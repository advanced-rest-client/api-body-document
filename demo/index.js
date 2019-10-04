import { html, render } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@api-components/api-navigation/api-navigation.js';
import '@api-components/raml-aware/raml-aware.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '../api-body-document.js';

class DemoElement extends AmfHelperMixin(LitElement) {}

window.customElements.define('demo-element', DemoElement);
class ApiDemo extends ApiDemoPageBase {
  constructor() {
    super();
    this._componentName = 'api-body-document';

    this.initObservableProperties([
      'legacy',
      'hasData',
      'payloads'
    ]);

    this.demoStates = ['Material', 'Legacy'];
    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
  }

  get helper() {
    return document.getElementById('helper');
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    switch (state) {
      case 0:
        this.legacy = false;
        break;
      case 1:
        this.legacy = true;
        break;
    }
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
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
    return [
      ['demo-api', 'Demo API'],
      ['examples-api', 'Examples render demo'],
      ['raml-types', 'RAML types with raml examples'],
      ['caro-api', 'Carolina API issue'],
      ['array-example', 'Array examples issue'],
      ['data-types-union', 'APIC-157: union data types'],
      ['SE-11508', 'SE-11508'],
      ['SE-12291', 'OAS "and" type'],
      ['demo-api-v4', 'Demo API - AMF v4']
    ].map(([file, label]) => html`
      <paper-item data-src="${file}-compact.json">${label} - compact model</paper-item>
      <paper-item data-src="${file}.json">${label}</paper-item>
      `);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      legacy,
      hasData,
      payloads,
      amf
    } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the OAuth2 authorization method element with various
        configuration options.
      </p>

      <section class="horizontal-section-container centered main">
        ${this._apiNavigationTemplate()}
        <div class="demo-container">

          <arc-interactive-demo
            .states="${demoStates}"
            @state-chanegd="${this._demoStateHandler}"
            ?dark="${darkThemeActive}"
          >

            <div slot="content">
              ${hasData ?
                html`
                  <api-body-document
                    aware="model"
                    .amf="${amf}"
                    .body="${payloads}"
                    ?compatibility="${legacy}"
                    opened
                    graph></api-body-document>
                ` :
                html`<p>Select a HTTP method in the navigation to see the demo.</p>`}
            </div>
          </arc-interactive-demo>
        </div>
      </section>
    </section>`;
  }

  _render() {
    const { amf } = this;
    render(html`
      ${this.headerTemplate()}
      <demo-element id="helper" .amf="${amf}"></demo-element>
      <!-- <raml-aware .api="${amf}" scope="model"></raml-aware> -->
      <div role="main">
        <h2 class="centered main">API body document</h2>
        ${this._demoTemplate()}
      </div>
      `, document.querySelector('#demo'));
  }
}
const instance = new ApiDemo();
instance.render();
window._demo = instance;
