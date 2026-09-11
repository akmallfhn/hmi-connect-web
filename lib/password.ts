// Mirrors the backend's own bounds — 72 is bcrypt's input ceiling, which silently truncates beyond it.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

export type NewPasswordErrors = {
  password?: string;
  confirmation?: string;
};

// Every flow that sets a new password asks for it twice, so the rule lives in one place.
export function validateNewPassword(
  password: string,
  confirmation: string
): NewPasswordErrors {
  const errors: NewPasswordErrors = {};

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`;
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Password maksimal ${PASSWORD_MAX_LENGTH} karakter.`;
  }

  if (!confirmation) {
    errors.confirmation = "Konfirmasi password wajib diisi.";
  } else if (confirmation !== password) {
    errors.confirmation = "Konfirmasi password tidak sama.";
  }

  return errors;
}

export function hasPasswordErrors(errors: NewPasswordErrors) {
  return Boolean(errors.password || errors.confirmation);
}
