/* eslint-disable class-methods-use-this */

import { LitElement, html } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import { expandMore } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@api-components/raml-aware/raml-aware.js';
import '@api-components/api-type-document/api-type-document.js';
import '@polymer/iron-collapse/iron-collapse.js';
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
       * `raml-aware` scope property to use.
       */
      aware: { type: String },
      /**
       * Set to true to open the body view.
       * Autormatically updated when the view is toggled from the UI.
       */
      opened: { type: Boolean },
      /**
       * AMF model for body as a `http://raml.org/vocabularies/http#payload`
       * type.
       */
      body: { type: Array },
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
       _hasObjectExamples: { type: Boolean },
       /**
        * When enabled it renders properties that are marked as `readOnly`
        */
       renderReadOnly: { type: Boolean },
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
     * @type {string}
     */
    this.aware = undefined;
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
   * @param {object} body Current value of the body.
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
   * Computes value for `renderMediaSelector` properety.
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
   * @param {Number} selected Index of currently selected media type in
   * `mediaTypes` array
   * @param {Array<Object>} body List of body in the request.
   * @return {Object|undefined}
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
   * @param {Array<Object>} body List of body schemas.
   * @return {string} Content type value.
   */
  _computeSelectedMediaName(selected, body) {
    if (!body || (!selected && selected !== 0)) {
      return undefined;
    }
    const data = body[selected];
    return /** @type string */ (this._getValue(data, this.ns.aml.vocabularies.core.mediaType));
  }

  /**
   * Handler for body value change. Computes basic view control properties.
   * @param {Object} body Currently computed body.
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
        if (andKey in body) {
          isAnd = true;
        } else if (orKey in body) {
          isOr = true;
        }else {
          isAnyType = true;
        }
      }
    }
    this._isObject = isObject || isAnd || isOr;
    this._isSchema = isSchema;
    this._isAnyType = isAnyType;
  }

  // Computes a label for the section toggle buttons.
  _computeToggleActionLabel(opened) {
    return opened ? 'Hide' : 'Show';
  }

  // Computes class for the toggle's button icon.
  _computeToggleIconClass(opened) {
    let clazz = 'toggle-icon';
    if (opened) {
      clazz += ' opened';
    }
    return clazz;
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

  _apiChangedHandler(e) {
    const { value } = e.detail;
    this.amf = value;
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
    const hasTypeName = !!_typeName;
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
    } = this;
    const hasBodyName = !!_bodyName;
    const hasDescription = !!_description;
    const hasTypeName = !!_typeName;

    return html`
    <div class="media-type-selector">
      <span>Media type:</span>
      ${_renderMediaSelector ?
        this._mediaTypesTemplate() :
        html`<span class="media-type-label">${_selectedMediaType}</span>`}
    </div>
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
        .partentTypeId="${_selectedBodyId}"
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
    const { opened, _isAnyType, aware, compatibility, headerLevel } = this;
    const iconClass = this._computeToggleIconClass(opened);
    return html`<style>${this.styles}</style>
    ${aware ?
      html`<raml-aware @api-changed="${this._apiChangedHandler}" .scope="${aware}"></raml-aware>` : ''}

    <div
      class="section-title-area"
      @click="${this.toggle}"
      title="Toogle body details"
      ?opened="${opened}"
    >
      <div class="table-title" role="heading" aria-level="${headerLevel}">Body</div>
      <div class="title-area-actions">
        <anypoint-button
          class="toggle-button"
          ?compatibility="${compatibility}">
          ${this._computeToggleActionLabel(opened)}
          <span class="icon ${iconClass}">${expandMore}</span>
        </anypoint-button>
      </div>
    </div>

    <iron-collapse .opened="${opened}">
      ${_isAnyType ? this._anyTypeTemplate() : this._typedTemplate()}
    </iron-collapse>`;
  }
}
