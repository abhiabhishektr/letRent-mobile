export const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
export const validatePhone = (phone: string) =>
  /^\+?[0-9\s-]{8,15}$/.test(phone.trim());
export const validatePassword = (password: string) => password.length >= 6;
