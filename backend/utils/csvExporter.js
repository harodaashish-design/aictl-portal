function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/\r?\n|\r/g, ' ');
  if (/[",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers, rows) {
  const headerLine = headers.map((h) => csvEscape(h.label)).join(',');
  const dataLines = rows.map((row) =>
    headers.map((h) => csvEscape(typeof h.accessor === 'function' ? h.accessor(row) : row[h.accessor])).join(',')
  );
  return [headerLine, ...dataLines].join('\r\n');
}

module.exports = { toCsv };
