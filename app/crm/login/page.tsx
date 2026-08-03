"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CRMLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/crm");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3efe6] p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-[1.5rem] border border-[#e0d7c3] bg-white p-8 shadow-sm"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#4b5b41]">CRM</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#1a1a18]">Sign in</h1>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-[#4b4a47]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-[#4b4a47]">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[#d4cdbd] px-3 py-2 text-sm"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#1d4d31] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
