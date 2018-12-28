/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   api-body-document.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../polymer/types/lib/elements/dom-if.d.ts" />
/// <reference path="../polymer/types/lib/utils/render-status.d.ts" />
/// <reference path="../raml-aware/raml-aware.d.ts" />
/// <reference path="../iron-flex-layout/iron-flex-layout.d.ts" />
/// <reference path="../api-type-document/api-type-document.d.ts" />
/// <reference path="../iron-collapse/iron-collapse.d.ts" />
/// <reference path="../iron-icon/iron-icon.d.ts" />
/// <reference path="../arc-icons/arc-icons.d.ts" />
/// <reference path="../paper-button/paper-button.d.ts" />
/// <reference path="../api-schema-document/api-schema-document.d.ts" />
/// <reference path="../markdown-styles/markdown-styles.d.ts" />
/// <reference path="../marked-element/marked-element.d.ts" />
/// <reference path="../api-resource-example-document/api-resource-example-document.d.ts" />
/// <reference path="../amf-helper-mixin/amf-helper-mixin.d.ts" />

declare namespace ApiElements {

  /**
   * `api-body-document`
   *
   * A component to render HTTP method body documentation based on AMF model
   *
   * ## Styling
   *
   * `<api-body-document>` provides the following custom properties and mixins for styling:
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--api-body-document` | Mixin applied to this elment | `{}`
   * `--api-body-document-title-border-color` | Border color of the section title | `#e5e5e5`
   * `--api-body-document-title` | Mixni apploied to the title element | `{}`
   * `--api-body-document-toggle-view-color` | Color of the toggle view button | `--arc-toggle-view-icon-color` or `rgba(0, 0, 0, 0.74)`
   * `--api-body-document-toggle-view-hover-color` | Color of the toggle view button when hovered | `var(--arc-toggle-view-icon-hover-color` or `rgba(0, 0, 0, 0.88)`
   * `--api-body-document-description-color` | Color of the type description | `rgba(0, 0, 0, 0.74)`
   * `--arc-font-subhead` | Mixin applied to the resource title | `{}`
   * `--api-body-document-media-button-background-color` | Selection color of the media type selector | `#CDDC39`
   * `--api-body-document-examples-title-color` | Color of examples section title | ``
   * `--api-body-document-examples-border-color` | Example section border color | `transparent`
   * `--code-background-color` | Background color of the examples section | ``
   * `--api-body-document-media-type-label-font-weight` | Font weight of the media type label (when selection is not available) | `500`
   * `--api-body-document-title-narrow` | Mixin applied to the title when in narrow layout | `{}`
   */
  class ApiBodyDocument extends
    ApiElements.AmfHelperMixin(
    Object) {

    /**
     * `raml-aware` scope property to use.
     */
    aware: string|null|undefined;

    /**
     * Set to true to open the body view.
     * Autormatically updated when the view is toggled from the UI.
     */
    opened: boolean|null|undefined;

    /**
     * AMF model for body as a `http://raml.org/vocabularies/http#payload`
     * type.
     */
    body: Array<object|null>|null;

    /**
     * List of discovered media types in the `body`.
     */
    readonly mediaTypes: Array<object|null>|null;

    /**
     * Computed value. True when mediaTypes has more than one item.
     */
    readonly renderMediaSelector: boolean|null|undefined;

    /**
     * Currently selected media type.
     * It is an index of a media type in `mediaTypes` array.
     * It is set to `0` each time the body changes.
     */
    selected: number|null|undefined;

    /**
     * A body model for selected media type.
     * Computed automatically when selection change.
     */
    readonly selectedBody: object|null|undefined;

    /**
     * Computed AMF schema object for the body.
     */
    readonly selectedSchema: object|null|undefined;

    /**
     * Name of the selected media type.
     */
    readonly selectedMediaType: string|null|undefined;

    /**
     * True if selected body is a structured object
     */
    readonly isObject: boolean|null|undefined;

    /**
     * True if selected body is a schema (JSON, XML, ...) data
     */
    readonly isSchema: boolean|null|undefined;

    /**
     * Computed value, true if the body is of "any" type.
     */
    readonly isAnyType: boolean|null|undefined;

    /**
     * Name of the resource type if any.
     */
    readonly typeName: string|null|undefined;

    /**
     * Computed value, true if `typeName` is set.
     */
    readonly hasTypeName: boolean|null|undefined;

    /**
     * Name of the resource type if any.
     */
    readonly description: string|null|undefined;

    /**
     * Computed value, true if `typeName` is set.
     */
    readonly hasDescription: boolean|null|undefined;

    /**
     * Computed value of examples in the body model.
     */
    readonly examples: Array<object|null>|null;

    /**
     * Computed valie if examples are set.
     */
    readonly hasExamples: boolean|null|undefined;

    /**
     * Set to render a mobile friendly view.
     */
    narrow: boolean|null|undefined;
    _bodyChanged(): void;

    /**
     * Computes list of media types in the `body`
     *
     * @param body Current value of the body.
     */
    _computeMediaTypes(body: any[]|null): Array<object|null>|null;

    /**
     * Computes value for `renderMediaSelector` properety.
     *
     * @param record `mediaTypes` change record.
     * @returns True if there's more than one item in mediaType
     */
    _computeRenderMediaSelector(record: object|null): Boolean|null;

    /**
     * Computes if `selected` equals current item index.
     */
    _mediaTypeActive(selected: Number|null, index: Number|null): Boolean|null;

    /**
     * Handler for media type type button click.
     * Sets `selected` property.
     */
    _selectMediaType(e: ClickEvent|null): void;

    /**
     * Computes value of `http://raml.org/vocabularies/http#schema` for body.
     *
     * @param selected Index of currently selected media type in
     * `mediaTypes` array
     * @param body List of body in request.
     */
    _computeSelectedBody(selected: Number|null, body: Array<object|null>|null): object|null|undefined;
    _computeSelectedSchema(selectedBody: any): any;

    /**
     * Computes value for `selectedMediaType` property.
     *
     * @param selected Currently selected media type index in the selector.
     * @param body List of bodies.
     * @returns Content type value.
     */
    _computeSelectedMediaName(selected: Number|null, body: Array<object|null>|null): String|null;

    /**
     * Handler for body value change. Computes basic view control properties.
     *
     * @param body Currently computed body.
     */
    _selectedSchemaChanged(body: object|null): void;

    /**
     * Computes a label for the section toggle buttons.
     */
    _computeToggleActionLabel(opened: any): any;

    /**
     * Computes class for the toggle's button icon.
     */
    _computeToggleIconClass(opened: any): any;

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
    _computeTypeName(body: object|null): String|null|undefined;

    /**
     * Computes `examples` property from AMF model.
     *
     * @param body Currently selected body.
     * @param schema Schema computed from the body.
     * @returns List of examples in the body
     */
    _computeExamples(body: object|null, schema: object|null): any[]|null|undefined;

    /**
     * Computes examples value by associated source maps element.
     *
     * @param id Body model AMF id.
     * @param examples An array of examples with source maps.
     * @returns List of examples or undefined if not found
     */
    _compuuteExamplesBySourceId(id: String|null, examples: Array<object|null>|null): Array<object|null>|null|undefined;

    /**
     * For an array shape it takes first item and tries to use it's example, if
     * any.
     *
     * @param body Selected body
     * @param shape Selected shape of the body
     * @returns List of examples in the shape
     */
    _computeArrayExample(body: object|null, shape: object|null): any[]|null|undefined;
  }
}

interface HTMLElementTagNameMap {
  "api-body-document": ApiElements.ApiBodyDocument;
}
