const generator = require('@api-components/api-model-generator');

const files = new Map();
files.set('demo-api/demo-api.raml', 'RAML 1.0');
files.set('caro-api/caro-api.raml', 'RAML 1.0');
files.set('array-example/array-example.raml', 'RAML 1.0');

generator(files)
.then(() => console.log('Finito'));
