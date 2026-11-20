/** Visual design tokens (colors, z-index, shadows) for the editor UI. */

export const EDITOR_VAR_PREFIX = '--horizons-editor-';
const editorVar = (token) => `var(${EDITOR_VAR_PREFIX}${token})`;

/** Background color for floating panels and toolbars. */
export const PANEL_BG = editorVar('panel-bg');
/** Background color for inset input surfaces inside panels (textareas, fields). */
export const PANEL_INPUT_BG = editorVar('panel-input-bg');
/** Border color for panel borders and dividers. */
export const BORDER_COLOR = editorVar('border');
/** Translucent border for subtle outlines. */
export const BORDER_COLOR_TRANSLUCENT = editorVar('border-translucent');
/** Border color for focused inputs: a touch stronger than the default. */
export const BORDER_COLOR_FOCUS = editorVar('border-focus');
/** Subtle hover background for interactive panel controls. */
export const HOVER_BG = editorVar('hover-bg');
/** Active/pressed background for panel controls. */
export const ACTIVE_BG = editorVar('active-bg');
/** Default foreground color on panels. */
export const TEXT_COLOR = editorVar('text');
/** Secondary foreground on panels for labels and placeholders. */
export const TEXT_MUTED = editorVar('text-muted');
export const BUTTON_BG = editorVar('button-bg');
/** Foreground color for the filled Comment button. */
export const BUTTON_TEXT = editorVar('button-text');
/** Hover background for the filled Comment button. */
export const BUTTON_BG_HOVER = editorVar('button-bg-hover');
/** Placeholder text color in panel inputs. */
export const PLACEHOLDER_COLOR = editorVar('placeholder');
/** Scrollbar thumb on panel surfaces. Matches the chat's `--scrollbar-thumb`. */
export const SCROLLBAR_THUMB = editorVar('scrollbar-thumb');
/** Hovered scrollbar thumb. Matches the chat's `--scrollbar-thumb-hover`. */
export const SCROLLBAR_THUMB_HOVER = editorVar('scrollbar-thumb-hover');
export const DIVIDER_COLOR = editorVar('divider');
export const MARKER_BORDER = editorVar('marker-border');
export const CONTROL_BORDER = editorVar('control-border');
export const CONTROL_BG = editorVar('control-bg');
export const CONTROL_ICON = editorVar('control-icon');
export const CHECKER_COLOR = editorVar('checker');
/** Outline color for editable targets in edit mode. */
export const EDIT_BORDER_COLOR = '#673DE6';
/** Hover background for editable targets in edit mode. */
export const EDIT_BACKGROUND_COLOR = '#673DE61A';
/** Accent color for annotation panel buttons and markers. */
export const ANNOTATION_COLOR = '#673DE6';
/** Hover state for annotation buttons and markers. */
export const ANNOTATION_COLOR_HOVER = '#5025D1';
export const COLOR_WHITE = '#ffffff';

export const EDITOR_PALETTES = {
  dark: {
    'panel-bg': '#1D1E20',
    'panel-input-bg': '#262831',
    'border': '#3B3D4A',
    'border-translucent': '#ffffff33',
    'border-focus': '#6B6E7E',
    'hover-bg': '#ffffff0d',
    'active-bg': '#2a2b2f',
    'text': '#ffffff',
    'text-muted': '#ffffff80',
    'button-bg': '#ffffff',
    'button-text': '#161718',
    'button-bg-hover': '#E5E5E7',
    'placeholder': '#D1D5DC',
    'scrollbar-thumb': 'rgba(255, 255, 255, 0.28)',
    'scrollbar-thumb-hover': 'rgba(255, 255, 255, 0.42)',
    'divider': '#ffffff26',
    'marker-border': '#ffffff25',
    'control-border': '#ffffff4d',
    'control-bg': '#ffffff08',
    'control-icon': '#ffffff99',
    'checker': '#555',
  },
  light: {
    'panel-bg': '#ffffff',
    'panel-input-bg': '#f5f5f6',
    'border': '#0000001a',
    'border-translucent': '#0000001a',
    'border-focus': '#797980',
    'hover-bg': '#0000000d',
    'active-bg': '#0000001a',
    'text': '#18181a',
    'text-muted': '#58585e',
    'button-bg': '#18181a',
    'button-text': '#f8f9fa',
    'button-bg-hover': '#000000cc',
    'placeholder': '#9d9ea4',
    'scrollbar-thumb': '#00000033',
    'scrollbar-thumb-hover': '#9d9ea4',
    'divider': '#0000001a',
    'marker-border': '#0000001a',
    'control-border': '#797980',
    'control-bg': '#0000000d',
    'control-icon': '#58585e',
    'checker': '#c6c6cc',
  },
};

/** Annotation marker: above the element it highlights */
export const Z_OFFSET_MARKER = 1;
/** Element-type tooltip: above the element and marker it accompanies. */
export const Z_OFFSET_TOOLTIP = 2;
/** Text-format toolbar. */
export const Z_OFFSET_TOOLBAR = 3;
/** Annotation panel: above the toolbar it can be anchored to. */
export const Z_OFFSET_PANEL = 4;
/** Toolbar dropdown panels (size, font, link, color): above everything else. */
export const Z_OFFSET_DROPDOWN = 5;

/** Drag-select band: no anchor element, so it sits flat above page content rather than on the offset ladder. */
export const SELECTION_RECT_Z_INDEX = 999999;

/** Box shadow for dropdown panels. */
export const BOX_SHADOW_DROPDOWN = '0 4px 16px 0 rgba(0, 0, 0, 0.30)';
/** Box shadow for floating editor surfaces: inline toolbars and panels. */
export const BOX_SHADOW_TOOLBAR = '0 1px 4px 0 rgba(0, 0, 0, 0.10)';
