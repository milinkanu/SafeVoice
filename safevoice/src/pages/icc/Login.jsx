import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Key, Mail, Building2, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/icc/login', { email, password });

            if (response.data.success) {
                localStorage.setItem('icc_token', response.data.token);
                localStorage.setItem('icc_user', JSON.stringify(response.data.user));
                navigate('/icc');
            } else {
                throw new Error("Invalid credentials");
            }
        } catch (err) {
            alert("Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-bg-surface to-bg-primary border border-border-default shadow-2xl text-accent-primary mb-6 relative">
                        <div className="absolute inset-0 bg-accent-primary opacity-10 blur-xl rounded-full"></div>
                        <Building2 className="w-10 h-10" />
                        <Shield className="w-5 h-5 absolute bottom-4 right-4 text-bg-primary fill-accent-primary outline outline-2 outline-bg-secondary rounded-full" />
                    </div>
                    <h1 className="text-4xl font-display text-text-primary mb-2 tracking-tight">
                        ICC Portal
                    </h1>
                    <p className="text-text-muted px-4 font-light">
                        Authorized Internal Complaints Committee members only.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-bg-secondary p-8 rounded-3xl border border-border-default shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary/50 via-accent-primary to-accent-primary/50"></div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    type="email"
                                    label="Official Email Address"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10"
                                />
                                <Mail className="w-4 h-4 text-text-muted absolute left-3 top-[34px]" />
                            </div>

                            <div className="relative">
                                <Input
                                    type="password"
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-10"
                                />
                                <Key className="w-4 h-4 text-text-muted absolute left-3 top-[34px]" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-text-muted hover:text-text-primary cursor-pointer transition-colors">
                                <input type="checkbox" className="mr-2 rounded border-border-default bg-bg-surface accent-accent-primary w-4 h-4" />
                                Remember me
                            </label>
                            <a href="#" className="font-medium text-accent-primary hover:text-emerald-400 transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold tracking-wide"
                            disabled={isLoading || !email || !password}
                        >
                            {isLoading ? 'Authenticating...' : <span className="flex items-center gap-2">Login Securely <LogIn className="w-4 h-4" /></span>}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-text-muted mt-8 max-w-xs mx-auto flex items-center gap-2 justify-center italic">
                    <Shield className="w-4 h-4 shrink-0" /> Restrictive access monitoring is active.
                </p>

            </div>
        </div>
    );
}
