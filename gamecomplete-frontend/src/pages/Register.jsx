import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Register({ setUser }) {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');
  const [level, setLevel] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/register', {
        firstname,
        lastname,
        email,
        password,
        age: age ? Number(age) : null,
        position,
        level: level ? Number(level) : null,
        location,
      });

      const { token, user } = res.data;
      localStorage.setItem('gc_token', token);
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      console.log('REGISTER ERROR FRONT:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Register failed');
    }
  };

  return (
    <div className="gc-card">
      <h2>Create account</h2>
      {error && <p className="gc-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>First name</label>
        <input value={firstname} onChange={(e) => setFirstname(e.target.value)} />

        <label>Last name</label>
        <input value={lastname} onChange={(e) => setLastname(e.target.value)} />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <label>Position</label>
        <input
          placeholder="defender, striker..."
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />

        <label>Level (1–10)</label>
        <input
          type="number"
          min="1"
          max="10"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        />

        <label>Location</label>
        <input
          placeholder="City"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>

      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default Register;
