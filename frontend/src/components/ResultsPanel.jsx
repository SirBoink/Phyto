import AiAdvisory from "./AiAdvisory";

/**
 * Full results view — replaces the upload area once prediction completes.
 * Shows disease name + image side-by-side, severity bar, and remedy card.
 */
export default function ResultsPanel({ result, loading, error, onRetry, preview }) {

    // ── Loading skeleton ──────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-5" aria-live="polite" aria-busy="true">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="skeleton h-8 w-3/4" />
                        <div className="skeleton h-5 w-1/2" />
                        <div className="skeleton h-5 w-2/3" />
                    </div>
                    <div className="skeleton w-48 h-48 rounded-2xl shrink-0" />
                </div>
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-32 w-full" />
            </div>
        );
    }

    // ── Error state ───────────────────────────────────────
    if (error) {
        return (
            <div className="p-6 bg-critical/10 border border-critical/20 rounded-2xl text-center" role="alert">
                <p className="text-critical font-semibold text-lg mb-2">Analysis Failed</p>
                <p className="text-cream-muted text-sm mb-5">{error}</p>
                <button onClick={onRetry}
                    className="px-6 py-2.5 bg-critical/15 text-critical rounded-xl hover:bg-critical/25 transition-colors text-sm font-medium">
                    Try Again
                </button>
            </div>
        );
    }

    if (!result) return null;

    // Coming-soon response from placeholder models
    if (!result.disease && result.status) {
        return (
            <div className="p-6 bg-warning/10 border border-warning/20 rounded-2xl text-center">
                <p className="text-warning font-semibold text-lg">{result.status}</p>
            </div>
        );
    }

    const severity = result.severity ?? 0;
    const severityColor = severity < 30 ? "bg-healthy" : severity < 60 ? "bg-warning" : "bg-critical";
    const severityLabel = severity < 30 ? "Mild" : severity < 60 ? "Moderate" : "Severe";

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `phyto_result_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8" aria-live="polite">

            {/* ── Hero: Diagnosis + Image ──────────────── */}
            <div className="flex flex-col sm:flex-row gap-8 items-start">
                {/* Left — disease info */}
                <div className="flex-1 space-y-3">
                    <p className="text-sage text-sm font-medium uppercase tracking-widest">Diagnosis</p>
                    <h2 className="font-serif text-3xl sm:text-4xl text-cream leading-snug">
                        {result.disease?.replaceAll("___", " — ").replaceAll("_", " ")}
                    </h2>
                    <p className="text-cream-muted text-base leading-relaxed">
                        Confidence: <span className="text-sage font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                        <span className="mx-2 text-cream-dim">·</span>
                        Model: <span className="text-cream">{result.model_used}</span>
                    </p>
                    <button onClick={handleDownload} title="Download results"
                        className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl border border-glass-border
                                   text-cream-muted text-sm hover:bg-glass-hover transition-colors"
                        aria-label="Download results as JSON">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Export
                    </button>
                </div>

                {/* Right — uploaded image */}
                {preview && (
                    <div className="shrink-0">
                        <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden ring-1 ring-glass-border shadow-xl shadow-black/30">
                            <img src={preview} alt="Uploaded leaf specimen" className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Severity bar ──────────────────────────── */}
            <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                    <p className="text-sage text-sm font-medium uppercase tracking-widest">Severity</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-cream text-2xl font-semibold">{severity.toFixed(1)}%</span>
                        <span className="text-cream-dim text-sm">{severityLabel}</span>
                    </div>
                </div>
                <div className="h-3.5 bg-forest-light rounded-full overflow-hidden">
                    <div className={`h-full rounded-full severity-bar-fill ${severityColor}`}
                        style={{ width: `${severity}%` }} />
                </div>
            </div>

            {/* ── AI Advisory (replaces static remedy card) ── */}
            {result.disease && (
                <AiAdvisory
                    disease={result.disease}
                    confidence={result.confidence}
                    severity={severity}
                />
            )}
        </div>
    );
}
