declare module 'react-pdf' {
    import { ComponentType, ReactElement } from 'react';

    export interface DocumentProps {
        file: string | ArrayBuffer | Blob | { data: ArrayBuffer } | { url: string };
        onLoadSuccess?: (pdf: { numPages: number }) => void;
        onLoadError?: (error: Error) => void;
        loading?: ReactElement | string;
        error?: ReactElement | string;
        children?: React.ReactNode;
    }

    export interface PageProps {
        pageNumber: number;
        width?: number;
        height?: number;
        scale?: number;
        renderTextLayer?: boolean;
        renderAnnotationLayer?: boolean;
        className?: string;
    }

    export const Document: ComponentType<DocumentProps>;
    export const Page: ComponentType<PageProps>;
    export const pdfjs: {
        GlobalWorkerOptions: {
            workerSrc: string;
        };
    };
}
