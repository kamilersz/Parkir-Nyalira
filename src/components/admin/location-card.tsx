import Link from "next/link";
import { formatRupiah } from "~/lib/pricing";

interface LocationCardProps {
  location: {
    id: string;
    name: string;
    slug: string;
    address?: string | null;
    pricingMode: "FLAT_HOURLY" | "FIXED_DAILY";
    isActive: boolean;
    balance: number;
    _count?: { tickets?: number };
  };
  todayRevenue: number;
}

export function LocationCard({ location, todayRevenue }: LocationCardProps) {
  return (
    <Link
      href={`/admin/locations/${location.id}`}
      className="block rounded-lg border bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{location.name}</h3>
          {location.address && (
            <p className="text-sm text-gray-500">{location.address}</p>
          )}
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            location.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {location.isActive ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      <div className="mt-4 flex gap-4 text-sm">
        <div>
          <p className="text-gray-500">Saldo</p>
          <p className="font-semibold">{formatRupiah(location.balance)}</p>
        </div>
        <div>
          <p className="text-gray-500">Pendapatan hari ini</p>
          <p className="font-semibold">{formatRupiah(todayRevenue)}</p>
        </div>
      </div>

      <div className="mt-3">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {location.pricingMode === "FLAT_HOURLY"
            ? "Tarif per jam"
            : "Tarif harian"}
        </span>
      </div>
    </Link>
  );
}
