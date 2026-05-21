import { useState, useRef } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import '../components/Avatar.css';
import './Profile.css';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    institution: user?.institution || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.patch('/auth/profile', form);
      await refreshUser();
      setMessage('Profil mis à jour');
    } catch {
      setError('Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image max 2 Mo');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await api.post('/auth/avatar', { image: reader.result });
        await refreshUser();
        setMessage('Photo de profil mise à jour');
      } catch {
        setError('Échec upload image');
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = async () => {
    await api.delete('/auth/avatar');
    await refreshUser();
    setMessage('Photo supprimée');
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await api.patch('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      setMessage('Mot de passe modifié');
    } catch {
      setError('Mot de passe actuel incorrect');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page animate-in">
      <header className="page-header">
        <h1>Mon profil</h1>
        <p className="page-subtitle">Gérez vos informations, photo et sécurité du compte enseignant.</p>
      </header>

      <div className="profile-grid grid-2">
        <section className="card profile-photo-card">
          <h3>Photo de profil</h3>
          <div className="profile-photo-wrap">
            <Avatar src={user.avatar} firstName={user.firstName} lastName={user.lastName} size="xl" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChange} />
          <div className="profile-photo-actions">
            <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()}>
              Changer la photo
            </button>
            {user.avatar && (
              <button type="button" className="btn btn-ghost" onClick={removePhoto}>
                Supprimer
              </button>
            )}
          </div>
          <p className="profile-hint">JPG, PNG — max 2 Mo</p>
        </section>

        <section className="card">
          <h3>Informations</h3>
          {message && <p className="profile-success">{message}</p>}
          {error && <p className="profile-error">{error}</p>}
          <form onSubmit={saveProfile}>
            <label>Prénom</label>
            <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <label>Nom</label>
            <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            <label>Email</label>
            <input className="input" value={user.email} disabled style={{ opacity: 0.6 }} />
            <label>Établissement</label>
            <input className="input" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
            <label>Rôle</label>
            <input className="input" value="Enseignant" disabled style={{ opacity: 0.6 }} />
            <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }} disabled={loading}>
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </section>
      </div>

      <section className="card section-gap" style={{ maxWidth: 480 }}>
        <h3>Sécurité</h3>
        <form onSubmit={changePassword}>
          <label>Mot de passe actuel</label>
          <input className="input" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
          <label>Nouveau mot de passe</label>
          <input className="input" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={8} />
          <label>Confirmer</label>
          <input className="input" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
          <button type="submit" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }}>
            Modifier le mot de passe
          </button>
        </form>
      </section>
    </div>
  );
}
