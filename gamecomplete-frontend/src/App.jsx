import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import api from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MatchDetails from './pages/MatchDetails';
import CreateMatch from './pages/CreateMatch';

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('gc_token');
    if (!token) return;

    api
      .get('/users/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('gc_token');
        setUser(null);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem('gc_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="gc-app">
      <nav className="gc-nav">
        <div className="gc-nav-left">
          <Link to="/dashboard" className="gc-logo">
            GameComplete
          </Link>
        </div>

        <div className="gc-nav-right">
          {user && (
            <>
              <Link to="/create-match">Create match</Link>
              <Link to="/profile">Profile</Link>
              <button onClick={logout} className="gc-btn-secondary">
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      <main className="gc-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute user={user}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute user={user}>
                <Profile user={user} />
              </PrivateRoute>
            }
          />

          <Route
            path="/matches/:id"
            element={
              <PrivateRoute user={user}>
                <MatchDetails user={user} />
              </PrivateRoute>
            }
          />

          <Route
            path="/create-match"
            element={
              <PrivateRoute user={user}>
                <CreateMatch />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
