export type SignupRegion =
  | "north-america"
  | "europe"
  | "asia-pacific"
  | "latin-america"
  | "middle-east"
  | "africa";

export type SignupRegionOption = {
  value: SignupRegion;
  label: string;
  phonePlaceholder: string;
  minDigits: number;
  maxDigits: number;
};

export const SIGNUP_REGION_OPTIONS: SignupRegionOption[] = [
  {
    value: "north-america",
    label: "North America",
    phonePlaceholder: "+1 555 123 4567",
    minDigits: 10,
    maxDigits: 11,
  },
  {
    value: "europe",
    label: "Europe",
    phonePlaceholder: "+44 7911 123456",
    minDigits: 9,
    maxDigits: 12,
  },
  {
    value: "asia-pacific",
    label: "Asia Pacific",
    phonePlaceholder: "+61 412 345 678",
    minDigits: 8,
    maxDigits: 12,
  },
  {
    value: "latin-america",
    label: "Latin America",
    phonePlaceholder: "+55 11 91234 5678",
    minDigits: 10,
    maxDigits: 11,
  },
  {
    value: "middle-east",
    label: "Middle East",
    phonePlaceholder: "+971 50 123 4567",
    minDigits: 9,
    maxDigits: 10,
  },
  {
    value: "africa",
    label: "Africa",
    phonePlaceholder: "+27 82 123 4567",
    minDigits: 9,
    maxDigits: 10,
  },
];

export type SignupStep2Values = {
  sponsor: string;
  username: string;
  fullName: string;
  region: SignupRegion | "";
  phone: string;
  email: string;
};

export type SignupStep2Errors = Partial<Record<keyof SignupStep2Values, string>>;

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const FULL_NAME_PATTERN = /^[a-zA-Z\s'.-]{2,80}$/;

export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d+\s()-]/g, "");
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function getRegionOption(region: SignupRegion | ""): SignupRegionOption | undefined {
  return SIGNUP_REGION_OPTIONS.find((option) => option.value === region);
}

export function validateUsername(value: string, label = "Username"): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required.`;
  if (!USERNAME_PATTERN.test(trimmed)) {
    return `${label} must be 3–20 characters and use letters, numbers, or underscores only.`;
  }
  return undefined;
}

export function validateFullName(value: string): string | undefined {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Full name is required.";
  if (!FULL_NAME_PATTERN.test(trimmed)) {
    return "Full name may only contain letters, spaces, hyphens, apostrophes, or periods.";
  }
  return undefined;
}

export function validateRegion(value: SignupRegion | ""): string | undefined {
  if (!value) return "Select your nationality region.";
  return undefined;
}

export function validatePhone(value: string, region: SignupRegion | ""): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Phone number is required.";
  if (/[a-zA-Z]/.test(trimmed)) return "Phone number cannot contain letters.";

  const regionError = validateRegion(region);
  if (regionError) return "Select your nationality region before entering a phone number.";

  const digits = phoneDigits(trimmed);
  const config = getRegionOption(region);
  if (!config) return "Select a valid nationality region.";

  if (digits.length < config.minDigits || digits.length > config.maxDigits) {
    return `Enter a valid ${config.label} phone number (${config.minDigits}–${config.maxDigits} digits).`;
  }

  if (region === "north-america") {
    const national =
      digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
    if (national.length !== 10) {
      return "North American numbers need 10 digits, optionally prefixed with country code 1.";
    }
  }

  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address (e.g. name@company.com).";
  }
  return undefined;
}

export function validateSignupStep2(values: SignupStep2Values): SignupStep2Errors {
  const errors: SignupStep2Errors = {};

  const sponsorError = validateUsername(values.sponsor, "Sponsor username");
  if (sponsorError) errors.sponsor = sponsorError;

  const usernameError = validateUsername(values.username);
  if (usernameError) errors.username = usernameError;

  const fullNameError = validateFullName(values.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const regionError = validateRegion(values.region);
  if (regionError) errors.region = regionError;

  const phoneError = validatePhone(values.phone, values.region);
  if (phoneError) errors.phone = phoneError;

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  return errors;
}

export function phonePlaceholderForRegion(region: SignupRegion | ""): string {
  return getRegionOption(region)?.phonePlaceholder ?? "+00 0000 0000";
}
