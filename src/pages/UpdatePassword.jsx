
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage(
          "Lien invalide ou expiré. Veuillez refaire une demande de réinitialisation."
        );
      }
    });
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Mot de passe mis à jour avec succès ! Redirection...");
      setTimeout(() => navigate('/admin'), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">

      {/* Décoration d'arrière-plan */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Retour */}
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#0F172A]"
        >
          <ArrowLeft size={17} />
          Retour à la connexion
        </button>

        {/* Carte du formulaire */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5">

          {/* En-tête */}
          <div className="bg-[#0F172A] px-6 py-8 text-center sm:px-9">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-orange-400 shadow-inner">
              <LockKeyhole size={30} strokeWidth={1.8} />
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-400">
              Sécurité du compte
            </p>

            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Nouveau mot de passe
            </h1>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-300">
              Choisissez un nouveau mot de passe pour sécuriser votre accès.
            </p>
          </div>

          {/* Formulaire */}
          <div className="px-6 py-8 sm:px-9 sm:py-9">

            {message && (
              <div
                role="status"
                className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm leading-5 ${
                  message.includes('succès')
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {message.includes('succès') ? (
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                ) : (
                  <ShieldCheck size={19} className="mt-0.5 shrink-0" />
                )}
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-5">

              {/* Nouveau mot de passe */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nouveau mot de passe
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-400/10"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirmation */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Confirmer le mot de passe
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Saisissez à nouveau le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-400/10"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {confirmPassword && (
                  <p className={`mt-2 text-xs ${
                    password === confirmPassword ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {password === confirmPassword
                      ? '✓ Les mots de passe correspondent'
                      : 'Les mots de passe ne correspondent pas encore'}
                  </p>
                )}
              </div>

              {/* Conseil de sécurité */}
              <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-orange-500" />
                <p className="text-xs leading-5 text-slate-500">
                  Utilisez un mot de passe difficile à deviner, avec un mélange de lettres,
                  de chiffres et de caractères spéciaux.
                </p>
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:bg-slate-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={17} />
                    Mettre à jour le mot de passe
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Pied de page */}
        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          <LockKeyhole size={13} className="mr-1 inline-block -translate-y-px" />
          Votre sécurité est une priorité.
        </p>

      </div>
    </div>
  );
}
