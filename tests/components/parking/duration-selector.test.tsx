import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DurationSelector } from "~/components/parking/duration-selector";

describe("DurationSelector", () => {
  const defaultProps = {
    pricingMode: "FLAT_HOURLY" as const,
    selectedDuration: null,
    onDurationChange: vi.fn(),
    dailyRate: 50000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders quick-select duration buttons for FLAT_HOURLY mode", () => {
    render(<DurationSelector {...defaultProps} />);

    expect(screen.getByText("1 Jam")).toBeInTheDocument();
    expect(screen.getByText("2 Jam")).toBeInTheDocument();
    expect(screen.getByText("3 Jam")).toBeInTheDocument();
    expect(screen.getByText("5 Jam")).toBeInTheDocument();
    expect(screen.getByText("1 Hari")).toBeInTheDocument();
  });

  it("renders only daily button for FIXED_DAILY mode", () => {
    render(<DurationSelector {...defaultProps} pricingMode="FIXED_DAILY" />);

    expect(screen.getByText("1 Hari")).toBeInTheDocument();
    expect(screen.queryByText("1 Jam")).not.toBeInTheDocument();
  });

  it("calls onDurationChange when a quick button is clicked", async () => {
    const user = userEvent.setup();
    render(<DurationSelector {...defaultProps} />);

    await user.click(screen.getByText("2 Jam"));
    expect(defaultProps.onDurationChange).toHaveBeenCalledWith(120);
  });

  it("calls onDurationChange with 1440 for 1 day button", async () => {
    const user = userEvent.setup();
    render(<DurationSelector {...defaultProps} />);

    await user.click(screen.getByText("1 Hari"));
    expect(defaultProps.onDurationChange).toHaveBeenCalledWith(1440);
  });

  it("highlights selected duration button", () => {
    render(<DurationSelector {...defaultProps} selectedDuration={120} />);

    const button = screen.getByText("2 Jam");
    expect(button).toHaveAttribute("data-selected", "true");
  });

  it("renders custom duration input", () => {
    render(<DurationSelector {...defaultProps} />);
    expect(screen.getByLabelText(/durasi kustom/i)).toBeInTheDocument();
  });

  it("calls onDurationChange from custom input", async () => {
    const user = userEvent.setup();
    render(<DurationSelector {...defaultProps} />);

    const input = screen.getByLabelText(/durasi kustom/i);
    await user.clear(input);
    await user.type(input, "90");

    expect(defaultProps.onDurationChange).toHaveBeenCalledWith(90);
  });
});
