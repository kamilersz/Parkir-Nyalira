"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LocationEntryForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (slug.trim()) {
          router.push(`/parkir/${slug.trim()}`);
        }
      }}
    >
      <input
        type="text"
        name="slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="Contoh: mall-xyz"
        className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-blue-200 focus:border-white focus:outline-none"
      />
      <button
        type="submit"
        className="mt-3 w-full rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
      >
        Lanjutkan
      </button>
    </form>
  );
}
