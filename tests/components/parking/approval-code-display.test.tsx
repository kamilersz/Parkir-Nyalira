import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApprovalCodeDisplay } from "~/components/parking/approval-code-display";

describe("ApprovalCodeDisplay", () => {
  const defaultProps = {
    approvalCode: "4827",
    timeoutCode: "6301",
    validFrom: new Date("2026-04-15T10:05:00Z").toISOString(),
    validUntil: new Date("2026-04-15T12:05:00Z").toISOString(),
    licensePlate: "B 1234 ABC",
    locationName: "Parkir Mall XYZ",
    vehicleType: "CAR",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays the approval code prominently", () => {
    render(<ApprovalCodeDisplay {...defaultProps} />);
    expect(screen.getByText("4827")).toBeInTheDocument();
  });

  it("displays the timeout code", () => {
    render(<ApprovalCodeDisplay {...defaultProps} />);
    expect(screen.getByText("6301")).toBeInTheDocument();
  });

  it("displays formatted code with separator", () => {
    render(<ApprovalCodeDisplay {...defaultProps} />);
    expect(screen.getByText("4827 - 6301")).toBeInTheDocument();
  });

  it("shows QR code containing approval data", () => {
    render(<ApprovalCodeDisplay {...defaultProps} />);
    expect(screen.getByAltText(/qr.*approval|qr.*kode/i)).toBeInTheDocument();
  });

  it("shows ticket details", () => {
    render(<ApprovalCodeDisplay {...defaultProps} />);

    expect(screen.getByText("B 1234 ABC")).toBeInTheDocument();
    expect(screen.getByText("Parkir Mall XYZ")).toBeInTheDocument();
  });

  it("shows validity period", () => {
    render(<ApprovalCodeDisplay {...defaultProps} />);
    expect(screen.getByText(/berlaku/i)).toBeInTheDocument();
  });

  it("shows expired state when validUntil is past", () => {
    render(
      <ApprovalCodeDisplay
        {...defaultProps}
        validUntil={new Date("2020-01-01").toISOString()}
      />,
    );

    expect(screen.getByText(/tiket telah kadaluarsa/i)).toBeInTheDocument();
  });

  it("renders share button", () => {
    render(<ApprovalCodeDisplay {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /bagikan|simpan/i }),
    ).toBeInTheDocument();
  });
});
