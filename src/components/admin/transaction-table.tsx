"use client";

import { formatRupiah } from "~/lib/pricing";

interface Transaction {
  id: string;
  licensePlateRaw: string;
  vehicleType: string;
  durationMinutes: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu",
  PAID: "Terbayar",
  EXPIRED: "Kadaluarsa",
  CANCELLED: "Dibatalkan",
};

const vehicleTypeLabels: Record<string, string> = {
  MOTORCYCLE: "Motor",
  CAR: "Mobil",
  BUS: "Bus",
  TRUCK: "Truk",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins > 0) return `${hours}j ${mins}m`;
  return `${hours} jam`;
}

export function TransactionTable({
  transactions,
  pagination,
  onPageChange,
  isLoading: _isLoading,
}: TransactionTableProps) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
        Belum ada transaksi
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Plat Nomor
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Jenis
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Durasi
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Jumlah
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Tanggal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{tx.licensePlateRaw}</td>
                <td className="px-4 py-3">
                  {vehicleTypeLabels[tx.vehicleType] ?? tx.vehicleType}
                </td>
                <td className="px-4 py-3">
                  {formatDuration(tx.durationMinutes)}
                </td>
                <td className="px-4 py-3">{formatRupiah(tx.totalPrice)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      tx.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : tx.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusLabels[tx.status] ?? tx.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(tx.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Halaman {pagination.page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
