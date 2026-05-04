import type { ThemeConfig } from 'antd';

/**
 * Portal Design System — Ant Design Token Overrides
 *
 * Single source of truth for all brand colours, typography, and
 * component-level overrides. Import this into the ConfigProvider
 * at the root of every module so the look is identical everywhere.
 */
export const BRAND_PRIMARY = '#1455BD';
export const BRAND_PRIMARY_HOVER = '#0d3a8a';

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
    colorBgLayout:    '#f8fafc',   // page background
    colorBgContainer: '#ffffff',
    colorBorder:      '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',
    colorTextBase:    '#0f172a',
    colorTextSecondary: '#64748b',
    colorTextTertiary:  '#94a3b8',

    // ── Motion ────────────────────────────────────────────────────
    motionDurationMid: '0.15s',
    motionDurationSlow: '0.25s',
  },

  components: {
    // ── Table ─────────────────────────────────────────────────────
    Table: {
      headerBg:           '#f8fafc',
      headerColor:        '#475569',
      headerSortActiveBg: '#f1f5f9',
      rowHoverBg:         '#f8fafc',
      borderColor:        '#e2e8f0',
      cellPaddingBlock:   12,
      cellPaddingInline:  16,
    },

    // ── Button ────────────────────────────────────────────────────
    Button: {
      primaryShadow:     'none',
      defaultShadow:     'none',
      defaultBorderColor: '#e2e8f0',
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
      cardBg:           '#f8fafc',
    },

    // ── Tag / Badge ───────────────────────────────────────────────
    Tag: {
      borderRadiusSM: 20,
    },

    // ── Select / Input ────────────────────────────────────────────
    Select: { borderRadius: 8 },
    Input:  { borderRadius: 8 },
  },
};
