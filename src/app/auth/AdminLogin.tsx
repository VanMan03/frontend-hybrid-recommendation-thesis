import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, LogIn } from "lucide-react";
import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  role: string;
};


const API_URL = import.meta.env.VITE_API_URL;

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!API_URL) {
      setError("API URL is not configured. Check VITE_API_URL in your .env file.");
      return;
    }

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);


      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

    const decoded = jwtDecode<JwtPayload>(data.token);

    if (decoded.role !== "admin") {
            throw new Error("This account is not an admin");
    }


      // 🔑 Save admin token
      localStorage.setItem("adminToken", data.token);

      navigate("/admin/dashboard");
    } catch (err: any) {
      const rawMessage = err?.message || "Login error";
      const isNetworkError =
        rawMessage.includes("Failed to fetch") || err instanceof TypeError;

      if (isNetworkError) {
        setError(
          "Unable to reach the server. Check backend availability, CORS settings, and your VITE_API_URL."
        );
      } else {
        setError(rawMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-600 mt-1">
            Travel Itinerary Management System
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="admin@email.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          <LogIn className="size-4" />
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
