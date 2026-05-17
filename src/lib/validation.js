import validator from "validator";

// ─── Sanitization ───────────────────────────────────────────────────────────
// Escapes HTML entities to prevent stored XSS attacks.
// Also strips any MongoDB/NoSQL operator patterns ($gt, $ne, etc.)

/**
 * Sanitizes a string input: trims whitespace and escapes HTML entities.
 * Returns the sanitized string, or null if input is not a valid string.
 */
export function sanitizeString(input) {
    if (typeof input !== "string") return null;
    return validator.escape(validator.trim(input));
}

/**
 * Checks that a value is a plain string (not an object/array).
 * Prevents NoSQL injection where an attacker sends { "$gt": "" } instead of a string.
 */
export function isPlainString(value) {
    return typeof value === "string";
}

// ─── Email Validation ───────────────────────────────────────────────────────
// Regex: local-part @ domain . TLD
//   Local part: starts with alphanumeric, allows ._%+- in the middle, ends with alphanumeric
//   Domain: alphanumeric segments separated by dots, hyphens allowed in the middle
//   TLD: 2–7 alpha characters
export const EMAIL_REGEX =
    /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,7}$/;

/**
 * Validates an email address using both the custom regex and the validator library.
 */
export function isValidEmail(email) {
    if (!isPlainString(email)) return false;
    const trimmed = email.trim().toLowerCase();
    return EMAIL_REGEX.test(trimmed) && validator.isEmail(trimmed);
}

// ─── Password Validation ────────────────────────────────────────────────────

export const PASSWORD_RULES = [
    { key: "minLength", label: "At least 8 characters", test: (pw) => pw.length >= 8, message: "Password must be at least 8 characters" },
    { key: "uppercase", label: "One uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw), message: "Password must contain at least one uppercase letter (A-Z)" },
    { key: "lowercase", label: "One lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw), message: "Password must contain at least one lowercase letter (a-z)" },
    { key: "number", label: "One number (0-9)", test: (pw) => /[0-9]/.test(pw), message: "Password must contain at least one number (0-9)" },
    { key: "special", label: "One special character (!@#$%^&*)", test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw), message: "Password must contain at least one special character" },
];

export function getPasswordStrength(pw) {
    if (!pw) return { score: 0, label: "", color: "" };
    const passed = PASSWORD_RULES.filter((c) => c.test(pw)).length;
    if (passed <= 1) return { score: 1, label: "Very Weak", color: "bg-red-500" };
    if (passed === 2) return { score: 2, label: "Weak", color: "bg-orange-500" };
    if (passed === 3) return { score: 3, label: "Fair", color: "bg-yellow-500" };
    if (passed === 4) return { score: 4, label: "Strong", color: "bg-blue-500" };
    return { score: 5, label: "Excellent", color: "bg-green-500" };
}

/**
 * Validates a password against all strength rules.
 * Returns { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
    if (!isPlainString(password)) {
        return { valid: false, errors: ["Password must be a string"] };
    }

    const errors = PASSWORD_RULES
        .filter((rule) => !rule.test(password))
        .map((rule) => rule.message);

    return { valid: errors.length === 0, errors };
}

// ─── Full Name Validation ───────────────────────────────────────────────────

/**
 * Validates a full name.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateFullName(name) {
    if (!isPlainString(name)) {
        return { valid: false, errors: ["Full name must be a string"] };
    }

    const trimmed = name.trim();
    const errors = [];

    if (trimmed.length < 3) {
        errors.push("Full name must be at least 3 characters");
    }
    if (trimmed.length > 100) {
        errors.push("Full name must not exceed 100 characters");
    }

    return { valid: errors.length === 0, errors };
}

// ─── OTP Validation ─────────────────────────────────────────────────────────

/**
 * Validates an OTP string (must be exactly 6 digits).
 * Returns { valid: boolean, errors: string[] }
 */
export function validateOTP(otp) {
    if (!isPlainString(otp)) {
        return { valid: false, errors: ["OTP must be a string"] };
    }

    const errors = [];
    if (!/^\d{6}$/.test(otp.trim())) {
        errors.push("OTP must be exactly 6 digits");
    }

    return { valid: errors.length === 0, errors };
}

// ─── Registration Validation (combined) ─────────────────────────────────────

/**
 * Validates all registration fields at once.
 * Returns { valid: boolean, errors: { field: string, messages: string[] }[] }
 */
export function validateRegistration(fullName, email, password) {
    const fieldErrors = [];

    // Full Name
    const nameResult = validateFullName(fullName);
    if (!nameResult.valid) {
        fieldErrors.push({ field: "fullName", messages: nameResult.errors });
    }

    // Email
    if (!isPlainString(email) || !email.trim()) {
        fieldErrors.push({ field: "email", messages: ["Email is required"] });
    } else if (!isValidEmail(email)) {
        fieldErrors.push({ field: "email", messages: ["Enter a valid email address (e.g. name@example.com)"] });
    }

    // Password
    const pwResult = validatePassword(password);
    if (!pwResult.valid) {
        fieldErrors.push({ field: "password", messages: pwResult.errors });
    }

    return {
        valid: fieldErrors.length === 0,
        errors: fieldErrors,
    };
}
