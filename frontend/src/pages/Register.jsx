import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-gray-800 p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-2 text-green-400">
          Inscription réussie 🎉
        </h2>
        <p className="text-gray-400">
          Vérifiez votre boîte mail pour confirmer votre compte.
          Redirection en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-gray-800 p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Créer un compte</h2>
      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            name="firstName"
            placeholder="Prénom"
            value={form.firstName}
            onChange={handleChange}
            className="w-1/2 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Nom"
            value={form.lastName}
            onChange={handleChange}
            className="w-1/2 p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
            required
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Téléphone (optionnel)"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-500"
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Création...' : "S'inscrire"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-400">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-purple-400 hover:underline">
          Connectez-vous
        </Link>
      </p>
    </div>
  );
}