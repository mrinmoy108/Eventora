"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setResetToken(data.token);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[#F7F6FD]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-10 text-center text-3xl font-bold tracking-tight text-[#1A1A2E] font-display">
          Forgot password?
        </h2>
        <p className="mt-2 text-center text-sm text-[#6B7280]">
          Enter your email to reset your password
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 shadow-sm rounded-xl">
        {success ? (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg border border-emerald-100 text-sm leading-relaxed text-left">
              <p className="font-semibold mb-2">📬 Simulated Email Sent!</p>
              <p className="mb-4">
                Since this is a development/sandbox environment, a real email was not sent. You can reset your password immediately using the link below:
              </p>
              <Link
                href={`/reset-password?token=${resetToken}`}
                className="inline-block w-full text-center font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                🔗 Reset Password Now
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Or go back to{" "}
              <Link href="/login" className="font-semibold text-[#6C3FE8] hover:text-[#5532b8]">
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-[#1A1A2E]"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. johndoe@eventora.com"
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-[#1A1A2E] shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#6C3FE8] sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-[#6C3FE8] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5532b8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C3FE8] disabled:opacity-50"
              >
                {loading ? "Sending link..." : "Send reset link"}
              </button>
            </div>
          </form>
        )}

        {!success && (
          <p className="mt-10 text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold leading-6 text-[#6C3FE8] hover:text-[#5532b8]"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
