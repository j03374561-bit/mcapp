import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Upload, Download, Trash2, FileSpreadsheet, CheckCircle2, AlertCircle, FileText, Archive } from 'lucide-react';
import { parseExcelQuestions, saveExam, generateTemplate, fetchExams, toggleExamArchive } from '../../lib/questionManager';
import { getUniqueExamsFromResults, exportToMarkdown } from '../../lib/resultsManager';

export function AdminUpload({ onBack }) {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [uploadedCount, setUploadedCount] = useState(0);

    // Export state
    const [availableExams, setAvailableExams] = useState([]);
    const [selectedExams, setSelectedExams] = useState([]);

    // Archive state
    const [allExams, setAllExams] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const resultsExams = await getUniqueExamsFromResults();
        setAvailableExams(resultsExams);

        const exams = await fetchExams();
        setAllExams(exams);
    };

    const handleToggleArchive = async (examId) => {
        await toggleExamArchive(examId);
        loadData(); // Refresh list
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);

        try {
            const questionsByExam = await parseExcelQuestions(file);
            const examIds = Object.keys(questionsByExam);
            let totalQuestions = 0;

            if (examIds.length === 0) {
                setMessage({ type: 'error', text: 'No valid questions found in file.' });
            } else {
                // Upload each exam found in the file
                for (const examId of examIds) {
                    const questions = questionsByExam[examId];
                    totalQuestions += questions.length;

                    // Infer metadata
                    const year = parseInt(examId.replace(/\D/g, '')) || new Date().getFullYear();

                    const examData = {
                        id: examId,
                        year: year,
                        subject: 'Custom Exam', // Default subject, could be improved
                        status: 'Available',
                        totalQuestions: questions.length,
                        questions: questions
                    };

                    await saveExam(examId, examData);
                }

                setUploadedCount(totalQuestions);
                setMessage({ type: 'success', text: `Successfully uploaded ${totalQuestions} questions across ${examIds.length} exam(s)!` });
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to parse or upload file. Please check the format.' });
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const toggleExamSelection = (examKey) => {
        if (selectedExams.includes(examKey)) {
            setSelectedExams(selectedExams.filter(k => k !== examKey));
        } else {
            setSelectedExams([...selectedExams, examKey]);
        }
    };

    const handleExportMarkdown = async () => {
        if (selectedExams.length === 0) {
            alert("Please select at least one exam to export.");
            return;
        }
        await exportToMarkdown(selectedExams);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <Button variant="ghost" onClick={onBack}>
                    Back to App
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-indigo-400" />
                            Upload Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-8 border-2 border-dashed border-slate-700 rounded-xl hover:border-indigo-500/50 transition-colors text-center">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="file-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center gap-3"
                            >
                                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                    <FileSpreadsheet className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-200">
                                        {uploading ? 'Uploading...' : 'Click to upload Excel file'}
                                    </p>
                                    <p className="text-sm text-slate-400 mt-1">.xlsx or .xls files only</p>
                                </div>
                            </label>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                {message.text}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Actions Section */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5 text-blue-400" />
                                Export Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-400 text-sm">
                                Select exams to export results:
                            </p>

                            {availableExams.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No results found yet.</p>
                            ) : (
                                <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-800 rounded p-2">
                                    {availableExams.map((exam) => (
                                        <label key={exam.key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer hover:bg-slate-800/50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedExams.includes(exam.key)}
                                                onChange={() => toggleExamSelection(exam.key)}
                                                className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500/20"
                                            />
                                            {exam.year} - {exam.subject}
                                        </label>
                                    ))}
                                </div>
                            )}

                            <Button
                                onClick={handleExportMarkdown}
                                className="w-full"
                                variant="secondary"
                                disabled={selectedExams.length === 0}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Download Markdown Report
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                                Templates
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 mb-4 text-sm">
                                Download the Excel template to format your questions correctly.
                            </p>
                            <Button onClick={generateTemplate} className="w-full" variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Download Excel Template
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Archive className="h-5 w-5 text-amber-400" />
                                Archive Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-400 text-sm">
                                Manage exam visibility for students:
                            </p>

                            {allExams.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No exams found.</p>
                            ) : (
                                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-800 rounded p-2">
                                    {allExams.map((exam) => (
                                        <div key={exam.id} className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded">
                                            <span className="text-sm text-slate-300">
                                                {exam.year} - {exam.subject}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant={exam.status === 'Archived' ? 'secondary' : 'ghost'}
                                                className={exam.status === 'Archived' ? 'text-amber-400' : 'text-slate-400'}
                                                onClick={() => handleToggleArchive(exam.id)}
                                            >
                                                {exam.status === 'Archived' ? 'Archived' : 'Active'}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
