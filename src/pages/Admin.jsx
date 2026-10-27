
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import {
  LogOut,
  Download,
  CheckCircle2,
  Clock3,
  Users,
  HeartHandshake,
  Wallet,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  LoaderCircle,
  UserRound,
  LockKeyhole,
  X,
  Filter,
  ArrowUpRight,
  HandHeart,
  AlertTriangle,
} from 'lucide-react';

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;

const formatDate = (value) => {
  if (!value) return 'Date inconnue';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Date inconnue';

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const participationLabel = (value) =>
  ({
    visiteur: 'Visiteur',
    benevole: 'Bénévole',
    exposant: 'Exposant',
    partenaire: 'Partenaire',
  }[value] || value || 'Non renseigné');

const statusInfo = (status) => {
  if (status === 'succes') {
    return {
      label: 'Vérifié',
      className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
      Icon: CheckCircle2,
    };
  }

  if (status === 'en_attente') {
    return {
      label: 'En attente',
      className: 'bg-amber-50 text-amber-700 ring-amber-600/10',
      Icon: Clock3,
    };
  }

  return {
    label: 'Aucun don',
    className: 'bg-slate-100 text-slate-500 ring-slate-500/10',
    Icon: Wallet,
  };
};

// MODAL DE CONFIRMATION INTÉGRÉ AU MÊME FICHIER
function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
      >
        <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <AlertTriangle size={23} strokeWidth={1.8} />
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Fermer la fenêtre"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
            >
              <X size={19} />
            </button>
          </div>

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
              className="mt-2 break-words text-[13px] leading-5 text-slate-500"
            >
              {message}
            </p>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/70 p-3">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-amber-600"
            />
            <p className="text-[11px] leading-4 text-amber-800">
              Vérifiez la réception effective du paiement avant de confirmer.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-3 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
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

export default function Admin() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [filterParticipation, setFilterParticipation] = useState('tous');
  const [filterPayment, setFilterPayment] = useState('tous');
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    montant: 0,
    nom: '',
  });

  // Authentification
  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setAuthReady(true);
      setErrorMsg('');
      setNotice('');
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;

      if (error) {
        setErrorMsg('Impossible de vérifier la session.');
      }

      setSession(data?.session ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Chargement des inscriptions
  const fetchInscriptions = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('inscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInscriptions(data || []);
    } catch (error) {
      console.error(error);
      setErrorMsg(
        'Impossible de charger les inscriptions. Vérifiez les permissions Supabase.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchInscriptions();
    } else {
      setInscriptions([]);
    }
  }, [session, fetchInscriptions]);

  // Connexion
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error(error);
      setErrorMsg(
        'Connexion impossible. Vérifiez votre adresse e-mail et votre mot de passe.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    if (
      !window.confirm('Voulez-vous vraiment vous déconnecter ?')
    ) {
      return;
    }

    setLogoutLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
    } catch (error) {
      console.error(error);
      setErrorMsg('La déconnexion a échoué. Veuillez réessayer.');
    } finally {
      setLogoutLoading(false);
    }
  };

  // Ouvrir le modal de confirmation
  const ouvrirConfirmation = (participant) => {
    setErrorMsg('');
    setNotice('');

    setConfirmModal({
      isOpen: true,
      id: participant.id,
      montant: participant.montant_don || 0,
      nom: `${participant.prenom || ''} ${participant.nom || ''}`.trim(),
    });
  };

  // Confirmer la réception du paiement
  const handleConfirmPayment = async () => {
    if (!confirmModal.id || actionLoading) return;

    setActionLoading(true);
    setErrorMsg('');
    setNotice('');

    try {
      const { data, error } = await supabase
        .from('inscriptions')
        .update({ statut_paiement: 'succes' })
        .eq('id', confirmModal.id)
        .eq('statut_paiement', 'en_attente')
        .select('id');

      if (error) throw error;

      if (!data?.length) {
        throw new Error(
          'Aucune modification effectuée. Le paiement a peut-être déjà été traité ou vos permissions sont insuffisantes.'
        );
      }

      setConfirmModal({
        isOpen: false,
        id: null,
        montant: 0,
        nom: '',
      });

      await fetchInscriptions();

      setNotice('Le paiement a été marqué comme vérifié.');
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error.message || 'Impossible de valider ce paiement.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV compatible avec Excel
  const exportCSV = () => {
    if (!filteredInscriptions.length) {
      setErrorMsg('Aucune inscription à exporter.');
      return;
    }

    const headers = [
      'Date',
      'Nom',
      'Prenom',
      'Genre',
      'Email',
      'Telephone',
      'Ville',
      'Organisation',
      'Participation',
      'Code invitation',
      'Montant don FCFA',
      'Reference paiement',
      'Statut paiement',
    ];

    const escapeCSV = (value) => {
      let text = String(value ?? '');

      if (/^[\s]*[=+\-@]/.test(text)) {
        text = "'" + text;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = filteredInscriptions.map((i) => [
      formatDate(i.created_at),
      i.nom,
      i.prenom,
      i.genre,
      i.email,
      i.telephone,
      i.ville,
      i.organisation,
      participationLabel(i.motif_venue),
      i.code_invitation,
      i.montant_don || 0,
      i.reference_paiement || '',
      statusInfo(i.statut_paiement).label,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(';'))
      .join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `inscriptions_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice('Export CSV téléchargé.');
  };

  // Recherche et filtres
  const filteredInscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inscriptions.filter((i) => {
      const matchesSearch =
        !query ||
        [
          i.nom,
          i.prenom,
          i.email,
          i.telephone,
          i.ville,
          i.organisation,
        ].some((value) =>
          String(value || '').toLowerCase().includes(query)
        );

      const matchesParticipation =
        filterParticipation === 'tous' ||
        i.motif_venue === filterParticipation;

      const matchesPayment =
        filterPayment === 'tous' ||
        (filterPayment === 'aucun'
          ? !i.statut_paiement
          : i.statut_paiement === filterPayment);

      return (
        matchesSearch &&
        matchesParticipation &&
        matchesPayment
      );
    });
  }, [inscriptions, search, filterParticipation, filterPayment]);

  // Statistiques
  const stats = useMemo(() => {
    const total = inscriptions.length;

    const benevoles = inscriptions.filter(
      (i) => i.motif_venue === 'benevole'
    ).length;

    const verified = inscriptions.filter(
      (i) => i.statut_paiement === 'succes'
    );

    const pending = inscriptions.filter(
      (i) => i.statut_paiement === 'en_attente'
    ).length;

    const totalDonations = verified.reduce(
      (sum, i) => sum + Number(i.montant_don || 0),
      0
    );

    return {
      total,
      benevoles,
      verified: verified.length,
      pending,
      totalDonations,
    };
  }, [inscriptions]);

  // Chargement de la session
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FB]">
        <div className="text-center">
          <LoaderCircle
            size={32}
            className="mx-auto animate-spin text-orange-500"
          />
          <p className="mt-3 text-sm text-slate-500">
            Vérification de la session...
          </p>
        </div>
      </div>
    );
  }

  // Connexion
  if (!session) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F5F7FB] px-4 py-8">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

        <section className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-slate-900/10">
          <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-300" />

          <div className="p-6 sm:p-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F172A] text-orange-400 shadow-lg">
              <ShieldCheck size={29} />
            </div>

            <div className="mb-7 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">
                Accès sécurisé
              </p>

              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#0F172A]">
                Administration
              </h1>

              <p className="mt-2 text-sm leading-5 text-slate-500">
                Connectez-vous pour gérer les inscriptions de l'événement.
              </p>
            </div>

            {errorMsg && (
              <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                <AlertCircle size={17} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Adresse e-mail
                </label>

                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@exemple.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Mot de passe
                </label>

                <div className="relative">
                  <LockKeyhole size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loginLoading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowUpRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-slate-400">
              <ShieldCheck size={13} className="mr-1 inline" />
              Espace réservé aux administrateurs
            </p>
          </div>
        </section>
      </main>
    );
  }

  // Dashboard
  return (
    <main className="min-h-screen bg-[#F5F7FB] text-slate-800">
      <header className="bg-[#0F172A] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
              <HeartHandshake size={22} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold sm:text-base">
                Administration
              </p>
              <p className="truncate text-[11px] text-slate-400">
                Journée de la solidarité humaine
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            {logoutLoading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              Vue d'ensemble
            </p>

            <h1 className="mt-1.5 text-2xl font-black tracking-tight text-[#0F172A] sm:text-3xl">
              Tableau de bord
            </h1>

            <p className="mt-2 text-sm leading-5 text-slate-500">
              Suivez les participants et gérez les inscriptions.
            </p>

            <p className="mt-2 truncate text-xs text-slate-400">
              <UserRound size={13} className="mr-1 inline" />
              {session.user.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchInscriptions}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 disabled:opacity-50 sm:text-sm"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>

            <button
              type="button"
              onClick={exportCSV}
              disabled={!filteredInscriptions.length}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 sm:text-sm"
            >
              <Download size={16} />
              Exporter CSV
            </button>
          </div>
        </div>

        {errorMsg && (
          <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="flex-1 break-words">{errorMsg}</p>
            <button type="button" onClick={() => setErrorMsg('')} aria-label="Fermer le message">
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700">
            <CheckCircle2 size={18} />
            <p className="flex-1">{notice}</p>
            <button type="button" onClick={() => setNotice('')} aria-label="Fermer le message">
              <X size={17} />
            </button>
          </div>
        )}

        {/* Statistiques */}
        <section className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: 'Participants',
              value: stats.total,
              Icon: Users,
              color: 'bg-blue-50 text-blue-600',
              note: 'Toutes inscriptions',
            },
            {
              label: 'Bénévoles',
              value: stats.benevoles,
              Icon: HeartHandshake,
              color: 'bg-orange-50 text-orange-600',
              note: 'Inscrits comme bénévoles',
            },
            {
              label: 'Dons vérifiés',
              value: stats.verified,
              Icon: CheckCircle2,
              color: 'bg-emerald-50 text-emerald-600',
              note: 'Paiements marqués vérifiés',
            },
            {
              label: 'Montant vérifié',
              value: formatMoney(stats.totalDonations),
              Icon: Wallet,
              color: 'bg-violet-50 text-violet-600',
              note: `${stats.pending} paiement(s) en attente`,
            },
          ].map(({ label, value, Icon, color, note }) => (
            <article
              key={label}
              className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500 sm:text-xs">
                  {label}
                </span>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={18} />
                </div>
              </div>

              <p className="mt-4 break-words text-xl font-black tracking-tight text-[#0F172A] sm:text-2xl">
                {value}
              </p>

              <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-xs">
                {note}
              </p>
            </article>
          ))}
        </section>

        {/* Liste des participants */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  Liste des participants
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredInscriptions.length} résultat(s)
                  {filteredInscriptions.length !== inscriptions.length
                    ? ` sur ${inscriptions.length}`
                    : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="relative min-w-0">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    aria-label="Rechercher un participant"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-orange-400 focus:bg-white"
                  />
                </div>

                <div className="relative min-w-0">
                  <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    aria-label="Filtrer par participation"
                    value={filterParticipation}
                    onChange={(e) => setFilterParticipation(e.target.value)}
                    className="w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-2 text-xs outline-none focus:border-orange-400"
                  >
                    <option value="tous">Toutes participations</option>
                    <option value="visiteur">Visiteurs</option>
                    <option value="benevole">Bénévoles</option>
                    <option value="exposant">Exposants</option>
                    <option value="partenaire">Partenaires</option>
                  </select>
                </div>

                <div className="min-w-0">
                  <select
                    aria-label="Filtrer par statut de paiement"
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-orange-400"
                  >
                    <option value="tous">Tous les statuts</option>
                    <option value="succes">Paiements vérifiés</option>
                    <option value="en_attente">En attente</option>
                    <option value="aucun">Aucun don</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading && inscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <LoaderCircle size={29} className="animate-spin text-orange-500" />
              <p className="mt-3 text-sm text-slate-500">Chargement des inscriptions...</p>
            </div>
          ) : filteredInscriptions.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={26} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#0F172A]">
                Aucun participant trouvé
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Modifiez votre recherche ou vos filtres.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilterParticipation('tous');
                  setFilterPayment('tous');
                }}
                className="mt-4 text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              {/* Tableau ordinateur */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5">Participant</th>
                      <th className="px-5 py-3.5">Contact</th>
                      <th className="px-5 py-3.5">Participation</th>
                      <th className="px-5 py-3.5">Don</th>
                      <th className="px-5 py-3.5">Paiement</th>
                      <th className="px-5 py-3.5">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredInscriptions.map((i) => {
                      const status = statusInfo(i.statut_paiement);
                      const StatusIcon = status.Icon;

                      return (
                        <tr key={i.id} className="transition-colors hover:bg-slate-50/80">
                          <td className="px-5 py-4">
                            <p className="font-bold text-[#0F172A]">
                              {i.prenom} {i.nom}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {formatDate(i.created_at)}
                            </p>
                          </td>

                          <td className="max-w-56 px-5 py-4">
                            <p className="break-all text-xs text-slate-700">{i.telephone || '—'}</p>
                            <p className="mt-1 break-all text-[11px] text-slate-400">{i.email || '—'}</p>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                              {participationLabel(i.motif_venue)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-bold text-orange-600">
                              {Number(i.montant_don || 0) > 0 ? formatMoney(i.montant_don) : '—'}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-bold ring-1 ring-inset ${status.className}`}>
                              <StatusIcon size={13} />
                              {status.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedParticipant(i)}
                                title="Voir les détails"
                                aria-label={`Voir les détails de ${i.prenom} ${i.nom}`}
                                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-orange-300 hover:text-orange-600"
                              >
                                <Eye size={15} />
                              </button>

                              {i.statut_paiement === 'en_attente' && (
                                <button
                                  type="button"
                                  onClick={() => ouvrirConfirmation(i)}
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-emerald-700"
                                >
                                  Vérifier
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cartes smartphone */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredInscriptions.map((i) => {
                  const status = statusInfo(i.statut_paiement);
                  const StatusIcon = status.Icon;

                  return (
                    <article key={i.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <UserRound size={19} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words text-sm font-bold text-[#0F172A]">
                              {i.prenom} {i.nom}
                            </h3>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {formatDate(i.created_at)}
                            </p>
                          </div>
                        </div>

                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold ring-1 ring-inset ${status.className}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-2.5 text-xs text-slate-600">
                        <p className="flex min-w-0 items-center gap-2">
                          <Phone size={14} className="shrink-0 text-slate-400" />
                          <span className="break-all">{i.telephone || 'Non renseigné'}</span>
                        </p>

                        <p className="flex min-w-0 items-center gap-2">
                          <Mail size={14} className="shrink-0 text-slate-400" />
                          <span className="break-all">{i.email || 'Non renseigné'}</span>
                        </p>

                        <p className="flex items-center gap-2">
                          <MapPin size={14} className="shrink-0 text-slate-400" />
                          {i.ville || 'Ville non renseignée'}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-[10px] text-slate-400">Participation</p>
                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {participationLabel(i.motif_venue)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">Don enregistré</p>
                          <p className="mt-1 text-xs font-bold text-orange-600">
                            {Number(i.montant_don || 0) > 0 ? formatMoney(i.montant_don) : '—'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedParticipant(i)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          <Eye size={15} />
                          Détails
                        </button>

                        {i.statut_paiement === 'en_attente' && (
                          <button
                            type="button"
                            onClick={() => ouvrirConfirmation(i)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                          >
                            <CheckCircle2 size={15} />
                            Vérifier
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex flex-col justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:px-5">
            <span>{filteredInscriptions.length} inscription(s) affichée(s)</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} />
              Espace administrateur
            </span>
          </div>
        </section>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3.5">
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[11px] leading-5 text-amber-800">
            Les montants proviennent de la base de données. Vérifiez la réception effective des dons avant de modifier leur statut.
          </p>
        </div>
      </div>

      {/* Détails du participant */}
      {selectedParticipant && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedParticipant(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="participant-dialog-title"
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
                  Fiche participant
                </p>
                <h2 id="participant-dialog-title" className="mt-1.5 text-xl font-extrabold text-[#0F172A]">
                  {selectedParticipant.prenom} {selectedParticipant.nom}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Fermer les détails"
                onClick={() => setSelectedParticipant(null)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {[
                ['E-mail', selectedParticipant.email, Mail],
                ['Téléphone', selectedParticipant.telephone, Phone],
                ['Ville', selectedParticipant.ville, MapPin],
                ['Genre', selectedParticipant.genre, UserRound],
                ['Organisation', selectedParticipant.organisation, HandHeart],
                ['Code invitation', selectedParticipant.code_invitation, ShieldCheck],
                ['Date inscription', formatDate(selectedParticipant.created_at), CalendarDays],
                ['Participation', participationLabel(selectedParticipant.motif_venue), HeartHandshake],
              ].map(([label, value, Icon]) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-500">
                    <Icon size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-400">{label}</p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-700">
                      {value || 'Non renseigné'}
                    </p>
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="text-xs text-slate-500">Montant du don enregistré</p>
                <p className="mt-1 text-xl font-black text-orange-600">
                  {formatMoney(selectedParticipant.montant_don)}
                </p>

                <p className="mt-3 text-xs text-slate-500">Référence de transaction</p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                  {selectedParticipant.reference_paiement || 'Aucune référence'}
                </p>

                <p className="mt-3 text-xs text-slate-500">Statut</p>
                <span className={`mt-1 inline-flex rounded-lg px-2.5 py-1.5 text-xs font-bold ${statusInfo(selectedParticipant.statut_paiement).className}`}>
                  {statusInfo(selectedParticipant.statut_paiement).label}
                </span>
              </div>

              {selectedParticipant.statut_paiement === 'en_attente' && (
                <button
                  type="button"
                  onClick={() => {
                    ouvrirConfirmation(selectedParticipant);
                    setSelectedParticipant(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 size={17} />
                  Vérifier le paiement
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </section>
        </div>
      )}

      {/* MODAL DE CONFIRMATION DU PAIEMENT */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => {
          if (!actionLoading) {
            setConfirmModal((prev) => ({
              ...prev,
              isOpen: false,
            }));
          }
        }}
        onConfirm={handleConfirmPayment}
        title="Confirmer la réception du don"
        message={`Avez-vous bien vérifié que le paiement de ${Number(
          confirmModal.montant || 0
        ).toLocaleString('fr-FR')} FCFA de la part de ${
          confirmModal.nom
        } a été reçu sur votre compte Mobile Money ?`}
        loading={actionLoading}
      />
    </main>
  );
}
