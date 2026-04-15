import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlateInput } from "~/components/parking/plate-input";

describe("PlateInput", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    onVehicleTypeDetected: vi.fn(),
    vehicleRules: [
      {
        vehicleType: "BUS" as const,
        pattern: "^BX\\d{4}[A-Z]{3}$",
        priority: 30,
        isActive: true,
      },
      {
        vehicleType: "CAR" as const,
        pattern: "^[A-Z]{1,2}\\d{1,4}[A-Z]{3}$",
        priority: 20,
        isActive: true,
      },
      {
        vehicleType: "MOTORCYCLE" as const,
        pattern: "^[A-Z]{1,2}\\d{1,4}[A-Z]{0,2}$",
        priority: 10,
        isActive: true,
      },
    ],
    selectedVehicleType: null,
    onVehicleTypeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders input with placeholder", () => {
    render(<PlateInput {...defaultProps} />);
    expect(screen.getByPlaceholderText(/plat nomor/i)).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    render(<PlateInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/plat nomor/i);
    await user.type(input, "B");

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("shows detected vehicle type badge when plate matches a rule", async () => {
    render(<PlateInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/plat nomor/i);
    fireEvent.change(input, { target: { value: "B1234ABC" } });

    await waitFor(() => {
      expect(defaultProps.onVehicleTypeDetected).toHaveBeenCalledWith("CAR");
    });
  });

  it("shows motorcycle badge for short plate", async () => {
    render(<PlateInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/plat nomor/i);
    fireEvent.change(input, { target: { value: "B1234AB" } });

    await waitFor(() => {
      expect(defaultProps.onVehicleTypeDetected).toHaveBeenCalledWith(
        "MOTORCYCLE",
      );
    });
  });

  it("allows manual vehicle type override", async () => {
    const user = userEvent.setup();
    render(<PlateInput {...defaultProps} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "MOTORCYCLE");

    expect(defaultProps.onVehicleTypeChange).toHaveBeenCalledWith("MOTORCYCLE");
  });

  it("displays the current value", () => {
    render(<PlateInput {...defaultProps} value="B 1234 ABC" />);
    const input = screen.getByPlaceholderText(/plat nomor/i);
    expect(input).toHaveValue("B 1234 ABC");
  });

  it("shows formatting hint", () => {
    render(<PlateInput {...defaultProps} />);
    expect(screen.getByText(/contoh/i)).toBeInTheDocument();
  });
});
