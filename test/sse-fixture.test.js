import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-body-document.js';

/** @typedef {import('../index').ApiBodyDocumentElement} ApiBodyDocumentElement */

/**
 * Fixture-driven test for W-23748891 — SSE / streaming body rendering.
 *
 * Consumes the exact AMF model the API Console ships (generated from
 * `oas32-query-sse.yaml` by api-model-generator 0.4.0 / AMF 5.11.x). That model
 * is a flat `@graph` (the console serialization). The `<api-body-document>`
 * element expands it internally on the `amf` setter, so the payload is read back
 * from `element.amf` (the expanded graph the element actually renders) to keep
 * object identity — `_resolve` looks shapes up inside `this.amf`.
 *
 * Asserts the streamed event schema renders as property rows — the behavior
 * that was empty before the itemSchema fallback.
 */
describe('SSE streaming body (fixture)', () => {
  const apiFile = 'oas32-query-sse';

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

  [
    ['Full AMF model', false],
    ['Compact AMF model', true],
  ].forEach(([label, compact]) => {
    describe(String(label), () => {
      let element = /** @type ApiBodyDocumentElement */ (null);
      let rawModel;

      before(async () => {
        rawModel = await AmfLoader.load(compact, apiFile);
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
        const typeDoc = element.shadowRoot.querySelector('api-type-document');
        assert.ok(typeDoc, 'api-type-document present');
        await nextFrame();
        await aTimeout(0);
        const rows = typeDoc.shadowRoot.querySelectorAll('property-shape-document');
        assert.isAbove(rows.length, 0, 'at least one property row renders');
        const names = Array.from(rows)
          .map((r) => {
            const nameEl = r.shadowRoot && r.shadowRoot.querySelector('.property-name');
            return nameEl ? nameEl.textContent.trim() : '';
          })
          .filter(Boolean);
        assert.include(names, 'event', 'the "event" field renders');
        assert.include(names, 'retry', 'the "retry" field renders');
      });

      it('@covers AC-03 renders the nested "data" property row', async () => {
        // AC-03 is verify-and-defer: assert only that the `data` row is PRESENT.
        // Whether `data.contentSchema` expands its inner shape is an
        // api-type-document concern (a separate component) and out of scope here.
        const typeDoc = element.shadowRoot.querySelector('api-type-document');
        await nextFrame();
        await aTimeout(0);
        const rows = typeDoc.shadowRoot.querySelectorAll('property-shape-document');
        const names = Array.from(rows)
          .map((r) => {
            const nameEl = r.shadowRoot && r.shadowRoot.querySelector('.property-name');
            return nameEl ? nameEl.textContent.trim() : '';
          })
          .filter(Boolean);
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

    before(async () => {
      rawModel = await AmfLoader.load(true, apiFile);
    });

    it('@covers AC-02 the QUERY JSON response still renders via shapes#schema', async () => {
      const element = await mountWithReturnsPayload(rawModel, '/pets', 'QUERY', 200);
      assert.ok(element._selectedSchema, 'schema-backed body still resolves');
      const node = element.shadowRoot.querySelector('api-type-document');
      assert.ok(node, 'api-type-document renders for the JSON array response');
    });
  });
});
