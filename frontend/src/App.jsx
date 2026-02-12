import { useState, useCallback } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import UploadCard from "./components/UploadCard";
import ModelSelector from "./components/ModelSelector";
import ResultsPanel from "./components/ResultsPanel";
import { usePrediction } from "./hooks/usePrediction";

export default function App() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [modelKey, setModelKey] = useState("general");

    const { result, loading, progress, error, predict, reset } = usePrediction();

    // Determines whether we show the results view or upload view
    const showResults = result || loading || error;

    const handleFileSelect = useCallback((selectedFile) => {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        reset();
    }, [reset]);

    const handlePredict = () => {
        if (!file) return;
        predict(file, modelKey);
    };

    const handleScanAnother = () => {
        setFile(null);
        setPreview(null);
        reset();
    };

    return (
        <div className="min-h-screen flex flex-col bg-organic relative">
            <div className="relative z-10 flex flex-col min-h-screen">

                {/* ── Header ──────────────────────────────── */}
                <header className="py-6 px-6">
                    <button
                        onClick={handleScanAnother}
                        className="font-serif text-3xl font-semibold text-cream tracking-tight hover:text-sage transition-colors"
                    >
                        Phyto
                    </button>
                </header>

                {/* ── Hero (hidden during results) ─────────── */}
                {!showResults && (
                    <section className="text-center pt-6 pb-10 px-6">
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-semibold text-cream leading-tight tracking-tight">
                            Precision Botany<br />
                            <span className="text-sage italic">at Your Fingertips</span>
                        </h1>
                        <p className="mt-4 text-cream-muted max-w-xl mx-auto text-base">
                            Upload a leaf. Our AI identifies the disease, estimates severity, and prescribes a remedy — in seconds.
                        </p>
                    </section>
                )}

                {/* ── Main Glass Card ──────────────────────── */}
                <main className="flex-1 max-w-4xl w-full mx-auto px-4 pb-12">
                    <div className="glass rounded-3xl p-6 sm:p-8">
                        <ErrorBoundary>
                            {showResults ? (
                                /* ── Results View ──────────── */
                                <>
                                    <ResultsPanel
                                        result={result}
                                        loading={loading}
                                        error={error}
                                        onRetry={handlePredict}
                                        preview={preview}
                                    />
                                    {!loading && (
                                        <div className="mt-8 flex justify-center">
                                            <button
                                                onClick={handleScanAnother}
                                                className="px-6 py-3 rounded-2xl border border-glass-border text-cream
                                                           hover:bg-glass-hover transition-all text-sm font-medium tracking-wide"
                                            >
                                                Scan Another Leaf
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* ── Upload View ───────────── */
                                <>
                                    <UploadCard
                                        file={file}
                                        preview={preview}
                                        onFileSelect={handleFileSelect}
                                        progress={progress}
                                        loading={loading}
                                    />

                                    {/* Control Bar */}
                                    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-stretch">
                                        <div className="flex-1">
                                            <ModelSelector value={modelKey} onChange={setModelKey} disabled={loading} />
                                        </div>
                                        <button
                                            onClick={handlePredict}
                                            disabled={!file || loading}
                                            className="btn-shiny px-8 py-3.5 text-forest font-semibold rounded-2xl
                                                       disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none
                                                       whitespace-nowrap text-base tracking-wide"
                                        >
                                            {loading ? "Analyzing…" : "Diagnose"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </ErrorBoundary>
                    </div>
                </main>

                {/* ── Footer ───────────────────────────────── */}
                <footer className="py-5 text-center text-cream-dim text-xs tracking-wide">
                    Phyto · Precision Botany Platform
                </footer>
            </div>
        </div>
    );
}
