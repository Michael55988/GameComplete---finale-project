import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../components/ToastContainer';
import Spinner from '../components/Spinner';
import Breadcrumbs from '../components/Breadcrumbs';

function CreateMatch() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/matches', {
        title,
        location,
        date,
        time,
        max_players: maxPlayers ? Number(maxPlayers) : null,
        description,
      });

      showToast('Match created successfully!', 'success');
      navigate(`/matches/${res.data.id}`);
    } catch (err) {
      console.log('CREATE MATCH ERROR:', err.response?.data || err.message);
      showToast(err.response?.data?.error || 'Could not create match', 'error');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/create-match', label: 'Create Match' },
  ];

  return (
    <div className="gc-card">
      <Breadcrumbs items={breadcrumbs} />
      <h2>Create a game</h2>

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

        <button type="submit" disabled={loading}>
          {loading ? <><Spinner size="small" /> Creating...</> : 'Create match'}
        </button>
      </form>
    </div>
  );
}

export default CreateMatch;
