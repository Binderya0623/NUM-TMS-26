/**
 * remotes.d.ts — Module Federation ambient declarations
 *
 * These tell TypeScript the shape of modules that are loaded at RUNTIME
 * by @originjs/vite-plugin-federation. The compiler never resolves these
 * to real files — they only exist to give you types and autocomplete.
 *
 * If you add a new remote, add a corresponding `declare module` block here.
 */

// ─── shared-ui-module ────────────────────────────────────────────────────────
declare module 'shared_ui/SharedUI' {
  import type { ComponentType, ReactNode } from 'react';
  import type { ThemeConfig } from 'antd';

  // DataTable
  export interface DataTableAction<T> {
    label: string;
    icon: ReactNode;
    onClick: (record: T) => void;
    hidden?: (record: T) => boolean;
    danger?: boolean;
  }
  export interface DataTableProps<T extends object> {
    columns: unknown[];
    dataSource: T[];
    rowKey?: keyof T | ((record: T) => string);
    loading?: boolean;
    title?: string;
    subtitle?: string;
    actions?: DataTableAction<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    searchFields?: (keyof T)[];
    onExport?: (filteredData: T[]) => void;
    onReload?: () => void;
    total?: number;
    pageSizeOptions?: number[];
  }
  export const DataTable: <T extends object>(props: DataTableProps<T>) => JSX.Element;

  // StatusBadge
  export type PortalStatus =
    | 'Submitted' | 'Resubmitted' | 'Approved'
    | 'Revision Required' | 'Finalized' | 'Closed'
    | 'Pending' | 'In Progress';
  export interface StatusBadgeProps { status: PortalStatus; localized?: boolean }
  export const StatusBadge: ComponentType<StatusBadgeProps>;

  // PageHeader
  export interface StatCard {
    label: string; value: string | number; icon: ReactNode; accentColor?: string;
  }
  export interface PageHeaderProps {
    title: string; description?: string; stats?: StatCard[]; actions?: ReactNode;
  }
  export const PageHeader: ComponentType<PageHeaderProps>;

  // PortalTabs
  export interface PortalTabItem {
    key: string; label: string; icon?: ReactNode; badge?: number; children: ReactNode;
  }
  export interface PortalTabsProps {
    items: PortalTabItem[]; defaultActiveKey?: string;
    activeKey?: string; onChange?: (key: string) => void; type?: 'line' | 'card';
  }
  export const PortalTabs: ComponentType<PortalTabsProps>;

  // Theme
  export const portalTheme: ThemeConfig;
  export const BRAND_PRIMARY: string;
  export const BRAND_PRIMARY_HOVER: string;
}

// ─── module-thesis ───────────────────────────────────────────────────────────
declare module 'module_thesis/ThesisView' {
  import type { ComponentType } from 'react';

  export type ThesisRole = 'student' | 'teacher';

  export interface ThesisRecord {
    title: string; description: string; supervisor: string;
    department: string; researchArea: string; submissionDate: string;
    status: string; progress: number; committee: string[];
  }

  export interface StudentRecord {
    id: number; studentId: string; name: string; thesisTitle: string; stage: string;
    status: string; progress: number; lastSubmission: string;
  }

  export interface ThesisViewProps {
    role?: ThesisRole;
    thesis?: ThesisRecord;
    students?: StudentRecord[];
    onReviewReport?: (studentId: string) => void;
    onSubmitReport?: () => void;
  }

  const ThesisView: ComponentType<ThesisViewProps>;
  export default ThesisView;
}
