import { importShared } from './chunk-__federation_fn_import.js';
import { requireReact } from './chunk-index.js';
import { Icon, _extends, RefIcon$3 as RefIcon$5, RefIcon$1 as RefIcon$6, RefIcon$2 as RefIcon$7, RefIcon as RefIcon$8 } from './chunk-SearchOutlined.js';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactJsxRuntime_production_min;

function requireReactJsxRuntime_production_min () {
	if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
	hasRequiredReactJsxRuntime_production_min = 1;
var f=requireReact(),k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
	function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;
	return reactJsxRuntime_production_min;
}

var hasRequiredJsxRuntime;

function requireJsxRuntime () {
	if (hasRequiredJsxRuntime) return jsxRuntime.exports;
	hasRequiredJsxRuntime = 1;
	{
	  jsxRuntime.exports = requireReactJsxRuntime_production_min();
	}
	return jsxRuntime.exports;
}

var jsxRuntimeExports = requireJsxRuntime();

// This icon file is generated automatically.
var BankOutlined$1 = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M894 462c30.9 0 43.8-39.7 18.7-58L530.8 126.2a31.81 31.81 0 00-37.6 0L111.3 404c-25.1 18.2-12.2 58 18.8 58H192v374h-72c-4.4 0-8 3.6-8 8v52c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-52c0-4.4-3.6-8-8-8h-72V462h62zM512 196.7l271.1 197.2H240.9L512 196.7zM264 462h117v374H264V462zm189 0h117v374H453V462zm307 374H642V462h118v374z" } }] }, "name": "bank", "theme": "outlined" };

const React$4 = await importShared('react');
var BankOutlined = function BankOutlined2(props, ref) {
  return /* @__PURE__ */ React$4.createElement(Icon, _extends({}, props, {
    ref,
    icon: BankOutlined$1
  }));
};
var RefIcon$4 = /* @__PURE__ */ React$4.forwardRef(BankOutlined);

// This icon file is generated automatically.
var CheckCircleOutlined$1 = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M699 353h-46.9c-10.2 0-19.9 4.9-25.9 13.3L469 584.3l-71.2-98.8c-6-8.3-15.6-13.3-25.9-13.3H325c-6.5 0-10.3 7.4-6.5 12.7l124.6 172.8a31.8 31.8 0 0051.7 0l210.6-292c3.9-5.3.1-12.7-6.4-12.7z" } }, { "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" } }] }, "name": "check-circle", "theme": "outlined" };

const React$3 = await importShared('react');
var CheckCircleOutlined = function CheckCircleOutlined2(props, ref) {
  return /* @__PURE__ */ React$3.createElement(Icon, _extends({}, props, {
    ref,
    icon: CheckCircleOutlined$1
  }));
};
var RefIcon$3 = /* @__PURE__ */ React$3.forwardRef(CheckCircleOutlined);

// This icon file is generated automatically.
var ExperimentOutlined$1 = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M512 472a40 40 0 1080 0 40 40 0 10-80 0zm367 352.9L696.3 352V178H768v-68H256v68h71.7v174L145 824.9c-2.8 7.4-4.3 15.2-4.3 23.1 0 35.3 28.7 64 64 64h614.6c7.9 0 15.7-1.5 23.1-4.3 33-12.7 49.4-49.8 36.6-82.8zM395.7 364.7V180h232.6v184.7L719.2 600c-20.7-5.3-42.1-8-63.9-8-61.2 0-119.2 21.5-165.3 60a188.78 188.78 0 01-121.3 43.9c-32.7 0-64.1-8.3-91.8-23.7l118.8-307.5zM210.5 844l41.7-107.8c35.7 18.1 75.4 27.8 116.6 27.8 61.2 0 119.2-21.5 165.3-60 33.9-28.2 76.3-43.9 121.3-43.9 35 0 68.4 9.5 97.6 27.1L813.5 844h-603z" } }] }, "name": "experiment", "theme": "outlined" };

const React$2 = await importShared('react');
var ExperimentOutlined = function ExperimentOutlined2(props, ref) {
  return /* @__PURE__ */ React$2.createElement(Icon, _extends({}, props, {
    ref,
    icon: ExperimentOutlined$1
  }));
};
var RefIcon$2 = /* @__PURE__ */ React$2.forwardRef(ExperimentOutlined);

// This icon file is generated automatically.
var MinusCircleOutlined$1 = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M696 480H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" } }, { "tag": "path", "attrs": { "d": "M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" } }] }, "name": "minus-circle", "theme": "outlined" };

const React$1 = await importShared('react');
var MinusCircleOutlined = function MinusCircleOutlined2(props, ref) {
  return /* @__PURE__ */ React$1.createElement(Icon, _extends({}, props, {
    ref,
    icon: MinusCircleOutlined$1
  }));
};
var RefIcon$1 = /* @__PURE__ */ React$1.forwardRef(MinusCircleOutlined);

// This icon file is generated automatically.
var TeamOutlined$1 = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M824.2 699.9a301.55 301.55 0 00-86.4-60.4C783.1 602.8 812 546.8 812 484c0-110.8-92.4-201.7-203.2-200-109.1 1.7-197 90.6-197 200 0 62.8 29 118.8 74.2 155.5a300.95 300.95 0 00-86.4 60.4C345 754.6 314 826.8 312 903.8a8 8 0 008 8.2h56c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5A226.62 226.62 0 01612 684c60.9 0 118.2 23.7 161.3 66.8C814.5 792 838 846.3 840 904.3c.1 4.3 3.7 7.7 8 7.7h56a8 8 0 008-8.2c-2-77-33-149.2-87.8-203.9zM612 612c-34.2 0-66.4-13.3-90.5-37.5a126.86 126.86 0 01-37.5-91.8c.3-32.8 13.4-64.5 36.3-88 24-24.6 56.1-38.3 90.4-38.7 33.9-.3 66.8 12.9 91 36.6 24.8 24.3 38.4 56.8 38.4 91.4 0 34.2-13.3 66.3-37.5 90.5A127.3 127.3 0 01612 612zM361.5 510.4c-.9-8.7-1.4-17.5-1.4-26.4 0-15.9 1.5-31.4 4.3-46.5.7-3.6-1.2-7.3-4.5-8.8-13.6-6.1-26.1-14.5-36.9-25.1a127.54 127.54 0 01-38.7-95.4c.9-32.1 13.8-62.6 36.3-85.6 24.7-25.3 57.9-39.1 93.2-38.7 31.9.3 62.7 12.6 86 34.4 7.9 7.4 14.7 15.6 20.4 24.4 2 3.1 5.9 4.4 9.3 3.2 17.6-6.1 36.2-10.4 55.3-12.4 5.6-.6 8.8-6.6 6.3-11.6-32.5-64.3-98.9-108.7-175.7-109.9-110.9-1.7-203.3 89.2-203.3 199.9 0 62.8 28.9 118.8 74.2 155.5-31.8 14.7-61.1 35-86.5 60.4-54.8 54.7-85.8 126.9-87.8 204a8 8 0 008 8.2h56.1c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5 29.4-29.4 65.4-49.8 104.7-59.7 3.9-1 6.5-4.7 6-8.7z" } }] }, "name": "team", "theme": "outlined" };

const React = await importShared('react');
var TeamOutlined = function TeamOutlined2(props, ref) {
  return /* @__PURE__ */ React.createElement(Icon, _extends({}, props, {
    ref,
    icon: TeamOutlined$1
  }));
};
var RefIcon = /* @__PURE__ */ React.forwardRef(TeamOutlined);

const {useState,useCallback} = await importShared('react');

const {Card,Progress,Steps,Avatar,Tag,Typography,Flex,Statistic,Button,Tabs,Table,Input,Space,Tooltip} = await importShared('antd');
const { Title, Text, Paragraph } = Typography;
const PageHeader = ({ title, description, stats = [], actions }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Card,
  {
    style: { borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.07)", border: "1px solid #e2e8f0" },
    styles: { body: { padding: 0 } },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 4, background: "linear-gradient(90deg, #1455BD 0%, #3b82f6 100%)" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 240 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { level: 4, style: { margin: 0, color: "#0f172a" }, children: title }),
          description && /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { type: "secondary", style: { marginTop: 6, display: "block", fontSize: 13, lineHeight: 1.6 }, children: description }),
          actions && /* @__PURE__ */ jsxRuntimeExports.jsx(Space, { style: { marginTop: 12 }, children: actions })
        ] }),
        stats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Space, { split: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 1, height: 48, background: "#e2e8f0" } }), children: stats.map((stat, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 10, border: "1px solid #f1f5f9", background: "#fafbff", minWidth: 140 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: stat.accentColor ? `${stat.accentColor}18` : "#e0e7ff", color: stat.accentColor ?? "#1455BD", fontSize: 18 }, children: stat.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: 2 }, children: stat.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: 18, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }, children: stat.value })
          ] })
        ] }, i)) })
      ] })
    ]
  }
);
const PortalTabs = ({ items, defaultActiveKey }) => {
  const antdItems = items.map(({ key, label, icon, badge, children }) => ({
    key,
    label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
      icon,
      label,
      badge != null && badge > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { style: { marginLeft: 2, lineHeight: "16px", padding: "0 4px" }, children: badge })
    ] }),
    children
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tabs,
    {
      type: "line",
      items: antdItems,
      defaultActiveKey: defaultActiveKey ?? items[0]?.key,
      animated: { inkBar: true, tabPane: true },
      style: { background: "#fff", borderRadius: 12 }
    }
  );
};
const STATUS_CONFIG = {
  "Submitted": { color: "blue", label: "Илгээсэн" },
  "Resubmitted": { color: "gold", label: "Дахин илгээсэн" },
  "Approved": { color: "success", label: "Зөвшөөрсөн" },
  "Revision Required": { color: "error", label: "Засвар шаардлагатай" },
  "Finalized": { color: "purple", label: "Баталгаажсан" },
  "Closed": { color: "default", label: "Хаагдсан" },
  "Pending": { color: "warning", label: "Хүлээгдэж байна" },
  "In Progress": { color: "processing", label: "Хийгдэж байна" },
  // Backend status strings
  "DRAFT": { color: "default", label: "Ноорог" },
  "SUBMITTED": { color: "blue", label: "Илгээсэн" },
  "PENDING_TEACHER_APPROVAL": { color: "gold", label: "Багшийн хүлээлт" },
  "DEPT_PENDING": { color: "warning", label: "Тэнхимийн хүлээлт" },
  "APPROVED": { color: "success", label: "Зөвшөөрсөн" },
  "ACTIVE": { color: "processing", label: "Хийгдэж байна" },
  "REJECTED": { color: "error", label: "Татгалзсан" },
  "REVISION_REQUIRED": { color: "error", label: "Засвар шаардлагатай" },
  "REVIEWED": { color: "cyan", label: "Хянагдсан" }
};
const StatusBadge = ({ status, localized = false }) => {
  const cfg = STATUS_CONFIG[status] ?? { color: "default", label: status };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: cfg.color, style: { margin: 0, fontWeight: 500 }, children: localized ? cfg.label : cfg.label || status });
};
function DataTable({
  columns,
  dataSource,
  rowKey = "id",
  loading = false,
  actions = [],
  searchable = false,
  searchPlaceholder = "Хайх...",
  searchFields,
  tableProps = {}
}) {
  const [searchText, setSearchText] = useState("");
  const filteredData = useCallback(() => {
    if (!searchText.trim()) return dataSource;
    const lower = searchText.toLowerCase();
    return dataSource.filter((record) => {
      const fields = searchFields ?? Object.keys(record);
      return fields.some((field) => String(record[field] ?? "").toLowerCase().includes(lower));
    });
  }, [dataSource, searchText, searchFields])();
  const actionsColumn = actions.length > 0 ? {
    title: "Үйлдэл",
    key: "_actions",
    width: actions.length * 40 + 16,
    align: "center",
    fixed: "right",
    render: (_, record) => /* @__PURE__ */ jsxRuntimeExports.jsx(Space, { size: 4, children: actions.map((action, i) => action.hidden?.(record) ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: action.label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "text",
        size: "small",
        icon: action.icon,
        danger: action.danger,
        onClick: (e) => {
          e.stopPropagation();
          action.onClick(record);
        },
        style: { color: action.danger ? void 0 : "#1455BD" }
      }
    ) }, i)) })
  } : null;
  const finalColumns = actionsColumn ? [...columns, actionsColumn] : columns;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    searchable && /* @__PURE__ */ jsxRuntimeExports.jsx(Flex, { justify: "flex-end", style: { marginBottom: 16 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        prefix: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$8, { style: { color: "#94a3b8" } }),
        placeholder: searchPlaceholder,
        value: searchText,
        onChange: (e) => setSearchText(e.target.value),
        allowClear: true,
        style: { width: 240 }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Table,
      {
        columns: finalColumns,
        dataSource: filteredData,
        rowKey,
        loading,
        size: "middle",
        scroll: { x: "max-content" },
        pagination: {
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (tot, range) => `${range[0]}–${range[1]} / нийт ${tot}`,
          style: { marginTop: 16 }
        },
        ...tableProps
      }
    )
  ] });
}
const DEFAULT_THESIS = {
  title: "Эмнэлгийн зургийн оношлогоонд гүн суралцахуй",
  description: "Конволюцын нейрон сүлжээ ашиглан эмнэлгийн зургийн оношлогооны нарийвчлалыг дээшлүүлэхэд гүн суралцахуйн арга техникийг хэрэглэх тухай цогц судалгаа.",
  supervisor: "Д.Сувдаа",
  department: "Компьютерын ухаан",
  researchArea: "Эрүүл мэндэд хиймэл оюун ухаан",
  submissionDate: "2026-06-30",
  status: "In Progress",
  progress: 75,
  committee: ["Д.Сувдаа", "Б.Батням"]
};
const STAGES = [
  { title: "Сэдвийн зөвшөөрөл", status: "finish" },
  { title: "Явц 1", status: "finish" },
  { title: "Явц 2", status: "finish" },
  { title: "Урьдчилсан", status: "process" },
  { title: "Эцсийн", status: "wait" }
];
function TeacherStudentTable({ students, onReview }) {
  const columns = [
    {
      title: "Оюутан",
      dataIndex: "name",
      key: "name",
      render: (name) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Flex, { align: "center", gap: 8, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: 32, style: { background: "#e0e7ff", color: "#1455BD", fontWeight: 700 }, children: (name || "").split(".").map((s) => s[0]).join("") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { strong: true, style: { fontSize: 13 }, children: name })
      ] })
    },
    { title: "Сэдэв", dataIndex: "thesisTitle", key: "thesisTitle", ellipsis: true },
    { title: "Шат", dataIndex: "stage", key: "stage", render: (stage) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { children: stage }) },
    {
      title: "Төлөв",
      dataIndex: "status",
      key: "status",
      render: (status) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status, localized: true })
    },
    {
      title: "Дэвшил",
      dataIndex: "progress",
      key: "progress",
      width: 140,
      render: (pct) => /* @__PURE__ */ jsxRuntimeExports.jsx(Flex, { align: "center", gap: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { percent: pct, size: "small", style: { flex: 1 } }) })
    },
    {
      title: "Сүүлийн илгээлт",
      dataIndex: "lastSubmission",
      key: "lastSubmission",
      render: (d) => /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { type: "secondary", style: { fontSize: 12 }, children: d })
    }
  ];
  if (students.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "48px 24px", color: "#94a3b8" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon, { style: { fontSize: 40, marginBottom: 12, display: "block" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { type: "secondary", children: "Одоогоор удирдаж буй оюутан байхгүй байна." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DataTable,
    {
      columns,
      dataSource: students,
      rowKey: "id",
      searchable: true,
      searchPlaceholder: "Оюутан хайх...",
      searchFields: ["name", "thesisTitle"],
      actions: [{ label: "Тайлан хянах", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$5, {}), onClick: (r) => onReview?.(r.studentId) }]
    }
  );
}
function StudentOverviewTab({ thesis }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr auto", gap: 24 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 16 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { level: 5, style: { marginBottom: 16 }, children: "Нийт дэвшил" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { percent: thesis.progress, strokeColor: { "0%": "#1455BD", "100%": "#3b82f6" }, style: { marginBottom: 24 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Steps,
          {
            current: STAGES.findIndex((s) => s.status === "process"),
            size: "small",
            items: STAGES.map((s) => ({
              title: s.title,
              status: s.status,
              icon: s.status === "finish" ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$3, { style: { color: "#1455BD" } }) : s.status === "process" ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$6, { style: { color: "#1455BD" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$1, { style: { color: "#94a3b8" } })
            }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon, { style: { color: "#1455BD", marginRight: 8 } }),
        "Комисс"
      ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Flex, { wrap: "wrap", gap: 12, children: thesis.committee.map((member, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Flex, { align: "center", gap: 8, style: { padding: "8px 12px", border: "1px solid #f1f5f9", borderRadius: 8, background: "#fafafa" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { size: 36, style: { background: "#e0e7ff", color: "#1455BD", fontWeight: 700 }, children: member.split(" ").map((n) => n[0]).join("") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { strong: true, style: { fontSize: 13 }, children: member }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { type: "secondary", style: { fontSize: 12 }, children: "Хянагч" }) })
        ] })
      ] }, i)) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Flex, { vertical: true, gap: 12, style: { width: 200 }, children: [
      { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon, {}), label: "Удирдагч", value: thesis.supervisor },
      { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$4, {}), label: "Тэнхим", value: thesis.department },
      { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$2, {}), label: "Чиглэл", value: thesis.researchArea },
      { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$7, {}), label: "Хугацаа", value: thesis.submissionDate }
    ].map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Statistic,
      {
        title: /* @__PURE__ */ jsxRuntimeExports.jsxs(Flex, { align: "center", gap: 4, children: [
          item.icon,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label })
        ] }),
        value: item.value,
        valueStyle: { fontSize: 13, color: "#0f172a" }
      }
    ) }, i)) })
  ] });
}
function ThesisView({
  role = "student",
  thesis = DEFAULT_THESIS,
  students = [],
  onReviewReport,
  onSubmitReport
}) {
  const isTeacher = role === "teacher";
  const headerStats = isTeacher ? [
    { label: "Удирдаж буй", value: `${students.length} оюутан`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon, {}), accentColor: "#1455BD" },
    { label: "Хүлээгдэж буй", value: `${students.filter((s) => s.status === "Submitted").length} тайлан`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$5, {}), accentColor: "#d97706" }
  ] : [
    { label: "Дэвшил", value: `${thesis.progress}%`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$3, {}), accentColor: "#1455BD" },
    { label: "Удирдагч", value: thesis.supervisor, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon, {}), accentColor: "#7c3aed" }
  ];
  const tabItems = isTeacher ? [{
    key: "students",
    label: "Оюутнуудын жагсаалт",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon, {}),
    badge: students.filter((s) => s.status === "Submitted").length,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(TeacherStudentTable, { students, onReview: onReviewReport })
  }] : [
    { key: "overview", label: "Тойм", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StudentOverviewTab, { thesis }) },
    {
      key: "submit",
      label: "Тайлан илгээх",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$5, {}),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Paragraph, { type: "secondary", children: "Тайлан илгээх форм энд ачаалагдана." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "primary", onClick: onSubmitReport, children: "Тайлан илгээх" })
      ] })
    }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1400, margin: "0 auto", paddingBottom: 40 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        title: isTeacher ? "Удирдсан дипломын ажлууд" : thesis.title,
        description: isTeacher ? "Өөрийн удирдаж буй оюутнуудын судалгааны ажлыг нэг дороос удирдах самбар." : thesis.description,
        stats: headerStats,
        actions: !isTeacher ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: thesis.status, localized: true }) : void 0
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 24 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PortalTabs, { items: tabItems }) })
  ] });
}

export { ThesisView as default };
