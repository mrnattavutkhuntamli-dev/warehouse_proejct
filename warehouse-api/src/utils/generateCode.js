/**
 * Generate running number codes like PO-20240101-001
 */
export const generateCode = (prefix, date = new Date()) => {
  const d = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${d}-${rand}`;
};
