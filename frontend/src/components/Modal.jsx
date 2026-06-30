export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-2xl rounded-md bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-black text-ink">{title}</h3>
          <button className="btn-secondary px-3" onClick={onClose}>Close</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

