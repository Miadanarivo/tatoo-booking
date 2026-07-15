import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const BODY_ZONES = ['bras', 'jambe', 'dos', 'torse', 'main', 'cou', 'autre'];

export default function Booking() {
  const { artistId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    date: '',
    startTime: '',
    durationMinutes: 60,
    description: '',
    bodyZone: 'autre',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: booking } = await api.post('/bookings', {
        ...form,
        artistId,
      });

      // Upload de l'image de référence si fournie
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/bookings/${booking.id}/reference-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Erreur lors de la réservation',
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-gray-800 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-2 text-green-400">
          Demande envoyée 🎉
        </h2>
        <p className="text-gray-400">
          L'artiste va examiner votre demande. Vous recevrez un email de
          confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-8 bg-gray-800 p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Réserver une séance</h2>
      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="w-1/2">
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm text-gray-400 mb-1">Heure</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Durée estimée (minutes)
          </label>
          <input
            type="number"
            name="durationMinutes"
            value={form.durationMinutes}
            onChange={handleChange}
            min={30}
            step={30}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Zone du corps
          </label>
          <select
            name="bodyZone"
            value={form.bodyZone}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
          >
            {BODY_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Description de votre projet
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
            placeholder="Décrivez le tatouage souhaité..."
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Image de référence (optionnel)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm text-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Envoi...' : 'Envoyer la demande'}
        </button>
      </form>
    </div>
  );
}