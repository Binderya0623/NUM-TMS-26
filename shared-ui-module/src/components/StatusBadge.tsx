import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PortalStatus =
  | 'Submitted'
  | 'Resubmitted'
  | 'Approved'
  | 'Revision Required'
  | 'Finalized'
  | 'Closed'
  | 'Pending'
  | 'In Progress';

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PortalStatus,
  { color: TagProps['color']; label: string }
> = {
  'Submitted':         { color: 'blue',    label: 'Илгээсэн'          },
  'Resubmitted':       { color: 'gold',    label: 'Дахин илгээсэн'    },
  'Approved':          { color: 'success', label: 'Зөвшөөрсөн'        },
  'Revision Required': { color: 'error',   label: 'Засвар шаардлагатай' },
  'Finalized':         { color: 'purple',  label: 'Баталгаажсан'      },
  'Closed':            { color: 'default', label: 'Хаагдсан'          },
  'Pending':           { color: 'warning', label: 'Хүлээгдэж байна'   },
  'In Progress':       { color: 'processing', label: 'Хийгдэж байна'  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface StatusBadgeProps {
  status: PortalStatus;
  /** Show Mongolian label instead of the English key */
  localized?: boolean;
}

/**
 * StatusBadge
 *
 * Single source of truth for thesis/evaluation status colours.
 * Replaces the three copies of StatusBadge.tsx spread across modules.
 *
 * Usage:
 *   <StatusBadge status="Approved" />
 *   <StatusBadge status="In Progress" localized />
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  localized = false,
}) => {
  const { color, label } = STATUS_CONFIG[status] ?? {
    color: 'default',
    label: status,
  };

  return (
    <Tag color={color} style={{ margin: 0, fontWeight: 500 }}>
      {localized ? label : status}
    </Tag>
  );
};
