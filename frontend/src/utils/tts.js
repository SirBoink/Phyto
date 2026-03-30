/**
 * Simple Text-to-Speech utility using the browser's native SpeechSynthesis API.
 */

let synth = window.speechSynthesis;

/**
 * Finds and returns a Hindi voice if available, otherwise returns the default voice.
 */
const getHindiVoice = () => {
    const voices = synth.getVoices();
    // Look for Hindi (hi-IN)
    const hindiVoice = voices.find(v => v.lang.includes('hi-IN') || v.lang.includes('hi_IN'));
    if (hindiVoice) return hindiVoice;
    
    // Fallback to any Indian English if Hindi is missing but we want an Indian accent
    const indianEnglish = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'));
    if (indianEnglish) return indianEnglish;

    // Last resort: default
    return voices.find(v => v.default) || voices[0];
};

/**
 * Speaks the provided text.
 * @param {string} text - The text to speak.
 * @param {string} lang - Optional language override (e.g. 'en-US').
 */
export const speak = (text, lang = 'hi-IN') => {
    if (!text || !synth) return;

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to set voice
    const voice = getHindiVoice();
    if (voice) {
        utterance.voice = voice;
    }
    
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    synth.speak(utterance);
};
