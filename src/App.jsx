import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import FormInscription from './components/FormInscription';
import Admin from './pages/Admin';
import UpdatePassword from './pages/UpdatePassword';

// Ce composant écoute les événements de Supabase
function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Si l'événement est une récupération de mot de passe, on redirige
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/update-password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return null; // Ce composant ne fait rien visuellement, il gère juste la logique
}

function App() {
  return (
    <BrowserRouter>
      <AuthListener /> {/* On ajoute l'écouteur ici */}
      <Routes>
        <Route path="/" element={<FormInscription />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;