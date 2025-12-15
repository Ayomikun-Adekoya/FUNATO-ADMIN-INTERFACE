pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

import { pdfjs } from 'react-pdf';

// Only set workerSrc in the browser
if (typeof window !== 'undefined' && pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
}
