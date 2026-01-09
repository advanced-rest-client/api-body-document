import { fixture, assert, nextFrame, aTimeout } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../api-body-document.js';

/** @typedef {import('../index').ApiBodyDocumentElement} ApiBodyDocumentElement */

describe('ApiBodyDocumentElement - gRPC', () => {
  /**
   * @return {Promise<ApiBodyDocumentElement>}
   */
  async function openedFixture() {
    return (fixture(`<api-body-document opened></api-body-document>`));
  }

  describe('gRPC operations', () => {
    let element = /** @type ApiBodyDocumentElement */ (null);
    let amf;
    let endpoint;
    let operation;
    let payload;

    before(async () => {
      amf = await AmfLoader.load(false, 'grpc-test');
    });

    beforeEach(async () => {
      element = await openedFixture();
      element.amf = amf;
      const webApi = element._computeApi(amf);
      const endpoints = element._computeEndpoints(webApi);
      endpoint = endpoints[0]; // Greeter endpoint
      const opKey = element._getAmfKey(element.ns.aml.vocabularies.apiContract.supportedOperation);
      const ops = element._ensureArray(endpoint[opKey]);
      operation = ops[0]; // SayHello1 operation
      
      const expects = element._computeExpects(operation);
      payload = element._ensureArray(element._computePayload(expects));
      
      await nextFrame();
    });

    it('should detect gRPC operation', async () => {
      assert.isTrue(element._isGrpcOperation(operation));
    });

    it('should show "Request" title for gRPC instead of "Body"', async () => {
      element.endpoint = endpoint;
      element.body = payload;
      await nextFrame();
      await aTimeout(0);

      const title = element.shadowRoot.querySelector('.heading2');
      assert.isNotNull(title, 'Title should exist with heading2 class');
      assert.equal(title.textContent.trim(), 'Request');
    });

    it('should show Message with just the name (not full path)', async () => {
      element.endpoint = endpoint;
      element.body = payload;
      await nextFrame();
      await aTimeout(0);

      const messageContainer = element.shadowRoot.querySelector('.media-type-selector:nth-of-type(2)');
      assert.isNotNull(messageContainer, 'Message container should exist');
      
      const messageLabel = messageContainer.querySelector('.media-type-label');
      assert.isNotNull(messageLabel, 'Message label should exist');
      assert.equal(messageLabel.textContent.trim(), 'HelloRequest');
      assert.notInclude(messageLabel.textContent, '.helloworld.');
    });

    it('should show "Fields:" before properties', async () => {
      element.endpoint = endpoint;
      element.body = payload;
      await nextFrame();
      await aTimeout(0);

      const fieldsTitle = element.shadowRoot.querySelector('.grpc-fields-title');
      assert.isNotNull(fieldsTitle, 'Fields title should exist');
      assert.equal(fieldsTitle.textContent.trim(), 'Fields:');
    });

    it('should show application/grpc media type', async () => {
      element.endpoint = endpoint;
      element.body = payload;
      await nextFrame();
      await aTimeout(0);

      const mediaTypeLabel = element.shadowRoot.querySelector('.media-type-label');
      assert.isNotNull(mediaTypeLabel);
      assert.equal(mediaTypeLabel.textContent.trim(), 'application/grpc');
    });

    it('should not mix request and response payloads for gRPC', async () => {
      element.endpoint = endpoint;
      element.body = payload;
      await nextFrame();
      await aTimeout(0);

      // Should only have one media type selector (for request)
      const mediaTypeSelectors = element.shadowRoot.querySelectorAll('.media-type-selector');
      // First is "Media type", second is "Message"
      assert.equal(mediaTypeSelectors.length, 2, 'Should only show request media type and message');
    });
  });

  describe('Non-gRPC operations (regression)', () => {
    let element = /** @type ApiBodyDocumentElement */ (null);
    let amf;

    before(async () => {
      amf = await AmfLoader.load(false, 'demo-api');
    });

    beforeEach(async () => {
      element = await openedFixture();
      element.amf = amf;
      await nextFrame();
    });

    it('should show "Body" title for non-gRPC APIs', async () => {
      const payload = AmfLoader.lookupPayload(amf, '/people', 'post');
      element.body = payload;
      await nextFrame();
      await aTimeout(0);

      const title = element.shadowRoot.querySelector('.heading3');
      assert.equal(title.textContent.trim(), 'Body');
    });

    it('should not show Message section for non-gRPC', async () => {
      const payload = AmfLoader.lookupPayload(amf, '/people', 'post');
      element.body = payload;
      await nextFrame();
      await aTimeout(0);

      const mediaTypeSelectors = element.shadowRoot.querySelectorAll('.media-type-selector');
      // Should only have one (Media type)
      assert.equal(mediaTypeSelectors.length, 1, 'Should only show Media type for non-gRPC');
    });

    it('should not show Fields title for non-gRPC', async () => {
      const payload = AmfLoader.lookupPayload(amf, '/people', 'post');
      element.body = payload;
      await nextFrame();
      await aTimeout(0);

      const fieldsTitle = element.shadowRoot.querySelector('.grpc-fields-title');
      assert.isNull(fieldsTitle, 'Fields title should not exist for non-gRPC');
    });

    it('should render type-title for non-gRPC', async () => {
      const payload = AmfLoader.lookupPayload(amf, '/people', 'post');
      element.body = payload;
      await nextFrame();
      await aTimeout(0);

      const typeDoc = element.shadowRoot.querySelector('api-type-document');
      assert.isNotNull(typeDoc, 'api-type-document should render for non-gRPC');
    });
  });
});

