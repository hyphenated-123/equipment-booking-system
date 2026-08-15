import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await register(name, email, password);
      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.detail || "Registration failed."
      );
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-6 text-3xl font-bold">Create account</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="w-full rounded-lg border p-3"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          className="w-full rounded-lg border p-3"
        />

        <button className="w-full rounded-lg bg-blue-600 p-3 text-white">
          Register
        </button>
      </form>

      <p className="mt-5">
        Already registered?{" "}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </p>

      <p className="mt-2 text-center text-sm">
        Register as an{" "}
        <Link to="/register/admin" className="text-blue-600">
          admin
        </Link>
        ?
      </p>
    </main>
  );
}

export default Register;

