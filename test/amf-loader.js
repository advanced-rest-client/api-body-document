import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { LitElement } from 'lit-element';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('helper-element', HelperElement);

const helper = new HelperElement();

AmfLoader.load = async function(compact, fileName) {
  compact = compact ? '-compact' : '';
  fileName = fileName || 'demo-api';
  const file = `${fileName}${compact}.json`;
  // eslint-disable-next-line no-restricted-globals
  const url = `${location.protocol  }//${  location.host  }/base/demo/${ file}`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
        /* istanbul ignore next */
      } catch (ex) {
        /* istanbul ignore next */
        reject(ex);
        /* istanbul ignore next */
        return;
      }
      resolve(data);
    });
    /* istanbul ignore next */
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};

AmfLoader.lookupOperation = function(model, endpoint, operation) {
  helper.amf = model;
  const webApi = helper._computeApi(model);
  const endPoint = helper._computeEndpointByPath(webApi, endpoint);
  const opKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) === operation);
};

AmfLoader.lookupPayload = function(model, endpoint, operation) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  return helper._ensureArray(helper._computePayload(expects));
};

AmfLoader.lookupPayloadBindings = function(payload) {
  let result = [];
  if (!payload) {
    result = [];
  }
  const keyBinding = helper._getAmfKey(helper.ns.aml.vocabularies.apiBinding.binding)
  const keyBindings = helper._getAmfKey(helper.ns.aml.vocabularies.apiBinding.bindings)
  result = payload && payload[keyBinding] ? payload[keyBinding][0][keyBindings] : []
  return result
};

AmfLoader.lookupReturnsPayload = function(model, endpoint, operation, code) {
  const op = AmfLoader.lookupOperation(model, endpoint, operation);
  const rKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.returns);
  const returns = helper._ensureArray(op[rKey]);
  const response = returns.find((item) => {
    if (helper._getValue(item, helper.ns.aml.vocabularies.apiContract.statusCode) === String(code)) {
      return true;
    }
    return false;
  });
  const pKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.payload);
  const payload = response[pKey];
  return payload instanceof Array ? payload : [payload];
};
