import { fixture, assert, nextFrame, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-body-document.js';

describe('<api-body-document>', function() {
  async function basicFixture() {
    return (await fixture(`<api-body-document></api-body-document>`));
  }

  async function openedFixture() {
    return (await fixture(`<api-body-document opened></api-body-document>`));
  }

  async function narrowFixture() {
    return (await fixture(`<api-body-document opened narrow></api-body-document>`));
  }

  async function awareFixture() {
    return (await fixture(`<div>
      <api-body-document aware="test-model"></api-body-document>
      <raml-aware scope="test-model"></raml-aware>
      </div>`));
  }

  function computeOperation(element, amf, endpoint, method) {
    const webApi = element._computeWebApi(amf);
    const endPoint = element._computeEndpointByPath(webApi, endpoint);
    const opKey = element._getAmfKey(element.ns.w3.hydra.supportedOperation);
    const ops = element._ensureArray(endPoint[opKey]);
    return ops.find((item) => element._getValue(item, element.ns.w3.hydra.core + 'method') === method);
  }

  function computeReturnsPayload(element, operation, code) {
    const rKey = element._getAmfKey(element.ns.w3.hydra.core + 'returns');
    const returns = element._ensureArray(operation[rKey]);
    const response = returns.find((item) => {
      if (element._getValue(item, element.ns.w3.hydra.core + 'statusCode') === String(code)) {
        return true;
      }
      return false;
    });
    const pKey = element._getAmfKey(element.ns.raml.vocabularies.http + 'payload');
    const payload = response[pKey];
    return payload instanceof Array ? payload : [payload];
  }

  describe('a11y', () => {
    let element;
    let amf;
    let payload;
    before(async () => {
      amf = await AmfLoader.load();
      payload = AmfLoader.lookupPayload(amf, '/people', 'post');
    });

    beforeEach(async () => {
      element = await openedFixture();
      element.amf = amf;
      element.body = payload;
      await nextFrame();
      await aTimeout();
    });

    it('is accessible', async () => {
      await assert.isAccessible(element);
    });
  });

  describe('Raml aware', () => {
    let element;
    let amf;
    before(async () => {
      amf = await AmfLoader.load();
    });

    beforeEach(async () => {
      const region = await awareFixture();
      element = region.querySelector('api-body-document');
      region.querySelector('raml-aware').api = amf;
      await aTimeout();
    });

    it('renders raml-aware', () => {
      const node = element.shadowRoot.querySelector('raml-aware');
      assert.ok(node);
    });

    it('sets amf value from aware', async () => {
      await aTimeout();
      assert.typeOf(element.amf, 'array');
    });
  });

  describe('Basic', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
      await aTimeout();
    });

    it('Toggle button opens the table', async () => {
      const button = element.shadowRoot.querySelector('.section-title-area');
      button.click();
      await nextFrame();
      const collapse = element.shadowRoot.querySelector('iron-collapse');
      assert.isTrue(collapse.opened);
    });

    it('renderMediaSelector is false', () => {
      assert.isFalse(element._renderMediaSelector);
    });
  });

  describe('With data', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        let element;
        let amf;
        let payload;
        before(async () => {
          amf = await AmfLoader.load(compact);
          payload = AmfLoader.lookupPayload(amf, '/people', 'post');
        });

        beforeEach(async () => {
          element = await openedFixture();
          element.amf = amf;
          element.body = payload;
          await nextFrame();
          await aTimeout();
        });

        it('renderMediaSelector is true', () => {
          assert.isTrue(element._renderMediaSelector);
        });

        it('mediaTypes is computed', () => {
          assert.typeOf(element._mediaTypes, 'array');
          assert.lengthOf(element._mediaTypes, 2);
        });

        it('selected is set automatically', () => {
          assert.equal(element.selected, 0);
        });

        it('selectedBody is computed with selection', () => {
          assert.typeOf(element._selectedBody, 'object');
        });

        it('isObject is computed for objects', () => {
          assert.isTrue(element._isObject);
        });

        it('isSchema is computed for objects', () => {
          assert.isFalse(element._isSchema);
        });

        it('typeName is computed', () => {
          assert.equal(element._typeName, 'AppPerson');
        });

        it('bodyName is computed', () => {
          assert.equal(element._bodyName, 'A person resource');
        });

        it('description is computed', () => {
          assert.typeOf(element._description, 'string');
        });

        it('Media type click changes selection', async () => {
          await nextFrame();
          const button = element.shadowRoot.querySelectorAll('.media-toggle')[1];
          button.click();
          assert.isFalse(element._isObject);
          assert.isTrue(element._isSchema);
          assert.isUndefined(element._typeName);
          assert.isUndefined(element._description);
        });

        it('Renders api-schema-document', async () => {
          element.selected = 1;
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-schema-document');
          assert.ok(node);
        });
      });
    });
  });

  describe('Narrow layout', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        let element;
        let amf;
        let payload;
        before(async () => {
          amf = await AmfLoader.load(compact);
          payload = AmfLoader.lookupPayload(amf, '/people', 'post');
        });

        beforeEach(async () => {
          element = await narrowFixture();
          element.amf = amf;
          element.body = payload;
          await nextFrame();
          await aTimeout();
        });

        it('Has narrow attribute', () => {
          assert.isTrue(element.hasAttribute('narrow'));
        });

        it('Narrow style is applied to the URI title', () => {
          element.style.setProperty('--api-body-document-title-narrow-font-size', '16px');
          const title = element.shadowRoot.querySelector('.table-title');
          const fontSize = getComputedStyle(title).fontSize;
          assert.equal(fontSize, '16px');
        });
      });
    });
  });

  describe('"Any" type view', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        let element;
        let amf;
        let payload;
        before(async () => {
          amf = await AmfLoader.load(compact);
          payload = AmfLoader.lookupPayload(amf, '/emptybody', 'post'); // 7
        });

        beforeEach(async () => {
          element = await narrowFixture();
          element.amf = amf;
          element.body = payload;
          await nextFrame();
          await aTimeout();
        });

        it('Computes isAnyType attribute', () => {
          assert.isTrue(element._isAnyType);
        });

        it('Renders "any" mode info message', async () => {
          await nextFrame();
          const label = element.shadowRoot.querySelector('.any-info');
          assert.ok(label);
        });

        it('Does not render media types', async () => {
          await nextFrame();
          const node = element.shadowRoot.querySelector('.media-type-selector');
          assert.notOk(node);
        });
      });
    });
  });

  describe('"Union" type view', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        let element;
        let amf;
        let payload;
        before(async () => {
          amf = await AmfLoader.load(compact);
          payload = AmfLoader.lookupPayload(amf, '/unionBody', 'post'); // 8
        });

        beforeEach(async () => {
          element = await openedFixture();
          element.amf = amf;
          element.body = payload;
          await nextFrame();
          await aTimeout();
        });

        it('Computes isObject attribute', () => {
          assert.isTrue(element._isObject);
        });

        it('Renders api-type-document', async () => {
          await nextFrame();
          const label = element.shadowRoot.querySelector('api-type-document');
          assert.ok(label);
        });
      });
    });
  });

  describe('Any type rendering', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        let element;
        let amf;
        before(async () => {
          amf = await AmfLoader.load(compact);
        });

        beforeEach(async () => {
          element = await openedFixture();
          element.amf = amf;
        });

        it('Renders example for any type', async () => {
          const type = AmfLoader.lookupPayload(amf, '/emptyBodyWithExample', 'post');
          element.body = type;
          element.selected = 0;
          await nextFrame();
          await aTimeout();
          assert.isTrue(element._isAnyType, 'isAnyType is set');
          await nextFrame();
          const node = element.shadowRoot.querySelector('.examples');
          assert.isFalse(node.hasAttribute('hidden'), 'Examples section is rendered');
        });

        it('Won\'t render example for any type when example is not defined', async () => {
          const type = AmfLoader.lookupPayload(amf, '/emptyBodyWithName', 'post');
          element.body = type;
          element.selected = 0;
          await aTimeout();
          assert.isTrue(element._isAnyType, 'isAnyType is set');
          await nextFrame();
          const node = element.shadowRoot.querySelector('.examples');
          assert.isTrue(node.hasAttribute('hidden'), 'Examples section is not rendered');
        });

        it('Renders body title', async () => {
          const type = AmfLoader.lookupPayload(amf, '/emptyBodyWithAllProperties', 'post');
          element.body = type;
          await aTimeout();
          assert.equal(element._bodyName, 'My body name', 'bodyName is set');
          await nextFrame();
          const node = element.shadowRoot.querySelector('.body-name');
          assert.ok(node, 'Body name label is rendered');
        });

        it('Renders body description', async () => {
          const type = AmfLoader.lookupPayload(amf, '/emptyBodyWithAllProperties', 'post');
          element.body = type;
          await aTimeout();
          assert.equal(element._description, 'My description of `body`.');
          await nextFrame();
          const node = element.shadowRoot.querySelector('.markdown-html');
          assert.ok(node, 'Example is rendered');
        });
      });
    });
  });

  describe('Examples from schema [SE-11508]', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(label, () => {
        let element;
        let amf;
        before(async () => {
          amf = await AmfLoader.load(compact, 'SE-11508');
        });

        beforeEach(async () => {
          element = await openedFixture();
          element.amf = amf;
          await nextFrame();
        });

        it('Renders api-type-document element', async () => {
          const op = computeOperation(element, amf, '/validatecustomeraccounthash', 'post');
          const payload = computeReturnsPayload(element, op, '400');
          element.body = payload;
          await nextFrame();
          await aTimeout();
          await nextFrame();
          const typeNode = element.shadowRoot.querySelector('api-type-document');
          assert.typeOf(typeNode.selectedBodyId, 'string', 'selected body id is set');
        });

        it('api-type-document renders api-resource-example-document element', (done) => {
          const op = computeOperation(element, amf, '/validatecustomeraccounthash', 'post');
          const payload = computeReturnsPayload(element, op, '400');
          element.body = payload;
          setTimeout(() => {
            const typeNode = element.shadowRoot.querySelector('api-type-document');
            const node = typeNode.shadowRoot.querySelector('api-resource-example-document');
            assert.lengthOf(node.renderedExamples, 1, 'Examples render has 1 example');
            assert.equal(node.renderedExamples[0].title, '400_badrequest_validate_customer_account_hash');
            done();
          }, 120);
        });
      });
    });
  });
});
