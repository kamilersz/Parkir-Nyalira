import "~/styles/globals.css";

import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Parkir Nyalira",
  description: "Self-service parking ticketing & payment",
};

export default function ParkingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <a href="/" className="text-lg font-bold text-blue-700">
            ← Parkir Nyalira
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pt-6 pb-24">{children}</main>
    </div>
  );
}
