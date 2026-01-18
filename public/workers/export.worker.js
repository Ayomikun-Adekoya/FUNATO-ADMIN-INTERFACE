// Web Worker for export processing - JavaScript version
// Handles CPU-intensive export operations off the main thread

// CSV Export
function generateCSV(data, columns) {
    const headers = columns.map((c) => c.header).join(',');
    const rows = data
        .map((row) =>
            columns
                .map((c) => {
                    const value = String(row[c.key] || '');
                    const escaped = value.replace(/"/g, '""');
                    return value.includes(',') || value.includes('"') || value.includes('\n')
                        ? `"${escaped}"`
                        : value;
                })
                .join(',')
        )
        .join('\n');

    const content = `${headers}\n${rows}`;
    return new Blob([content], { type: 'text/csv;charset=utf-8;' });
}

// Excel Export (HTML format)
function generateExcel(data, columns) {
    const headerRow = `<tr>${columns.map((c) => `<th style="background-color:#4472C4;color:white;padding:8px;border:1px solid #000;font-weight:bold;">${escapeHtml(c.header)}</th>`).join('')}</tr>`;

    const bodyRows = data
        .map((row, rowIndex) => {
            const bgColor = rowIndex % 2 === 0 ? '#ffffff' : '#f2f2f2';
            return `<tr style="background-color:${bgColor};"><td style="padding:8px;border:1px solid #000;">${columns
                .map((c) => `${escapeHtml(String(row[c.key] || ''))}`)
                .join('</td><td style="padding:8px;border:1px solid #000;">')}</td></tr>`;
        })
        .join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11pt; }
                th { background-color: #4472C4; color: white; padding: 8px; border: 1px solid #000; font-weight: bold; text-align: left; }
                td { padding: 8px; border: 1px solid #000; }
                tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <table>
                ${headerRow}
                ${bodyRows}
            </table>
        </body>
        </html>
    `;

    return new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
}

// Simple PDF (CSV format in text/plain for fallback)
function generatePDF(data, columns) {
    // Note: PDF generation requires libraries which may not be available in worker
    // Fallback to formatted text/CSV
    const headers = columns.map((c) => c.header).join('\t');
    const rows = data
        .map((row) => columns.map((c) => row[c.key] || '').join('\t'))
        .join('\n');

    const content = `${headers}\n${rows}`;
    return new Blob([content], { type: 'text/plain;charset=utf-8;' });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Main message handler
self.onmessage = function (event) {
    const { id, type, data, columns } = event.data;

    try {
        let blob;

        switch (type) {
            case 'csv':
                blob = generateCSV(data, columns);
                break;
            case 'excel':
                blob = generateExcel(data, columns);
                break;
            case 'pdf':
                blob = generatePDF(data, columns);
                break;
            default:
                throw new Error(`Unknown export type: ${type}`);
        }

        // Send blob back to main thread
        self.postMessage({
            id,
            type: 'success',
            blob,
        });
    } catch (error) {
        // Send error back to main thread
        self.postMessage({
            id,
            type: 'error',
            error: error instanceof Error ? error.message : String(error),
        });
    }
};
