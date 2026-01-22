import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowRight, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Invalid email or password');
            }

            const data = await response.json();
            localStorage.setItem('auth_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background ambient-bg">
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

                {/* Grid pattern */}
                <div className="absolute inset-0 grid-pattern opacity-50" />

                {/* Floating particles */}
                <div className="particle" style={{ left: '15%', top: '25%', animationDelay: '0s' }} />
                <div className="particle" style={{ left: '75%', top: '35%', animationDelay: '3s' }} />
                <div className="particle" style={{ left: '25%', top: '75%', animationDelay: '6s' }} />
                <div className="particle" style={{ left: '85%', top: '65%', animationDelay: '9s' }} />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md animate-fade-in-up">
                {/* Card glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-[3rem] blur-2xl opacity-50" />

                {/* Main card */}
                <div className="relative glass-strong border border-white/10 p-10 rounded-[2rem] shadow-2xl">
                    {/* Logo section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-6">
                            <div className="relative">
                                {/* 3D Logo container */}
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-primary flex items-center justify-center shadow-2xl shadow-primary/40 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-white/20" />
                                    <Zap className="h-10 w-10 text-white relative z-10" />
                                </div>
                                {/* Glow effect */}
                                <div className="absolute -inset-2 bg-primary/30 rounded-2xl blur-xl -z-10" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Sign in to access your POS system
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 animate-fade-in-up">
                            <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            </div>
                            <p className="text-sm font-medium text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleLogin}>
                        {/* Email field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground/80">Email Address</label>
                            <div className={`
                                relative rounded-xl transition-all duration-300
                                ${emailFocused ? 'ring-2 ring-primary/30' : ''}
                            `}>
                                {/* Input glow */}
                                <div className={`
                                    absolute -inset-0.5 rounded-xl 
                                    bg-gradient-to-r from-primary/30 to-purple-500/30
                                    opacity-0 transition-opacity duration-300 blur-sm
                                    ${emailFocused ? 'opacity-100' : ''}
                                `} />

                                <div className="relative">
                                    <Mail className={`
                                        absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 
                                        transition-colors duration-300
                                        ${emailFocused ? 'text-primary' : 'text-muted-foreground'}
                                    `} />
                                    <input
                                        type="email"
                                        className="
                                            w-full h-14 pl-12 pr-4 rounded-xl 
                                            glass border border-white/10
                                            bg-background/50
                                            font-medium
                                            focus:border-primary/50 focus:outline-none
                                            transition-all duration-300
                                            placeholder:text-muted-foreground/50
                                        "
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setEmailFocused(true)}
                                        onBlur={() => setEmailFocused(false)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-foreground/80">Password</label>
                            <div className={`
                                relative rounded-xl transition-all duration-300
                                ${passwordFocused ? 'ring-2 ring-primary/30' : ''}
                            `}>
                                {/* Input glow */}
                                <div className={`
                                    absolute -inset-0.5 rounded-xl 
                                    bg-gradient-to-r from-primary/30 to-purple-500/30
                                    opacity-0 transition-opacity duration-300 blur-sm
                                    ${passwordFocused ? 'opacity-100' : ''}
                                `} />

                                <div className="relative">
                                    <Lock className={`
                                        absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 
                                        transition-colors duration-300
                                        ${passwordFocused ? 'text-primary' : 'text-muted-foreground'}
                                    `} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="
                                            w-full h-14 pl-12 pr-12 rounded-xl 
                                            glass border border-white/10
                                            bg-background/50
                                            font-medium
                                            focus:border-primary/50 focus:outline-none
                                            transition-all duration-300
                                            placeholder:text-muted-foreground/50
                                        "
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Forgot password link */}
                        <div className="flex justify-end">
                            <button type="button" className="text-sm font-medium text-primary hover:underline">
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                relative w-full h-14 rounded-xl font-bold text-white
                                overflow-hidden
                                transition-all duration-300
                                hover:scale-[1.02] active:scale-[0.98]
                                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                                group
                            "
                        >
                            {/* Gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_100%] group-hover:animate-gradient-rotate" />

                            {/* 3D layers */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />

                            {/* Shadow */}
                            <div className="absolute -bottom-2 inset-x-4 h-4 bg-primary/40 blur-xl rounded-full" />

                            {/* Content */}
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm text-muted-foreground">
                            Demo credentials: <span className="font-mono font-bold text-foreground">admin@example.com</span> / <span className="font-mono font-bold text-foreground">password123</span>
                        </p>
                    </div>
                </div>

                {/* Bottom branding */}
                <div className="text-center mt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                            SaaS POS Enterprise
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
