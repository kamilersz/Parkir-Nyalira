"use client";

interface VehicleTypeSelectorProps {
  value: string | null;
  onChange: (type: string) => void;
  disabled?: boolean;
}

const vehicleTypes = [
  {
    type: "MOTORCYCLE",
    label: "Motor",
    icon: (
      <svg
        viewBox="0 0 80 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12"
      >
        <circle
          cx="18"
          cy="42"
          r="12"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="62"
          cy="42"
          r="12"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M18 42L30 25L50 25L62 42"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M30 25L35 18H45L50 25"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35 18C35 18 38 15 45 15C52 15 55 18 55 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    type: "CAR",
    label: "Mobil",
    icon: (
      <svg
        viewBox="0 0 80 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12"
      >
        <path
          d="M10 35L20 20C22 17 26 15 30 15H50C54 15 58 17 60 20L70 35"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect
          x="8"
          y="35"
          width="64"
          height="12"
          rx="4"
          stroke="currentColor"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="47"
          r="6"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="58"
          cy="47"
          r="6"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M25 20L30 28H50L55 20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="32"
          y="22"
          width="16"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
  },
  {
    type: "BUS",
    label: "Bus",
    icon: (
      <svg
        viewBox="0 0 80 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12"
      >
        <rect
          x="8"
          y="10"
          width="64"
          height="35"
          rx="4"
          stroke="currentColor"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="47"
          r="5"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="58"
          cy="47"
          r="5"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <line
          x1="8"
          y1="22"
          x2="68"
          y2="22"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="14"
          y="13"
          width="8"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <rect
          x="26"
          y="13"
          width="8"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <rect
          x="38"
          y="13"
          width="8"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <rect
          x="50"
          y="13"
          width="8"
          height="7"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <rect
          x="14"
          y="26"
          width="52"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
  },
  {
    type: "TRUCK",
    label: "Truk",
    icon: (
      <svg
        viewBox="0 0 80 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12"
      >
        <rect
          x="5"
          y="15"
          width="45"
          height="25"
          rx="2"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M50 25H70L75 35V40H50V25Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle
          cx="18"
          cy="43"
          r="5"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="38"
          cy="43"
          r="5"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx="62"
          cy="43"
          r="5"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
        <rect
          x="54"
          y="28"
          width="10"
          height="10"
          rx="1"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
  },
];

export function VehicleTypeSelector({
  value,
  onChange,
  disabled = false,
}: VehicleTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {vehicleTypes.map(({ type, label, icon }) => {
        const isSelected = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
              isSelected
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} `}
            aria-pressed={isSelected}
          >
            <div className={isSelected ? "text-primary" : "text-current"}>
              {icon}
            </div>
            <span className="text-sm font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
