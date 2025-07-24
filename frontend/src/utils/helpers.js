// Returns a number as a string with 2 decimals, or "0.00" if invalid
export function validatedNum(value) {
  return parseFloat(Number(value) ? value : 0).toFixed(2);
}
