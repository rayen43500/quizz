import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quizzes from './pages/Quizzes';
import QuizEditor from './pages/QuizEditor';
import LiveSession from './pages/LiveSession';
import Sessions from './pages/Sessions';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import AIGenerator from './pages/AIGenerator';
import Profile from './pages/Profile';
import Students from './pages/Students';
import StudentPortal from './pages/StudentPortal';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="landing-loading">
        <div className="landing-spinner" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'teacher') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={loading ? <div className="landing-loading"><div className="landing-spinner" /></div> : user ? <Navigate to="/app" /> : <Landing />} />
      <Route path="/login" element={user ? (user.role === 'teacher' ? <Navigate to="/app" /> : <Navigate to="/student" />) : <Login />} />
      <Route path="/student" element={<StudentPortal />} />
      <Route path="/register" element={user ? <Navigate to="/app" /> : <Register />} />
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="quizzes/:id" element={<QuizEditor />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="sessions/:id/live" element={<LiveSession />} />
        <Route path="reports" element={<Reports />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ai-generator" element={<AIGenerator />} />
        <Route path="profile" element={<Profile />} />
        <Route path="students" element={<Students />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
