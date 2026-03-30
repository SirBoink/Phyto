import { useEffect } from "react";

export default function EnvironmentalPanel({ envContext, weather, hasGeolocation, onClose }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!envContext) return null;

    const {
        swi_value,
        saturation_level,
        in_wetland_zone,
        zone_name,
        bayesian_disease_risk_note,
        data_resolution,
        last_updated
    } = envContext;

    const satBadge = {
        LOW: { bg: "bg-healthy/15", text: "text-healthy", border: "border-healthy/20", label: "Low" },
        MODERATE: { bg: "bg-warning/15", text: "text-warning", border: "border-warning/20", label: "Moderate" },
        HIGH: { bg: "bg-critical/15", text: "text-critical", border: "border-critical/20", label: "High" },
    }[saturation_level] || { bg: "bg-white/5", text: "text-cream-dim", border: "border-white/10", label: "N/A" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-md" onClick={onClose}>
            <div 
                className="w-full max-w-3xl bg-organic border border-glass-border rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between bg-white/5 border-b border-glass-border">
                    <div className="flex flex-col">
                        <h3 className="text-cream font-serif text-xl font-medium tracking-tight">Environmental Intelligence</h3>
                        <p className="text-cream-dim text-[10px] uppercase tracking-widest mt-1">Multi-Sensor Data Fusion (ISRO + Weather)</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-cream-muted hover:bg-glass-hover hover:text-cream transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                    {/* Live Weather Section */}
                    {weather && (
                        <div className="bg-black/20 border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 scale-150 opacity-20 pointer-events-none transition-transform duration-700 group-hover:scale-[2] group-hover:rotate-12">
                                <span className="text-6xl">{weather.icon}</span>
                            </div>
                            
                            <div className="relative z-10 flex flex-wrap items-center gap-8">
                                <div className="flex items-center gap-4">
                                    <span className="text-5xl font-serif text-cream">{weather.temperature}°</span>
                                    <div className="flex flex-col">
                                        <span className="text-cream font-medium text-lg">{weather.condition}</span>
                                        <span className="text-cream-dim text-xs">Feels like {weather.feels_like}°</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-6 border-l border-white/10 pl-8">
                                    <div className="flex flex-col">
                                        <span className="text-cream-dim text-[10px] uppercase font-bold tracking-wider">Humidity</span>
                                        <span className="text-cream font-medium">{weather.humidity}%</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-cream-dim text-[10px] uppercase font-bold tracking-wider">Wind</span>
                                        <span className="text-cream font-medium">{weather.wind_speed} km/h</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-cream-dim text-[10px] uppercase font-bold tracking-wider">Pressure</span>
                                        <span className="text-cream font-medium">{weather.pressure} hPa</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Satellite Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Soil Wetness Card */}
                        <div className="p-6 rounded-3xl bg-glass border border-glass-border flex flex-col justify-between group hover:bg-glass-hover transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-cream-dim text-[10px] uppercase font-bold tracking-widest">Soil Wetness Index</span>
                                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold border ${satBadge.bg} ${satBadge.text} ${satBadge.border}`}>
                                    {satBadge.label}
                                </span>
                            </div>
                            
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-cream text-4xl font-serif font-bold">
                                    {swi_value != null ? swi_value.toFixed(3) : "—"}
                                </span>
                                <span className="text-cream-dim text-xs">SWI</span>
                            </div>
                            <p className="text-cream-dim text-[10px] mt-2 border-t border-white/5 pt-3">
                                Sensor: {data_resolution} | Updated: {last_updated}
                            </p>
                        </div>

                        {/* Proximity Card */}
                        <div className={`p-6 rounded-3xl border flex flex-col justify-between transition-all duration-500 ${
                            in_wetland_zone ? "bg-critical/5 border-critical/20" : "bg-glass border-glass-border"
                        }`}>
                            <div>
                                <span className="text-cream-dim text-[10px] uppercase font-bold tracking-widest block mb-4">Boundary Proximity</span>
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-2xl ${in_wetland_zone ? 'bg-critical/10' : 'bg-healthy/10'}`}>
                                        {in_wetland_zone ? (
                                            <svg className="w-6 h-6 text-critical" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-healthy" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`font-semibold ${in_wetland_zone ? 'text-critical' : 'text-healthy'}`}>
                                            {in_wetland_zone ? `Near ${zone_name}` : "Optimal Buffer Zone"}
                                        </span>
                                        <span className="text-cream-dim text-xs mt-1">
                                            {in_wetland_zone ? "Elevated humidity risk" : "Standard ambient humidity"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Risk Callout */}
                    <div className="p-6 rounded-3xl bg-sage/5 border border-sage/10 shadow-inner">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-sage/10 rounded-xl">
                                <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-sage text-[10px] uppercase font-bold tracking-widest">Holistic Risk Report</span>
                                <p className="text-cream text-[15px] leading-relaxed font-serif italic antialiased">
                                    "{bayesian_disease_risk_note}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

