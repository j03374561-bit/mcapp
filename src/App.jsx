import { useState } from 'react';
import { LoginScreen } from './features/auth/LoginScreen';
import { ExamSelection } from './features/exams/ExamSelection';
import { QuestionView } from './features/exams/QuestionView';
import { AdminUpload } from './features/admin/AdminUpload';

function App() {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user_session');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse user session:", e);
            localStorage.removeItem('user_session');
            return null;
        }
    });
    const [selectedExam, setSelectedExam] = useState(null);
    const [adminMode, setAdminMode] = useState(false);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user_session', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        setSelectedExam(null);
        setAdminMode(false);
        localStorage.removeItem('user_session');
    };

    const handleSelectExam = (exam) => {
        setSelectedExam(exam);
    };

    const handleBackToExams = () => {
        setSelectedExam(null);
    };

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Exam Portal
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-400">Welcome, {user.name}</span>
                        {user.role === 'admin' && (
                            <button
                                onClick={() => setAdminMode(!adminMode)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${adminMode
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {adminMode ? 'Exit Admin' : 'Admin Mode'}
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <main>
                    {adminMode ? (
                        <AdminUpload />
                    ) : selectedExam ? (
                        <QuestionView exam={selectedExam} onBack={handleBackToExams} userName={user.name} />
                    ) : (
                        <ExamSelection onSelectExam={handleSelectExam} />
                    )}
                </main>
            </div>
        </div>
    );
}

export default App
