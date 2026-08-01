import { Link } from "react-router-dom";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/3 p-6 text-center shadow-card-glow sm:p-8">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_55%)]" />
      <div className="relative flex flex-col items-center">
        {Icon ? (
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary-light shadow-glow-primary">
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
        ) : null}

        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>

        {actionLabel && actionHref ? (
          <Link
            to={actionHref}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow-primary transition-all duration-200 hover:scale-[1.02] hover:bg-primary-dark"
          >
            {actionLabel}
            {ActionIcon ? <ActionIcon className="h-4 w-4" aria-hidden="true" /> : null}
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export { EmptyState };