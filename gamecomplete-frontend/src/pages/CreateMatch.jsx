import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function CreateMatch() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/matches', {
        title,
        location,
        date,
        time,
        max_players: maxPlayers ? Number(maxPlayers) : null,
        description,
      });

      navigate(`/matches/${res.data.id}`);
    } catch (err) {
      console.log('CREATE MATCH ERROR:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Could not create match');
    }
  };

  return (
    <div className="gc-card">
      <h2>Create a game</h2>
      {error && <p className="gc-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Location</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} />

        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Time</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        <label>Max players</label>
        <input
          type="number"
          min="2"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value)}
        />

        <label>Description</label>
        <textarea
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">Create match</button>
      </form>
    </div>
  );
}

export default CreateMatch;
