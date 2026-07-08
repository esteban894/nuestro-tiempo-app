/** Longitud del código de invitación de pareja (coincide con `CoupleInvite` de la API). */
export const INVITE_CODE_LENGTH = 8;

/** Expresión regular para validar un código de 8 dígitos hexadecimales. */
export const INVITE_CODE_REGEX = /^[0-9A-F]{8}$/i;
