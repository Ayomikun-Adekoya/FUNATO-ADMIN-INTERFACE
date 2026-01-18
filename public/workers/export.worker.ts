// Web Worker for export processing
// Handles CPU-intensive export operations off the main thread

interface ExportMessage {
    id: string;
    type: 'csv' | 'excel' | 'pdf';
    data: any[];
    columns: Array<{ key: string; header: string }>;
}

// CSV Export
function generateCSV(data: any[], columns: Array<{ key: string; header: string }>): Blob {
    const headers = columns.map((c) => c.header).join(',');
    const rows = data
        .map((row) =>
            columns
                .map((c) => {
                    const value = String(row[c.key] || '');
                    // Escape quotes and wrap in quotes if contains comma/quote/newline
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

// Excel Export (HTML format that Excel understands)
function generateExcel(data: any[], columns: Array<{ key: string; header: string }>): Blob {
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

// PDF Export (simple table-based)
async function generatePDF(data: any[], columns: Array<{ key: string; header: string }>): Promise<Blob> {
    try {
        // Dynamic import inside worker
        const jsPDFModule = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        const autoTableModule = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');

        const { jsPDF } = jsPDFModule;

        const doc = new jsPDF({ orientation: 'landscape' });
        const head = [columns.map((c) => c.header)];
        const body = data.map((row) => columns.map((c) => String(row[c.key] || '')));

        // @ts-ignore
        doc.autoTable({
            head,
            body,
            startY: 14,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [68, 114, 196], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [242, 242, 242] },
            margin: { top: 10 },
        });

        return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
    } catch (error) {
        console.error('PDF generation error:', error);
        // Fallback to simple text representation
        const text = data
            .map((row) => columns.map((c) => row[c.key] || '').join('\t'))
            .join('\n');
        return new Blob([text], { type: 'text/plain' });
    }
}

function escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Main message handler
self.onmessage = async (event: MessageEvent<ExportMessage>) => {
    const { id, type, data, columns } = event.data;

    try {
        let blob: Blob;

        switch (type) {
            case 'csv':
                blob = generateCSV(data, columns);
                break;
            case 'excel':
                blob = generateExcel(data, columns);
                break;
            case 'pdf':
                blob = await generatePDF(data, columns);
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
