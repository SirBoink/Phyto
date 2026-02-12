import { useState, useEffect, useRef } from "react";
import { fetchAdvisory, sendFollowUp } from "../services/api";

const MAX_FOLLOWUPS = 2;

/**
 * AI Advisory panel — auto-fetches LLM advisory on mount,
 * displays bilingual output with language toggle,
 * and supports up to 2 follow-up questions.
 */
export default function AiAdvisory({ disease, confidence, severity }) {
    const [advisory, setAdvisory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lang, setLang] = useState("english");

    // Follow-up chat state
    const [chatHistory, setChatHistory] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [followUpCount, setFollowUpCount] = useState(0);
    const [question, setQuestion] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Auto-fetch advisory on mount
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchAdvisory(disease, confidence, severity)
            .then((data) => {
                if (!cancelled) {
                    setAdvisory(data);
                    // Seed chat history with the initial prompt/response for follow-ups
                    setChatHistory([
                        { role: "user", content: `Disease: ${disease}, Confidence: ${(confidence * 100).toFixed(1)}%, Severity: ${severity.toFixed(1)}%` },
                        { role: "model", content: JSON.stringify(data) },
                    ]);
                }
            })
            .catch((err) => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [disease, confidence, severity]);

    // Scroll to bottom when new follow-up arrives
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [followUps]);

    const handleFollowUp = async (e) => {
        e.preventDefault();
        if (!question.trim() || chatLoading || followUpCount >= MAX_FOLLOWUPS) return;

        const q = question.trim();
        setQuestion("");
        setChatLoading(true);

        // Optimistically add user message
        setFollowUps((prev) => [...prev, { role: "user", content: q }]);

        try {
            const result = await sendFollowUp(chatHistory, q);

            // Update history for future follow-ups
            setChatHistory((prev) => [
                ...prev,
                { role: "user", content: q },
                { role: "model", content: JSON.stringify(result) },
            ]);

            setFollowUps((prev) => [...prev, { role: "model", content: result }]);
            setFollowUpCount((c) => c + 1);
        } catch (err) {
            setFollowUps((prev) => [
                ...prev,
                { role: "error", content: err.message },
            ]);
        } finally {
            setChatLoading(false);
        }
    };

    // ── Loading skeleton ──────────────────────────────
    if (loading) {
        return (
            <div className="space-y-4" aria-live="polite" aria-busy="true">
                <div className="flex items-center gap-3">
                    <div className="skeleton h-5 w-32" />
                    <div className="skeleton h-8 w-24 rounded-full" />
                </div>
                <div className="skeleton h-20 w-full" />
                <div className="skeleton h-32 w-full" />
                <div className="skeleton h-32 w-full" />
            </div>
        );
    }

    // ── Error state ──────────────────────────────
    if (error) {
        return (
            <div className="p-5 bg-critical/10 border border-critical/20 rounded-2xl text-center">
                <p className="text-critical font-semibold mb-1">AI Advisory Unavailable</p>
                <p className="text-cream-dim text-sm">{error}</p>
            </div>
        );
    }

    if (!advisory) return null;

    const data = advisory[lang];
    if (!data) return null;

    return (
        <div className="space-y-6">

            {/* ── Header + Language Toggle ───────── */}
            <div className="flex items-center justify-between">
                <p className="text-sage text-sm font-medium uppercase tracking-widest">
                    AI Advisory
                </p>
                <div className="flex rounded-full border border-glass-border overflow-hidden">
                    {["english", "hindi"].map((l) => (
                        <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`px-4 py-1.5 text-xs font-medium transition-all ${lang === l
                                    ? "bg-sage/15 text-sage"
                                    : "text-cream-dim hover:text-cream"
                                }`}
                        >
                            {l === "english" ? "EN" : "हिं"}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Summary ──────────────────────────── */}
            <div className="p-4 rounded-2xl bg-sage/5 border border-sage/10">
                <p className="text-cream text-base leading-relaxed">{data.summary}</p>
            </div>

            {/* ── Remedy Cards ─────────────────────── */}
            <div className="border border-glass-border rounded-2xl overflow-hidden bg-glass">
                {/* Commercial Tab */}
                <div className="border-b border-glass-border">
                    <div className="px-5 py-3 bg-sage/5">
                        <p className="text-sage text-sm font-medium">
                            {lang === "english" ? "Commercial Treatment" : "व्यावसायिक उपचार"}
                        </p>
                    </div>
                    {data.commercial_remedy && (
                        <div className="p-5 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-cream-dim text-xs uppercase tracking-wider mb-1">
                                        {lang === "english" ? "Product" : "उत्पाद"}
                                    </p>
                                    <p className="text-cream text-base">{data.commercial_remedy.product}</p>
                                </div>
                                <div>
                                    <p className="text-cream-dim text-xs uppercase tracking-wider mb-1">
                                        {lang === "english" ? "Dosage" : "खुराक"}
                                    </p>
                                    <p className="text-cream text-base">{data.commercial_remedy.dosage}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-cream-dim text-xs uppercase tracking-wider mb-1">
                                    {lang === "english" ? "Frequency" : "आवृत्ति"}
                                </p>
                                <p className="text-cream text-base">{data.commercial_remedy.frequency}</p>
                            </div>
                            {data.commercial_remedy.notes && (
                                <p className="text-cream-dim text-sm italic leading-relaxed pt-2 border-t border-glass-border">
                                    {data.commercial_remedy.notes}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Traditional Tab */}
                <div>
                    <div className="px-5 py-3 bg-teal/5">
                        <p className="text-teal text-sm font-medium">
                            {lang === "english" ? "Traditional Remedy" : "पारंपरिक उपचार"}
                        </p>
                    </div>
                    {data.traditional_remedy && (
                        <div className="p-5 space-y-3">
                            <div>
                                <p className="text-cream-dim text-xs uppercase tracking-wider mb-1">
                                    {lang === "english" ? "Recipe" : "नुस्खा"}
                                </p>
                                <p className="text-cream text-base leading-relaxed">{data.traditional_remedy.recipe}</p>
                            </div>
                            <div>
                                <p className="text-cream-dim text-xs uppercase tracking-wider mb-1">
                                    {lang === "english" ? "Frequency" : "आवृत्ति"}
                                </p>
                                <p className="text-cream text-base">{data.traditional_remedy.frequency}</p>
                            </div>
                            {data.traditional_remedy.notes && (
                                <p className="text-cream-dim text-sm italic leading-relaxed pt-2 border-t border-glass-border">
                                    {data.traditional_remedy.notes}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Follow-up Chat ──────────────────── */}
            <div className="border border-glass-border rounded-2xl overflow-hidden bg-glass">
                <div className="px-5 py-3 border-b border-glass-border flex items-center justify-between">
                    <p className="text-sage text-sm font-medium">
                        {lang === "english" ? "Ask a Follow-up" : "अनुवर्ती प्रश्न पूछें"}
                    </p>
                    <span className="text-cream-dim text-xs">
                        {followUpCount}/{MAX_FOLLOWUPS}
                    </span>
                </div>

                {/* Previous follow-ups */}
                {followUps.length > 0 && (
                    <div className="px-5 py-4 space-y-3 max-h-64 overflow-y-auto">
                        {followUps.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-sage/15 text-cream chat-bubble-user"
                                        : msg.role === "error"
                                            ? "bg-critical/10 text-critical"
                                            : "bg-glass-hover text-cream chat-bubble-ai"
                                    }`}>
                                    {msg.role === "model"
                                        ? (msg.content[lang] || msg.content.english || JSON.stringify(msg.content))
                                        : msg.content
                                    }
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="px-4 py-2.5 rounded-2xl bg-glass-hover">
                                    <div className="flex gap-1.5">
                                        <span className="chat-dot w-2 h-2 bg-sage/50 rounded-full" style={{ animationDelay: "0ms" }} />
                                        <span className="chat-dot w-2 h-2 bg-sage/50 rounded-full" style={{ animationDelay: "150ms" }} />
                                        <span className="chat-dot w-2 h-2 bg-sage/50 rounded-full" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleFollowUp} className="p-3 border-t border-glass-border flex gap-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={followUpCount >= MAX_FOLLOWUPS || chatLoading}
                        placeholder={
                            followUpCount >= MAX_FOLLOWUPS
                                ? (lang === "english" ? "Follow-up limit reached" : "अनुवर्ती सीमा समाप्त")
                                : (lang === "english" ? "Ask about this disease…" : "इस रोग के बारे में पूछें…")
                        }
                        className="flex-1 px-4 py-2.5 rounded-xl bg-forest-light border border-glass-border
                                   text-cream text-sm placeholder:text-cream-dim/50
                                   focus:outline-none focus:border-sage/30 transition-colors
                                   disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!question.trim() || followUpCount >= MAX_FOLLOWUPS || chatLoading}
                        className="px-4 py-2.5 rounded-xl bg-sage/15 text-sage text-sm font-medium
                                   hover:bg-sage/25 transition-colors
                                   disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
}
