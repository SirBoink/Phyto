/**
 * API service — centralized fetch wrapper for the backend.
 * All requests go through the Vite proxy (/api → localhost:8000).
 */

const BASE = "/api";

export async function predictDisease(file, modelKey = "general", onProgress) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_key", modelKey);

    // XMLHttpRequest gives us upload progress tracking
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(`Server error: ${xhr.status}`));
            }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.addEventListener("abort", () => reject(new Error("Request aborted")));

        xhr.open("POST", `${BASE}/predict`);
        xhr.send(formData);
    });
}

export async function fetchRemedy(diseaseClass) {
    const res = await fetch(`${BASE}/remedies/${encodeURIComponent(diseaseClass)}`);
    if (!res.ok) throw new Error(`Failed to fetch remedy: ${res.status}`);
    return res.json();
}

export async function fetchAdvisory(disease, confidence, severity) {
    const res = await fetch(`${BASE}/chat/advisory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disease, confidence, severity }),
    });
    if (!res.ok) throw new Error(`Advisory failed: ${res.status}`);
    return res.json();
}

export async function sendFollowUp(history, question) {
    const res = await fetch(`${BASE}/chat/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, question }),
    });
    if (res.status === 429) {
        const data = await res.json();
        throw new Error(data.detail || "Follow-up limit reached.");
    }
    if (!res.ok) throw new Error(`Follow-up failed: ${res.status}`);
    return res.json();
}
