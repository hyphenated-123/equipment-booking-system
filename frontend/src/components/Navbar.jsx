import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-blue-600">
          Equipment Booking
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/catalog" className="hover:text-blue-600">
            Resources
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>

              {user.role === "admin" && (
                <Link to="/admin" className="hover:text-blue-600">
                  Admin
                </Link>
              )}

              <button
                onClick={logout}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600">
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
