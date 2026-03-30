import { useState } from "react";

/**
 * Environmental Intelligence panel — displays ISRO Bhuvan / Bhoonidhi data
 * including soil moisture index, wetland zone alerts, and risk assessment.
 */
export default function EnvironmentalPanel({ envContext, hasGeolocation }) {
    const [expanded, setExpanded] = useState(true);

    if (!envContext) return null;

    const {
        swi_value,
        saturation_level,
        in_wetland_zone,
        zone_name,
        bayesian_disease_risk_note,
    } = envContext;

    // Color-coded badge for saturation level
    const satBadge = {
        LOW: { bg: "bg-healthy/15", text: "text-healthy", border: "border-healthy/20", label: "Low" },
        MODERATE: { bg: "bg-warning/15", text: "text-warning", border: "border-warning/20", label: "Moderate" },
        HIGH: { bg: "bg-critical/15", text: "text-critical", border: "border-critical/20", label: "High" },
        UNKNOWN: { bg: "bg-cream-dim/15", text: "text-cream-dim", border: "border-cream-dim/20", label: "N/A" },
    }[saturation_level || "UNKNOWN"];

    return (
        <div className="border border-glass-border rounded-2xl overflow-hidden bg-glass">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-5 py-3 flex items-center justify-between bg-teal/5 hover:bg-teal/8 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">🌍</span>
                    <p className="text-teal text-sm font-medium">Environmental Intelligence</p>
                </div>
                <svg
                    className={`w-4 h-4 text-teal transition-transform ${expanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {expanded && (
                <div className="p-5 space-y-4">
                    {/* Location notice */}
                    {!hasGeolocation && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/5 border border-warning/10">
                            <svg className="w-4 h-4 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            <p className="text-warning/80 text-xs">
                                Using default Bhopal location for environmental data
                            </p>
                        </div>
                    )}

                    {/* Metrics row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Soil Wetness Index */}
                        <div className="p-4 rounded-xl bg-forest-light border border-glass-border space-y-2">
                            <p className="text-cream-dim text-xs uppercase tracking-wider">
                                Soil Wetness Index
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="text-cream text-2xl font-semibold">
                                    {swi_value != null ? swi_value.toFixed(2) : "—"}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${satBadge.bg} ${satBadge.text} ${satBadge.border}`}>
                                    {satBadge.label}
                                </span>
                            </div>
                            <p className="text-cream-dim text-xs">
                                EOS-04 SAR-derived · 500m resolution
                            </p>
                        </div>

                        {/* Wetland Zone Alert */}
                        <div className={`p-4 rounded-xl border space-y-2 ${
                            in_wetland_zone
                                ? "bg-critical/5 border-critical/15"
                                : "bg-forest-light border-glass-border"
                        }`}>
                            <p className="text-cream-dim text-xs uppercase tracking-wider">
                                Wetland Zone
                            </p>
                            <div className="flex items-center gap-2">
                                {in_wetland_zone ? (
                                    <>
                                        <span className="text-lg">💧</span>
                                        <span className="text-critical font-semibold text-base">
                                            Alert — Near {zone_name || "Bhojtal"}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-lg">✅</span>
                                        <span className="text-healthy text-base">
                                            Not in wetland zone
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-cream-dim text-xs">
                                Bhuvan WFS · Bhoj Wetland boundary
                            </p>
                        </div>
                    </div>

                    {/* Risk Note Callout */}
                    {bayesian_disease_risk_note && (
                        <div className="p-4 rounded-xl bg-teal/5 border border-teal/15">
                            <div className="flex items-start gap-3">
                                <span className="text-lg shrink-0 mt-0.5">🔬</span>
                                <div>
                                    <p className="text-teal text-xs font-medium uppercase tracking-wider mb-1.5">
                                        Environmental Risk Assessment
                                    </p>
                                    <p className="text-cream text-sm leading-relaxed">
                                        {bayesian_disease_risk_note}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
