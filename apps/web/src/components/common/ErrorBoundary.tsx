import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
                    <div className="max-w-md w-full glass-strong p-8 rounded-3xl border border-white/10 shadow-2xl animate-fade-in-up relative overflow-hidden">
                        {/* Background Glows */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-destructive/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6 shadow-lg shadow-destructive/20">
                                <AlertTriangle className="h-10 w-10 text-destructive" />
                            </div>

                            <h1 className="text-2xl font-black mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Oops! Something went wrong
                            </h1>

                            <p className="text-muted-foreground mb-8 text-sm">
                                We encountered an unexpected error. Please try reloading the page.
                            </p>

                            {this.state.error && (
                                <div className="w-full bg-black/20 rounded-xl p-4 mb-8 text-left overflow-hidden">
                                    <p className="font-mono text-xs text-destructive break-all">
                                        {this.state.error.toString()}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={this.handleGoHome}
                                    className="
                    flex items-center justify-center gap-2
                    h-12 rounded-xl font-bold text-sm
                    glass border border-white/10
                    hover:bg-white/5 active:scale-95
                    transition-all duration-200
                  "
                                >
                                    <Home className="h-4 w-4" />
                                    Home
                                </button>

                                <button
                                    onClick={this.handleReset}
                                    className="
                    flex items-center justify-center gap-2
                    h-12 rounded-xl font-bold text-sm text-white
                    bg-gradient-to-r from-destructive to-orange-600
                    hover:opacity-90 active:scale-95
                    transition-all duration-200 shadow-lg shadow-destructive/25
                  "
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
