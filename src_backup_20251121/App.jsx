import { useState } from 'react';
import { LoginScreen } from './features/auth/LoginScreen';
import { ExamSelection } from './features/exams/ExamSelection';
import { QuestionView } from './features/exams/QuestionView';
import { Button } from './components/ui/Button';
import { getResultsCount } from './lib/resultsManager';
import { Download, Settings } from 'lucide-react';
import { AdminUpload } from './features/admin/AdminUpload';
import { ExportModal } from './features/admin/ExportModal';

function App() {
  console.log("App.jsx: Component rendering...");
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
  const [resultsCount, setResultsCount] = useState(0);
  const [adminMode, setAdminMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getResultsCount();
      setResultsCount(count);
    };
    fetchCount();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedExam(null);
    localStorage.removeItem('user_session');
  };

  const handleSelectExam = (exam) => {
    setSelectedExam(exam);
  };

  const handleBackToExams = async () => {
    setSelectedExam(null);
    const count = await getResultsCount();
    setResultsCount(count); //  Update count when returning from exam
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (adminMode) {
    return <AdminUpload onBack={() => setAdminMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 style={{ color: 'red', fontSize: '40px', zIndex: 9999, position: 'relative' }}>
        DEBUG: REACT IS MOUNTED
      </h1>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Exam Portal
          </h1>
          <div className="flex items-center gap-4">
            {!selectedExam && resultsCount > 0 && user.role === 'admin' && (
              <Button variant="secondary" size="sm" onClick={() => setShowExportModal(true)}>
                <Download className="mr-2 h-4 w-4" />
                Export Results ({resultsCount})
              </Button>
            )}
            <span className="text-slate-400">Welcome, {user.name}</span>
            {user.role === 'admin' && (
              <Button variant="ghost" size="sm" onClick={() => setAdminMode(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <main>
          {selectedExam ? (
            <QuestionView exam={selectedExam} onBack={handleBackToExams} userName={user.name} />
          ) : (
            <ExamSelection onSelectExam={handleSelectExam} />
          )}
        </main>

        {showExportModal && (
          <ExportModal onClose={() => setShowExportModal(false)} />
        )}
      </div>
    </div>
  );
}

export default App;
