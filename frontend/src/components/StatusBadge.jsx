import { STATUS_COLORS } from '../utils/constants';

export default function StatusBadge({ status }) {
  const style = STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-300';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
