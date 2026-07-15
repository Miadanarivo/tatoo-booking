import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold text-purple-400">
        Tattoo Booking 🖋️
      </Link>
      <div className="flex gap-4 items-center">
        <Link to="/artists" className="hover:text-purple-400">
          Artistes
        </Link>
        {user ? (
          <>
            <span className="text-sm text-gray-400">
              Bonjour, {user.firstName}
            </span>
            <Link to="/dashboard" className="hover:text-purple-400">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-purple-400">
              Connexion
            </Link>
            <Link
              to="/register"
              className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-700 text-sm"
            >
              Inscription
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}