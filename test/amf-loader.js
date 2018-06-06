const AmfLoader = {};
AmfLoader.load = function(endpointIndex, methodIndex) {
  endpointIndex = endpointIndex || 0;
  methodIndex = methodIndex || 0;
  const url = location.protocol + '//' + location.host +
    location.pathname.substr(0, location.pathname.lastIndexOf('/'))
    .replace('/test', '/demo') + '/demo-api.json';
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
      } catch (e) {
        reject(e);
        return;
      }
      const def = data[0]['http://raml.org/vocabularies/document#encodes'][0];
      const endpoint = def['http://raml.org/vocabularies/http#endpoint'][endpointIndex];
      const method = endpoint['http://www.w3.org/ns/hydra/core#supportedOperation'][methodIndex];
      const expects = method['http://www.w3.org/ns/hydra/core#expects'];
      const request = expects.find((item) => item['@type'].indexOf('http://raml.org/vocabularies/http#Request') !== -1);
      const payload = request['http://raml.org/vocabularies/http#payload'];
      resolve([data, payload]);
    });
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};
