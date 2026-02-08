import { useState } from "react";
import api from "../api";
import { useToast } from "../components/ToastContainer";
import Spinner from "../components/Spinner";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    age: "",
    position: "",
    level: "",
    location: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      showToast("Les mots de passe ne correspondent pas.", "error");
      setLoading(false);
      return;
    }

    if (!avatar) {
      showToast("Le selfie est obligatoire.", "error");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });
      data.append("avatar", avatar);

      const res = await api.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Compte créé, tu peux te connecter !", "success");
      console.log(res.data);
    } catch (err) {
      console.error("REGISTER ERROR FRONT:", err.response?.data || err.message);
      showToast(err.response?.data?.message || "Erreur à l'inscription.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gc-card auth-container">
      <h2>Inscription</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Nom / Pseudo
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Téléphone
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Âge
          <input
            type="number"
            name="age"
            min="12"
            max="60"
            value={form.age}
            onChange={handleChange}
          />
        </label>

        <label>
          Poste préféré
          <select
            name="position"
            value={form.position}
            onChange={handleChange}
          >
            <option value="">Choisir...</option>
            <option value="GK">Gardien</option>
            <option value="DEF">Défenseur</option>
            <option value="MID">Milieu</option>
            <option value="ATT">Attaquant</option>
            <option value="WINGER">Ailier</option>
          </select>
        </label>

        <label>
          Niveau (1–10)
          <input
            type="number"
            name="level"
            min="1"
            max="10"
            value={form.level}
            onChange={handleChange}
          />
        </label>

        <label>
          Ville / terrain habituel
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </label>

        <label>
          Mot de passe
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Confirme le mot de passe
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Selfie (obligatoire)
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? <><Spinner size="small" /> Registering...</> : "REGISTER"}
        </button>
      </form>
    </div>
  );
}

export default Register;
