import React, { useState, useCallback } from 'react';
import {
  Card, Progress, Steps, Avatar, Tag, Typography, Flex, Statistic, Button,
  Tabs, Table, Input, Space, Tooltip,
  type TableColumnType, type TabsProps, type TableProps,
} from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  CalendarOutlined,
  BankOutlined,
  ExperimentOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/es/table/interface';

const { Title, Text, Paragraph } = Typography;

// ─── Inline shared components (avoids nested federation) ──────────────────────

// PageHeader
interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor?: string;
}
interface PageHeaderProps {
  title: string;
  description?: string;
  stats?: StatCard[];
  actions?: React.ReactNode;
}
const PageHeader: React.FC<PageHeaderProps> = ({ title, description, stats = [], actions }) => (
  <Card
    style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.07)', border: '1px solid #e2e8f0' }}
    styles={{ body: { padding: 0 } }}
  >
    <div style={{ height: 4, background: 'linear-gradient(90deg, #1455BD 0%, #3b82f6 100%)' }} />
    <div style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <Title level={4} style={{ margin: 0, color: '#0f172a' }}>{title}</Title>
        {description && <Text type="secondary" style={{ marginTop: 6, display: 'block', fontSize: 13, lineHeight: 1.6 }}>{description}</Text>}
        {actions && <Space style={{ marginTop: 12 }}>{actions}</Space>}
      </div>
      {stats.length > 0 && (
        <Space split={<div style={{ width: 1, height: 48, background: '#e2e8f0' }} />}>
          {stats.map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, border: '1px solid #f1f5f9', background: '#fafbff', minWidth: 140 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: stat.accentColor ? `${stat.accentColor}18` : '#e0e7ff', color: stat.accentColor ?? '#1455BD', fontSize: 18 }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </Space>
      )}
    </div>
  </Card>
);

// PortalTabs
interface PortalTabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  children: React.ReactNode;
}
const PortalTabs: React.FC<{ items: PortalTabItem[]; defaultActiveKey?: string }> = ({ items, defaultActiveKey }) => {
  const antdItems: TabsProps['items'] = items.map(({ key, label, icon, badge, children }) => ({
    key,
    label: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {icon}{label}
        {badge != null && badge > 0 && <Tag style={{ marginLeft: 2, lineHeight: '16px', padding: '0 4px' }}>{badge}</Tag>}
      </span>
    ),
    children,
  }));
  return (
    <Tabs type="line" items={antdItems} defaultActiveKey={defaultActiveKey ?? items[0]?.key}
      animated={{ inkBar: true, tabPane: true }} style={{ background: '#fff', borderRadius: 12 }} />
  );
};

// StatusBadge
type PortalStatus = 'Submitted' | 'Resubmitted' | 'Approved' | 'Revision Required' | 'Finalized' | 'Closed' | 'Pending' | 'In Progress';
const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  'Submitted':                  { color: 'blue',       label: 'Илгээсэн' },
  'Resubmitted':                { color: 'gold',       label: 'Дахин илгээсэн' },
  'Approved':                   { color: 'success',    label: 'Зөвшөөрсөн' },
  'Revision Required':          { color: 'error',      label: 'Засвар шаардлагатай' },
  'Finalized':                  { color: 'purple',     label: 'Баталгаажсан' },
  'Closed':                     { color: 'default',    label: 'Хаагдсан' },
  'Pending':                    { color: 'warning',    label: 'Хүлээгдэж байна' },
  'In Progress':                { color: 'processing', label: 'Хийгдэж байна' },
  // Backend status strings
  'DRAFT':                      { color: 'default',    label: 'Ноорог' },
  'SUBMITTED':                  { color: 'blue',       label: 'Илгээсэн' },
  'PENDING_TEACHER_APPROVAL':   { color: 'gold',       label: 'Багшийн хүлээлт' },
  'DEPT_PENDING':               { color: 'warning',    label: 'Тэнхимийн хүлээлт' },
  'APPROVED':                   { color: 'success',    label: 'Зөвшөөрсөн' },
  'ACTIVE':                     { color: 'processing', label: 'Хийгдэж байна' },
  'REJECTED':                   { color: 'error',      label: 'Татгалзсан' },
  'REVISION_REQUIRED':          { color: 'error',      label: 'Засвар шаардлагатай' },
  'REVIEWED':                   { color: 'cyan',       label: 'Хянагдсан' },
};
const StatusBadge: React.FC<{ status: string; localized?: boolean }> = ({ status, localized = false }) => {
  const cfg = STATUS_CONFIG[status] ?? { color: 'default', label: status };
  return <Tag color={cfg.color} style={{ margin: 0, fontWeight: 500 }}>{localized ? cfg.label : (cfg.label || status)}</Tag>;
};

// DataTable (simplified)
export { type TableColumnType };
interface DataTableAction<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (record: T) => void;
  hidden?: (record: T) => boolean;
  danger?: boolean;
}
interface DataTableProps<T extends object> {
  columns: TableColumnType<T>[];
  dataSource: T[];
  rowKey?: keyof T | ((record: T) => string);
  loading?: boolean;
  actions?: DataTableAction<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  tableProps?: Omit<TableProps<T>, 'columns' | 'dataSource' | 'rowKey'>;
}
function DataTable<T extends object>({
  columns, dataSource, rowKey = 'id' as keyof T, loading = false,
  actions = [], searchable = false, searchPlaceholder = 'Хайх...', searchFields,
  tableProps = {},
}: DataTableProps<T>) {
  const [searchText, setSearchText] = useState('');
  const filteredData = useCallback(() => {
    if (!searchText.trim()) return dataSource;
    const lower = searchText.toLowerCase();
    return dataSource.filter((record) => {
      const fields = searchFields ?? (Object.keys(record) as (keyof T)[]);
      return fields.some((field) => String(record[field] ?? '').toLowerCase().includes(lower));
    });
  }, [dataSource, searchText, searchFields])();

  const actionsColumn: TableColumnType<T> | null = actions.length > 0 ? {
    title: 'Үйлдэл', key: '_actions', width: actions.length * 40 + 16, align: 'center', fixed: 'right',
    render: (_: unknown, record: T) => (
      <Space size={4}>
        {actions.map((action, i) => action.hidden?.(record) ? null : (
          <Tooltip key={i} title={action.label}>
            <Button type="text" size="small" icon={action.icon} danger={action.danger}
              onClick={(e) => { e.stopPropagation(); action.onClick(record); }}
              style={{ color: action.danger ? undefined : '#1455BD' }} />
          </Tooltip>
        ))}
      </Space>
    ),
  } : null;

  const finalColumns = actionsColumn ? [...columns, actionsColumn] : columns;

  return (
    <div>
      {searchable && (
        <Flex justify="flex-end" style={{ marginBottom: 16 }}>
          <Input prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder={searchPlaceholder}
            value={searchText} onChange={(e) => setSearchText(e.target.value)} allowClear style={{ width: 240 }} />
        </Flex>
      )}
      <Table<T> columns={finalColumns} dataSource={filteredData} rowKey={rowKey as string}
        loading={loading} size="middle" scroll={{ x: 'max-content' }}
        pagination={{ showSizeChanger: true, pageSizeOptions: [10, 20, 50],
          showTotal: (tot, range) => `${range[0]}–${range[1]} / нийт ${tot}`, style: { marginTop: 16 } }}
        {...tableProps} />
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThesisRole = 'student' | 'teacher';

export interface ThesisViewProps {
  role: ThesisRole;
  thesis?: ThesisRecord;
  students?: StudentRecord[];
  onReviewReport?: (studentId: string) => void;
  onSubmitReport?: () => void;
}

interface ThesisRecord {
  title: string;
  description: string;
  supervisor: string;
  department: string;
  researchArea: string;
  submissionDate: string;
  status: string;
  progress: number;
  committee: string[];
}

interface StudentRecord {
  id: number;
  studentId: string;
  name: string;
  thesisTitle: string;
  stage: string;
  status: string;
  progress: number;
  lastSubmission: string;
}

// ─── Static fallback data ─────────────────────────────────────────────────────

const DEFAULT_THESIS: ThesisRecord = {
  title: 'Эмнэлгийн зургийн оношлогоонд гүн суралцахуй',
  description: 'Конволюцын нейрон сүлжээ ашиглан эмнэлгийн зургийн оношлогооны нарийвчлалыг дээшлүүлэхэд гүн суралцахуйн арга техникийг хэрэглэх тухай цогц судалгаа.',
  supervisor: 'Д.Сувдаа',
  department: 'Компьютерын ухаан',
  researchArea: 'Эрүүл мэндэд хиймэл оюун ухаан',
  submissionDate: '2026-06-30',
  status: 'In Progress',
  progress: 75,
  committee: ['Д.Сувдаа', 'Б.Батням'],
};

const STAGES = [
  { title: 'Сэдвийн зөвшөөрөл', status: 'finish'  },
  { title: 'Явц 1',             status: 'finish'  },
  { title: 'Явц 2',             status: 'finish'  },
  { title: 'Урьдчилсан',        status: 'process' },
  { title: 'Эцсийн',            status: 'wait'    },
] as const;

// ─── Teacher view ──────────────────────────────────────────────────────────────

function TeacherStudentTable({ students, onReview }: { students: StudentRecord[]; onReview?: (studentId: string) => void }) {
  const columns: TableColumnType<StudentRecord>[] = [
    {
      title: 'Оюутан', dataIndex: 'name', key: 'name',
      render: (name: string) => (
        <Flex align="center" gap={8}>
          <Avatar size={32} style={{ background: '#e0e7ff', color: '#1455BD', fontWeight: 700 }}>
            {(name || '').split('.').map((s: string) => s[0]).join('')}
          </Avatar>
          <Text strong style={{ fontSize: 13 }}>{name}</Text>
        </Flex>
      ),
    },
    { title: 'Сэдэв', dataIndex: 'thesisTitle', key: 'thesisTitle', ellipsis: true },
    { title: 'Шат', dataIndex: 'stage', key: 'stage', render: (stage: string) => <Tag>{stage}</Tag> },
    {
      title: 'Төлөв', dataIndex: 'status', key: 'status',
      render: (status: string) => <StatusBadge status={status} localized />,
    },
    {
      title: 'Дэвшил', dataIndex: 'progress', key: 'progress', width: 140,
      render: (pct: number) => <Flex align="center" gap={8}><Progress percent={pct} size="small" style={{ flex: 1 }} /></Flex>,
    },
    {
      title: 'Сүүлийн илгээлт', dataIndex: 'lastSubmission', key: 'lastSubmission',
      render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{d}</Text>,
    },
  ];

  if (students.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
        <TeamOutlined style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
        <Text type="secondary">Одоогоор удирдаж буй оюутан байхгүй байна.</Text>
      </div>
    );
  }

  return (
    <DataTable<StudentRecord>
      columns={columns} dataSource={students} rowKey="id"
      searchable searchPlaceholder="Оюутан хайх..." searchFields={['name', 'thesisTitle']}
      actions={[{ label: 'Тайлан хянах', icon: <FileTextOutlined />, onClick: (r) => onReview?.(r.studentId) }]}
    />
  );
}

// ─── Student view ──────────────────────────────────────────────────────────────

function StudentOverviewTab({ thesis }: { thesis: ThesisRecord }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <Title level={5} style={{ marginBottom: 16 }}>Нийт дэвшил</Title>
          <Progress percent={thesis.progress} strokeColor={{ '0%': '#1455BD', '100%': '#3b82f6' }} style={{ marginBottom: 24 }} />
          <Steps current={STAGES.findIndex((s) => s.status === 'process')} size="small"
            items={STAGES.map((s) => ({
              title: s.title, status: s.status,
              icon: s.status === 'finish' ? <CheckCircleOutlined style={{ color: '#1455BD' }} />
                : s.status === 'process' ? <ClockCircleOutlined style={{ color: '#1455BD' }} />
                : <MinusCircleOutlined style={{ color: '#94a3b8' }} />,
            }))} />
        </Card>
        <Card title={<><TeamOutlined style={{ color: '#1455BD', marginRight: 8 }} />Комисс</>}>
          <Flex wrap="wrap" gap={12}>
            {thesis.committee.map((member, i) => (
              <Flex key={i} align="center" gap={8} style={{ padding: '8px 12px', border: '1px solid #f1f5f9', borderRadius: 8, background: '#fafafa' }}>
                <Avatar size={36} style={{ background: '#e0e7ff', color: '#1455BD', fontWeight: 700 }}>
                  {member.split(' ').map((n) => n[0]).join('')}
                </Avatar>
                <div>
                  <Text strong style={{ fontSize: 13 }}>{member}</Text>
                  <div><Text type="secondary" style={{ fontSize: 12 }}>Хянагч</Text></div>
                </div>
              </Flex>
            ))}
          </Flex>
        </Card>
      </div>
      <Flex vertical gap={12} style={{ width: 200 }}>
        {[
          { icon: <TeamOutlined />,       label: 'Удирдагч', value: thesis.supervisor },
          { icon: <BankOutlined />,       label: 'Тэнхим',   value: thesis.department },
          { icon: <ExperimentOutlined />, label: 'Чиглэл',   value: thesis.researchArea },
          { icon: <CalendarOutlined />,   label: 'Хугацаа',  value: thesis.submissionDate },
        ].map((item, i) => (
          <Card key={i} size="small">
            <Statistic title={<Flex align="center" gap={4}>{item.icon}<span>{item.label}</span></Flex>}
              value={item.value} valueStyle={{ fontSize: 13, color: '#0f172a' }} />
          </Card>
        ))}
      </Flex>
    </div>
  );
}

// ─── ThesisView — main export ─────────────────────────────────────────────────

export default function ThesisView({
  role = 'student',
  thesis = DEFAULT_THESIS,
  students = [],
  onReviewReport,
  onSubmitReport,
}: ThesisViewProps) {
  const isTeacher = role === 'teacher';

  const headerStats = isTeacher
    ? [
        { label: 'Удирдаж буй', value: `${students.length} оюутан`, icon: <TeamOutlined />, accentColor: '#1455BD' },
        { label: 'Хүлээгдэж буй', value: `${students.filter((s) => s.status === 'Submitted').length} тайлан`, icon: <FileTextOutlined />, accentColor: '#d97706' },
      ]
    : [
        { label: 'Дэвшил', value: `${thesis.progress}%`, icon: <CheckCircleOutlined />, accentColor: '#1455BD' },
        { label: 'Удирдагч', value: thesis.supervisor, icon: <TeamOutlined />, accentColor: '#7c3aed' },
      ];

  const tabItems: PortalTabItem[] = isTeacher
    ? [{
        key: 'students', label: 'Оюутнуудын жагсаалт', icon: <TeamOutlined />,
        badge: students.filter((s) => s.status === 'Submitted').length,
        children: <TeacherStudentTable students={students} onReview={onReviewReport} />,
      }]
    : [
        { key: 'overview', label: 'Тойм', children: <StudentOverviewTab thesis={thesis} /> },
        {
          key: 'submit', label: 'Тайлан илгээх', icon: <FileTextOutlined />,
          children: (
            <Card>
              <Paragraph type="secondary">Тайлан илгээх форм энд ачаалагдана.</Paragraph>
              <Button type="primary" onClick={onSubmitReport}>Тайлан илгээх</Button>
            </Card>
          ),
        },
      ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', paddingBottom: 40 }}>
      <PageHeader
        title={isTeacher ? 'Удирдсан дипломын ажлууд' : thesis.title}
        description={isTeacher ? 'Өөрийн удирдаж буй оюутнуудын судалгааны ажлыг нэг дороос удирдах самбар.' : thesis.description}
        stats={headerStats}
        actions={!isTeacher ? <StatusBadge status={thesis.status as PortalStatus} localized /> : undefined}
      />
      <div style={{ marginTop: 24 }}>
        <PortalTabs items={tabItems} />
      </div>
    </div>
  );
}
