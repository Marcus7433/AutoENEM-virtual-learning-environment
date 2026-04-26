function DeleteConfirmModal({ isDeleting, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-sm font-semibold text-slate-800">Excluir redação?</h3>
        <p className="mt-1.5 text-xs text-slate-500">
          Esta ação é permanente e não pode ser desfeita.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? 'Excluindo...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
