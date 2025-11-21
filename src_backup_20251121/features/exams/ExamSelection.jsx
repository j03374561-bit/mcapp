import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Calendar, BookOpen, ArrowRight, Trash2 } from 'lucide-react';
import { fetchExams, deleteExam } from '../../lib/questionManager';

export function ExamSelection({ onSelectExam }) {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadExams = async () => {
        setLoading(true);
        const data = await fetchExams();
        setExams(data);
        setLoading(false);
    };

    useEffect(() => {
        loadExams();
    }, []);

    const handleDelete = async (e, examId) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            const success = await deleteExam(examId);
            if (success) {
                loadExams();
            }
        }
    };

    if (loading) {
        return <div className="text-center text-slate-400 py-12">Loading exams...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
                <Card
                    key={exam.id}
                    className="group hover:border-indigo-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    onClick={() => onSelectExam(exam)}
                >
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <Badge variant={exam.status === 'Available' ? 'success' : 'secondary'}>
                                {exam.status}
                            </Badge>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm font-mono">#{exam.id}</span>
                                <button
                                    onClick={(e) => handleDelete(e, exam.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-500/10"
                                    title="Delete Exam"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <CardTitle className="mt-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-indigo-400" />
                            {exam.year} Exam
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{exam.subject}</span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            Comprehensive practice test with {exam.totalQuestions} questions covering all key topics.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button
                            variant="ghost"
                            className="w-full group-hover:bg-indigo-500/10 group-hover:text-indigo-300 justify-between"
                        >
                            Start Practice
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
