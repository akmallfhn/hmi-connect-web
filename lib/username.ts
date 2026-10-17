// A period may only sit between characters; underscores are allowed anywhere.
export const USERNAME_PATTERN = "[A-Za-z0-9_](?:[A-Za-z0-9._]*[A-Za-z0-9_])?";

export const USERNAME_ERROR =
  "Username hanya boleh berisi huruf, angka, titik (.), atau garis bawah (_), dan tidak boleh diawali atau diakhiri titik. Spasi dan tanda hubung (-) tidak diperbolehkan.";

export function isUsernameFormatValid(username: string) {
  return (
    username.trim() !== "" &&
    new RegExp(`^(?:${USERNAME_PATTERN})$`, "u").test(username)
  );
}
