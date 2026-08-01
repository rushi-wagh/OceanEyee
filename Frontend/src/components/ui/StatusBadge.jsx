const statusToneMap = {
  SUBMITTED: "border-white/10 bg-white/[0.04] text-slate-300",
  PENDING_AUTHORITY: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  VERIFIED: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
  REJECTED: "border-red-400/20 bg-red-400/10 text-red-200",
  RESOLVED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  CLOSED: "border-slate-400/20 bg-slate-400/10 text-slate-200",
};
import { humanizeStatus } from "@/components/ui/statusUtils";

const StatusBadge = ({ status }) => {
  const toneClassName = statusToneMap[status] || "border-white/10 bg-white/[0.04] text-slate-300";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${toneClassName}`}>
      {humanizeStatus(status)}
    </span>
  );
};

export { StatusBadge };
