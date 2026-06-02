function StatsCard({ icon, iconClass, value, label, valueClass }) {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
      <Icon size={26} className={iconClass} />
      <span className={`text-3xl font-bold ${valueClass}`}>{value}</span>
      <span className="text-center text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default StatsCard;
