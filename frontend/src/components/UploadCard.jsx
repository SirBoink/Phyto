import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] };

/**
 * Large upload zone with gradient border, leaf icon,
 * glow on drag-hover, preview, and progress bar.
 */
export default function UploadCard({ file, preview, onFileSelect, progress, loading }) {
    const onDrop = useCallback(
        (accepted, rejected) => {
            if (rejected.length > 0) {
                const err = rejected[0].errors[0];
                alert(err.code === "file-too-large" ? "File must be under 5 MB." : "Only .jpg and .png files are allowed.");
                return;
            }
            if (accepted.length > 0) onFileSelect(accepted[0]);
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED,
        maxSize: MAX_SIZE,
        multiple: false,
        disabled: loading,
    });

    return (
        <div
            {...getRootProps()}
            role="button"
            aria-label="Upload leaf image"
            className={`
                relative rounded-2xl min-h-[400px] flex items-center justify-center cursor-pointer
                transition-all duration-300 gradient-border upload-glow
                ${isDragActive ? "drag-active bg-sage/5" : "hover:bg-glass-hover"}
                ${loading ? "opacity-50 pointer-events-none" : ""}
            `}
        >
            <input {...getInputProps()} />

            {preview ? (
                /* ── Preview state ──────────────────────── */
                <div className="flex flex-col items-center gap-5 p-8">
                    <img
                        src={preview}
                        alt="Leaf preview"
                        className="w-56 h-56 object-cover rounded-2xl shadow-xl shadow-black/30 ring-1 ring-glass-border"
                    />
                    <p className="text-cream-muted text-sm">
                        Drop or click to replace &middot; {file?.name}
                    </p>
                </div>
            ) : (
                /* ── Empty state ────────────────────────── */
                <div className="flex flex-col items-center gap-5 p-8">
                    {/* Large thin-line leaf / scanner icon */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300
                        ${isDragActive ? "bg-sage/15" : "bg-glass"}`}
                    >
                        <svg className={`w-10 h-10 transition-colors duration-300 ${isDragActive ? "text-sage" : "text-cream-dim"}`}
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                            {/* Leaf shape */}
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M17 8C17 8 15 2 9 2C3 2 2 8 2 12c0 4 2 8 7 10 0-3 .5-6 2-8.5S17 8 17 8z" />
                            {/* Leaf vein */}
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M9 22c0-5 1-8 3-11" />
                            {/* Scanner lines */}
                            <path strokeLinecap="round" d="M20 6h2M20 10h2M20 14h2" strokeWidth="1.5" />
                        </svg>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="font-serif text-xl text-cream">
                            {isDragActive ? "Release to analyze" : "Drop your leaf specimen"}
                        </p>
                        <p className="text-cream-dim text-sm">
                            or <span className="text-sage underline underline-offset-2">browse files</span> &middot; JPG / PNG &middot; Max 5 MB
                        </p>
                    </div>
                </div>
            )}

            {/* Upload progress bar */}
            {loading && progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-forest-light rounded-b-2xl overflow-hidden">
                    <div className="h-full bg-sage transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>
    );
}
