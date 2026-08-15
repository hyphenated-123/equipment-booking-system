import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  async function login(email, password) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { access_token, user: loggedInUser } = response.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    setUser(loggedInUser);

    return loggedInUser;
  }

  async function register(name, email, password) {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  }

  async function adminRegister(name, email, password, adminCode) {
    const response = await api.post("/auth/register/admin", {
      name,
      email,
      password,
      admin_code: adminCode,
    });

    return response.data;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        adminRegister,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
