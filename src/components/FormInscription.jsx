import { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Building2,
  Ticket,
  HeartHandshake,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  HandHeart,
  LoaderCircle,
  Globe2,
  Copy,
  Check
} from 'lucide-react';

const INITIAL_FORM = {
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  ville: '',
  motif_venue: 'visiteur',
  genre: 'Homme',
  organisation: '',
  code_invitation: '',
};

const inputClass =
  'block w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-[13px] text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10';

const labelClass = 'mb-1.5 block text-[13px] font-semibold text-slate-700';

function CustomSelect({ value, onChange, options, Icon, name }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        name={name}
        aria-label={name}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
        className={`flex w-full min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13px] outline-none transition-all ${
          open
            ? 'border-orange-400 bg-white ring-2 ring-orange-500/10'
            : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
        }`}
      >
        <Icon size={16} className="shrink-0 text-slate-400" />

        <span className="min-w-0 flex-1 truncate text-slate-700">
          {options.find((option) => option.value === value)?.label}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-48 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full min-w-0 items-center rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${
                  value === option.value
                    ? 'bg-orange-50 font-semibold text-orange-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="min-w-0 flex-1 truncate">
                  {option.label}
                </span>

                {value === option.value && (
                  <CheckCircle2 size={15} className="ml-2 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FormInscription() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // États pour la gestion du don manuel
  const [inscriptionId, setInscriptionId] = useState(null);
  const [donAmount, setDonAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [operateur, setOperateur] = useState('MTN'); // 'MTN' ou 'Orange'
  const [transactionRef, setTransactionRef] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [donLoading, setDonLoading] = useState(false);
  const [donValide, setDonValide] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) setErrorMessage('');
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // On génère un ID unique directement dans le navigateur (UUID)
      const newId = crypto.randomUUID(); 

      const dataToInsert = {
        id: newId, // On l'ajoute à notre objet
        ...formData,
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        telephone: formData.telephone.trim(),
        email: formData.email.trim().toLowerCase(),
        ville: formData.ville.trim(),
        organisation: formData.organisation.trim() || null,
        code_invitation: formData.code_invitation.trim() || null,
      };

      // On fait l'insertion normalement, sans .select()
      const { error } = await supabase
        .from('inscriptions')
        .insert([dataToInsert]);

      if (error) throw error;

      // On sauvegarde l'ID généré pour l'étape du don
      setInscriptionId(newId);
      
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      setErrorMessage(
        "Impossible de valider votre inscription. Vérifiez que la table Supabase est bien configurée."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour copier le code USSD
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getUssdCode());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Fonction pour générer le code USSD selon l'opérateur et le montant
  const getUssdCode = () => {
    const amount = customAmount.trim() !== '' ? Number(customAmount) : donAmount;
    if (!amount || amount <= 0) return "Veuillez entrer un montant";
    
    if (operateur === 'Orange') {
      return `#150*1*1*689502270*${amount}#`;
    } else {
      return `*126*1*1*651562073*${amount}#`;
    }
  };

  // Fonction pour enregistrer le don manuel dans Supabase
    const handleValiderDon = async () => {
    const amount = customAmount.trim() !== '' ? Number(customAmount) : donAmount;

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setErrorMessage('Veuillez saisir un montant entier valide en FCFA.');
      return;
    }

    const cleanRef = transactionRef.trim();
    // On vérifie que l'ID fait au moins 8 caractères
    if (cleanRef.length < 8) {
      setErrorMessage("L'ID de transaction semble invalide. Copiez bien le code complet reçu par SMS.");
      return;
    }

    setDonLoading(true);
    setErrorMessage('');

    const { error } = await supabase
      .from('inscriptions')
      .update({
        a_fait_un_don: true,
        montant_don: amount,
        reference_paiement: cleanRef,
        statut_paiement: 'en_attente' // L'admin vérifiera manuellement
      })
      .eq('id', inscriptionId);

    if (error) {
      console.error(error);
      setErrorMessage("Erreur lors de l'enregistrement de votre don. Veuillez réessayer.");
    } else {
      setDonValide(true);
    }
    setDonLoading(false);
  };

  const fieldIcon = (Icon) => (
    <Icon
      size={16}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
  );

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#F5F7FB] font-sans text-slate-800">
      {/* Arrière-plan décoratif */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -right-32 top-96 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-[#0F172A]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white">
              <HeartHandshake size={20} />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-wide text-white">
                SOLIDARITÉ
              </p>
              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Ensemble, plus forts
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-300 sm:flex">
            <ShieldCheck size={16} className="text-emerald-400" />
            Inscription gratuite
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-3 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {!success ? (
          <div className="grid items-start gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            {/* Présentation */}
            <section className="lg:sticky lg:top-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-700">
                <Sparkles size={14} />
                Un événement, une cause commune
              </div>

              <h1 className="text-3xl font-black leading-tight tracking-tight text-[#0F172A] sm:text-4xl xl:text-5xl">
                La solidarité
                <span className="block text-orange-500">
                  nous rassemble.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                Rejoignez-nous pour célébrer la solidarité humaine,
                partager des expériences et construire ensemble un avenir
                plus juste et plus humain.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <CalendarDays size={19} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Date de l'événement
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#0F172A]">
                      Dimanche 20 décembre 2026
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <MapPin size={19} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Lieu de rencontre
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#0F172A]">
                      Yaoundé, Cameroun
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#0F172A] p-5 text-white shadow-lg shadow-slate-900/10">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                    <HandHeart size={22} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">
                      Chaque geste compte.
                    </h2>
                    <p className="mt-2 text-[13px] leading-5 text-slate-300">
                      Participez comme visiteur, bénévole, exposant ou
                      partenaire. Votre présence fait déjà la différence.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-slate-300">
                  <Globe2 size={15} className="shrink-0 text-orange-400" />
                  Ouvert à toutes les personnes de bonne volonté
                </div>
              </div>
            </section>

            {/* Formulaire d'inscription */}
            <section className="min-w-0 rounded-[24px] border border-white bg-white shadow-xl shadow-slate-900/[0.06]">
              <div className="h-1 rounded-t-[24px] bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300" />

              <div className="min-w-0 p-4 sm:p-6 lg:p-7">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">
                    Votre participation
                  </p>
                  <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-[#0F172A] sm:text-2xl">
                    Inscrivez-vous
                  </h2>
                  <p className="mt-2 text-[13px] leading-5 text-slate-500">
                    Complétez les informations ci-dessous pour réserver
                    votre place. Les champs marqués d'un * sont obligatoires.
                  </p>
                </div>

                {errorMessage && !success && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700"
                  >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="min-w-0 space-y-4">
                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="min-w-0">
                      <label htmlFor="prenom" className={labelClass}>
                        Prénom *
                      </label>
                      <div className="relative min-w-0">
                        {fieldIcon(UserRound)}
                        <input
                          id="prenom"
                          name="prenom"
                          required
                          autoComplete="given-name"
                          maxLength={100}
                          value={formData.prenom}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Votre prénom"
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label htmlFor="nom" className={labelClass}>
                        Nom *
                      </label>
                      <div className="relative min-w-0">
                        {fieldIcon(UserRound)}
                        <input
                          id="nom"
                          name="nom"
                          required
                          autoComplete="family-name"
                          maxLength={100}
                          value={formData.nom}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="min-w-0">
                      <label className={labelClass}>Genre *</label>
                      <CustomSelect
                        name="Genre"
                        value={formData.genre}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, genre: value }))
                        }
                        Icon={UserRound}
                        options={[
                          { value: 'Homme', label: 'Homme' },
                          { value: 'Femme', label: 'Femme' },
                        ]}
                      />
                    </div>

                    <div className="min-w-0">
                      <label htmlFor="ville" className={labelClass}>
                        Ville de résidence *
                      </label>
                      <div className="relative min-w-0">
                        {fieldIcon(MapPin)}
                        <input
                          id="ville"
                          name="ville"
                          required
                          autoComplete="address-level2"
                          maxLength={100}
                          value={formData.ville}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Ex. : Yaoundé"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="telephone" className={labelClass}>
                      Téléphone / WhatsApp *
                    </label>
                    <div className="relative min-w-0">
                      {fieldIcon(Phone)}
                      <input
                        id="telephone"
                        name="telephone"
                        required
                        type="tel"
                        autoComplete="tel"
                        maxLength={30}
                        value={formData.telephone}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="+237 655 66 77 88"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="email" className={labelClass}>
                      Adresse e-mail *
                    </label>
                    <div className="relative min-w-0">
                      {fieldIcon(Mail)}
                      <input
                        id="email"
                        name="email"
                        required
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="vous@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label className={labelClass}>
                      Comment souhaitez-vous participer ? *
                    </label>
                    <CustomSelect
                      name="Type de participation"
                      value={formData.motif_venue}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          motif_venue: value,
                        }))
                      }
                      Icon={HeartHandshake}
                      options={[
                        { value: 'visiteur', label: 'Visiteur' },
                        { value: 'benevole', label: 'Bénévole' },
                        { value: 'exposant', label: 'Exposant' },
                        { value: 'partenaire', label: 'Partenaire' },
                      ]}
                    />
                    <p className="mt-1.5 text-[11px] leading-4 text-slate-400">
                      Choisissez le rôle qui correspond à votre participation.
                    </p>
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="organisation" className={labelClass}>
                      Organisation / entreprise{' '}
                      <span className="font-normal text-slate-400">
                        (facultatif)
                      </span>
                    </label>
                    <div className="relative min-w-0">
                      {fieldIcon(Building2)}
                      <input
                        id="organisation"
                        name="organisation"
                        maxLength={200}
                        value={formData.organisation}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Nom de votre structure"
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <label htmlFor="code_invitation" className={labelClass}>
                      Code d'invitation{' '}
                      <span className="font-normal text-slate-400">
                        (facultatif)
                      </span>
                    </label>
                    <div className="relative min-w-0">
                      {fieldIcon(Ticket)}
                      <input
                        id="code_invitation"
                        name="code_invitation"
                        maxLength={100}
                        value={formData.code_invitation}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ex. : INV-2026"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      <p className="text-[11px] leading-5 text-slate-500">
                        L'inscription est gratuite. Vérifiez vos coordonnées
                        avant de valider. Vos informations doivent être
                        protégées conformément aux règles applicables.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle size={17} className="animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      <>
                        Valider mon inscription
                        <ArrowRight
                          size={17}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-slate-400">
                    <span className="text-orange-500">*</span> Champs obligatoires
                  </p>
                </form>
              </div>
            </section>
          </div>
        ) : (
          /* Confirmation et Don */
          <section className="mx-auto max-w-xl overflow-hidden rounded-[26px] border border-white bg-white shadow-xl shadow-slate-900/10">
            <div className="relative overflow-hidden bg-[#0F172A] px-5 py-10 text-center text-white sm:px-10">
              <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-orange-500/20 blur-2xl" />

              <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-orange-300/30 bg-orange-500/15">
                <CheckCircle2 size={36} className="text-orange-400" />
                <Sparkles
                  size={17}
                  className="absolute -right-1 -top-1 text-amber-300"
                />
              </div>

              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">
                Confirmation d'inscription
              </p>

              <h2 className="text-2xl font-black sm:text-3xl">
                Merci {formData.prenom} !
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
                Votre inscription a été enregistrée. Nous sommes heureux
                de vous compter parmi les participants à cette journée.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              {!donValide ? (
                <>
                  <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <CalendarDays size={20} className="shrink-0 text-orange-500" />
                      <div>
                        <p className="text-[11px] text-slate-400">Rendez-vous le</p>
                        <p className="mt-1 text-sm font-bold text-[#0F172A]">
                          20 décembre 2026 · Yaoundé
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Ticket size={20} className="shrink-0 text-orange-500" />
                      <div>
                        <p className="text-[11px] text-slate-400">
                          Votre participation
                        </p>
                        <p className="mt-1 text-sm font-bold capitalize text-[#0F172A]">
                          {{
                            visiteur: 'Visiteur',
                            benevole: 'Bénévole',
                            exposant: 'Exposant',
                            partenaire: 'Partenaire',
                          }[formData.motif_venue]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-7">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <HeartHandshake size={21} />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#0F172A]">
                          Soutenir l'initiative
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Un don facultatif pour soutenir les activités.
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-[13px] leading-5 text-slate-500">
                      Votre inscription est entièrement gratuite. Si vous le
                      souhaitez, vous pouvez contribuer librement par Mobile Money.
                    </p>

                    {/* Choix du montant */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[1000, 1500, 2000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setDonAmount(amount);
                            setCustomAmount('');
                            setErrorMessage('');
                          }}
                          className={`rounded-xl border px-1.5 py-3 text-xs font-bold transition-all sm:text-sm ${
                            donAmount === amount && customAmount === ''
                              ? 'border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-500/10'
                              : 'border-slate-200 text-slate-600 hover:border-orange-300'
                          }`}
                        >
                          {amount.toLocaleString('fr-FR')} F
                        </button>
                      ))}
                    </div>

                    <label htmlFor="custom-donation" className={labelClass + ' mt-4'}>
                      Autre montant (FCFA)
                    </label>
                    <input
                      id="custom-donation"
                      type="number"
                      min="1"
                      step="1"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="Montant libre"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10"
                    />

                    {/* Sélection de l'opérateur */}
                    <div className="mt-4 flex gap-2 rounded-xl bg-slate-100 p-1">
                      <button
                        type="button"
                        onClick={() => setOperateur('MTN')}
                        className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                          operateur === 'MTN'
                            ? 'bg-yellow-400 text-black shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        MTN MoMo
                      </button>
                      <button
                        type="button"
                        onClick={() => setOperateur('Orange')}
                        className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                          operateur === 'Orange'
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Orange Money
                      </button>
                    </div>

                    {/* Instructions de paiement */}
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                      <p className="font-semibold text-slate-800 mb-1">
                        {operateur === 'MTN' ? 'Bénéficiaire : NDJOKO PIERRE CANIS' : 'Bénéficiaire : LOWEH SEAN WILFRIED NGUEMA ELLA'}
                      </p>
                      <p className="text-slate-600 mb-3">
                        Numéro : {operateur === 'MTN' ? '651562073' : '689502270'}
                      </p>
                      
                      <p className="text-[11px] text-slate-500 mb-2">Copiez ce code USSD et tapez-le sur votre téléphone :</p>
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                        <span className="font-mono font-bold text-[#0F172A]">{getUssdCode()}</span>
                        <button onClick={copyToClipboard} className="text-slate-400 transition-colors hover:text-orange-500">
                          {isCopied ? <Check size={18} className="text-emerald-500"/> : <Copy size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* ID Transaction */}
                    <label htmlFor="transaction-ref" className={labelClass + ' mt-4'}>
                      ID de la transaction (Reçu par SMS) *
                    </label>
                    <input
                      id="transaction-ref"
                      type="text"
                      value={transactionRef}
                      onChange={(e) => {
                        setTransactionRef(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="Ex: PP21008.0037.A22091"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10"
                    />

                    {errorMessage && (
                      <p role="alert" className="mt-2 text-xs text-red-600">
                        {errorMessage}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleValiderDon}
                      disabled={donLoading || !transactionRef || (!donAmount && !customAmount)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {donLoading ? (
                        <><LoaderCircle size={18} className="animate-spin" /> Enregistrement...</>
                      ) : (
                        <><HandHeart size={18} /> J'ai effectué le dépôt</>
                      )}
                    </button>

                    <p className="mt-3 text-center text-[10px] leading-4 text-slate-400">
                      Votre don sera vérifié manuellement par l'organisation.
                    </p>
                  </div>
                </>
              ) : (
                /* Message de fin après le don */
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0F172A] mb-2">Merci pour votre générosité !</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Votre don de {customAmount || donAmount} FCFA a été enregistré avec succès. 
                    L'organisation vérifiera la transaction sous peu.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if(donValide) {
                    setSuccess(false);
                    setFormData(INITIAL_FORM);
                    setInscriptionId(null);
                    setDonValide(false);
                    setTransactionRef('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    // optionnel: on pourrait cacher le don et laisser juste le message de confirmation
                  }
                }}
                className="mt-7 w-full text-center text-xs font-semibold text-slate-500 underline underline-offset-4 transition hover:text-orange-600"
              >
                {donValide ? "Retour au formulaire d'inscription" : "Ignorer cette étape"}
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Pied de page */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:px-8 sm:text-left">
          <p className="text-xs font-semibold text-slate-600">
            Ensemble, faisons grandir la solidarité. - formatech
          </p>
          <p className="text-[10px] text-slate-400">
            © 2026 · Journée internationale de la solidarité humaine
          </p>
        </div>
      </footer>
    </main>
  );
}