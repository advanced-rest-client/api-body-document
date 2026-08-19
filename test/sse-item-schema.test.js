import { fixture, assert, html } from '@open-wc/testing';
import '../api-body-document.js';

/** @typedef {import('../index').ApiBodyDocumentElement} ApiBodyDocumentElement */

/**
 * Inline-AMF oracle for W-23748891 — SSE / streaming body rendering.
 *
 * OAS 3.2 `text/event-stream` payloads carry the streamed event shape under
 * `shapes#itemSchema` instead of `shapes#schema`. These tests exercise
 * `_computeSelectedSchema` directly with hand-built AMF nodes (no
 * api-model-generator dependency, no AMF version coupling) so the fallback is
 * pinned regardless of the toolchain.
 *
 * The NodeShape is inlined as the DIRECT value of the itemSchema/schema key so
 * the assertion inspects the real resolved shape (its `@type` and its
 * `shacl#property` array), not a bare `{@id}` stub that `_resolve` would return
 * unchanged when no `amf` model is attached.
 */
describe('_computeSelectedSchema - SSE itemSchema fallback', () => {
  /** @return {Promise<ApiBodyDocumentElement>} */
  async function basicFixture() {
    return fixture(html`<api-body-document></api-body-document>`);
  }

  let element = /** @type ApiBodyDocumentElement */ (null);
  // Namespace constants, read from the element so the test tracks the contract.
  let SCHEMA_KEY;
  let ITEM_SCHEMA_KEY;
  let MEDIA_TYPE_KEY;
  let NODE_SHAPE;
  let ANY_SHAPE;
  let PROPERTY_SHAPE;
  let PROPERTY_KEY;
  let NAME_KEY;
  let PAYLOAD_TYPE;

  before(async () => {
    element = await basicFixture();
    // No `amf` is set: `_getAmfKey` then returns the full IRI, matching the
    // full-IRI keys used to build the nodes below.
    SCHEMA_KEY = element.ns.aml.vocabularies.shapes.schema;
    ITEM_SCHEMA_KEY = `${element.ns.aml.vocabularies.shapes.key}itemSchema`;
    MEDIA_TYPE_KEY = element.ns.aml.vocabularies.core.mediaType;
    NODE_SHAPE = element.ns.w3.shacl.NodeShape;
    ANY_SHAPE = element.ns.aml.vocabularies.shapes.AnyShape;
    PROPERTY_SHAPE = element.ns.w3.shacl.PropertyShape;
    PROPERTY_KEY = element.ns.w3.shacl.property;
    NAME_KEY = element.ns.w3.shacl.name;
    PAYLOAD_TYPE = element.ns.aml.vocabularies.apiContract.Payload;
  });

  /**
   * Builds a NodeShape with the given property names inlined.
   * @param {string} shapeName shacl#name of the shape
   * @param {string[]} propertyNames property names to attach
   */
  function buildNodeShape(shapeName, propertyNames) {
    const properties = propertyNames.map((name, i) => ({
      '@id': `amf://id#prop-${shapeName}-${i}`,
      '@type': [PROPERTY_SHAPE],
      [NAME_KEY]: [{ '@value': name }],
    }));
    return {
      '@id': `amf://id#${shapeName}`,
      '@type': [NODE_SHAPE, ANY_SHAPE],
      [NAME_KEY]: [{ '@value': shapeName }],
      [PROPERTY_KEY]: properties,
    };
  }

  /**
   * Builds a payload node carrying the given shape under a schema-like key.
   * @param {string} mediaType core#mediaType value
   * @param {Object} keyedShapes map of AMF key -> inlined NodeShape
   */
  function buildPayload(mediaType, keyedShapes) {
    const payload = {
      '@id': 'amf://id#payload',
      '@type': [PAYLOAD_TYPE],
      [MEDIA_TYPE_KEY]: [{ '@value': mediaType }],
    };
    Object.entries(keyedShapes).forEach(([key, shape]) => {
      payload[key] = shape;
    });
    return payload;
  }

  it('@covers AC-01 resolves the itemSchema NodeShape for a text/event-stream payload', () => {
    const eventShape = buildNodeShape('itemSchema', ['event', 'data', 'retry']);
    const payload = buildPayload('text/event-stream', { [ITEM_SCHEMA_KEY]: eventShape });

    const result = element._computeSelectedSchema(payload);

    assert.ok(result, 'a schema is returned (not undefined)');
    assert.include(result['@type'], NODE_SHAPE, 'resolved shape is a NodeShape');
    assert.lengthOf(
      result[PROPERTY_KEY],
      3,
      'resolved shape carries the three event properties (event/data/retry)'
    );
    const names = result[PROPERTY_KEY].map((p) => p[NAME_KEY][0]['@value']);
    assert.deepEqual(names, ['event', 'data', 'retry'], 'property names are the SSE event fields');
  });

  it('@covers AC-02 still returns the schema NodeShape when shapes#schema is present', () => {
    const schemaShape = buildNodeShape('schema', ['kind', 'maxAge']);
    const payload = buildPayload('application/json', { [SCHEMA_KEY]: schemaShape });

    const result = element._computeSelectedSchema(payload);

    assert.ok(result, 'a schema is returned');
    assert.strictEqual(result['@id'], 'amf://id#schema', 'returns the schema node, unchanged');
    assert.lengthOf(result[PROPERTY_KEY], 2, 'schema properties intact');
  });

  it('@covers AC-02 schema wins when BOTH schema and itemSchema are present', () => {
    const schemaShape = buildNodeShape('schema', ['kind', 'maxAge']);
    const itemShape = buildNodeShape('itemSchema', ['event', 'data', 'retry']);
    const payload = buildPayload('application/json', {
      [SCHEMA_KEY]: schemaShape,
      [ITEM_SCHEMA_KEY]: itemShape,
    });

    const result = element._computeSelectedSchema(payload);

    assert.strictEqual(
      result['@id'],
      'amf://id#schema',
      'itemSchema is only a fallback; schema takes precedence'
    );
  });

  it('returns undefined when neither schema nor itemSchema is present', () => {
    const payload = buildPayload('text/plain', {});
    assert.isUndefined(element._computeSelectedSchema(payload));
  });

  it('returns undefined for an empty selected body', () => {
    assert.isUndefined(element._computeSelectedSchema(undefined));
  });

  it('unwraps an itemSchema wrapped in an array (mirrors the schema Array guard)', () => {
    const eventShape = buildNodeShape('itemSchema', ['event']);
    const payload = buildPayload('text/event-stream', { [ITEM_SCHEMA_KEY]: [eventShape] });

    const result = element._computeSelectedSchema(payload);

    assert.strictEqual(result['@id'], 'amf://id#itemSchema', 'array-wrapped itemSchema is unwrapped');
  });
});

describe('_computeTypeName - itemSchema title suppression', () => {
  /** @return {Promise<ApiBodyDocumentElement>} */
  async function basicFixture() {
    return fixture(html`<api-body-document></api-body-document>`);
  }

  let element = /** @type ApiBodyDocumentElement */ (null);

  before(async () => {
    element = await basicFixture();
  });

  function nodeNamed(name) {
    return { '@id': 'amf://id#x', [element.ns.w3.shacl.name]: [{ '@value': name }] };
  }

  it('@covers AC-01 hides the internal "itemSchema" predicate name as a type title', () => {
    assert.isUndefined(element._computeTypeName(nodeNamed('itemSchema')));
  });

  it('still hides "schema" (regression guard)', () => {
    assert.isUndefined(element._computeTypeName(nodeNamed('schema')));
  });

  it('keeps a real, author-given type name', () => {
    assert.strictEqual(element._computeTypeName(nodeNamed('PetEvent')), 'PetEvent');
  });
});
