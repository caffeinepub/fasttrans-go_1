import { Status } from "../hooks/useQueries";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  [Status.pending]: { label: "قيد الانتظار", className: "status-pending" },
  [Status.accepted]: { label: "تم القبول", className: "status-accepted" },
  [Status.inProgress]: {
    label: "جاري التوصيل",
    className: "status-inProgress",
  },
  [Status.completed]: { label: "مكتمل", className: "status-completed" },
  [Status.cancelled]: { label: "ملغي", className: "status-cancelled" },
};

export function StatusBadge({ status }: { status: Status }) {
  const entry = STATUS_MAP[status] ?? { label: status, className: "" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${entry.className}`}
    >
      {entry.label}
    </span>
  );
}
