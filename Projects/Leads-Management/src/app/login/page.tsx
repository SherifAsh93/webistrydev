"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "كلمة المرور غير صحيحة");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="safe-top safe-bottom flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="mb-6 flex items-center gap-2">
        <BrandMark height={56} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md"
      >
        <h1 className="mb-4 text-center text-lg font-bold text-stone-800">
          لوحة التحكم
        </h1>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-sm font-medium text-stone-700">
            كلمة المرور
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoFocus
            required
          />
        </label>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-md active:scale-95 disabled:opacity-60"
        >
          {loading ? "جارِ الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
