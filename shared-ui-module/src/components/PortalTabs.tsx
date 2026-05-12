import React from 'react';
import { Tabs, Badge } from 'antd';
import type { TabsProps } from 'antd';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PortalTabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** Show a numeric notification badge on the tab */
  badge?: number;
  children: React.ReactNode;
}

export interface PortalTabsProps {
  items: PortalTabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  /** 'line' (default) or 'card' */
  type?: TabsProps['type'];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PortalTabs
 *
 * Replaces the ~15 repeated `<Tabs>` blocks where each `<TabsTrigger>`
 * had 140 characters of identical Tailwind className.
 *
 * Delegates styling to the portalTheme Ant Design tokens so the brand
 * colour is applied consistently without any hardcoded strings.
 *
 * Usage:
 * ```tsx
 * <PortalTabs
 *   items={[
 *     {
 *       key: 'plan-review',
 *       label: 'Сэдэв дэвшүүлэх',
 *       icon: <FileStackOutlined />,
 *       badge: 3,
 *       children: <TeacherPlanReviewTab />,
 *     },
 *   ]}
 * />
 * ```
 */
export const PortalTabs: React.FC<PortalTabsProps> = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  type = 'line',
}) => {
  const antdItems: TabsProps['items'] = items.map(
    ({ key, label, icon, badge, children }) => ({
      key,
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {icon}
          {label}
          {badge != null && badge > 0 && (
            <Badge
              count={badge}
              size="small"
              style={{ marginLeft: 2 }}
            />
          )}
        </span>
      ),
      children,
    })
  );

  return (
    <Tabs
      type={type}
      items={antdItems}
      defaultActiveKey={defaultActiveKey ?? items[0]?.key}
      activeKey={activeKey}
      onChange={onChange}
      animated={{ inkBar: true, tabPane: true }}
      style={{ background: '#fff', borderRadius: 8 }}
    />
  );
};
