import { fixture, assert, nextFrame, aTimeout, waitUntil } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-body-document.js';

/** @typedef {import('../index').ApiBodyDocumentElement} ApiBodyDocumentElement */

describe('ApiBodyDocumentElement', () => {
  /**
   * @return {Promise<ApiBodyDocumentElement>}
   */
  async function basicFixture() {
    return (fixture(`<api-body-document></api-body-document>`));
  }

  /**
   * @return {Promise<ApiBodyDocumentElement>}
   */
  async function openedFixture() {
    return (fixture(`<api-body-document opened></api-body-document>`));
  }

  /**
   * @return {Promise<ApiBodyDocumentElement>}
   */
  async function narrowFixture() {
    return (fixture(`<api-body-document opened narrow></api-body-document>`));
  }

  function computeOperation(element, amf, endpoint, method) {
    const webApi = element._computeApi(amf);
    const endPoint = element._computeEndpointByPath(webApi, endpoint);
    const opKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.supportedOperation);
    const ops = element._ensureArray(endPoint[opKey]);
    return ops.find((item) => element._getValue(item, element.ns.aml.vocabularies.apiContract.method) === method);
  }

  function computeReturnsPayload(element, operation, code) {
    const rKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.returns);
    const returns = element._ensureArray(operation[rKey]);
    const response = returns.find((item) => {
      if (element._getValue(item, element.ns.aml.vocabularies.apiContract.statusCode) === String(code)) {
        return true;
      }
      return false;
    });
    const pKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.payload);
    const payload = response[pKey];
    return payload instanceof Array ? payload : [payload];
  }

  describe('a11y', () => {
    let element = /** @type ApiBodyDocumentElement */ (null);
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
      await aTimeout(0);
    });

    it('is accessible', async () => {
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });
  });

  describe('Basic', () => {
    let element = /** @type ApiBodyDocumentElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
      await aTimeout(0);
    });

    it('Toggle button opens the table', async () => {
      const button = /** @type HTMLElement */ (element.shadowRoot.querySelector('.section-title-area'));
      button.click();
      await nextFrame();
      const collapse = element.shadowRoot.querySelector('anypoint-collapse');
      assert.isTrue(collapse.opened);
    });

    it('renderMediaSelector is false', () => {
      assert.isFalse(element._renderMediaSelector);
    });
  });

  describe('Basic', () => {
    let element = /** @type ApiBodyDocumentElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
      await aTimeout(0);
    });

    it('sets default header level', () => {
      const node = element.shadowRoot.querySelector('.section-title-area [role="heading"]');
      assert.equal(node.getAttribute('aria-level'), '2');
    });

    it('sets header level', async () => {
      element.headerLevel = 4;
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('.section-title-area [role="heading"]');
      assert.equal(node.getAttribute('aria-level'), '4');
    });

    it('passes renderReadOnly prop to api-type-document', async () => {
      element.renderReadOnly = true;
      element._isAnyType = false;
      element._isObject = true;
      await aTimeout(0);
      assert.isTrue(element.shadowRoot.querySelector('api-type-document').renderReadOnly);
    })
  });

  describe('With data', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element = /** @type ApiBodyDocumentElement */ (null);
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
          await aTimeout(0);
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
          const button = /** @type HTMLElement */ (element.shadowRoot.querySelectorAll('.media-toggle')[1]);
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
      describe(String(label), () => {
        let element = /** @type ApiBodyDocumentElement */ (null);
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
          await aTimeout(0);
        });

        it('Has narrow attribute', () => {
          assert.isTrue(element.hasAttribute('narrow'));
        });

        it('Narrow style is applied to the URI title', () => {
          element.style.setProperty('--arc-font-subhead-narrow-font-size', '16px');
          const title = element.shadowRoot.querySelector('.heading3');
          const { fontSize } = getComputedStyle(title);
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
      describe(String(label), () => {
        let element = /** @type ApiBodyDocumentElement */ (null);
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
          await aTimeout(0);
        });

        it('Computes isAnyType attribute', () => {
          assert.isTrue(element._isAnyType);
        });

        it('Renders "any" mode info message', async () => {
          await nextFrame();
          const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('.any-info'));
          assert.ok(node);
        });

        it('renderMediaSelector is false', () => {
          assert.isFalse(element._renderMediaSelector);
        });

        it('Renders media types', async () => {
          await nextFrame();
          const node = element.shadowRoot.querySelector('.media-type-selector');
          assert.ok(node);
        });
      });
    });
  });

  describe('"Union" type view', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element = /** @type ApiBodyDocumentElement */ (null);
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
          await aTimeout(0);
        });

        it('Computes isObject attribute', () => {
          assert.isTrue(element._isObject);
        });

        it('Renders api-type-document', async () => {
          await nextFrame();
          const node = /** @type HTMLElement */ (element.shadowRoot.querySelector('api-type-document'));
          assert.ok(node);
        });
      });
    });
  });

  describe('Any type rendering', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element = /** @type ApiBodyDocumentElement */ (null);
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
          await aTimeout(0);
          assert.isTrue(element._isAnyType, 'isAnyType is set');
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-resource-example-document');
          assert.isTrue(node.hasExamples, 'Examples section is rendered');
        });

        it('Won\'t render example for any type when example is not defined', async () => {
          const type = AmfLoader.lookupPayload(amf, '/emptyBodyWithName', 'post');
          element.body = type;
          element.selected = 0;
          await aTimeout(0);
          assert.isTrue(element._isAnyType, 'isAnyType is set');
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-resource-example-document');
          assert.isFalse(node.hasExamples, 'Examples section is not rendered');
        });

        it('Renders body title', async () => {
          const type = AmfLoader.lookupPayload(amf, '/emptyBodyWithAllProperties', 'post');
          element.body = type;
          await aTimeout(0);
          assert.equal(element._bodyName, 'My body name', 'bodyName is set');
          await nextFrame();
          const node = element.shadowRoot.querySelector('.body-name');
          assert.ok(node, 'Body name label is rendered');
        });

        it('Renders body description', async () => {
          const type = AmfLoader.lookupPayload(amf, '/emptyBodyWithAllProperties', 'post');
          element.body = type;
          await aTimeout(0);
          assert.equal(element._description, 'My description of `body`.');
          await nextFrame();
          const node = element.shadowRoot.querySelector('.markdown-html');
          assert.ok(node, 'Example is rendered');
        });

        it('renders api-resource-example-document with renderReadOnly property set to false', async () => {
          const type = AmfLoader.lookupPayload(amf, '/emptyBodyWithExample', 'post');
          element.body = type;
          element.selected = 0;
          element.renderReadOnly = false;
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-resource-example-document');
          assert.isFalse(node.renderReadOnly);
        });

        it('renders api-resource-example-document with renderReadOnly property set to true', async () => {
          const type = AmfLoader.lookupPayload(amf, '/emptyBodyWithExample', 'post');
          element.body = type;
          element.selected = 0;
          element.renderReadOnly = true;
          await nextFrame();
          const node = element.shadowRoot.querySelector('api-resource-example-document');
          assert.isTrue(node.renderReadOnly);
        });
      });
    });
  });

  describe('Basic', () => {
    let element = /** @type ApiBodyDocumentElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      await nextFrame();
      await aTimeout(0);
    });

    it('sets default header level', () => {
      const node = element.shadowRoot.querySelector('.section-title-area [role="heading"]');
      assert.equal(node.getAttribute('aria-level'), '2');
    });

    it('sets header level', async () => {
      element.headerLevel = 4;
      await aTimeout(0);
      const node = element.shadowRoot.querySelector('.section-title-area [role="heading"]');
      assert.equal(node.getAttribute('aria-level'), '4');
    });
  });

  describe('Examples from schema [SE-11508]', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element = /** @type ApiBodyDocumentElement */ (null);
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
          await aTimeout(0);
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

  describe('Any type rendering when multiple media types', () => {
    [
      ['APIC-463', false],
      ['Compact APIC-463 model', true]
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element = /** @type ApiBodyDocumentElement */ (null);
        let amf;
        let payload;
        before(async () => {
          amf = await AmfLoader.load(compact, 'APIC-463');
          payload = AmfLoader.lookupPayload(amf, '/test', 'post');
        });

        beforeEach(async () => {
          element = await openedFixture();
          element.amf = amf;
          element.body = payload;
          await nextFrame();
          await aTimeout(0);
        });

        it('Renders media types', async () => {
          await nextFrame();
          const node = element.shadowRoot.querySelector('.media-type-selector');
          assert.ok(node);
        });

        it('renderMediaSelector is true', () => {
          assert.isTrue(element._renderMediaSelector);
        });
      });
    });
  });

  describe('APIC-561', () => {
    [
      ['Full AMF model', false],
      ['Compact AMF model', true]
    ].forEach(([label, compact]) => {
      describe(String(label), () => {
        let element = /** @type ApiBodyDocumentElement */ (null);
        let amf;
        let payload;

        before(async () => {
          amf = await AmfLoader.load(compact, 'anyOf');
          payload = AmfLoader.lookupPayload(amf, 'test', 'publish');
        });

        beforeEach(async () => {
          element = await narrowFixture();
          element.amf = amf;
          element.body = payload;
          await nextFrame();
          await aTimeout(0);
        });

        it('Renders api-type-document for anyOf payload', async () => {
          await waitUntil(() => !!element.shadowRoot.querySelector('api-type-document'), 'api-type-document should render', { timeout: 1000 });
        });
      });
    });
  });
});
