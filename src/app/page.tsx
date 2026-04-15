import Link from "next/link";
import { LocationEntryForm } from "~/components/location-entry-form";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 px-4 text-white">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl font-bold backdrop-blur-sm">
            P
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Parkir Nyalira
          </h1>
          <p className="text-blue-100">
            Parkir mandiri — bayar sendiri, bayar lebih cepat
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
            <h2 className="mb-3 text-lg font-semibold">Masukkan kode lokasi</h2>
            <LocationEntryForm />
          </div>

          <p className="text-sm text-blue-200">
            Atau scan QR code di lokasi parkir untuk langsung masuk
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-blue-200">
          <Link href="/login" className="hover:text-white">
            Masuk
          </Link>
          <span>·</span>
          <Link href="/riwayat" className="hover:text-white">
            Riwayat
          </Link>
        </div>
      </div>
    </main>
  );
}
