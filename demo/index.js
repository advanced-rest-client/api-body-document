import { html, render } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import '@api-components/raml-aware/raml-aware.js';
import '@api-components/api-navigation/api-navigation.js';
import '../api-body-document.js';

import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
class DemoElement extends AmfHelperMixin(LitElement) {}

window.customElements.define('demo-element', DemoElement);
class ApiDemo extends ApiDemoPageBase {
  constructor() {
    super();
    this.hasData = false;
  }

  get hasData() {
    return this._hasData;
  }

  set hasData(value) {
    this._setObservableProperty('hasData', value);
  }

  get payloads() {
    return this._payloads;
  }

  set payloads(value) {
    this._setObservableProperty('payloads', value);
  }

  get helper() {
    return document.getElementById('helper');
  }

  _navChanged(e) {
    const { selected, type } = e.detail;

    if (type === 'method') {
      this.setData(selected);
    } else {
      this.hasData = false;
    }
  }

  setData(selected) {
    const helper = this.helper;
    const webApi = helper._computeWebApi(this.amf);
    const method = helper._computeMethodModel(webApi, selected);
    const payloads = this.computePayloads(method);
    this.payloads = payloads;
    this.hasData = true;
  }

  computePayloads(model) {
    if (!model) {
      return;
    }
    const helper = this.helper;
    let result = [];
    const expects = helper._computeExpects(model);
    if (expects) {
      let payloads = helper._computePayload(expects);
      if (payloads) {
        if (!(payloads instanceof Array)) {
          payloads = [payloads];
        }
        result = payloads;
      }
    }
    const returns = helper._computeReturns(model);
    if (returns) {
      for (let i = 0, len = returns.length; i < len; i++) {
        let payloads = helper._computePayload(returns[i]);
        if (payloads) {
          if (!(payloads instanceof Array)) {
            payloads = [payloads];
          }
          result = result.concat(payloads);
        }
      }
    }

    return result.length ? result : undefined;
  }

  _apiListTemplate() {
    return html`
    <paper-item data-src="demo-api.json">Demo api</paper-item>
    <paper-item data-src="demo-api-compact.json">Demo api - compact model</paper-item>
    <paper-item data-src="examples-api.json">Examples render demo api</paper-item>
    <paper-item data-src="examples-api-compact.json">Examples render demo - compact model</paper-item>
    <paper-item data-src="raml-types.json">RAML types with raml examples</paper-item>
    <paper-item data-src="raml-types-compact.json">RAML types with raml examples - compact model</paper-item>
    <paper-item data-src="caro-api-compact.json">Carolina API issue - compact model</paper-item>
    <paper-item data-src="array-example-compact.json">Array examples issue - compact model</paper-item>
    <paper-item data-src="data-types-union.json">APIC-157</paper-item>
    <paper-item data-src="data-types-union-compact.json">APIC-157 - compact model</paper-item>
    <paper-item data-src="SE-11508.json">SE-11508</paper-item>
    <paper-item data-src="SE-11508.json">SE-11508 - compact model</paper-item>`;
  }

  render() {
    render(html `
    ${this.headerTemplate()}
    <raml-aware .api="${this.amf}" scope="model"></raml-aware>

    <section role="main" class="centered card">
      ${this._apiNavigationTemplate()}
      ${this.hasData ?
        html`<div class="list">
          <api-body-document aware="model" .body="${this.payloads}" opened></api-body-document>
        </div>` :
        html`<p>Select a HTTP method in the navigation to see the demo.</p>`}
    </section>

    <demo-element id="helper" .amf="${this.amf}"></demo-element>`, document.querySelector('#demo'));
  }
}
const instance = new ApiDemo();
instance.render();
window._demo = instance;
