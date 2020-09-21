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
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border-bottom: 1px var(--api-body-document-title-border-color, #e5e5e5) solid;
  transition: border-bottom-color 0.15s ease-in-out;
}

.section-title-area[opened] {
  border-bottom-color: transparent;
}

.section-title-area .table-title {
  flex: 1;
  flex-basis: 0.000000001px;
  font-size: var(--api-body-document-title-narrow-font-size, initial);
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

.table-title {
  font-size: var(--arc-font-subhead-font-size);
  font-weight: var(--arc-font-subhead-font-weight);
  line-height: var(--arc-font-subhead-line-height);
}

:host([narrow]) .table-title {
  font-size: var(--api-body-document-title-narrow-font-size, initial);
}

.type-title {
  font-size: var(--arc-font-body2-font-size);
  font-weight: var(--arc-font-body2-font-weight);
  line-height: var(--arc-font-body2-line-height);
}

.body-name {
  font-weight: var(--api-body-document-any-info-font-weight, 500);
  font-size: 1.1rem;
}

anypoint-button[active] {
  background-color: var(--api-body-document-media-button-background-color, #CDDC39);
}

.media-type-selector {
  margin: 20px 0;
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

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}
`;
