import React from 'react';
import { Card, Typography, Space, Divider } from 'antd';
import { BORDER_NAVY, BRAND_PRIMARY, BRAND_PRIMARY_HOVER, BRAND_PRIMARY_SOFT, TEXT_NAVY } from '../theme/portalTheme';

const { Title, Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  /** Tailwind-compatible hex or CSS color for the icon background */
  accentColor?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Up to 4 quick-stat cards shown on the right */
  stats?: StatCard[];
  /** Optional action buttons (e.g. <Button type="primary">…</Button>) */
  actions?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PageHeader
 *
 * Enterprise page banner used at the top of every major view.
 * Replaces the repeated "blue top stripe + Card + h1 + stats" pattern
 * that appears in TeacherThesis.tsx, StudentThesis.tsx, AdminGrades.tsx…
 *
 * Usage:
 * ```tsx
 * <PageHeader
 *   title="Удирдсан дипломын ажлууд"
 *   description="Оюутнуудын судалгааны ажлыг нэг дороос удирдах самбар."
 *   stats={[
 *     { label: 'Удирдаж буй', value: '4 оюутан', icon: <TeamOutlined />, accentColor: '#1f4f82' },
 *     { label: 'Хүлээгдэж буй', value: '3 хүсэлт', icon: <BellOutlined />, accentColor: '#d97706' },
 *   ]}
 *   actions={<Button type="primary">…</Button>}
 * />
 * ```
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  stats = [],
  actions,
}) => {
  return (
    <Card
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(16,32,51,.06)',
        border: `1px solid ${BORDER_NAVY}`,
      }}
      styles={{
        body: { padding: 0 },
      }}
    >
      {/* Brand accent stripe */}
      <div
        style={{
          height: 4,
          background: `linear-gradient(90deg, ${BRAND_PRIMARY} 0%, ${BRAND_PRIMARY_HOVER} 100%)`,
        }}
      />

      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: text block */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <Title level={4} style={{ margin: 0, color: TEXT_NAVY }}>
            {title}
          </Title>
          {description && (
            <Text
              type="secondary"
              style={{ marginTop: 6, display: 'block', fontSize: 13, lineHeight: 1.6 }}
            >
              {description}
            </Text>
          )}
          {actions && (
            <Space style={{ marginTop: 12 }}>{actions}</Space>
          )}
        </div>

        {/* Right: stat cards */}
        {stats.length > 0 && (
          <Space split={<Divider type="vertical" style={{ height: 48 }} />}>
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: `1px solid ${BORDER_NAVY}`,
                  background: '#f6f9fc',
                  minWidth: 140,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: stat.accentColor
                      ? `${stat.accentColor}18`
                      : BRAND_PRIMARY_SOFT,
                    color: stat.accentColor ?? BRAND_PRIMARY,
                    fontSize: 18,
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#6f8195',
                      marginBottom: 2,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: TEXT_NAVY,
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </Space>
        )}
      </div>
    </Card>
  );
};
