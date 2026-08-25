import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-body-document.js';

/** @typedef {import('../index').ApiBodyDocumentElement} ApiBodyDocumentElement */

/**
 * Fixture-driven test for W-23748891 — SSE / streaming body rendering.
 *
 * This is the SUPPORTING (visual/e2e) test. The GATING oracle for the fix is
 * the generator-independent inline-AMF suite in `sse-item-schema.test.js`; that
 * one pins the behavior with hand-built nodes and does not depend on any model
 * file, so a missing fixture can never turn the gate red.
 *
 * ── Fixture provenance (explicit — not assumed) ──────────────────────────────
 * This suite consumes the AMF model the API Console ships:
 *   demo/oas32-query-sse.json          (full)
 *   demo/oas32-query-sse-compact.json  (compact)
 * They were generated from demo/oas32-query-sse/oas32-query-sse.yaml by the
 * CONSOLE toolchain (api-model-generator 0.4.0 / AMF 5.11.x) — NOT by this
 * component's `npm run build:models`, whose pinned api-model-generator (0.2.14)
 * cannot parse OAS 3.2 and would error on the `query` verb / `itemSchema`.
 * That is why the JSON is committed here (whitelisted in .gitignore, mirroring
 * the existing `!demo/grpc-test.json` pre-generated fixture) rather than
 * regenerated. To refresh it: run the console's model build against the YAML and
 * copy both artifacts back into demo/.
 *
 * Because the models are committed, a clean checkout of this branch always has
 * them. As a belt-and-suspenders guard against a stripped/partial checkout, the
 * suite SKIPS (never fails) if the fixture cannot be loaded.
 *
 * The model is a flat `@graph` (the console serialization). The element expands
 * it internally on the `amf` setter, so the payload is read back from
 * `element.amf` to keep object identity — `_resolve` looks shapes up inside
 * `this.amf`; a raw `@graph` payload would resolve to bare stubs.
 */
describe('SSE streaming body (fixture)', () => {
  const apiFile = 'oas32-query-sse';

  /**
   * Loads a model, returning `undefined` (rather than throwing) when the fixture
   * is absent so the caller can skip instead of reporting a false failure.
   * @param {boolean} compact
   * @return {Promise<any|undefined>}
   */
  async function loadModelOrSkip(compact) {
    try {
      return await AmfLoader.load(compact, apiFile);
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Mounts the element with the given (flat @graph) model, lets it expand,
   * then attaches the payload found for endpoint/operation/status.
   * @param {any} rawModel
   * @param {string} endpoint
   * @param {string} operation
   * @param {number} status
   * @return {Promise<ApiBodyDocumentElement>}
   */
  async function mountWithReturnsPayload(rawModel, endpoint, operation, status) {
    const element = /** @type ApiBodyDocumentElement */ (await fixture(html`<api-body-document
      opened
      .amf="${rawModel}"></api-body-document>`));
    // The element expands the flat @graph; read back the expanded model so the
    // payload objects are the same identities the element resolves against.
    const expanded = element.amf;
    const payload = AmfLoader.lookupReturnsPayload(expanded, endpoint, operation, status);
    element.body = payload;
    await nextFrame();
    await aTimeout(0);
    return element;
  }

  /**
   * Collects the rendered property-name texts from the api-type-document.
   * @param {ApiBodyDocumentElement} element
   * @return {Promise<string[]>}
   */
  async function renderedPropertyNames(element) {
    const typeDoc = element.shadowRoot.querySelector('api-type-document');
    if (!typeDoc) {
      return [];
    }
    await nextFrame();
    await aTimeout(0);
    const rows = typeDoc.shadowRoot.querySelectorAll('property-shape-document');
    return Array.from(rows)
      .map((r) => {
        const nameEl = r.shadowRoot && r.shadowRoot.querySelector('.property-name');
        return nameEl ? nameEl.textContent.trim() : '';
      })
      .filter(Boolean);
  }

  const variants = /** @type {Array<[string, boolean]>} */ ([
    ['Full AMF model', false],
    ['Compact AMF model', true],
  ]);
  variants.forEach(([label, compact]) => {
    describe(String(label), () => {
      let element = /** @type ApiBodyDocumentElement */ (null);
      let rawModel;

      before(async function beforeHook() {
        rawModel = await loadModelOrSkip(compact);
        if (!rawModel) {
          // eslint-disable-next-line no-console
          console.warn(`[skip] fixture ${apiFile}${compact ? '-compact' : ''}.json not available`);
          this.skip();
        }
      });

      beforeEach(async () => {
        element = await mountWithReturnsPayload(rawModel, '/pets/events', 'get', 200);
      });

      it('@covers AC-01 selects the itemSchema NodeShape (not undefined)', () => {
        assert.ok(element._selectedSchema, 'a schema is selected for the SSE payload');
      });

      it('@covers AC-01 detects the SSE event shape as an object', () => {
        assert.isTrue(element._isObject, '_isObject is true for the event NodeShape');
      });

      it('@covers AC-01 renders api-type-document for the SSE payload', () => {
        const node = element.shadowRoot.querySelector('api-type-document');
        assert.ok(node, 'api-type-document is rendered');
      });

      it('@covers AC-01 renders property rows for the event fields', async () => {
        const names = await renderedPropertyNames(element);
        assert.isAbove(names.length, 0, 'at least one property row renders');
        assert.include(names, 'event', 'the "event" field renders');
        assert.include(names, 'retry', 'the "retry" field renders');
      });

      it('@covers AC-03 renders the nested "data" property row', async () => {
        // AC-03 is verify-and-defer: assert only that the `data` row is PRESENT.
        // Whether `data.contentSchema` expands its inner shape is an
        // api-type-document concern (a separate component) and out of scope here.
        const names = await renderedPropertyNames(element);
        assert.include(names, 'data', 'the "data" field row is present');
      });

      it('@covers AC-01 does not render the internal "itemSchema" name as a type title', () => {
        const title = element.shadowRoot.querySelector('.type-title');
        if (title) {
          assert.notEqual(
            title.textContent.trim(),
            'itemSchema',
            'internal AMF predicate name must not surface as the body type title'
          );
        }
      });
    });
  });

  describe('non-SSE regression (AC-02)', () => {
    let rawModel;

    before(async function beforeHook() {
      rawModel = await loadModelOrSkip(true);
      if (!rawModel) {
        this.skip();
      }
    });

    it('@covers AC-02 the QUERY JSON response still renders via shapes#schema', async () => {
      const element = await mountWithReturnsPayload(rawModel, '/pets', 'QUERY', 200);
      assert.ok(element._selectedSchema, 'schema-backed body still resolves');
      const node = element.shadowRoot.querySelector('api-type-document');
      assert.ok(node, 'api-type-document renders for the JSON array response');
    });
  });
});
