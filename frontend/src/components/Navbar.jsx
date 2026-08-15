import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold">
          ⚙️ Equipment Booking
        </Link>

        <div className="flex items-center gap-6">

          {user ? (
            <>
              <Link to="/catalog" className="hover:text-blue-600">
                Catalog
              </Link>

              {user.role === "admin" && (
                <Link to="/admin" className="hover:text-blue-600">
                  Admin
                </Link>
              )}

              <Link to="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>

              <span className="text-sm text-gray-600">
                {user.name}
              </span>

              <button
                onClick={logout}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
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

