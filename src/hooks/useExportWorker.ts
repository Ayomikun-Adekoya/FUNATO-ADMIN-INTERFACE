import { useEffect, useRef, useCallback } from 'react';

interface ExportOptions {
    type: 'csv' | 'excel' | 'pdf';
    data: any[];
    columns: Array<{ key: string; header: string }>;
    onProgress?: (message: string) => void;
    onSuccess?: (blob: Blob, format: string) => void;
    onError?: (error: string) => void;
}

/**
 * Hook to handle export processing in a Web Worker
 * Offloads CPU-intensive work to prevent UI freezing
 * Works entirely client-side with no backend support
 */
export const useExportWorker = () => {
    const workerRef = useRef<Worker | null>(null);
    const requestMapRef = useRef<Map<string, { resolve: (blob: Blob) => void; reject: (error: string) => void }>>(
        new Map()
    );
    const workerSupportedRef = useRef(true);

    // Initialize worker
    useEffect(() => {
        // Check if worker is supported
        if (typeof window === 'undefined' || !window.Worker) {
            console.warn('Web Workers not supported, export will run on main thread');
            workerSupportedRef.current = false;
            return;
        }

        try {
            // Use public worker file path
            workerRef.current = new Worker('/workers/export.worker.js');

            // Handle messages from worker
            workerRef.current.onmessage = (event) => {
                const { id, type, blob, error } = event.data;
                const request = requestMapRef.current.get(id);

                if (!request) return;

                if (type === 'success') {
                    request.resolve(blob);
                } else if (type === 'error') {
                    request.reject(error);
                }

                requestMapRef.current.delete(id);
            };

            workerRef.current.onerror = (error) => {
                console.error('Worker error:', error);
                workerSupportedRef.current = false;
                // Clear all pending requests on worker error
                requestMapRef.current.forEach(({ reject }) => {
                    reject('Worker thread error');
                });
                requestMapRef.current.clear();
            };
        } catch (error) {
            console.warn('Failed to create worker:', error);
            workerSupportedRef.current = false;
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const export_ = useCallback(
        async (options: ExportOptions): Promise<Blob> => {
            const { type, data, columns, onProgress, onError } = options;

            if (onProgress) {
                onProgress(`Processing ${data.length} records for ${type.toUpperCase()} export...`);
            }

            return new Promise((resolve, reject) => {
                if (!workerSupportedRef.current || !workerRef.current) {
                    // Fallback: no worker support, process on main thread
                    console.warn('Worker not available, processing on main thread');
                    try {
                        let blob: Blob;
                        switch (type) {
                            case 'csv': {
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
                                blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                                break;
                            }
                            case 'excel': {
                                const headerRow = `<tr>${columns.map((c) => `<th>${c.header}</th>`).join('')}</tr>`;
                                const bodyRows = data
                                    .map((r) => `<tr>${columns.map((c) => `<td>${r[c.key] || ''}</td>`).join('')}</tr>`)
                                    .join('');
                                const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><table>${headerRow}${bodyRows}</table></body></html>`;
                                blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                                break;
                            }
                            default:
                                throw new Error(`Unknown export type: ${type}`);
                        }
                        resolve(blob);
                    } catch (error) {
                        const errorMsg = error instanceof Error ? error.message : String(error);
                        onError?.(errorMsg);
                        reject(errorMsg);
                    }
                    return;
                }

                const requestId = `${Date.now()}-${Math.random()}`;

                // Store resolve/reject for this request
                requestMapRef.current.set(requestId, {
                    resolve,
                    reject: (error: string) => {
                        onError?.(error);
                        reject(error);
                    },
                });

                // Send to worker
                workerRef.current?.postMessage({
                    id: requestId,
                    type,
                    data,
                    columns,
                });

                // Timeout safety
                setTimeout(() => {
                    if (requestMapRef.current.has(requestId)) {
                        const request = requestMapRef.current.get(requestId);
                        request?.reject('Export processing timeout');
                        requestMapRef.current.delete(requestId);
                    }
                }, 300000); // 5 minute timeout
            });
        },
        []
    );

    return { export: export_ };
};
