import { Plus, Trash2 } from 'lucide-react';

function FloatingActions({ onNova, onDelete }) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onDelete}
        title="Excluir redação"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-500 shadow-lg ring-1 ring-red-100 transition-transform hover:scale-110 hover:bg-red-50 active:scale-95 dark:bg-slate-800 dark:text-red-400 dark:ring-red-500/30 dark:shadow-black/40 dark:hover:bg-slate-700"
      >
        <Trash2 size={18} />
      </button>
      <button
        type="button"
        onClick={onNova}
        title="Nova Redação"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform hover:scale-110 hover:bg-brand-hover active:scale-95"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}

export default FloatingActions;
