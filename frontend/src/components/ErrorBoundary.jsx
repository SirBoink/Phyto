import { Component } from "react";

/**
 * Catches render errors in children — styled for forest theme.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("[ErrorBoundary]", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center bg-critical/10 border border-critical/20 rounded-2xl">
                    <p className="text-critical font-semibold mb-2">Something went wrong</p>
                    <p className="text-cream-muted text-sm mb-4">{this.state.error?.message}</p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-5 py-2 bg-critical/15 text-critical rounded-xl hover:bg-critical/25 transition-colors text-sm font-medium"
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
