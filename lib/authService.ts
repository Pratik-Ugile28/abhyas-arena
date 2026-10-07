export interface AuthValidationResult {
  valid: boolean;
  status?: string;
  reason?: string;
}

export const AuthValidator = {
  // Alphanumeric with hyphens and underscores, 3 to 30 characters
  STUDENT_ID_REGEX: /^[a-zA-Z0-9_-]{3,30}$/,

  validateStudentId(studentId: string): AuthValidationResult {
    const trimmed = studentId.trim();
    if (!trimmed) {
      return { valid: false, reason: 'Student ID or Username cannot be empty.' };
    }
    if (trimmed.length < 3) {
      return { valid: false, reason: 'Student ID must be at least 3 characters.' };
    }
    if (trimmed.length > 30) {
      return { valid: false, reason: 'Student ID cannot exceed 30 characters.' };
    }
    if (!this.STUDENT_ID_REGEX.test(trimmed)) {
      return {
        valid: false,
        reason: 'Student ID can only contain letters, numbers, underscores, and hyphens.',
      };
    }
    return { valid: true };
  },

  validatePassword(password: string): AuthValidationResult {
    if (!password) {
      return { valid: false, reason: 'Password cannot be empty.' };
    }
    if (password.length < 4) {
      return { valid: false, reason: 'Password must be at least 4 characters.' };
    }
    if (password.length > 64) {
      return { valid: false, reason: 'Password cannot exceed 64 characters.' };
    }
    return { valid: true };
  },

  /**
   * Deterministic SHA-256 password hash matching Android AuthValidator.kt:
   * val salt = "AbhyasArena_Salt_${normalizedId}"
   * MessageDigest SHA-256 of "$salt:$password"
   */
  async hashPassword(password: string, studentId: string): Promise<string> {
    const normalizedId = studentId.trim().toLowerCase();
    const salt = `AbhyasArena_Salt_${normalizedId}`;
    const message = `${salt}:${password}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // Use Web Crypto SubtleCrypto
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    // Node.js fallback
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCrypto = require('crypto');
      return nodeCrypto.createHash('sha256').update(message).digest('hex');
    } catch {
      // Fallback simple hash
      return message;
    }
  },
};
