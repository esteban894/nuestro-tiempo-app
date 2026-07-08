const HEX_CHARS = "0123456789ABCDEF";

/** Longitud del código de invitación de pareja (coincide con `CoupleInvite` de la API). */
export const INVITE_CODE_LENGTH = 8;

/** Expresión regular para validar un código de 8 dígitos hexadecimales. */
export const INVITE_CODE_REGEX = /^[0-9A-F]{8}$/i;

/**
 * Genera un código de invitación de 8 dígitos hexadecimales en mayúsculas.
 * Simula (mock) el `CoupleInvite.code` que devolvería la API.
 */
export const generateInviteCode = (): string => {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
  }
  return code;
};
