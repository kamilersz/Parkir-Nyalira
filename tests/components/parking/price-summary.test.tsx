import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceSummary } from "~/components/parking/price-summary";

describe("PriceSummary", () => {
  const defaultProps = {
    locationName: "Parkir Mall XYZ",
    licensePlate: "B 1234 ABC",
    vehicleType: "CAR",
    durationMinutes: 120,
    pricingMode: "FLAT_HOURLY" as const,
    breakdown: {
      firstHour: 10000,
      additionalHourCount: 1,
      additionalHours: 5000,
      total: 15000,
      dailyRate: 0,
      capped: false,
      capAmount: null,
    },
    onPay: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays location name", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText("Parkir Mall XYZ")).toBeInTheDocument();
  });

  it("displays license plate", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText("B 1234 ABC")).toBeInTheDocument();
  });

  it("displays vehicle type label", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText(/mobil/i)).toBeInTheDocument();
  });

  it("displays formatted duration", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText(/2 jam/i)).toBeInTheDocument();
  });

  it("displays price breakdown for hourly mode", () => {
    render(<PriceSummary {...defaultProps} />);

    expect(screen.getByText(/Rp 10.000/)).toBeInTheDocument();
    expect(screen.getByText(/Rp 5.000/)).toBeInTheDocument();
    expect(screen.getByText(/Rp 15.000/)).toBeInTheDocument();
  });

  it("displays total price prominently", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText("Rp 15.000")).toBeInTheDocument();
  });

  it("renders pay button with correct text", () => {
    render(<PriceSummary {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /bayar sekarang/i }),
    ).toBeInTheDocument();
  });

  it("calls onPay when pay button is clicked", async () => {
    const user = userEvent.setup();
    render(<PriceSummary {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /bayar sekarang/i }));
    expect(defaultProps.onPay).toHaveBeenCalled();
  });

  it("shows loading state on pay button", () => {
    render(<PriceSummary {...defaultProps} isLoading={true} />);

    const button = screen.getByRole("button", { name: /memproses|loading/i });
    expect(button).toBeDisabled();
  });

  it("shows daily rate for FIXED_DAILY mode", () => {
    render(
      <PriceSummary
        {...defaultProps}
        pricingMode="FIXED_DAILY"
        breakdown={{
          firstHour: 0,
          additionalHourCount: 0,
          additionalHours: 0,
          total: 50000,
          dailyRate: 50000,
          capped: false,
          capAmount: null,
        }}
      />,
    );

    expect(screen.getByText(/tarif harian/i)).toBeInTheDocument();
    expect(screen.getAllByText("Rp 50.000").length).toBeGreaterThanOrEqual(1);
  });

  it("shows capped indicator when price is capped", () => {
    render(
      <PriceSummary
        {...defaultProps}
        breakdown={{
          ...defaultProps.breakdown,
          capped: true,
          capAmount: 75000,
          total: 75000,
        }}
      />,
    );

    expect(screen.getByText(/tarif maks/i)).toBeInTheDocument();
  });
});
