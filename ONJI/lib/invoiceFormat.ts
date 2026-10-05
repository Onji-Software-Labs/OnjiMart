
// GENERATED / PENDING / APPROVED all show as "Approved"
export const displayStatus = (s?: string) => {
  const v = (s ?? "").toUpperCase();
  if (["GENERATED", "PENDING", "APPROVED"].includes(v)) return "Approved";
  return v ? v.charAt(0) + v.slice(1).toLowerCase() : "—";
};

type DateInput = string | Date | null | undefined;

const toDate = (d: DateInput): Date | null => {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  return isNaN(date.getTime()) ? null : date;
};

// "Oct 24, 2023"
export const fmtDate = (d?: DateInput) => {
  const date = toDate(d);
  return date
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "N/A";
};

// "09:45 AM"
export const fmtTime = (d?: DateInput) => {
  const date = toDate(d);
  return date
    ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";
};

// "#HL-99284" style: uses orderId when the backend sends it, else the invoice id
export const refId = (inv: any) =>
  `#${String(inv.orderId ?? inv.id).slice(0, 8).toUpperCase()}`;

export const formatINR = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
