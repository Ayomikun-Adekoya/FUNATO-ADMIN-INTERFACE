import { useState, useEffect } from 'react';
import '@/utils/pdfConfig'; // ✅ Load PDF worker config
import dynamic from 'next/dynamic';

// Dynamically import React-PDF components (required for Next.js)
const Document = dynamic(() => import('react-pdf').then((m) => m.Document), {
  ssr: false,
});
const Page = dynamic(() => import('react-pdf').then((m) => m.Page), {
  ssr: false,
});

interface PDFViewerProps {
  file: string | Blob;
  fileName?: string;
}

export default function PDFViewer({ file, fileName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    console.error('PDF load error:', err);
    setError('Failed to load PDF.');
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        
        {fileName && (
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {fileName}
            </h3>
          </div>
        )}

        {error ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-red-500 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="mt-4 text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                className="shadow-lg rounded-lg overflow-hidden"
              />
            </Document>

            {numPages && numPages > 1 && (
              <div className="mt-6 flex items-center gap-4 bg-gray-50 dark:bg-gray-900/30 px-6 py-3 rounded-lg">
                <button
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                  className="btn-secondary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px] text-center">
                  Page {pageNumber} of {numPages}
                </p>

                <button
                  onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                  disabled={pageNumber >= numPages}
                  className="btn-secondary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
