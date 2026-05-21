import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('teacher@quisi.edu');
  const [password, setPassword] = useState('Teacher123!');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student');
      else navigate('/app');
    } catch {
      setError('Identifiants invalides');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-brand">
          <Link to="/" className="auth-logo-link">
            <span className="auth-logo">Q</span>
            <span>Quisi</span>
          </Link>
          <h2>Intelligence pédagogique en temps réel</h2>
          <p>Connectez-vous pour gérer vos quiz, sessions live et analytics IA.</p>
          <ul className="auth-features">
            <li>⚡ Sessions synchronisées &lt; 1s</li>
            <li>🧠 Assistant IA pendant les cours</li>
            <li>📊 Rapports & heatmaps automatiques</li>
          </ul>
        </div>
        <div className="auth-card card">
          <h1>Connexion</h1>
          <p className="subtitle">Enseignant ou étudiant</p>
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label>Mot de passe</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Se connecter
            </button>
          </form>
          <p className="auth-footer">
            Pas de compte ? <Link to="/register">S'inscrire</Link>
            <br />
            <Link to="/" style={{ marginTop: '0.5rem', display: 'inline-block' }}>← Retour accueil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
