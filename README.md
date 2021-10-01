# DEPRECATED

This component is being deprecated. The code base has been moved to [api-documentation](https://github.com/advanced-rest-client/api-documentation) module. This module will be archived when [PR 37](https://github.com/advanced-rest-client/api-documentation/pull/37) is merged.

-----

A component to render HTTP method body documentation based on AMF model generated from API spec file.

## Version compatibility

This version only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility with previous model version use `3.x.x` version of the component.

## Usage

### Installation

```sh
npm install --save @api-components/api-body-document
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-body-document/api-body-document.js';
    </script>
  </head>
  <body>
    <api-body-document></api-body-document>
  </body>
</html>
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@api-components/api-body-document/api-body-document.js';

class SampleElement extends PolymerElement {
  render() {
    return html`
    <api-body-document .amf="${this.amf}"></api-body-document>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

## Development

```sh
git clone https://github.com/advanced-rest-client/api-body-document
cd api-body-document
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```
