
import { useEffect } from 'react';
import { AlertTriangle, X, LoaderCircle, ShieldCheck } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer cette action',
  message = 'Souhaitez-vous continuer ?',
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!loading) onConfirm?.();
  };

  const handleClose = () => {
    if (!loading) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl shadow-slate-950/20 animate-in zoom-in-95 duration-200"
      >
        {/* Bande décorative */}
        <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

        <div className="p-5 sm:p-6">
          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <AlertTriangle size={23} strokeWidth={1.8} />
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              aria-label="Fermer la fenêtre"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={19} />
            </button>
          </div>

          {/* Message */}
          <div className="mt-4">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
              Confirmation requise
            </p>

            <h2
              id="confirm-modal-title"
              className="text-lg font-extrabold leading-snug tracking-tight text-[#0F172A]"
            >
              {title}
            </h2>

            <p
              id="confirm-modal-message"
              className="mt-2 text-[13px] leading-5 text-slate-500"
            >
              {message}
            </p>
          </div>

          {/* Rappel */}
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-amber-600"
            />
            <p className="text-[11px] leading-4 text-amber-800">
              Vérifiez les informations avant de confirmer. Cette action peut
              modifier les données enregistrées.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-3 py-3 text-xs font-bold text-white shadow-sm shadow-orange-500/20 transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  Patientez...
                </>
              ) : (
                'Confirmer'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
