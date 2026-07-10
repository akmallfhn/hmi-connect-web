export const USERNAME_PATTERN = "[A-Za-z0-9._]+";

export const USERNAME_ERROR =
  "Username hanya boleh berisi huruf, angka, titik (.), atau garis bawah (_). Spasi dan tanda hubung (-) tidak diperbolehkan.";

export function isUsernameFormatValid(username: string) {
  return (
    username.trim() !== "" &&
    new RegExp(`^(?:${USERNAME_PATTERN})$`, "u").test(username)
  );
}
