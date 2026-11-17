export default function LoadingSpinner({ label = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0B2C6F]" />
      <p className="mt-3 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
