import { importShared } from './chunk-__federation_fn_import.js';
import { requireReact } from './chunk-index.js';
import { Icon, _extends, RefIcon as RefIcon$2, RefIcon$1 as RefIcon$3 } from './chunk-SearchOutlined.js';

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
var ExportOutlined$1 = { "icon": { "tag": "svg", "attrs": { "fill-rule": "evenodd", "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M880 912H144c-17.7 0-32-14.3-32-32V144c0-17.7 14.3-32 32-32h360c4.4 0 8 3.6 8 8v56c0 4.4-3.6 8-8 8H184v656h656V520c0-4.4 3.6-8 8-8h56c4.4 0 8 3.6 8 8v360c0 17.7-14.3 32-32 32zM770.87 199.13l-52.2-52.2a8.01 8.01 0 014.7-13.6l179.4-21c5.1-.6 9.5 3.7 8.9 8.9l-21 179.4c-.8 6.6-8.9 9.4-13.6 4.7l-52.4-52.4-256.2 256.2a8.03 8.03 0 01-11.3 0l-42.4-42.4a8.03 8.03 0 010-11.3l256.1-256.3z" } }] }, "name": "export", "theme": "outlined" };

const React$1 = await importShared('react');
var ExportOutlined = function ExportOutlined2(props, ref) {
  return /* @__PURE__ */ React$1.createElement(Icon, _extends({}, props, {
    ref,
    icon: ExportOutlined$1
  }));
};
var RefIcon$1 = /* @__PURE__ */ React$1.forwardRef(ExportOutlined);

// This icon file is generated automatically.
var FilterOutlined$1 = { "icon": { "tag": "svg", "attrs": { "viewBox": "64 64 896 896", "focusable": "false" }, "children": [{ "tag": "path", "attrs": { "d": "M880.1 154H143.9c-24.5 0-39.8 26.7-27.5 48L349 597.4V838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V597.4L907.7 202c12.2-21.3-3.1-48-27.6-48zM603.4 798H420.6V642h182.9v156zm9.6-236.6l-9.5 16.6h-183l-9.5-16.6L212.7 226h598.6L613 561.4z" } }] }, "name": "filter", "theme": "outlined" };

const React = await importShared('react');
var FilterOutlined = function FilterOutlined2(props, ref) {
  return /* @__PURE__ */ React.createElement(Icon, _extends({}, props, {
    ref,
    icon: FilterOutlined$1
  }));
};
var RefIcon = /* @__PURE__ */ React.forwardRef(FilterOutlined);

const {useState,useCallback} = await importShared('react');

const {Table,Input,Button,Space: Space$1,Tooltip,Typography: Typography$1,Flex} = await importShared('antd');
const { Text: Text$1 } = Typography$1;
function buildColumnSearchFilter(dataIndex) {
  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: 8 }, onKeyDown: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Хайх...",
          value: selectedKeys[0],
          onChange: (e) => setSelectedKeys(e.target.value ? [e.target.value] : []),
          onPressEnter: () => confirm(),
          style: { marginBottom: 8, display: "block", width: 200 },
          autoFocus: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Space$1, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "primary",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$2, {}),
            size: "small",
            onClick: () => confirm(),
            style: { width: 90 },
            children: "Хайх"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "small",
            onClick: () => {
              clearFilters?.();
              confirm();
            },
            style: { width: 90 },
            children: "Цэвэрлэх"
          }
        )
      ] })
    ] }),
    filterIcon: (filtered) => /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon, { style: { color: filtered ? "#1455BD" : void 0 } }),
    onFilter: (value, record) => {
      const cell = record[dataIndex];
      return String(cell ?? "").toLowerCase().includes(String(value).toLowerCase());
    }
  };
}
function DataTable({
  columns,
  dataSource,
  rowKey = "id",
  loading = false,
  title,
  subtitle,
  actions = [],
  searchable = false,
  searchPlaceholder = "Хайх...",
  searchFields,
  onExport,
  onReload,
  total,
  pageSizeOptions = [10, 20, 50],
  tableProps = {}
}) {
  const [searchText, setSearchText] = useState("");
  const filteredData = useCallback(() => {
    if (!searchText.trim()) return dataSource;
    const lower = searchText.toLowerCase();
    return dataSource.filter((record) => {
      const fields = searchFields ?? Object.keys(record);
      return fields.some(
        (field) => String(record[field] ?? "").toLowerCase().includes(lower)
      );
    });
  }, [dataSource, searchText, searchFields])();
  const actionsColumn = actions.length > 0 ? {
    title: "Үйлдэл",
    key: "_actions",
    width: actions.length * 40 + 16,
    align: "center",
    fixed: "right",
    render: (_, record) => /* @__PURE__ */ jsxRuntimeExports.jsx(Space$1, { size: 4, children: actions.map((action, i) => {
      if (action.hidden?.(record)) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: action.label, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
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
      ) }, i);
    }) })
  } : null;
  const finalColumns = actionsColumn ? [...columns, actionsColumn] : columns;
  const toolbar = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Flex,
    {
      justify: "space-between",
      align: "center",
      wrap: "wrap",
      gap: 12,
      style: { marginBottom: 16 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          title && /* @__PURE__ */ jsxRuntimeExports.jsx(Text$1, { strong: true, style: { fontSize: 16, color: "#0f172a" }, children: title }),
          subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Text$1, { type: "secondary", style: { fontSize: 13 }, children: subtitle }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Space$1, { wrap: true, children: [
          searchable && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              prefix: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$2, { style: { color: "#94a3b8" } }),
              placeholder: searchPlaceholder,
              value: searchText,
              onChange: (e) => setSearchText(e.target.value),
              allowClear: true,
              style: { width: 240 }
            }
          ),
          onExport && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Экспортлох", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$1, {}),
              onClick: () => onExport(filteredData),
              children: "Экспорт"
            }
          ) }),
          onReload && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Шинэчлэх", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$3, {}), onClick: onReload }) })
        ] })
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    (title || subtitle || searchable || onExport || onReload) && toolbar,
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
          showQuickJumper: true,
          pageSizeOptions,
          total,
          showTotal: (tot, range) => `${range[0]}–${range[1]} / нийт ${tot}`,
          style: { marginTop: 16 }
        },
        ...tableProps
      }
    )
  ] });
}

const {Tag} = await importShared('antd');

const STATUS_CONFIG = {
  "Submitted": { color: "blue", label: "Илгээсэн" },
  "Resubmitted": { color: "gold", label: "Дахин илгээсэн" },
  "Approved": { color: "success", label: "Зөвшөөрсөн" },
  "Revision Required": { color: "error", label: "Засвар шаардлагатай" },
  "Finalized": { color: "purple", label: "Баталгаажсан" },
  "Closed": { color: "default", label: "Хаагдсан" },
  "Pending": { color: "warning", label: "Хүлээгдэж байна" },
  "In Progress": { color: "processing", label: "Хийгдэж байна" }
};
const StatusBadge = ({
  status,
  localized = false
}) => {
  const { color, label } = STATUS_CONFIG[status] ?? {
    color: "default",
    label: status
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color, style: { margin: 0, fontWeight: 500 }, children: localized ? label : status });
};

const {Card,Typography,Space,Divider} = await importShared('antd');

const { Title, Text } = Typography;
const PageHeader = ({
  title,
  description,
  stats = [],
  actions
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      style: {
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,.07)",
        border: "1px solid #e2e8f0"
      },
      styles: {
        body: { padding: 0 }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: {
              height: 4,
              background: "linear-gradient(90deg, #1455BD 0%, #3b82f6 100%)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              padding: "20px 24px",
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "center",
              justifyContent: "space-between"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 240 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { level: 4, style: { margin: 0, color: "#0f172a" }, children: title }),
                description && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Text,
                  {
                    type: "secondary",
                    style: { marginTop: 6, display: "block", fontSize: 13, lineHeight: 1.6 },
                    children: description
                  }
                ),
                actions && /* @__PURE__ */ jsxRuntimeExports.jsx(Space, { style: { marginTop: 12 }, children: actions })
              ] }),
              stats.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Space, { split: /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { type: "vertical", style: { height: 48 } }), children: stats.map((stat, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 16px",
                    borderRadius: 10,
                    border: "1px solid #f1f5f9",
                    background: "#fafbff",
                    minWidth: 140
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        style: {
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: stat.accentColor ? `${stat.accentColor}18` : "#e0e7ff",
                          color: stat.accentColor ?? "#1455BD",
                          fontSize: 18
                        },
                        children: stat.icon
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          style: {
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "#94a3b8",
                            marginBottom: 2
                          },
                          children: stat.label
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          style: {
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#0f172a",
                            lineHeight: 1.2
                          },
                          children: stat.value
                        }
                      )
                    ] })
                  ]
                },
                i
              )) })
            ]
          }
        )
      ]
    }
  );
};

const {Tabs,Badge} = await importShared('antd');

const PortalTabs = ({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  type = "line"
}) => {
  const antdItems = items.map(
    ({ key, label, icon, badge, children }) => ({
      key,
      label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 }, children: [
        icon,
        label,
        badge != null && badge > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Badge,
          {
            count: badge,
            size: "small",
            style: { marginLeft: 2 }
          }
        )
      ] }),
      children
    })
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tabs,
    {
      type,
      items: antdItems,
      defaultActiveKey: defaultActiveKey ?? items[0]?.key,
      activeKey,
      onChange,
      animated: { inkBar: true, tabPane: true },
      style: { background: "#fff", borderRadius: 12 }
    }
  );
};

const BRAND_PRIMARY = "#1455BD";
const BRAND_PRIMARY_HOVER = "#0d3a8a";
const portalTheme = {
  token: {
    // ── Brand palette ──────────────────────────────────────────────
    colorPrimary: BRAND_PRIMARY,
    colorPrimaryHover: BRAND_PRIMARY_HOVER,
    colorLink: BRAND_PRIMARY,
    colorLinkHover: BRAND_PRIMARY_HOVER,
    // ── Typography ────────────────────────────────────────────────
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeHeading1: 28,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,
    // ── Shape ─────────────────────────────────────────────────────
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    // ── Elevation ─────────────────────────────────────────────────
    boxShadow: "0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.07)",
    boxShadowSecondary: "0 4px 6px -1px rgba(0,0,0,.08), 0 2px 4px -2px rgba(0,0,0,.06)",
    // ── Neutral greys (slate scale) ───────────────────────────────
    colorBgLayout: "#f8fafc",
    // page background
    colorBgContainer: "#ffffff",
    colorBorder: "#e2e8f0",
    colorBorderSecondary: "#f1f5f9",
    colorTextBase: "#0f172a",
    colorTextSecondary: "#64748b",
    colorTextTertiary: "#94a3b8",
    // ── Motion ────────────────────────────────────────────────────
    motionDurationMid: "0.15s",
    motionDurationSlow: "0.25s"
  },
  components: {
    // ── Table ─────────────────────────────────────────────────────
    Table: {
      headerBg: "#f8fafc",
      headerColor: "#475569",
      headerSortActiveBg: "#f1f5f9",
      rowHoverBg: "#f8fafc",
      borderColor: "#e2e8f0",
      cellPaddingBlock: 12,
      cellPaddingInline: 16
    },
    // ── Button ────────────────────────────────────────────────────
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
      defaultBorderColor: "#e2e8f0"
    },
    // ── Card ──────────────────────────────────────────────────────
    Card: {
      paddingLG: 24
    },
    // ── Tabs ──────────────────────────────────────────────────────
    Tabs: {
      inkBarColor: BRAND_PRIMARY,
      itemActiveColor: BRAND_PRIMARY,
      itemSelectedColor: BRAND_PRIMARY,
      itemHoverColor: BRAND_PRIMARY_HOVER,
      cardBg: "#f8fafc"
    },
    // ── Tag / Badge ───────────────────────────────────────────────
    Tag: {
      borderRadiusSM: 20
    },
    // ── Select / Input ────────────────────────────────────────────
    Select: { borderRadius: 8 },
    Input: { borderRadius: 8 }
  }
};

export { BRAND_PRIMARY, BRAND_PRIMARY_HOVER, DataTable, PageHeader, PortalTabs, StatusBadge, buildColumnSearchFilter, portalTheme };
