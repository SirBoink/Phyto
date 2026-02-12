import { useState, useRef, useEffect } from "react";

const MODELS = [
    { value: "general", label: "General", tip: "ResNet · PlantVillage dataset" },
    { value: "soynet", label: "SoyNet", tip: "Soybean specialist · Coming soon" },
    { value: "fivecrop", label: "FiveCrop", tip: "Multi-crop ensemble · Coming soon" },
];

/**
 * Pill-shaped custom dropdown selector with tooltips.
 */
export default function ModelSelector({ value, onChange, disabled }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = MODELS.find((m) => m.value === value);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            {/* Pill button */}
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`
                    w-full px-5 py-3.5 rounded-2xl text-left flex items-center justify-between gap-3
                    border transition-all duration-200
                    ${open ? "border-sage/40 bg-sage/5" : "border-glass-border bg-glass hover:bg-glass-hover"}
                    ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <div className="flex flex-col">
                    <span className="text-cream text-sm font-medium">{selected?.label}</span>
                    <span className="text-cream-dim text-xs">{selected?.tip}</span>
                </div>
                <svg className={`w-4 h-4 text-cream-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-glass-border bg-forest-light/95 backdrop-blur-xl shadow-xl shadow-black/30 overflow-hidden"
                    role="listbox">
                    {MODELS.map((m) => (
                        <button
                            key={m.value}
                            type="button"
                            role="option"
                            aria-selected={m.value === value}
                            onClick={() => { onChange(m.value); setOpen(false); }}
                            className={`
                                w-full px-5 py-3 text-left flex flex-col gap-0.5 transition-colors
                                ${m.value === value ? "bg-sage/10" : "hover:bg-glass-hover"}
                            `}
                        >
                            <span className={`text-sm font-medium ${m.value === value ? "text-sage" : "text-cream"}`}>
                                {m.label}
                            </span>
                            <span className="text-xs text-cream-dim">{m.tip}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
