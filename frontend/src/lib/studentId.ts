export const STUDENT_ID_LENGTH = 9;
export const STUDENT_ID_PATTERN = /^\d{9}$/;
export const STUDENT_ID_ERROR_MESSAGE = "University ID must be exactly 9 digits.";
export const STUDENT_ID_PLACEHOLDER = "020232255";

export function normalizeStudentId(value: string) {
  return value.replace(/\D/g, "").slice(0, STUDENT_ID_LENGTH);
}

export function isValidStudentId(value: string) {
  return STUDENT_ID_PATTERN.test(value);
}
