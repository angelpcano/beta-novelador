import { useState, type FormEvent } from 'react';
import { Cloud, Mail } from 'lucide-react';
import { supabase } from './supabase';

type Props = { initialError?: string };

export default function AuthScreen({ initialError }: Props) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(initialError ?? '');
  const [sending, setSending] = useState(false);

  const sendLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setSending(true);
    setMessage('');
    setError('');
    try {
      const emailRedirectTo = new URL(import.meta.env.BASE_URL, window.location.origin).toString();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo },
      });
      if (authError) throw authError;
      setMessage('Te hemos enviado un enlace. Ábrelo en este dispositivo para continuar.');
    } catch (authError) {
      console.error('No se pudo enviar el enlace de acceso', authError);
      setError(authError instanceof Error ? authError.message : 'No se pudo enviar el enlace.');
    } finally {
      setSending(false);
    }
  };

  return <main className="auth-page">
    <section className="auth-card">
      <div className="auth-brand"><span className="brand-mark">N.</span><div><strong>BETA-Novelador</strong><small>ESTUDIO LITERARIO</small></div></div>
      <div className="auth-icon"><Cloud size={21}/></div>
      <h1>Tus proyectos, contigo</h1>
      <p>Entra con tu correo para guardar y sincronizar tus novelas entre el ordenador y el móvil.</p>
      <form onSubmit={sendLink}>
        <label className="field-label" htmlFor="sync-email">Correo electrónico</label>
        <input id="sync-email" className="text-input" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)} placeholder="tu@correo.com"/>
        <button className="primary-btn auth-submit" type="submit" disabled={sending||!email.trim()}><Mail size={16}/>{sending?'Enviando enlace…':'Enviar enlace de acceso'}</button>
      </form>
      {message&&<div className="auth-message" role="status">{message}</div>}
      {error&&<div className="auth-error" role="alert">{error}</div>}
      <p className="auth-footnote">Usa el mismo correo en todos tus dispositivos. No necesitas crear una contraseña.</p>
    </section>
  </main>;
}
