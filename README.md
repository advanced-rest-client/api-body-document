[![Published on NPM](https://img.shields.io/npm/v/@api-components/api-body-document.svg)](https://www.npmjs.com/package/@api-components/api-body-document)

[![Build Status](https://travis-ci.org/api-components/api-body-document.svg?branch=stage)](https://travis-ci.org/api-components/api-body-document)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/api-components/api-body-document)

## &lt;api-body-document&gt;

A component to render HTTP method body documentation based on AMF model generated from API spec file.

```html
<api-body-document></api-body-document>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
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

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@api-components/api-body-document/api-body-document.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <api-body-document></api-body-document>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/api-components/api-body-document
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
