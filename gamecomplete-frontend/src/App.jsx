import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import api from "./api";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MatchDetails from "./pages/MatchDetails";
import CreateMatch from "./pages/CreateMatch";
import MatchLineupPage from "./pages/MatchLineUpPage";

function PrivateRoute({ user, children }) {
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("gc_token");
    if (!token) return;

    api
      .get("/users/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("gc_token");
        setUser(null);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("gc_token");
    sessionStorage.removeItem("gc_token");
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="gc-app">
      <Navigation user={user} onLogout={logout} />

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
                <Profile user={user} setUser={setUser} />
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

          <Route
            path="/matches/:id/lineup"
            element={
              <PrivateRoute user={user}>
                <MatchLineupPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
