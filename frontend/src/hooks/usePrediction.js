import { useState, useCallback } from "react";
import { predictDisease } from "../services/api";

/**
 * Custom hook that encapsulates the prediction API call,
 * tracks loading, progress, error, and result state.
 */
export function usePrediction() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const predict = useCallback(async (file, modelKey) => {
        setLoading(true);
        setError(null);
        setResult(null);
        setProgress(0);

        try {
            const data = await predictDisease(file, modelKey, setProgress);
            setResult(data);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setProgress(0);
    }, []);

    return { result, loading, progress, error, predict, reset };
}
