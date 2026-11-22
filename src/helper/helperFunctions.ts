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

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export interface ISTShiftInfo {
  shift: "M" | "E";
  shiftStartUtc: Date;
  shiftEndUtc: Date;
  istDateString: string;
  isMorning: boolean;
}

export const getISTShiftInfo = (referenceDate: Date = new Date()): ISTShiftInfo => {
  const istTime = new Date(referenceDate.getTime() + IST_OFFSET_MS);

  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const date = istTime.getUTCDate();
  const hour = istTime.getUTCHours();

  const isMorning = hour < 12;
  const shift: "M" | "E" = isMorning ? "M" : "E";

  const startHourIST = isMorning ? 0 : 12;
  const endHourIST = isMorning ? 12 : 24;

  const shiftStartUtc = new Date(Date.UTC(year, month, date, startHourIST, 0, 0, 0) - IST_OFFSET_MS);
  const shiftEndUtc = new Date(Date.UTC(year, month, date, endHourIST, 0, 0, 0) - IST_OFFSET_MS);

  const mm = String(month + 1).padStart(2, "0");
  const dd = String(date).padStart(2, "0");
  const istDateString = `${year}-${mm}-${dd}`;

  return {
    shift,
    shiftStartUtc,
    shiftEndUtc,
    istDateString,
    isMorning,
  };
};

export const getISTMorningBoundaries = (referenceDate: Date = new Date()): { shiftStartUtc: Date; shiftEndUtc: Date } => {
  const istTime = new Date(referenceDate.getTime() + IST_OFFSET_MS);
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const date = istTime.getUTCDate();

  const shiftStartUtc = new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - IST_OFFSET_MS);
  const shiftEndUtc = new Date(Date.UTC(year, month, date, 12, 0, 0, 0) - IST_OFFSET_MS);

  return { shiftStartUtc, shiftEndUtc };
};

export const getISTEveningBoundaries = (referenceDate: Date = new Date()): { shiftStartUtc: Date; shiftEndUtc: Date } => {
  const istTime = new Date(referenceDate.getTime() + IST_OFFSET_MS);
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const date = istTime.getUTCDate();

  const shiftStartUtc = new Date(Date.UTC(year, month, date, 12, 0, 0, 0) - IST_OFFSET_MS);
  const shiftEndUtc = new Date(Date.UTC(year, month, date, 24, 0, 0, 0) - IST_OFFSET_MS);

  return { shiftStartUtc, shiftEndUtc };
};

export const getISTDayBoundaries = (referenceDate: Date = new Date()): { dayStartUtc: Date; dayEndUtc: Date } => {
  const istTime = new Date(referenceDate.getTime() + IST_OFFSET_MS);
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const date = istTime.getUTCDate();

  const dayStartUtc = new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - IST_OFFSET_MS);
  const dayEndUtc = new Date(Date.UTC(year, month, date, 24, 0, 0, 0) - IST_OFFSET_MS - 1); // 23:59:59.999 IST

  return { dayStartUtc, dayEndUtc };
};

export const getCurrentTimeZoneIST = (): "M" | "E" => {
  const now = new Date();
  const istDate = new Date(now.getTime() + IST_OFFSET_MS);
  const hours = istDate.getUTCHours();

  return hours < 12 ? "M" : "E";
};