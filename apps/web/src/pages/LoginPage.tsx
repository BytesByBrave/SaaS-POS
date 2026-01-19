import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
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
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
            <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-lg border">
                <h1 className="text-2xl font-bold text-center mb-2">POS Login</h1>
                <p className="text-sm text-muted-foreground text-center mb-6">Enter your credentials to access the system</p>

                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full h-10 rounded-md border px-3"
                            placeholder="staff@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            className="w-full h-10 rounded-md border px-3"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
