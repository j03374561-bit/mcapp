import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Lock, User, AlertCircle } from "lucide-react";
import { USERS } from "../../data/mockData.js";

export function LoginScreen({ onLogin }) {
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Simulate network request
        setTimeout(() => {
            // Check if user exists
            const user = USERS.find(
                u => u.username === username && u.password === password
            );

            if (user) {
                setIsLoading(false);
                onLogin({ name: user.name, role: user.role });
            } else {
                setIsLoading(false);
                setError("Invalid username or password");
            }
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-950 p-4">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <h1 style={{ color: 'red', fontSize: '40px', zIndex: 9999, position: 'relative', backgroundColor: 'white' }}>
                DEBUG: LOGIN SCREEN MOUNTED
            </h1>
            <Card className="w-full max-w-md relative z-10 border-white/10 bg-slate-900/60">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tighter">
                        Welcome Back
                    </CardTitle>
                    <p className="text-slate-400 text-sm">
                        Enter your credentials to access the exam portal
                    </p>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <span className="text-red-400 text-sm">{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Username"
                                    className="pl-10 bg-slate-950/50 border-slate-800 focus:border-indigo-500/50"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="pl-10 bg-slate-950/50 border-slate-800 focus:border-indigo-500/50"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Demo accounts hint */}
                        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <p className="text-indigo-300 text-xs font-semibold mb-1">Demo Accounts:</p>
                            <div className="space-y-1 text-xs text-slate-400">
                                <p>student1 / pass123</p>
                                <p>student2 / pass456</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
