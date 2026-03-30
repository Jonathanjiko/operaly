"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Operaly"
            className="h-14"
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-[#0F1F63] mb-2">
          Restablecer contraseña
        </h1>

        <p className="text-center text-gray-500 mb-6 text-sm">
          Ingresa una nueva contraseña para tu cuenta.
        </p>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-4">
              Tu contraseña ha sido actualizada correctamente.
            </p>

            <a
              href="/login"
              className="inline-block bg-[#0F1F63] text-white px-5 py-2 rounded-xl hover:opacity-90"
            >
              Ir a iniciar sesión
            </a>
          </div>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#0F1F63]"
            />

            {error && (
              <p className="text-red-500 text-sm mb-3">
                {error}
              </p>
            )}

            <button
              onClick={handleReset}
              disabled={loading || !password}
              className="w-full bg-[#0F1F63] text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
