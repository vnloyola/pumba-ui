.pumba-__name__ {
  display: block;
  padding: var(--pumba-space-control-y) var(--pumba-space-control-x);
  border: 1px solid var(--pumba-color-border);
  border-radius: var(--pumba-radius-control);
  font-family: var(--pumba-text-body-font-family);
  font-size: var(--pumba-text-body-font-size);
  font-weight: var(--pumba-text-body-font-weight);
  line-height: var(--pumba-text-body-line-height);
}

.pumba-__name__[data-variant="default"] {
  background: var(--pumba-color-surface);
  color: var(--pumba-color-text);
}

.pumba-__name__[data-size="sm"] {
  padding: var(--pumba-space-1) var(--pumba-space-3);
}

.pumba-__name__[data-size="lg"] {
  padding: var(--pumba-space-3) var(--pumba-space-6);
}

.pumba-__name__:hover,
.pumba-__name__[data-hovered] {
  border-color: var(--pumba-color-border-strong);
}

.pumba-__name__:active,
.pumba-__name__[data-pressed] {
  background: var(--pumba-color-accent-subtle);
}

.pumba-__name__:focus-visible,
.pumba-__name__[data-focus-visible] {
  outline: 2px solid var(--pumba-color-focus);
  outline-offset: 2px;
}
