/**
 * shared-ui-module — Public API
 *
 * This is the ONLY file exposed via Module Federation ('shared_ui/SharedUI').
 * Consumers import from this single entry point:
 *
 *   import { DataTable, StatusBadge, portalTheme } from 'shared_ui/SharedUI';
 */

// ── Components ────────────────────────────────────────────────────────────────
export { DataTable }              from './components/DataTable';
export { StatusBadge }            from './components/StatusBadge';
export { PageHeader }             from './components/PageHeader';
export { PortalTabs }             from './components/PortalTabs';

// ── Types ─────────────────────────────────────────────────────────────────────
export type { DataTableProps, DataTableAction, TableColumnType } from './components/DataTable';
export type { StatusBadgeProps, PortalStatus }                   from './components/StatusBadge';
export type { PageHeaderProps, StatCard }                        from './components/PageHeader';
export type { PortalTabsProps, PortalTabItem }                   from './components/PortalTabs';

// ── Theme ─────────────────────────────────────────────────────────────────────
export { portalTheme, BRAND_PRIMARY, BRAND_PRIMARY_HOVER, BRAND_PRIMARY_SOFT, BORDER_NAVY, TEXT_NAVY } from './theme/portalTheme';

// ── Helpers ───────────────────────────────────────────────────────────────────
export { buildColumnSearchFilter } from './components/DataTable';
