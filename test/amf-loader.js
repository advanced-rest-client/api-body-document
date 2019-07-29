import { ns } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
export const AmfLoader = {};
AmfLoader.load = async function(endpointIndex, methodIndex, compact, fileName) {
  endpointIndex = endpointIndex || 0;
  methodIndex = methodIndex || 0;
  fileName = fileName || 'demo-api';
  const file = '/' + fileName + (compact ? '-compact' : '') + '.json';
  const url = location.protocol + '//' + location.host + '/base/demo/' + file;
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data = JSON.parse(e.target.response);
      const original = data;
      if (data instanceof Array) {
        data = data[0];
      }
      const encKey = compact ? 'doc:encodes' :
        ns.raml.vocabularies.document + 'encodes';
      let encodes = data[encKey];
      if (encodes instanceof Array) {
        encodes = encodes[0];
      }
      const endKey = compact ? 'raml-http:endpoint' :
        ns.raml.vocabularies.http + 'endpoint';
      let endpoints = encodes[endKey];
      if (endpoints && !(endpoints instanceof Array)) {
        endpoints = [endpoints];
      }
      const endpoint = endpoints[endpointIndex];
      const opKey = compact ? 'hydra:supportedOperation' :
        ns.w3.hydra.core + 'supportedOperation';
      let methods = endpoint[opKey];
      if (!(methods instanceof Array)) {
        methods = [methods];
      }
      const method = methods[methodIndex];
      const expKey = compact ? 'hydra:expects' : ns.w3.hydra.core + 'expects';
      let request = method[expKey];
      if (request instanceof Array) {
        request = request[0];
      }
      const pKey = compact ? 'raml-http:payload' : 'http://a.ml/vocabularies/http#payload';
      let payload = request[pKey];
      if (!(payload instanceof Array)) {
        payload = [payload];
      }
      resolve([original, payload]);
    });
    xhr.open('GET', url);
    xhr.send();
  });
};
