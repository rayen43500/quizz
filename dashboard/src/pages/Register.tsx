import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', institution: '', role: 'teacher' as 'teacher' | 'student' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ ...form, role: form.role });
      if (form.role === 'student') navigate('/student');
      else navigate('/app');
    } catch {
      setError('Erreur lors de l\'inscription');
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
          <h2>Rejoignez la révolution EdTech</h2>
          <p>Créez votre compte enseignant et commencez à transformer vos cours dès aujourd'hui.</p>
        </div>
        <div className="auth-card card">
          <h1>Inscription enseignant</h1>
          <form onSubmit={handleSubmit}>
            <label>Type de compte</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'teacher' | 'student' })}>
              <option value="teacher">Enseignant</option>
              <option value="student">Étudiant</option>
            </select>
            {(['firstName', 'lastName', 'email', 'password', 'institution'] as const).map((field) => (
              <div key={field}>
                <label>
                  {field === 'firstName' ? 'Prénom' : field === 'lastName' ? 'Nom' : field === 'institution' ? 'Établissement' : field === 'email' ? 'Email' : 'Mot de passe'}
                </label>
                <input
                  className="input"
                  type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  required={field !== 'institution'}
                />
              </div>
            ))}
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Créer mon compte
            </button>
          </form>
          <p className="auth-footer">
            <Link to="/login">Déjà inscrit ?</Link>
            <br />
            <Link to="/">← Retour accueil</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
