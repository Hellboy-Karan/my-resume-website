export default function Skeleton({ lines = 3 }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div className="h-4 animate-pulse rounded bg-slate-200" key={index} />
      ))}
    </div>
  );
}

