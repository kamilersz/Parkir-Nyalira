import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QRISDisplay } from "~/components/parking/qris-display";

describe("QRISDisplay", () => {
  const defaultProps = {
    qrPayload: '{"ticketId":"t-1","amount":15000}',
    amount: 15000,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    onDownload: vi.fn(),
    paymentStatus: "PENDING" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders QR code image", () => {
    render(<QRISDisplay {...defaultProps} />);
    expect(screen.getByAltText(/qr.*qris/i)).toBeInTheDocument();
  });

  it("displays formatted amount", () => {
    render(<QRISDisplay {...defaultProps} />);
    expect(screen.getByText(/Rp 15.000/)).toBeInTheDocument();
  });

  it("renders download button", () => {
    render(<QRISDisplay {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /unduh.*qr/i }),
    ).toBeInTheDocument();
  });

  it("calls onDownload when download button is clicked", async () => {
    const user = userEvent.setup();
    render(<QRISDisplay {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /unduh.*qr/i }));
    expect(defaultProps.onDownload).toHaveBeenCalled();
  });

  it("shows countdown timer", () => {
    render(<QRISDisplay {...defaultProps} />);
    expect(screen.getByText(/menit tersisa/i)).toBeInTheDocument();
  });

  it("shows expired message when time runs out", () => {
    render(
      <QRISDisplay
        {...defaultProps}
        expiresAt={new Date(Date.now() - 1000).toISOString()}
      />,
    );

    expect(screen.getByText(/kadaluarsa/i)).toBeInTheDocument();
  });

  it("shows payment confirmed state", () => {
    render(<QRISDisplay {...defaultProps} paymentStatus="SUCCESS" />);

    expect(screen.getByText(/pembayaran berhasil/i)).toBeInTheDocument();
  });

  it("shows help text about scanning", () => {
    render(<QRISDisplay {...defaultProps} />);
    expect(
      screen.getByText(/scan.*e-wallet|scan.*mobile banking/i),
    ).toBeInTheDocument();
  });
});
