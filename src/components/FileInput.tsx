import React, { useRef, useState, DragEvent } from 'react';

interface FileInputProps {
    accept?: string;
    multiple?: boolean;
    file?: File | null;
    onChange: (file: File | null) => void;
    placeholder?: string;
    showPreview?: boolean;
    previewUrl?: string | null;
}

export default function FileInput({ accept, multiple = false, file = null, onChange, placeholder = 'Choose file', showPreview = false, previewUrl = null }: FileInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleButtonClick = (e?: React.MouseEvent<HTMLElement>) => {
        // prevent parent click handler from firing twice
        e?.stopPropagation();
        inputRef.current?.click();
    };

    const handleFile = (f: File | null) => {
        onChange(f);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        handleFile(f);
    };

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0] || null;
        if (f) handleFile(f as File);
    };

    return (
        <div>
            <div
                onClick={handleButtonClick}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex items-center justify-between gap-3 p-3 border rounded-lg cursor-pointer transition ${dragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 bg-white dark:bg-gray-800'} `}
            >
                <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{file ? file.name : (previewUrl ? 'Current image' : placeholder)}</div>
                        <div className="text-xs text-gray-500">{file ? `${(file.size / 1024).toFixed(1)} KB` : (previewUrl ? 'Existing image' : 'Click or drag file here')}</div>
                    </div>
                </div>
                <button type="button" onClick={(e) => handleButtonClick(e)} className="btn-secondary">Browse</button>
                <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={onInputChange} className="hidden" />
            </div>

            {showPreview && (
                <div className="mt-3">
                    {file && file.type.startsWith('image/') && (
                        <img src={URL.createObjectURL(file)} alt="preview" className="max-h-48 object-contain rounded-md border" />
                    )}
                    {!file && previewUrl && (
                        <img src={previewUrl} alt="preview" className="max-h-48 object-contain rounded-md border" />
                    )}
                </div>
            )}
        </div>
    );
}
