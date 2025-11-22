import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Upload, Download, Trash2, FileSpreadsheet, CheckCircle2, AlertCircle, FileText, Archive, Users, Pencil, X, Save } from 'lucide-react';
import { parseExcelQuestions, saveExam, generateTemplate, fetchExams, toggleExamArchive, updateExamMetadata } from '../../lib/questionManager';
import { getUniqueExamsFromResults, exportToMarkdown, exportToExcel, deleteResultsForExams } from '../../lib/resultsManager';
import { parseExcelUsers, saveUsers, generateUserTemplate } from '../../lib/userManager';

export function AdminUpload({ onBack }) {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [uploadedCount, setUploadedCount] = useState(0);

    // User Upload State
    const [uploadingUsers, setUploadingUsers] = useState(false);
    const [userMessage, setUserMessage] = useState(null);

    // Export state
    const [availableExams, setAvailableExams] = useState([]);
    const [selectedExams, setSelectedExams] = useState([]);

    // Archive & Edit state
    const [allExams, setAllExams] = useState([]);
    const [editingExam, setEditingExam] = useState(null);
    const [editForm, setEditForm] = useState({ year: '', subject: '' });

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

    const handleEditClick = (exam) => {
        setEditingExam(exam.id);
        setEditForm({ year: exam.year, subject: exam.subject });
    };

    const handleSaveEdit = async () => {
        if (!editingExam) return;

        const success = await updateExamMetadata(editingExam, {
            year: parseInt(editForm.year),
            subject: editForm.subject
        });

        if (success) {
            setEditingExam(null);
            loadData();
        } else {
            alert("Failed to update exam.");
        }
    };

    const handleCancelEdit = () => {
        setEditingExam(null);
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
                loadData(); // Refresh list to show new exams
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to parse or upload file. Please check the format.' });
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleUserUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingUsers(true);
        setUserMessage(null);

        try {
            const users = await parseExcelUsers(file);
            if (users.length === 0) {
                setUserMessage({ type: 'error', text: 'No valid users found.' });
            } else {
                await saveUsers(users);
                setUserMessage({ type: 'success', text: `Successfully imported ${users.length} users!` });
            }
        } catch (error) {
            console.error(error);
            setUserMessage({ type: 'error', text: `Failed: ${error.message || 'Check file format'}` });
        } finally {
            setUploadingUsers(false);
            e.target.value = '';
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

    const handleExportExcel = async () => {
        if (selectedExams.length === 0) {
            alert("Please select at least one exam to export.");
            return;
        }
        await exportToExcel(selectedExams);
    };

    const handleDeleteResults = async () => {
        if (selectedExams.length === 0) {
            alert("Please select at least one exam to delete results for.");
            return;
        }

        if (window.confirm(`Are you sure you want to PERMANENTLY delete results for ${selectedExams.length} selected exam(s)? This cannot be undone.`)) {
            try {
                const count = await deleteResultsForExams(selectedExams);
                alert(`Successfully deleted ${count} result records.`);
                setSelectedExams([]); // Clear selection
                loadData(); // Refresh list
            } catch (error) {
                alert("Failed to delete results: " + error.message);
            }
        }
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
                <div className="space-y-6">
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

                    {/* User Management Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-pink-400" />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-6 border-2 border-dashed border-slate-700 rounded-xl hover:border-pink-500/50 transition-colors text-center">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleUserUpload}
                                    className="hidden"
                                    id="user-upload"
                                    disabled={uploadingUsers}
                                />
                                <label
                                    htmlFor="user-upload"
                                    className="cursor-pointer flex flex-col items-center gap-3"
                                >
                                    <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-200">
                                            {uploadingUsers ? 'Importing...' : 'Upload User List'}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">Excel with Username, Password, Name, Role</p>
                                    </div>
                                </label>
                            </div>

                            <Button onClick={generateUserTemplate} className="w-full" variant="outline" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download User Template
                            </Button>

                            {userMessage && (
                                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${userMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
                                    }`}>
                                    {userMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    {userMessage.text}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

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

                            <div className="grid grid-cols-1 gap-2">
                                <Button
                                    onClick={handleExportMarkdown}
                                    className="w-full"
                                    variant="secondary"
                                    disabled={selectedExams.length === 0}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Download Markdown Report
                                </Button>
                                <Button
                                    onClick={handleExportExcel}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    variant="default"
                                    disabled={selectedExams.length === 0}
                                >
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Download Excel Report
                                </Button>
                                <Button
                                    onClick={handleDeleteResults}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
                                    variant="default"
                                    disabled={selectedExams.length === 0}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Results
                                </Button>
                            </div>
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
                                        <div key={exam.id} className="flex items-center justify-between p-2 hover:bg-slate-800/50 rounded group">
                                            {editingExam === exam.id ? (
                                                <div className="flex items-center gap-2 w-full">
                                                    <Input
                                                        value={editForm.year}
                                                        onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                                        className="w-20 h-8 text-xs"
                                                    />
                                                    <Input
                                                        value={editForm.subject}
                                                        onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                                        className="flex-1 h-8 text-xs"
                                                    />
                                                    <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8 p-0 text-emerald-400">
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 p-0 text-red-400">
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-slate-300">
                                                            {exam.year} - {exam.subject}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 w-6 p-0 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-400"
                                                            onClick={() => handleEditClick(exam)}
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant={exam.status === 'Archived' ? 'secondary' : 'ghost'}
                                                        className={exam.status === 'Archived' ? 'text-amber-400' : 'text-slate-400'}
                                                        onClick={() => handleToggleArchive(exam.id)}
                                                    >
                                                        {exam.status === 'Archived' ? 'Archived' : 'Active'}
                                                    </Button>
                                                </>
                                            )}
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
