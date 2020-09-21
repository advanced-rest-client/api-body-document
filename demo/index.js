import { html } from 'lit-html';
import { ApiDemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '../api-body-document.js';

class ApiDemo extends ApiDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'payloads'
    ]);
    this.compatibility = false;
    this.componentName = 'api-body-document';
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
    const webApi = this._computeWebApi(this.amf);
    const method = this._computeMethodModel(webApi, selected);
    const payloads = this.computePayloads(method);
    this.payloads = payloads;
    this.hasData = true;
  }

  computePayloads(model) {
    if (!model) {
      return undefined;
    }
    let result = [];
    const expects = this._computeExpects(model);
    if (expects) {
      let payloads = this._computePayload(expects);
      if (payloads) {
        if (!Array.isArray(payloads)) {
          payloads = [payloads];
        }
        result = payloads;
      }
    }
    const returns = this._computeReturns(model);
    if (returns) {
      for (let i = 0, len = returns.length; i < len; i++) {
        let payloads = this._computePayload(returns[i]);
        if (payloads) {
          if (!Array.isArray(payloads)) {
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
      ['demo-api-v4', 'Demo API - AMF v4'],
      ['APIC-463', 'APIC-463']
    ].map(([file, label]) => html`
      <anypoint-item data-src="${file}-compact.json">${label} - compact model</anypoint-item>
      <anypoint-item data-src="${file}.json">${label}</anypoint-item>
      `);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      hasData,
      payloads,
      amf
    } = this;
    return html`
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API body document element with various
        configuration options.
      </p>
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
                ?compatibility="${compatibility}"
                opened
                graph></api-body-document>
            ` :
            html`<p>Select a HTTP method in the navigation to see the demo.</p>`}
        </div>
      </arc-interactive-demo>
    </section>`;
  }

  contentTemplate() {
    return html`
    <h2>API body document</h2>
    ${this._demoTemplate()}
    `;
  }
}
const instance = new ApiDemo();
instance.render();
