import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useToast } from "../components/ToastContainer";
import Spinner from "../components/Spinner";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        rememberMe,
      });

      const { token, user } = res.data;

      if (rememberMe) {
        localStorage.setItem("gc_token", token);
        localStorage.setItem("savedEmail", email);
      } else {
        sessionStorage.setItem("gc_token", token);
        localStorage.removeItem("savedEmail");
      }

      showToast("Welcome back!", "success");
      setUser(user);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Erreur de connexion.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <label className="remember-me">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>

        <button type="submit" disabled={loading}>
          {loading ? <><Spinner size="small" /> Connecting...</> : "Connect"}
        </button>
      </form>
    </div>
  );
}

export default Login;
