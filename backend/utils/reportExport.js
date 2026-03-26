const escapeCsvCell = (value) => {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const buildCsvReport = (report) => {
  const lines = [
    "WasteZero Admin Report",
    `Range,${escapeCsvCell(report.range.startDate)},${escapeCsvCell(report.range.endDate)}`,
    "",
    "Summary Metric,Value",
    ...Object.entries(report.summary).map(
      ([key, value]) => `${escapeCsvCell(key)},${escapeCsvCell(value)}`,
    ),
    "",
    "User Growth",
    "Date,Count",
    ...report.userGrowth.map((item) => `${item.date},${item.count}`),
    "",
    "Opportunity Trends",
    "Date,Count",
    ...report.opportunityTrends.map((item) => `${item.date},${item.count}`),
    "",
    "Volunteer Participation",
    "Metric,Value",
    ...report.volunteerParticipation.map(
      (item) => `${escapeCsvCell(item.label)},${escapeCsvCell(item.value)}`,
    ),
  ];

  return lines.join("\n");
};

const escapePdfText = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

export const buildPdfReport = (report) => {
  const lines = [
    "WasteZero Admin Report",
    `Range: ${report.range.startDate} to ${report.range.endDate}`,
    "",
    "Summary",
    ...Object.entries(report.summary).map(([key, value]) => `${key}: ${value}`),
    "",
    "User Growth",
    ...report.userGrowth.slice(0, 12).map((item) => `${item.date}: ${item.count}`),
    "",
    "Opportunity Trends",
    ...report.opportunityTrends
      .slice(0, 12)
      .map((item) => `${item.date}: ${item.count}`),
  ].slice(0, 40);

  const textStream = [
    "BT",
    "/F1 12 Tf",
    "50 780 Td",
    ...lines.flatMap((line, index) =>
      index === 0
        ? [`(${escapePdfText(line)}) Tj`]
        : ["0 -16 Td", `(${escapePdfText(line)}) Tj`],
    ),
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${textStream.length} >>\nstream\n${textStream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((objectText) => {
    offsets.push(pdf.length);
    pdf += objectText;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf-8");
};
