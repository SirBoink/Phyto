import { useState } from "react";

const MODELS = [
    { value: "general", label: "General", hindi: "सामान्य", tip: "Other plants" },
    { value: "soybean", label: "Soybean", hindi: "सोयाबीन", tip: "ResNet specialist" },
    { value: "wheat", label: "Wheat", hindi: "गेहूं", tip: "EfficientNet specialist" },
    { value: "chili", label: "Chili", hindi: "मिर्च", tip: "VGG16 specialist" },
];

/**
 * Grid selector for crop models.
 */
export default function ModelSelector({ value, onChange, disabled }) {
    return (
        <div className="w-full">
            <label className="block text-cream font-medium mb-3 ml-1 text-sm tracking-wide">
                Select your crop type / अपनी फसल चुनें:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MODELS.map((m) => {
                    const isSelected = m.value === value;
                    return (
                        <button
                            key={m.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => onChange(m.value)}
                            className={`
                                relative p-4 flex flex-col items-center justify-center gap-1 rounded-2xl
                                border transition-all duration-300 group min-h-[100px]
                                ${
                                    isSelected
                                        ? "border-sage bg-sage/10 shadow-[0_0_15px_rgba(132,189,170,0.2)]"
                                        : "border-glass-border bg-glass hover:bg-glass-hover hover:border-sage/40"
                                }
                                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                            `}
                        >
                            {/* Inner glow effect for selected */}
                            {isSelected && (
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sage/5 to-transparent pointer-events-none" />
                            )}
                            
                            <div className="text-center space-y-1">
                                <span className={`block text-base font-bold ${isSelected ? "text-sage" : "text-cream"}`}>
                                    {m.label}
                                </span>
                                <span className={`block text-sm font-medium ${isSelected ? "text-sage-light" : "text-cream-muted"}`}>
                                    {m.hindi}
                                </span>
                                <span className="block text-[10px] text-cream-dim leading-tight mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {m.tip}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
