import type { ThemeConfig } from 'antd';

/**
 * Portal Design System — Ant Design Token Overrides
 *
 * Single source of truth for all brand colours, typography, and
 * component-level overrides. Import this into the ConfigProvider
 * at the root of every module so the look is identical everywhere.
 */
export const BRAND_PRIMARY = '#1f4f82';
export const BRAND_PRIMARY_HOVER = '#183f68';
export const BRAND_PRIMARY_SOFT = '#e8f0f8';
export const BORDER_NAVY = '#d9e3ee';
export const TEXT_NAVY = '#102033';

export const portalTheme: ThemeConfig = {
  token: {
    // ── Brand palette ──────────────────────────────────────────────
    colorPrimary:       BRAND_PRIMARY,
    colorPrimaryHover:  BRAND_PRIMARY_HOVER,
    colorLink:          BRAND_PRIMARY,
    colorLinkHover:     BRAND_PRIMARY_HOVER,

    // ── Typography ────────────────────────────────────────────────
    fontFamily:
      "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeHeading1: 28,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,

    // ── Shape ─────────────────────────────────────────────────────
    borderRadius:   8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // ── Elevation ─────────────────────────────────────────────────
    boxShadow:
      '0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.07)',
    boxShadowSecondary:
      '0 4px 6px -1px rgba(0,0,0,.08), 0 2px 4px -2px rgba(0,0,0,.06)',

    // ── Neutral greys (slate scale) ───────────────────────────────
    colorBgLayout:    '#f6f9fc',   // page background
    colorBgContainer: '#ffffff',
    colorBorder:      BORDER_NAVY,
    colorBorderSecondary: '#edf3f8',
    colorTextBase:    TEXT_NAVY,
    colorTextSecondary: '#6f8195',
    colorTextTertiary:  '#9aabba',

    // ── Motion ────────────────────────────────────────────────────
    motionDurationMid: '0.15s',
    motionDurationSlow: '0.25s',
  },

  components: {
    // ── Table ─────────────────────────────────────────────────────
    Table: {
      headerBg:           '#f3f7fb',
      headerColor:        '#30465f',
      headerSortActiveBg: '#edf3f8',
      rowHoverBg:         '#f6f9fc',
      borderColor:        BORDER_NAVY,
      cellPaddingBlock:   12,
      cellPaddingInline:  16,
    },

    // ── Button ────────────────────────────────────────────────────
    Button: {
      primaryShadow:     '0 1px 2px rgba(16,32,51,0.12)',
      defaultShadow:     '0 1px 2px rgba(16,32,51,0.06)',
      defaultBorderColor: BORDER_NAVY,
      defaultHoverBorderColor: BRAND_PRIMARY,
      defaultHoverColor: TEXT_NAVY,
    },

    // ── Card ──────────────────────────────────────────────────────
    Card: {
      paddingLG: 24,
    },

    // ── Tabs ──────────────────────────────────────────────────────
    Tabs: {
      inkBarColor:      BRAND_PRIMARY,
      itemActiveColor:  BRAND_PRIMARY,
      itemSelectedColor: BRAND_PRIMARY,
      itemHoverColor:   BRAND_PRIMARY_HOVER,
      cardBg:           '#f6f9fc',
    },

    // ── Tag / Badge ───────────────────────────────────────────────
    Tag: {
      borderRadiusSM: 20,
    },

    // ── Select / Input ────────────────────────────────────────────
    Select: {
      borderRadius: 8,
      activeBorderColor: BRAND_PRIMARY,
      hoverBorderColor: BRAND_PRIMARY,
    },
    Input:  {
      borderRadius: 8,
      activeBorderColor: BRAND_PRIMARY,
      hoverBorderColor: BRAND_PRIMARY,
    },
  },
};
