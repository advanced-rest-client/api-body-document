import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@api-components/raml-aware/raml-aware.js';
import '@api-components/api-type-document/api-type-document.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@api-components/api-schema-document/api-schema-document.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import '@api-components/api-resource-example-document/api-resource-example-document.js';

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('@anypoint-web-components/anypoint-button').AnypointButton} AnypointButton */

export declare interface MediaTypeItem {
  label: string;
}

export declare interface ApiBodyDocumentElement extends AmfHelperMixin, LitElement {

}

/**
 * A component to render HTTP method body documentation based on AMF model.
 */
export declare class ApiBodyDocumentElement extends AmfHelperMixin(LitElement) {
  readonly styles: CSSResult[];

  /**
   * `raml-aware` scope property to use.
   * @deprecated Use direct binding instead.
   */
  aware: string;
  /**
   * Set to true to open the body view.
   * Autormatically updated when the view is toggled from the UI.
   */
  opened: boolean;
  /**
   * AMF model for body as a `http://raml.org/vocabularies/http#payload`
   * type.
   */
  body: any[];
  /**
   * List of discovered media types in the `body`.
   */
  _mediaTypes: any[];
  /**
   * Computed value. True when mediaTypes has more than one item.
   */
  _renderMediaSelector: boolean;
  /**
   * Currently selected media type.
   * It is an index of a media type in `mediaTypes` array.
   * It is set to `0` each time the body changes.
   */
  selected: number;
  /**
   * A body model for selected media type.
   * Computed automatically when selection change.
   */
  _selectedBody: object;
  /**
   * Selected body ID.
   * It is computed here and passed to the type document to render
   * examples.
   */
  _selectedBodyId: string;
  /**
   * Computed AMF schema object for the body.
   */
  _selectedSchema: object;
  /**
   * Name of the selected media type.
   */
  _selectedMediaType: string;
  /**
   * True if selected body is a structured object
   */
  _isObject: boolean;
  /**
   * True if selected body is a schema (JSON, XML, ...) data
   */
  _isSchema: boolean;
  /**
   * Computed value, true if the body is of "any" type.
   */
  _isAnyType: boolean;
  /**
   * Name of the resource type if any.
   */
  _typeName: string;
  /**
   * Computed value, true if `typeName` is set.
   */
  _hasTypeName: boolean;
  /**
   * Body name, if defined
   */
  _bodyName: string;
  /**
   * Name of the resource type if any.
   */
  _description: string;
  /**
   * Set to render a mobile friendly view.
   */
  narrow: boolean;
  /**
   * Enables compatibility with Anypoint components.
   */
  compatibility: boolean;
  /**
   * Type of the header in the documentation section.
   * Should be in range of 1 to 6.
   *
   * @default 2
   */
  headerLevel: number;
  /**
   * When enabled it renders external types as links and dispatches
   * `api-navigation-selection-changed` when clicked.
   */
  graph: boolean;
  _hasObjectExamples: boolean;
  /**
   * When enabled it renders properties that are marked as `readOnly`
   */
  renderReadOnly: boolean;
  __bodyChangedDebounce: boolean;

  constructor();

  __amfChanged(): void;

  /**
   * Computes basic view values when body change.
   */
  __bodyChanged(body: any): void;

  _selectedBodyChanged(value: any): void;

  /**
   * Computes list of media types in the `body`
   * @param body Current value of the body.
   */
  _computeMediaTypes(body: object): MediaTypeItem[]|undefined;

  /**
   * Computes value for `renderMediaSelector` properety.
   * @param types `mediaTypes` change record.
   */
  _computeRenderMediaSelector(types: MediaTypeItem[]): boolean;

  /**
   * Handler for media type type button click.
   * Sets `selected` property.
   *
   * @param {PointerEvent} e
   */
  _selectMediaType(e: PointerEvent): void;

  /**
   * Computes value of `http://raml.org/vocabularies/http#schema` for body.
   * @param selected Index of currently selected media type in
   * `mediaTypes` array
   * @param body List of body in the request.
   */
  _computeSelectedBody(selected:number, body:any[]): any|undefined;

  _computeSelectedSchema(selectedBody: any): any|undefined;

  /**
   * Computes value for `selectedMediaType` property.
   * @param selected Currently selected media type index in the selector.
   * @param body List of body schemas.
   * @returns Content type value.
   */
  _computeSelectedMediaName(selected: number, body: any[]): string|undefined

  /**
   * Handler for body value change. Computes basic view control properties.
   * @param body Currently computed body.
   */
  _selectedSchemaChanged(body: any): void;

  /**
   * Computes a label for the section toggle buttons.
   */
  _computeToggleActionLabel(opened: boolean): string;

  /**
   * Computes class for the toggle's button icon.
   */
  _computeToggleIconClass(opened: boolean): string;

  /**
   * Toggles URI parameters view.
   * Use `pathOpened` property instead.
   */
  toggle(): void;

  /**
   * Computes `typeName` as a name of body in the AMF model.
   *
   * @param body Currently selected body.
   */
  _computeTypeName(body: any): string|undefined;

  _apiChangedHandler(e: CustomEvent): void;

  /**
   * A template to render for "Any" AMF model.
   */
  _anyTypeTemplate(): TemplateResult;

  /**
   * A template to render for any AMF model\ that is different than "any".
   */
  _typedTemplate(): TemplateResult;

  /**
   * @returns Template for the media types buttons
   */
  _mediaTypesTemplate(): TemplateResult[]|string;

  /**
   * @param item
   * @param index
   * @returns Template for a media types button
   */
  _mediaTypeToggleButtonTemplate(item: MediaTypeItem, index: number): TemplateResult;

  render(): TemplateResult;
}
