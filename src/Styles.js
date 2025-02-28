import { css } from 'lit-element';

export default css`
:host {
  display: block;
  font-size: var(--arc-font-body1-font-size);
  font-weight: var(--arc-font-body1-font-weight);
  line-height: var(--arc-font-body1-line-height);
}

[hidden] {
  display: none !important;
}

.section-title-area {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: var(--api-body-document-title-border-bottom,
    1px var(--api-body-document-title-border-color, var(--api-parameters-document-title-border-color, #e5e5e5)) solid
  );
  cursor: pointer;
  user-select: none;
  transition: border-bottom-color 0.15s ease-in-out;
}

.section-title-area[data-opened] {
  border-bottom-color: transparent;
}

.toggle-button {
  outline: none;
}

.toggle-icon {
  margin-left: 8px;
  transform: rotateZ(0deg);
  transition: transform 0.3s ease-in-out;
}

.toggle-icon.opened {
  transform: rotateZ(-180deg);
}

.heading3 {
  flex: 1;
  font-family: var(--api-body-document-h3-font-family, var(--arc-font-subhead-font-family));
  color: var(--api-body-document-h3-font-color, var(--arc-font-subhead-color));
  font-size: var(--api-body-document-h3-font-size, var(--arc-font-subhead-font-size));
  font-weight: var(--api-body-document-h3-font-weight, var(--arc-font-subhead-font-weight));
  line-height: var(--api-body-document-h3-line-height, var(--arc-font-subhead-line-height));
}

:host([narrow]) .heading3 {
  font-size: var(--api-body-document-title-narrow-font-size, var(--arc-font-subhead-narrow-font-size, 17px));
}

.type-title {
  font-size: var(--arc-font-body2-font-size);
  font-weight: var(--arc-font-body2-font-weight);
  line-height: var(--arc-font-body2-line-height);
}

.body-name {
  font-weight: var(--api-body-document-any-info-font-weight, 500);
  font-size: var(--api-body-document-body-name-font-size, 1.1rem);
}

anypoint-button[active] {
  color: var(--api-body-document-media-button-color);
  background-color: var(--api-body-document-media-button-background-color, #CDDC39);
  text-decoration: var(--api-body-document-media-button-text-decoration);
  text-underline-offset: var(--api-body-document-media-button-text-underline-offset);
}

.media-type-selector {
  margin: 20px 0;
  color: var(--api-body-document-media-type-selector-color);
  font-size: var(--api-body-document-media-type-selector-font-size);
  font-weight: var(--api-body-document-media-type-selector-font-weight);
}

.markdown-html {
  margin-bottom: 28px;
  margin-top: 28px;
  color: var(--api-body-document-description-color, rgba(0, 0, 0, 0.74));
}

.markdown-html[data-with-title] {
  margin-top: 0;
}

api-schema-document {
  background-color: var(--code-background-color);
  padding: 8px;
  color: var(--api-body-document-code-color, initial);
  word-break: break-all;
}

.media-type-label {
  font-weight: var(--api-body-document-media-type-label-font-weight, 500);
  margin-left: 8px;
}

.media-toggle {
  outline: none;
  color: var(--api-body-document-toggle-view-color, var(--arc-toggle-view-icon-color, rgba(0, 0, 0, 0.74)));
  font-size: var(--api-body-document-toggle-view-font-size);
  font-weight: var(--api-body-document-toggle-view-font-weight);
}

.any-info,
.any-info-description {
  color: var(--api-body-document-description-color, rgba(0, 0, 0, 0.74));
}

.any-info {
  font-size: var(--api-body-document-any-info-font-size, 16px);
}

arc-marked {
  background-color: transparent;
  padding: 0px;
}

.bindings-container-list {
  padding: 0;
  list-style-type: none;

}

.bindings-container-list li .bindings-header {
 font-weight: 400;
}

.bindings-container-list li .bindings-header > .binding-type {
 font-weight: 600;
}

.bindings-container-list li .bindings-body > label {
  display: block;
}

.bindings-container-list li .bindings-body > .binding-data-type {
  text-transform: capitalize;
}

.message-id-container {
  background-color: white;
  font-size: 14px;
  padding: 1em;
}

.message-id-tag {
  border: 1px solid #D67300;
  border-radius: 4px;
  padding: 4px 19px;
  color: #D67300;
  margin-left: 20px;
}
`;
