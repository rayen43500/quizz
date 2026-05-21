import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import '../components/Avatar.css';

export default function StudentPortal() {
  const { user, logout } = useAuth();

  return (
    <div className="landing" style={{ minHeight: '100vh', padding: 'var(--space-10)' }}>
      <div className="card" style={{ maxWidth: 520, margin: '4rem auto', textAlign: 'center' }}>
        {user && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <Avatar src={user.avatar} firstName={user.firstName} lastName={user.lastName} size="xl" />
          </div>
        )}
        <h1 style={{ marginBottom: 'var(--space-3)' }}>Espace étudiant</h1>
        <p className="page-subtitle" style={{ margin: '0 auto var(--space-8)' }}>
          {user
            ? `Bonjour ${user.firstName} — utilisez l'application mobile Quisi pour rejoindre les sessions, répondre aux quiz et consulter vos statistiques.`
            : 'Connectez-vous avec un compte étudiant.'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            📱 Expo : <code style={{ color: 'var(--primary)' }}>cd mobile && npx expo start</code>
          </p>
          <Link to="/" className="btn btn-secondary">Retour accueil</Link>
          {user ? (
            <button className="btn btn-ghost" onClick={logout}>Déconnexion</button>
          ) : (
            <Link to="/login" className="btn btn-primary">Connexion</Link>
          )}
        </div>
      </div>
    </div>
  );
}
