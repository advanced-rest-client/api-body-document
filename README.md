[![Build Status](https://travis-ci.org/advanced-rest-client/api-body-document.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/api-body-document)

# api-body-document

A component to render HTTP method body documentation based on AMF model

```html
<api-schema-document></api-schema-document>
```

## Styling

`<api-body-document>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--api-body-document` | Mixin applied to this elment | `{}`
`--api-body-document-title-border-color` | Border color of the section title | `#e5e5e5`
`--api-body-document-title` | Mixni apploied to the title element | `{}`
`--api-body-document-toggle-view-color` | Color of the toggle view button | `--arc-toggle-view-icon-color` or `rgba(0, 0, 0, 0.74)`
`--api-body-document-toggle-view-hover-color` | Color of the toggle view button when hovered | `var(--arc-toggle-view-icon-hover-color` or `rgba(0, 0, 0, 0.88)`
`--api-body-document-description-color` | Color of the type description | `rgba(0, 0, 0, 0.74)`
`--arc-font-subhead` | Mixin applied to the resource title | `{}`
`--api-body-document-media-button-background-color` | Selection color of the media type selector | `#CDDC39`
`--api-body-document-examples-title-color` | Color of examples section title | ``
`--api-body-document-examples-border-color` | Example section border color | `transparent`
`--code-background-color` | Background color of the examples section | ``
`--api-body-document-media-type-label-font-weight` | Font weight of the media type label (when selection is not available) | `500`
`--api-body-document-title-narrow` | Mixin applied to the title when in narrow layout | `{}`

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/).
