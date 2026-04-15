import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionTable } from "~/components/admin/transaction-table";

describe("TransactionTable", () => {
  const defaultProps = {
    transactions: [
      {
        id: "ticket-1",
        licensePlateRaw: "B 1234 ABC",
        vehicleType: "CAR",
        durationMinutes: 120,
        totalPrice: 15000,
        status: "PAID" as const,
        createdAt: new Date("2026-04-15T10:00:00Z"),
        paidAt: new Date("2026-04-15T10:05:00Z"),
      },
      {
        id: "ticket-2",
        licensePlateRaw: "D 5678 XY",
        vehicleType: "MOTORCYCLE",
        durationMinutes: 60,
        totalPrice: 3000,
        status: "PENDING" as const,
        createdAt: new Date("2026-04-15T11:00:00Z"),
        paidAt: null,
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
    },
    onPageChange: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders transaction rows", () => {
    render(<TransactionTable {...defaultProps} />);
    expect(screen.getByText("B 1234 ABC")).toBeInTheDocument();
    expect(screen.getByText("D 5678 XY")).toBeInTheDocument();
  });

  it("shows formatted amounts", () => {
    render(<TransactionTable {...defaultProps} />);
    expect(screen.getByText("Rp 15.000")).toBeInTheDocument();
    expect(screen.getByText("Rp 3.000")).toBeInTheDocument();
  });

  it("shows status badges", () => {
    render(<TransactionTable {...defaultProps} />);
    expect(screen.getByText("Terbayar")).toBeInTheDocument();
    expect(screen.getByText("Menunggu")).toBeInTheDocument();
  });

  it("shows vehicle type labels in Indonesian", () => {
    render(<TransactionTable {...defaultProps} />);
    expect(screen.getByText("Mobil")).toBeInTheDocument();
    expect(screen.getByText("Motor")).toBeInTheDocument();
  });

  it("shows formatted dates", () => {
    render(<TransactionTable {...defaultProps} />);
    const dateCells = screen.getAllByText(/15 apr/i);
    expect(dateCells).toHaveLength(2);
  });

  it("renders column headers", () => {
    render(<TransactionTable {...defaultProps} />);

    expect(screen.getByText(/plat nomor/i)).toBeInTheDocument();
    expect(screen.getByText(/jenis/i)).toBeInTheDocument();
    expect(screen.getByText(/durasi/i)).toBeInTheDocument();
    expect(screen.getByText(/jumlah/i)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();
    expect(screen.getByText(/tanggal/i)).toBeInTheDocument();
  });

  it("shows empty state when no transactions", () => {
    render(
      <TransactionTable
        {...defaultProps}
        transactions={[]}
        pagination={{ page: 1, limit: 10, total: 0 }}
      />,
    );

    expect(screen.getByText(/belum ada transaksi/i)).toBeInTheDocument();
  });

  it("calls onPageChange when pagination is used", async () => {
    const user = userEvent.setup();
    render(
      <TransactionTable
        {...defaultProps}
        pagination={{ page: 1, limit: 10, total: 25 }}
      />,
    );

    const nextButton = screen.getByRole("button", { name: /berikutnya/i });
    await user.click(nextButton);

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });
});
