import React, { useState, useCallback } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Tooltip,
  Typography,
  Flex,
  type TableProps,
  type TableColumnType,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/es/table/interface';

const { Text } = Typography;

// ─── Public Types ──────────────────────────────────────────────────────────────

export type { TableColumnType };

export interface DataTableAction<T> {
  /** Label shown in tooltip */
  label: string;
  /** Icon from @ant-design/icons */
  icon: React.ReactNode;
  /** Called when the user clicks the action */
  onClick: (record: T) => void;
  /** Return true to hide/disable the action for a specific row */
  hidden?: (record: T) => boolean;
  danger?: boolean;
}

export interface DataTableProps<T extends object> {
  /** Array of column definitions (standard Ant Design TableColumnType) */
  columns: TableColumnType<T>[];
  /** Data source — pass an empty array while loading */
  dataSource: T[];
  /** Row key — must be unique per row. Default: 'id' */
  rowKey?: keyof T | ((record: T) => string);
  /** Show a loading skeleton */
  loading?: boolean;
  /** Text shown in the header above the table */
  title?: string;
  /** Optional sub-text / description */
  subtitle?: string;
  /** Row-level action buttons rendered in the last column */
  actions?: DataTableAction<T>[];
  /** Enable the global text search bar */
  searchable?: boolean;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Fields to include in client-side search. Defaults to all string fields. */
  searchFields?: (keyof T)[];
  /** Show an Export button (fires this callback — implement your own CSV/XLSX) */
  onExport?: (filteredData: T[]) => void;
  /** Show a Reload button */
  onReload?: () => void;
  /** Total record count for server-side pagination */
  total?: number;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Override any Ant Table props */
  tableProps?: Omit<TableProps<T>, 'columns' | 'dataSource' | 'rowKey'>;
}

// ─── Column search filter (reusable across any column) ────────────────────────

function buildColumnSearchFilter<T>(dataIndex: keyof T): Partial<TableColumnType<T>> {
  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: FilterDropdownProps) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder="Хайх..."
          value={selectedKeys[0] as string}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block', width: 200 }}
          autoFocus
        />
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="small"
            onClick={() => confirm()}
            style={{ width: 90 }}
          >
            Хайх
          </Button>
          <Button
            size="small"
            onClick={() => {
              clearFilters?.();
              confirm();
            }}
            style={{ width: 90 }}
          >
            Цэвэрлэх
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <FilterOutlined style={{ color: filtered ? '#1455BD' : undefined }} />
    ),
    onFilter: (value, record) => {
      const cell = record[dataIndex];
      return String(cell ?? '')
        .toLowerCase()
        .includes(String(value).toLowerCase());
    },
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * DataTable
 *
 * Enterprise-grade table for the University Portal.
 * Wraps Ant Design's Table with:
 *   • Global client-side text search
 *   • Per-column filter dropdowns (call buildColumnSearchFilter on any column)
 *   • Row action buttons with tooltip labels
 *   • Export + Reload toolbar
 *   • Consistent portal branding via antd theme tokens
 *
 * Usage:
 * ```tsx
 * <DataTable
 *   title="Students"
 *   columns={columns}
 *   dataSource={students}
 *   rowKey="id"
 *   searchable
 *   searchFields={['name', 'email']}
 *   actions={[{ label: 'View', icon: <EyeOutlined />, onClick: (r) => nav(r.id) }]}
 *   onReload={refetch}
 * />
 * ```
 */
export function DataTable<T extends object>({
  columns,
  dataSource,
  rowKey = 'id' as keyof T,
  loading = false,
  title,
  subtitle,
  actions = [],
  searchable = false,
  searchPlaceholder = 'Хайх...',
  searchFields,
  onExport,
  onReload,
  total,
  pageSizeOptions = [10, 20, 50],
  tableProps = {},
}: DataTableProps<T>) {
  const [searchText, setSearchText] = useState('');

  // ── Client-side global search ──────────────────────────────────
  const filteredData = useCallback(() => {
    if (!searchText.trim()) return dataSource;

    const lower = searchText.toLowerCase();
    return dataSource.filter((record) => {
      const fields =
        searchFields ?? (Object.keys(record) as (keyof T)[]);
      return fields.some((field) =>
        String(record[field] ?? '')
          .toLowerCase()
          .includes(lower)
      );
    });
  }, [dataSource, searchText, searchFields])();

  // ── Actions column ────────────────────────────────────────────
  const actionsColumn: TableColumnType<T> | null =
    actions.length > 0
      ? {
          title: 'Үйлдэл',
          key: '_actions',
          width: actions.length * 40 + 16,
          align: 'center',
          fixed: 'right',
          render: (_: unknown, record: T) => (
            <Space size={4}>
              {actions.map((action, i) => {
                if (action.hidden?.(record)) return null;
                return (
                  <Tooltip key={i} title={action.label}>
                    <Button
                      type="text"
                      size="small"
                      icon={action.icon}
                      danger={action.danger}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(record);
                      }}
                      style={{ color: action.danger ? undefined : '#1455BD' }}
                    />
                  </Tooltip>
                );
              })}
            </Space>
          ),
        }
      : null;

  const finalColumns: TableColumnType<T>[] = actionsColumn
    ? [...columns, actionsColumn]
    : columns;

  // ── Toolbar ───────────────────────────────────────────────────
  const toolbar = (
    <Flex
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={12}
      style={{ marginBottom: 16 }}
    >
      {/* Left: title block */}
      <div>
        {title && (
          <Text strong style={{ fontSize: 16, color: '#0f172a' }}>
            {title}
          </Text>
        )}
        {subtitle && (
          <div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {subtitle}
            </Text>
          </div>
        )}
      </div>

      {/* Right: search + action buttons */}
      <Space wrap>
        {searchable && (
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
        )}
        {onExport && (
          <Tooltip title="Экспортлох">
            <Button
              icon={<ExportOutlined />}
              onClick={() => onExport(filteredData)}
            >
              Экспорт
            </Button>
          </Tooltip>
        )}
        {onReload && (
          <Tooltip title="Шинэчлэх">
            <Button icon={<ReloadOutlined />} onClick={onReload} />
          </Tooltip>
        )}
      </Space>
    </Flex>
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <div>
      {(title || subtitle || searchable || onExport || onReload) && toolbar}
      <Table<T>
        columns={finalColumns}
        dataSource={filteredData}
        rowKey={rowKey as string}
        loading={loading}
        size="middle"
        scroll={{ x: 'max-content' }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions,
          total,
          showTotal: (tot, range) =>
            `${range[0]}–${range[1]} / нийт ${tot}`,
          style: { marginTop: 16 },
        }}
        {...tableProps}
      />
    </div>
  );
}

// Re-export the helper so consumers can decorate their own columns
export { buildColumnSearchFilter };
