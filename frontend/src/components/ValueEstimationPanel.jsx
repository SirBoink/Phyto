import { useState, useMemo, useEffect } from "react";

export default function ValueEstimationPanel({ marketData, marketLossData, onClose }) {
    const [yieldValue, setYieldValue] = useState(1);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!marketData || !marketLossData) return null;

    const { commodity, min_price, max_price, modal_price, unit, market, sentiment, arrival_volume } = marketData;
    const { impact_percentage, loss_per_unit, currency, recommendation } = marketLossData;

    const calculations = useMemo(() => {
        const parsedYield = parseFloat(yieldValue) || 0;
        const totalValue = (parsedYield * modal_price);
        const projectedLoss = (parsedYield * loss_per_unit);
        const salvageValue = totalValue - projectedLoss;

        return {
            totalValue: totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
            projectedLoss: projectedLoss.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
            salvageValue: salvageValue.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
        };
    }, [yieldValue, modal_price, loss_per_unit]);

    const sentimentColor = {
        Bullish: "text-healthy bg-healthy/10 border-healthy/20",
        Stable: "text-sage bg-sage/10 border-sage/20",
        Bearish: "text-critical bg-critical/10 border-critical/20"
    }[sentiment] || "text-cream-dim bg-white/5 border-white/10";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-md" onClick={onClose}>
            <div 
                className="w-full max-w-2xl bg-organic border border-glass-border rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Section */}
                <div className="px-8 py-6 flex items-center justify-between bg-white/5 border-b border-glass-border">
                    <div className="flex flex-col">
                        <h3 className="text-cream font-serif text-xl font-medium">Economic Decision Support</h3>
                        <p className="text-cream-dim text-xs uppercase tracking-widest mt-1">Market Pulse: {market}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-cream-muted hover:bg-glass-hover hover:text-cream transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                    {/* Market Intelligence Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-3xl bg-glass border border-glass-border">
                            <p className="text-cream-dim text-[10px] uppercase tracking-tighter font-semibold mb-2">Modal Price</p>
                            <p className="text-cream text-2xl font-serif">₹{modal_price}<span className="text-xs text-cream-dim ml-1">/{unit}</span></p>
                        </div>
                        <div className="p-4 rounded-3xl bg-glass border border-glass-border">
                            <p className="text-cream-dim text-[10px] uppercase tracking-tighter font-semibold mb-2">Trend Sentiment</p>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block ${sentimentColor}`}>
                                {sentiment}
                            </div>
                        </div>
                        <div className="p-4 rounded-3xl bg-glass border border-glass-border">
                            <p className="text-cream-dim text-[10px] uppercase tracking-tighter font-semibold mb-2">Daily Arrivals</p>
                            <p className="text-cream text-2xl font-serif">{arrival_volume}<span className="text-xs text-cream-dim ml-1">Qtl</span></p>
                        </div>
                    </div>

                    {/* Impact Analysis Section */}
                    <div className="space-y-4">
                        <div className="flex items-end justify-between px-1">
                            <div>
                                <h4 className="text-cream font-medium">Harvest Impairment Analysis</h4>
                                <p className="text-cream-dim text-xs">Based on visual severity and crop sensitivity</p>
                            </div>
                            <div className={`text-right px-4 py-1 rounded-xl font-bold ${impact_percentage > 25 ? 'bg-critical/10 text-critical border border-critical/20' : 'bg-healthy/10 text-healthy border border-healthy/20'}`}>
                                {impact_percentage}% Loss
                            </div>
                        </div>
                        
                        {/* Custom Animated Gauge/Bar */}
                        <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                                    impact_percentage > 40 ? 'bg-gradient-to-r from-warning to-critical' : 'bg-gradient-to-r from-healthy to-warning'
                                }`}
                                style={{ width: `${impact_percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Financial Projection Tool */}
                    <div className="bg-black/25 rounded-[2rem] p-6 border border-white/5 space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-full sm:flex-1 space-y-3">
                                <label className="text-cream-dim text-xs uppercase tracking-widest font-medium px-1">Estimate Your Yield</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        min="0" step="0.5"
                                        className="w-full bg-white/5 border border-glass-border rounded-2xl px-6 py-4 text-cream text-xl font-serif focus:outline-none focus:ring-2 focus:ring-sage/30 transition-all placeholder:text-cream-dim/30 shadow-inner group-hover:bg-white/10"
                                        value={yieldValue}
                                        onChange={(e) => setYieldValue(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                                        <span className="text-cream-dim text-sm">{unit}s</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="hidden sm:block w-px h-16 bg-glass-border mx-2" />
                            
                            <div className="w-full sm:w-auto flex flex-col items-center sm:items-end min-w-[140px]">
                                <p className="text-cream-dim text-xs uppercase tracking-widest font-medium mb-1">Impact Priority</p>
                                <span className={`text-lg font-bold ${recommendation === 'High Priority' ? 'text-critical' : 'text-healthy'}`}>
                                    {recommendation}
                                </span>
                            </div>
                        </div>

                        {/* Financial Card Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center group hover:bg-white/10 transition-colors">
                                <p className="text-cream-dim text-[10px] uppercase tracking-widest font-bold mb-1 opacity-60">Potential Loss</p>
                                <p className="text-2xl text-critical font-serif font-semibold">₹ {calculations.projectedLoss}</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-sage/10 border border-sage/10 flex flex-col items-center group hover:bg-sage/20 transition-colors">
                                <p className="text-sage text-[10px] uppercase tracking-widest font-bold mb-1 opacity-80">Estimated Salvage</p>
                                <p className="text-2xl text-cream font-serif font-semibold">₹ {calculations.salvageValue}</p>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-center text-cream-dim/40 text-[10px] italic">
                        * Calculations factor in crop-specific sensitivity to foliar impairment. Prices indexed from {market} Mandi.
                    </p>
                </div>
            </div>
        </div>
    );
}

