import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { ChevronRight, ChevronLeft, CheckCircle2, XCircle, AlertCircle, Download, RotateCcw, Mail } from 'lucide-react';
import { fetchQuestionsForExam } from '../../lib/questionManager';
import { saveResult } from '../../lib/resultsManager';

export function QuestionView({ exam, onBack, userName }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [answers, setAnswers] = useState({}); // Store all answers
    const [showResults, setShowResults] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQuestions = async () => {
            setLoading(true);
            const data = await fetchQuestionsForExam(exam.id);
            setQuestions(data);
            setLoading(false);
        };
        loadQuestions();
    }, [exam.id]);

    if (loading) {
        return <div className="text-center text-slate-400 py-12">Loading questions...</div>;
    }

    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion && questions.length > 0) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl text-slate-300">No questions available for this exam yet.</h2>
                <Button onClick={onBack} className="mt-4">Go Back</Button>
            </div>
        );
    }

    if (questions.length === 0 && !loading) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl text-slate-300">No questions found for this exam.</h2>
                <Button onClick={onBack} className="mt-4">Go Back</Button>
            </div>
        );
    }

    const handleOptionSelect = (optionId) => {
        if (isSubmitted) return;
        setSelectedOption(optionId);
    };

    const handleSubmit = () => {
        if (!selectedOption) return;
        setIsSubmitted(true);

        // Store the answer
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: {
                questionId: currentQuestion.id,
                selected: selectedOption,
                correct: currentQuestion.correctAnswer,
                isCorrect: selectedOption === currentQuestion.correctAnswer
            }
        }));
    };

    const handleNext = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
        } else {
            // Last question - calculate and save results
            const score = Object.values(answers).filter(a => a.isCorrect).length;
            const total = questions.length;
            const percentage = ((score / total) * 100).toFixed(1);

            // Save result to Firestore
            await saveResult({
                userName: userName || 'Anonymous',
                examYear: exam.year,
                subject: exam.subject,
                score: score,
                totalQuestions: total,
                percentage: parseFloat(percentage),
            });

            // Show results screen
            setShowResults(true);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setSelectedOption(null);
            setIsSubmitted(false);
        }
    };

    const handleEmailResults = () => {
        const score = Object.values(answers).filter(a => a.isCorrect).length;
        const total = questions.length;
        const percentage = ((score / total) * 100).toFixed(1);
        const status = percentage >= 50 ? 'Pass' : 'Fail';

        const subject = `Exam Results - ${exam.year} ${exam.subject} - ${userName || 'Student'}`;

        let body = `Student Name: ${userName || 'Anonymous'}\n`;
        body += `Exam: ${exam.year} ${exam.subject}\n`;
        body += `Date: ${new Date().toLocaleString()}\n`;
        body += `Score: ${score} / ${total}\n`;
        body += `Percentage: ${percentage}%\n`;
        body += `Status: ${status}\n\n`;

        const mailtoLink = `mailto:tsuiwk46@icloud.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    const handleDownloadResults = () => {
        const score = Object.values(answers).filter(a => a.isCorrect).length;
        const total = questions.length;
        const percentage = ((score / total) * 100).toFixed(1);
        const status = percentage >= 50 ? 'PASS' : 'FAIL';

        let content = `# Exam Results Report\n\n`;
        content += `**Student:** ${userName || 'Anonymous'}\n`;
        content += `**Exam:** ${exam.year} ${exam.subject}\n`;
        content += `**Date:** ${new Date().toLocaleString()}\n`;
        content += `**Score:** ${score} / ${total} (${percentage}%)\n`;
        content += `**Status:** ${status}\n\n`;

        content += `## Question Breakdown\n\n`;
        content += `| # | Question | Your Answer | Correct Answer | Result |\n`;
        content += `|---|---|---|---|---|\n`;

        questions.forEach((q, index) => {
            const answer = answers[index];
            const resultIcon = answer.isCorrect ? '✅' : '❌';
            // Escape pipe characters in text to avoid breaking markdown table
            const safeText = q.text.replace(/\|/g, '-');

            content += `| ${index + 1} | ${safeText} | **${answer.selected.toUpperCase()}** | ${q.correctAnswer.toUpperCase()} | ${resultIcon} |\n`;
        });

        content += `\n---\n*Generated by Exam Portal App*`;

        // Create download
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam-result-${exam.year}-${userName || 'student'}-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRetry = () => {
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsSubmitted(false);
        setAnswers({});
        setShowResults(false);
    };

    // Results Summary Screen
    if (showResults) {
        const score = Object.values(answers).filter(a => a.isCorrect).length;
        const total = questions.length;
        const percentage = ((score / total) * 100).toFixed(1);

        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Card className="border-t-4 border-t-indigo-500">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl mb-2">🎉 Exam Complete!</CardTitle>
                        <p className="text-slate-400">Here are your results</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Score Summary */}
                        <div className="text-center p-8 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                            <div className="text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                {percentage}%
                            </div>
                            <div className="text-slate-300 text-lg">
                                {score} out of {total} correct
                            </div>
                            <Badge
                                variant={percentage >= 70 ? 'success' : percentage >= 50 ? 'default' : 'destructive'}
                                className="mt-4"
                            >
                                {percentage >= 70 ? 'Excellent!' : percentage >= 50 ? 'Good Job!' : 'Keep Practicing!'}
                            </Badge>
                        </div>

                        {/* Question Breakdown */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-slate-200">Question Breakdown</h3>
                            {questions.map((q, index) => {
                                const answer = answers[index];
                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "p-4 rounded-lg border flex items-start gap-3",
                                            answer.isCorrect
                                                ? "bg-emerald-500/10 border-emerald-500/20"
                                                : "bg-red-500/10 border-red-500/20"
                                        )}
                                    >
                                        {answer.isCorrect ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-slate-200 font-medium mb-1">
                                                Q{index + 1}: {q.text}
                                            </p>
                                            <div className="text-sm text-slate-400">
                                                Your answer: <span className={answer.isCorrect ? "text-emerald-400" : "text-red-400"}>
                                                    {answer.selected.toUpperCase()}
                                                </span>
                                                {!answer.isCorrect && (
                                                    <span className="ml-2">
                                                        • Correct: <span className="text-emerald-400">{q.correctAnswer.toUpperCase()}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-3 justify-between">
                        <Button variant="ghost" onClick={onBack}>
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Exams
                        </Button>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={handleRetry}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Retry Exam
                            </Button>
                            <Button variant="secondary" onClick={handleEmailResults}>
                                <Mail className="mr-2 h-4 w-4" /> Email Results
                            </Button>
                            <Button onClick={handleDownloadResults}>
                                <Download className="mr-2 h-4 w-4" /> Download Results
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const isCorrect = isSubmitted && selectedOption === currentQuestion.correctAnswer;
    const isWrong = isSubmitted && selectedOption !== currentQuestion.correctAnswer;

    // Question Screen
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-white">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Exams
                </Button>
                <Badge variant="outline" className="bg-slate-900/50">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </Badge>
            </div>

            <Card className="border-t-4 border-t-indigo-500">
                <CardHeader>
                    <CardTitle className="text-xl leading-relaxed">
                        {currentQuestion.text}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {currentQuestion.options.map((option) => {
                        const isSelected = selectedOption === option.id;
                        const isCorrectAnswer = option.id === currentQuestion.correctAnswer;

                        const baseStyles = "w-full justify-start text-left h-auto py-4 px-6 text-base transition-all duration-200";
                        const selectedStyles = isSelected && !isSubmitted ? "ring-2 ring-indigo-500 bg-indigo-500/10" : "";
                        const correctStyles = isSubmitted && isCorrectAnswer ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "";
                        const wrongStyles = isSubmitted && isSelected && !isCorrectAnswer ? "bg-red-500/20 text-red-300 border-red-500/50" : "";

                        return (
                            <Button
                                key={option.id}
                                variant="secondary"
                                className={cn(baseStyles, selectedStyles, correctStyles, wrongStyles)}
                                onClick={() => handleOptionSelect(option.id)}
                                disabled={isSubmitted}
                            >
                                <span className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/50 text-sm font-bold text-slate-400">
                                    {option.id.toUpperCase()}
                                </span>
                                {option.text}
                                {isSubmitted && isCorrectAnswer && <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-400" />}
                                {isSubmitted && isSelected && !isCorrectAnswer && <XCircle className="ml-auto h-5 w-5 text-red-400" />}
                            </Button>
                        );
                    })}
                </CardContent>
                <CardFooter className="flex justify-between border-t border-white/5 pt-6">
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </Button>

                    {!isSubmitted ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className="w-32"
                        >
                            Submit
                        </Button>
                    ) : (
                        <Button onClick={handleNext} className="w-32">
                            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {isSubmitted && (
                <div className={cn(
                    "rounded-xl p-4 border backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4",
                    isCorrect ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
                )}>
                    <div className="flex items-start gap-3">
                        {isCorrect ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-400 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-6 w-6 text-red-400 mt-0.5" />
                        )}
                        <div>
                            <h4 className={cn("font-semibold mb-1", isCorrect ? "text-emerald-300" : "text-red-300")}>
                                {isCorrect ? "Correct Answer!" : "Incorrect"}
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {currentQuestion.explanation}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
