export const formatDate = (date: Date): string => {
  const d = new Date(date);

  const day = d.getDate();              // no padStart
  const month = d.getMonth() + 1;       // no padStart
  const year = String(d.getFullYear()).slice(-2); // last 2 digits

  return `${day}-${month}-${year}`;
};

export const getTodayDDMMYYYY = (): string => {
  const now = new Date();

  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);

  const day = istDate.getDate();
  const month = istDate.getMonth() + 1;
  const year = String(istDate.getFullYear()).slice(-2);

  return `${day}-${month}-${year}`; // e.g. 4-5-26
};

export const getCurrentTimeZoneIST = (): "M" | "E" => {
  const now = new Date();

  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);

  const hours = istDate.getHours();

  return hours < 12 ? "M" : "E";
};