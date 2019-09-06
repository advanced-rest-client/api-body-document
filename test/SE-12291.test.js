import { fixture, assert, nextFrame, aTimeout, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-body-document.js';
// Rendering of OAS' "and" type.
describe('SE-12291', function() {
  async function basicFixture(amf, payload) {
    const element = (await fixture(html`<api-body-document
      .amf="${amf}"
      .body="${payload}"></api-body-document>`));
    await nextFrame();
    await aTimeout();
    return element;
  }
  const apiFile = 'SE-12291';
  [
    ['Full AMF model', false],
    ['Compact AMF model', true]
  ].forEach(([label, compact]) => {
    describe(label, () => {
      let element;
      let amf;
      let payload;
      before(async () => {
        amf = await AmfLoader.load(compact, apiFile);
        payload = AmfLoader.lookupReturnsPayload(amf,
          '/api/investment-administration/capital-system/v1/portfolios',
          'get',
          200);
      });

      beforeEach(async () => {
        element = await basicFixture(amf, payload);
      });

      it('sets _isObject', () => {
        assert.isTrue(element._isObject);
      });

      it('renders api-type-document', () => {
        const node = element.shadowRoot.querySelector('api-type-document');
        assert.ok(node);
      });
    });
  });
});
