/**
 * Valida si un string es un ObjectId válido de MongoDB
 * @param id - String a validar
 * @returns true si es un ObjectId válido (24 caracteres hexadecimales)
 */
export function isValidMongoId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
