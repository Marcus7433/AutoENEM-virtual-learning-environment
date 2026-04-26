import { LogOut, Trash2 } from 'lucide-react';

function AccountActionsCard({ onLogout, onDeleteRequest }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-md transition hover:bg-red-700"
      >
        <LogOut size={16} />
        Sair da conta
      </button>

      <button
        type="button"
        onClick={onDeleteRequest}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-md transition hover:bg-red-700"
      >
        <Trash2 size={16} />
        Deletar conta
      </button>
    </div>
  );
}

export default AccountActionsCard;
