import { useState, useMemo } from 'react';

export default function ValueEstimationPanel({ marketData }) {
    const [yieldValue, setYieldValue] = useState(1);

    if (!marketData) return null;

    const { commodity, min_price, max_price, modal_price, unit, market, status } = marketData;

    const estimatedValue = useMemo(() => {
        const parsedYield = parseFloat(yieldValue) || 0;
        return (parsedYield * modal_price).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    }, [yieldValue, modal_price]);

    return (
        <div className="bg-glass-panel border border-glass-border rounded-3xl p-6 shadow-xl relative overflow-hidden" aria-labelledby="market-title">
            {/* Background glowing elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-forest-light/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 ring-1 ring-amber-500/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 id="market-title" className="font-serif font-medium text-lg text-cream">Market Value Estimation</h3>
                    {status === 'mock' && (
                        <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full ml-auto whitespace-nowrap">
                            Demo Mode
                        </span>
                    )}
                </div>

                <p className="text-sm text-cream-muted mb-6 leading-relaxed">
                    Based on current market prices from the Agmarknet API for <span className="text-amber-500 font-medium">{commodity}</span> at <span className="text-cream">{market} Market</span>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" aria-label="Current prices">
                    <div className="bg-glass-panel/50 border border-glass-border rounded-2xl p-4 transition-colors hover:bg-glass-hover">
                        <p className="text-xs text-cream-dim uppercase tracking-wider mb-1">Price Range</p>
                        <p className="text-cream font-medium">₹{min_price} - ₹{max_price} <span className="text-cream-dim text-sm font-normal">/ {unit}</span></p>
                    </div>
                    <div className="bg-glass-panel/50 border border-glass-border rounded-2xl p-4 border-l-amber-500/50 border-l-2 transition-colors hover:bg-glass-hover">
                        <p className="text-xs text-cream-dim uppercase tracking-wider mb-1">Modal (Average) Price</p>
                        <p className="text-amber-500 font-semibold text-lg">₹{modal_price} <span className="text-cream-dim text-sm font-normal">/ {unit}</span></p>
                    </div>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-2xl p-5" aria-live="polite">
                    <label htmlFor="yield-input" className="block text-sm text-cream mb-2 font-medium">Estimate Your Harvest Value</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="relative flex-1">
                            <input 
                                id="yield-input"
                                type="number" 
                                min="0" step="0.1"
                                className="w-full bg-glass-panel border border-glass-border rounded-xl px-4 py-2.5 text-cream focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-shadow transition-colors placeholder:text-cream-dim/50"
                                value={yieldValue}
                                placeholder="Enter yield..."
                                onChange={(e) => setYieldValue(e.target.value)}
                                aria-label="Estimated harvest yield"
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <span className="text-cream-dim text-sm">{unit}s</span>
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-glass-border" aria-hidden="true" />
                        <div className="flex-1 pt-2 sm:pt-0 border-t border-glass-border sm:border-t-0">
                            <p className="text-xs text-cream-dim mb-1">Gross Expected Value</p>
                            <p className="text-2xl font-serif text-amber-500 font-semibold tabular-nums">₹ {estimatedValue}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
