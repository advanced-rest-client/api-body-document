/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable class-methods-use-this */

import { LitElement, html } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin';
import markdownStyles from '@advanced-rest-client/markdown-styles';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@api-components/api-type-document/api-type-document.js';
import '@anypoint-web-components/anypoint-collapse/anypoint-collapse.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@api-components/api-schema-document/api-schema-document.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import '@api-components/api-resource-example-document/api-resource-example-document.js';
import styles from './Styles.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/anypoint-button').AnypointButton} AnypointButton */
/** @typedef {import('./ApiBodyDocumentElement').MediaTypeItem} MediaTypeItem */

/**
 * A component to render HTTP method body documentation based on AMF model.
 */
export class ApiBodyDocumentElement extends AmfHelperMixin(LitElement) {
  get styles() {
    return [
      markdownStyles,
      styles,
    ];
  }

  static get properties() {
    return {
      /**
       * Set to true to open the body view.
       * Automatically updated when the view is toggled from the UI.
       */
      opened: { type: Boolean },
      /**
       * AMF model for body as a `http://raml.org/vocabularies/http#payload`
       * type.
       */
      body: { type: Array },
      /**
       * requestBody description for OAS 3.0 specs
       */
      bodyDescription: { type: String },
      /**
       * List of discovered media types in the `body`.
       */
      _mediaTypes: { type: Array },
      /**
       * Computed value. True when mediaTypes has more than one item.
       */
      _renderMediaSelector: { type: Boolean },
      /**
       * Currently selected media type.
       * It is an index of a media type in `mediaTypes` array.
       * It is set to `0` each time the body changes.
       */
      selected: { type: Number },
      /**
       * A body model for selected media type.
       * Computed automatically when selection change.
       */
      _selectedBody: { type: Object },
      /**
       * Selected body ID.
       * It is computed here and passed to the type document to render
       * examples.
       */
      _selectedBodyId: { type: String },
      /**
       * Computed AMF schema object for the body.
       */
      _selectedSchema: { type: Object },
      /**
       * Name of the selected media type.
       */
      _selectedMediaType: { type: String },
      /**
       * True if selected body is a structured object
       */
      _isObject: { type: Boolean },
      /**
       * True if selected body is a schema (JSON, XML, ...) data
       */
      _isSchema: { type: Boolean },
      /**
       * Computed value, true if the body is of "any" type.
       */
      _isAnyType: { type: Boolean },
      /**
       * Name of the resource type if any.
       */
      _typeName: { type: String },
      /**
       * Computed value, true if `typeName` is set.
       */
      _hasTypeName: { type: Boolean },
      /**
       * Body name, if defined
       */
      _bodyName: { type: String },
      /**
       * Name of the resource type if any.
       */
      _description: { type: String },
      /**
       * Set to render a mobile friendly view.
       */
       narrow: { type: Boolean, reflect: true },
       /**
        * Enables compatibility with Anypoint components.
        */
       compatibility: { type: Boolean },
       /**
        * Type of the header in the documentation section.
        * Should be in range of 1 to 6.
        *
        * @default 2
        */
       headerLevel: { type: Number },
       /**
        * When enabled it renders external types as links and dispatches
        * `api-navigation-selection-changed` when clicked.
        */
       graph: { type: Boolean },
       /**
         * Method's endpoint definition as a
         * `http://raml.org/vocabularies/http#endpoint` of AMF model.
         */
       endpoint: { type: Object },
       _hasObjectExamples: { type: Boolean },
       /**
        * When enabled it renders properties that are marked as `readOnly`
        */
       renderReadOnly: { type: Boolean },
       /**
        * Bindings for the type document.
        * This is a map of the type name to the binding name.
        */
       bindings: { type: Array },
    };
  }

  get _mediaTypes() {
    return this.__mediaTypes;
  }

  set _mediaTypes(value) {
    const old = this.__mediaTypes;
    if (old === value) {
      return;
    }
    this.__mediaTypes = value;
    this.requestUpdate('_mediaTypes', old);
    this._renderMediaSelector = this._computeRenderMediaSelector(value);
  }

  get messageId() {
    try {
      const apiContractsupportedOperation = this._getAmfKey(this.ns.aml.vocabularies.apiContract.supportedOperation)
      const apiContractExpects = this._getAmfKey(this.ns.aml.vocabularies.apiContract.expects)
      const apiContractMessageId = this._getAmfKey(this.ns.aml.vocabularies.apiContract.messageId)
      const coreName = this._getAmfKey(this.ns.schema.name)    
      const expects = this.endpoint[apiContractsupportedOperation][0][apiContractExpects][0];
      const messageId = expects[apiContractMessageId] || expects[coreName]
      return messageId[0]['@value']
    } catch(e) {
      return ''
    }
  }

  get hasMessageId() {
    return this._isAsyncAPI(this.amf) && !!this.messageId
  }

  get _selectedBody() {
    return this.__selectedBody;
  }

  set _selectedBody(value) {
    const old = this.__selectedBody;
    if (old === value) {
      return;
    }
    this.__selectedBody = value;
    this.requestUpdate('_selectedBody', old);
    this._selectedBodyChanged(value);
  }

  get _selectedSchema() {
    return this.__selectedSchema;
  }

  set _selectedSchema(value) {
    const old = this.__selectedSchema;
    if (old === value) {
      return;
    }
    this.__selectedSchema = value;
    this.requestUpdate('_selectedSchema', old);
    this._selectedSchemaChanged(value);
  }

  get selected() {
    return this._selected;
  }

  set selected(value) {
    const old = this._selected;
    if (old === value) {
      return;
    }
    this._selected = value;
    this.requestUpdate('selected', old);
    this._selectedBody = this._computeSelectedBody(value, this.body);
    this._selectedMediaType = this._computeSelectedMediaName(value, this.body);
  }

  get body() {
    return this._body;
  }

  set body(value) {
    const old = this._body;
    if (old === value) {
      return;
    }
    this._body = value;
    this.requestUpdate('body', old);
    this._selectedBody = this._computeSelectedBody(this.selected, value);
    this._selectedMediaType = this._computeSelectedMediaName(this.selected, value);
    this._bodyChanged();
  }

  get bodyDescription() {
    return this._bodyDescription;
  }

  set bodyDescription(value) {
    const old = this._bodyDescription;
    if (old === value) {
      return;
    }
    this._bodyDescription = value;
    this.requestUpdate('bodyDescription', old);
  }

  get toggleActionLabel() {
    const { opened } = this;
    return opened ? 'Hide' : 'Show';
  }

  get bindings() {
    return this._bindings
  }

  set bindings(value) {
    const old = this._bindings;
    if (old === value) {
      return;
    }

    const messageKey = this._getAmfKey(this.ns.aml.vocabularies.apiBinding.messageKey)
    const typeKey = this._getAmfKey(this.ns.aml.vocabularies.apiBinding.type)
    const dataTypeKey = this._getAmfKey(this.ns.w3.shacl.datatype)
    const descriptionKey = this._getAmfKey(this.ns.aml.vocabularies.core.description)

    try {
      this._bindings = value?.map((item) => ({
        key: item[messageKey][0][descriptionKey][0]['@value'],
        dataType: item[messageKey][0][dataTypeKey] ? this._getDataType(item[messageKey][0][dataTypeKey][0]['@id']) : 'any', // integer, number, long, float, double, boolean
        bindingType: this._getValue(item, typeKey), // kafka, AMQP, etc
      }))
    } catch(e) {
      console.log(e)
    }

  }

  _getDataType(type){
    const xmlSchema = this.ns.w3.xmlSchema;
    switch (type) {
      case this._getAmfKey(xmlSchema.number):
          return 'number';
      case this._getAmfKey(xmlSchema.long):
        return 'long';
      case this._getAmfKey(xmlSchema.integer):
        return 'integer';
      case this._getAmfKey(xmlSchema.float):
        return 'float';
      case this._getAmfKey(xmlSchema.double):
        return 'double';
      case this._getAmfKey(xmlSchema.boolean):
        return 'boolean';
      default:
        return 'any';
    }
  }

  constructor() {
    super();
    this._renderMediaSelector = false;
    this._hasObjectExamples = false;
    this.headerLevel = 2;
    this.compatibility = false;
    this.renderReadOnly = false;
    this.graph = false;
    this.narrow = false;
    /**
     * @type {MediaTypeItem[]=}
     */
    this._mediaTypes = undefined;
  }

  __amfChanged() {
    this._bodyChanged();
  }

  _bodyChanged() {
    if (this.__bodyChangedDebounce) {
      return;
    }
    this.__bodyChangedDebounce = true;
    setTimeout(() => {
      this.__bodyChangedDebounce = false;
      this.__bodyChanged(this.body);
    });
  }

  /**
   * Computes basic view values when body change.
   *
   * @param {Object} body
   */
  __bodyChanged(body) {
    if (!body) {
      return;
    }
    this.selected = -1;
    const media = this._computeMediaTypes(body);
    this._mediaTypes = media;
    this.selected = 0;
  }

  _selectedBodyChanged(value) {
    this._selectedBodyId = value && value['@id'];
    this._selectedSchema = this._computeSelectedSchema(value);
    this._hasObjectExamples = false;
  }

  /**
   * Computes list of media types in the `body`
   * @param {any} body Current value of the body.
   * @return {MediaTypeItem[]|undefined}
   */
  _computeMediaTypes(body) {
    const result = [];
    body.forEach((item) => {
      const label = this._getValue(item, this.ns.aml.vocabularies.core.mediaType);
      if (label) {
        result.push({
          label
        });
      }
    });
    return result.length ? result : undefined;
  }

  /**
   * Computes value for `renderMediaSelector` property.
   * @param {MediaTypeItem[]} types `mediaTypes` change record.
   * @return {boolean}
   */
  _computeRenderMediaSelector(types) {
    return !!(types && types.length && types.length > 1);
  }

  /**
   * Handler for media type type button click.
   * Sets `selected` property.
   *
   * @param {PointerEvent} e
   */
  _selectMediaType(e) {
    const node = /** @type AnypointButton */ (e.target);
    const index = Number(node.dataset.index);
    if (Number.isNaN(index)) {
      return;
    }
    if (index !== this.selected) {
      this.selected = index;
    }
    setTimeout(() => {
      node.active = true;
    });
  }

  /**
   * Computes value of `http://raml.org/vocabularies/http#schema` for body.
   * @param {number} selected Index of currently selected media type in
   * `mediaTypes` array
   * @param {any[]} body List of body in the request.
   * @return {any|undefined}
   */
  _computeSelectedBody(selected, body) {
    if (!body || (!selected && selected !== 0)) {
      return undefined;
    }
    return body[selected];
  }

  _computeSelectedSchema(selectedBody) {
    if (!selectedBody) {
      return undefined;
    }
    const key = this._getAmfKey(this.ns.aml.vocabularies.shapes.schema);
    let schema = selectedBody[key];
    if (!schema) {
      return undefined;
    }
    if (Array.isArray(schema)) {
      [schema] = schema;
    }
    return this._resolve(schema);
  }

  /**
   * Computes value for `selectedMediaType` property.
   * @param {number} selected Currently selected media type index in the selector.
   * @param {any} body List of body schemas.
   * @return {string} Content type value.
   */
  _computeSelectedMediaName(selected, body) {
    if (!body || (!selected && selected !== 0)) {
      return undefined;
    }
    const data = body[selected];
    return /** @type string */ (this._getValue(data, this.ns.aml.vocabularies.core.mediaType) || this._getValue(data, this.ns.aml.vocabularies.apiContract.schemaMediaType));
  }

  /**
   * Handler for body value change. Computes basic view control properties.
   * @param {any} body Currently computed body.
   */
  _selectedSchemaChanged(body) {
    this._typeName = this._computeTypeName(body);
    this._bodyName = this._getValue(body, this.ns.aml.vocabularies.core.name);
    this._description = this._computeDescription(body);
    let isObject = false;
    let isSchema = false;
    let isAnyType = false;
    let isAnd = false;
    let isOr = false;
    let isXone = false;
    const types = body && body['@type'];
    if (types) {
      if (types.indexOf(this._getAmfKey(this.ns.w3.shacl.NodeShape)) > -1 ||
        types.indexOf(this._getAmfKey(this.ns.aml.vocabularies.shapes.UnionShape)) > -1) {
        isObject = true;
      } else if (types.indexOf(this._getAmfKey(this.ns.aml.vocabularies.shapes.SchemaShape)) > -1 ||
        types.indexOf(this._getAmfKey(this.ns.aml.vocabularies.shapes.ScalarShape)) > -1) {
        isSchema = true;
      } else if (types.indexOf(this._getAmfKey(this.ns.aml.vocabularies.shapes.ArrayShape)) > -1) {
        isObject = true;
      } else if (types.indexOf(this._getAmfKey(this.ns.aml.vocabularies.shapes.AnyShape)) > -1) {
        const andKey = this._getAmfKey(this.ns.w3.shacl.and);
        const orKey = this._getAmfKey(this.ns.w3.shacl.or);
        const xoneKey = this._getAmfKey(this.ns.w3.shacl.xone);
        if (andKey in body) {
          isAnd = true;
        } else if (orKey in body) {
          isOr = true;
        } else if (xoneKey in body) {
          isXone = true;
        }else {
          isAnyType = true;
        }
      }
    }
    this._isObject = isObject || isAnd || isOr || isXone;
    this._isSchema = isSchema;
    this._isAnyType = isAnyType;
  }

  /**
   * Toggles URI parameters view.
   * Use `pathOpened` property instead.
   */
  toggle() {
    this.opened = !this.opened;
  }

  /**
   * Computes `typeName` as a name of body in the AMF model.
   *
   * @param {Object} body Currently selected body.
   * @return {String|undefined}
   */
  _computeTypeName(body) {
    let value = /** @type string */ (this._getValue(body, this.ns.w3.shacl.name));
    if (value && (value === 'schema' || value.indexOf('amf_inline_type') === 0)) {
      value = undefined;
    }
    return value;
  }

  /**
   * A template to render for "Any" AMF model.
   * @return {TemplateResult}
   */
  _anyTypeTemplate() {
    const {
      compatibility,
      _bodyName,
      _description,
      _typeName,
      _selectedBody,
      _selectedMediaType,
      _selectedBodyId,
      renderReadOnly,
      _renderMediaSelector
    } = this;
    const hasBodyName = !!_bodyName;
    const hasDescription = !!_description;
    const hasTypeName = _typeName && _typeName !== 'default';
    return html`
    <div class="media-type-selector">
      <span>Media type:</span>
      ${_renderMediaSelector ?
      this._mediaTypesTemplate() :
      html`<span class="media-type-label">${_selectedMediaType}</span>`}
    </div>
    ${hasBodyName ? html`<div class="body-name type-title">${_bodyName}</div>` : ''}
    ${hasDescription ? html`<arc-marked .markdown="${_description}" sanitize>
      <div slot="markdown-html" class="markdown-html" part="markdown-html" ?data-with-title="${hasTypeName}"></div>
    </arc-marked>` : ''}
    ${!!this.bindings ?
      html`<ul class="bindings-container-list">
        ${this.bindings.map(item => html`<li>
          <p class="bindings-header">
            <label>Message specific information:</label>
            <span class="binding-type"> ${item.bindingType}</span>
          </p>
          <div class="bindings-body">
            <label>key</label>
            <span class="binding-key">${item.key}</span>
            <span class="binding-data-type">${item.dataType}</span>
          </div>
        </li>`)}
      </ul>`
    : ''}
    <p class="any-info">Any instance of data is allowed.</p>
    <p class="any-info-description">
      The API file specifies body for this request but it does not specify the data model.
    </p>

    <api-resource-example-document
      .amf="${this.amf}"
      .examples="${_selectedBody}"
      .mediaType="${_selectedMediaType}"
      .typeName="${_typeName}"
      .payloadId="${_selectedBodyId}"
      .renderReadOnly="${renderReadOnly}"
      ?compatibility="${compatibility}"
    ></api-resource-example-document>
    `;
  }

  /**
   * A template to render for any AMF model\ that is different than "any".
   * @return {TemplateResult}
   */
  _typedTemplate() {
    const {
      compatibility,
      graph,
      _bodyName,
      _description,
      _typeName,
      _selectedSchema,
      _selectedMediaType,
      _selectedBodyId,
      _renderMediaSelector,
      _isObject,
      _isSchema,
      amf,
      narrow,
      renderReadOnly,
      bodyDescription,
      hasMessageId,
      messageId
    } = this;
    const hasBodyName = !!_bodyName;
    const hasDescription = !!_description;
    const hasTypeName = _typeName && _typeName !== 'default';
    const hasBodyDescription = !!bodyDescription

    return html`
    <div class="media-type-selector">
      <span>Media type:</span>
      ${_renderMediaSelector ?
        this._mediaTypesTemplate() :
        html`<span class="media-type-label">${_selectedMediaType}</span>`}
    </div>
    ${hasMessageId ? html`<div class="message-id-container">Message ID <span class="message-id-tag">${messageId}</span></div>` : ''}
    ${hasBodyDescription ? html`
        <arc-marked .markdown="${bodyDescription}" sanitize>
            <div slot="markdown-html" class="markdown-html" part="markdown-html"></div>
        </arc-marked>` : ''}
    ${hasBodyName ? html`<div class="body-name type-title">${_bodyName}</div>` : ''}
    ${hasTypeName ? html`<div class="type-title">${_typeName}</div>` : ''}
    ${hasDescription ? html`
    <arc-marked .markdown="${_description}" sanitize>
      <div slot="markdown-html" class="markdown-html" part="markdown-html" ?data-with-title="${hasTypeName}"></div>
    </arc-marked>` : ''}

    ${_isObject ?
      html`<api-type-document
      .amf="${amf}"
      ?renderReadOnly="${renderReadOnly}"
      .selectedBodyId="${_selectedBodyId}"
      .type="${_selectedSchema}"
      .narrow="${narrow}"
      .mediaType="${_selectedMediaType}"
      ?compatibility="${compatibility}"
      ?graph="${graph}"></api-type-document>` : ''}
    ${_isSchema ?
      html`<api-schema-document
        .amf="${amf}"
        .mediaType="${_selectedMediaType}"
        .shape="${_selectedSchema}"
        ?compatibility="${compatibility}"></api-schema-document>` :
      ''}`;
  }

  /**
   * @return {TemplateResult[]|string} Template for the media types buttons
   */
  _mediaTypesTemplate() {
    const items = /** @type MediaTypeItem[] */ (this._mediaTypes);
    if (!Array.isArray(items) || !items.length) {
      return '';
    }
    return items.map((item, index) => this._mediaTypeToggleButtonTemplate(item, index));
  }

  /**
   * @param {MediaTypeItem} item
   * @param {number} index
   * @return {TemplateResult} Template for a media types button
   */
  _mediaTypeToggleButtonTemplate(item, index) {
    const { selected } = this;
    return html`<anypoint-button
      class="media-toggle"
      data-index="${index}"
      title="Select ${item.label} media type"
      .active="${selected === index}"
      ?compatibility="${this.compatibility}"
      toggles
      @click="${this._selectMediaType}"
    >${item.label}</anypoint-button>`;
  }

  render() {
    const { opened, _isAnyType, compatibility, headerLevel } = this;
    const iconClass = {
      'toggle-icon': true,
      opened,
    };
    return html`
    <style>${this.styles}</style>
    <section class="body">
      <div
        class="section-title-area body"
        @click="${this.toggle}"
        title="Toggle body details"
        ?data-opened="${opened}"
      >
        <div class="heading3" role="heading" aria-level="${headerLevel}">Body</div>
        <div class="title-area-actions" data-toggle="body">
          <anypoint-button
            class="toggle-button"
            ?compatibility="${compatibility}"
            data-toggle="body">
            ${this.toggleActionLabel}
            <arc-icon class="${classMap(iconClass)}" icon="expandMore"></arc-icon>
          </anypoint-button>
        </div>
      </div>
      <anypoint-collapse .opened="${opened}">
        ${_isAnyType ? this._anyTypeTemplate() : this._typedTemplate()}
      </anypoint-collapse>
    </section>`;
  }
}
