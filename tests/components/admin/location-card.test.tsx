import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocationCard } from "~/components/admin/location-card";

describe("LocationCard", () => {
  const defaultProps = {
    location: {
      id: "loc-1",
      name: "Parkir Mall XYZ",
      slug: "mall-xyz",
      address: "Jl. Sudirman No. 1",
      pricingMode: "FLAT_HOURLY" as const,
      isActive: true,
      balance: 500000,
      _count: { tickets: 42 },
    },
    todayRevenue: 75000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays location name", () => {
    render(<LocationCard {...defaultProps} />);
    expect(screen.getByText("Parkir Mall XYZ")).toBeInTheDocument();
  });

  it("displays formatted balance", () => {
    render(<LocationCard {...defaultProps} />);
    expect(screen.getByText(/Rp 500.000/)).toBeInTheDocument();
  });

  it("displays today's revenue", () => {
    render(<LocationCard {...defaultProps} />);
    expect(screen.getByText(/Rp 75.000/)).toBeInTheDocument();
  });

  it("shows active status badge", () => {
    render(<LocationCard {...defaultProps} />);
    expect(screen.getByText(/aktif/i)).toBeInTheDocument();
  });

  it("shows inactive status badge when inactive", () => {
    render(
      <LocationCard
        {...defaultProps}
        location={{ ...defaultProps.location, isActive: false }}
      />,
    );
    expect(screen.getByText(/nonaktif/i)).toBeInTheDocument();
  });

  it("shows pricing mode label", () => {
    render(<LocationCard {...defaultProps} />);
    expect(screen.getByText(/tarif per jam/i)).toBeInTheDocument();
  });

  it("links to location detail page", () => {
    render(<LocationCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/admin/locations/loc-1");
  });
});
