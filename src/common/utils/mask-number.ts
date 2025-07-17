export const maskNumber = (pan: string) => {
  const visibleDigits = 4; // Number of digits to keep visible

  // Remove any non-digit characters from the PAN
  const digitsOnly = pan.replace(/\D/g, '');

  // Determine the number of digits to mask
  const maskDigits = Math.max(0, digitsOnly.length - visibleDigits - 4);

  // Create the masked PAN
  const maskedDigits = '*'.repeat(maskDigits);
  const visiblePart = digitsOnly.slice(0, visibleDigits);
  const lastFourDigits = digitsOnly.slice(-4);

  return visiblePart + maskedDigits + lastFourDigits;
};
