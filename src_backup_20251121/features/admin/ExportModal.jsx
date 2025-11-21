import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileSpreadsheet, FileText, X, CheckSquare, Square } from 'lucide-react';
import { getUniqueExamsFromResults, exportToExcel, exportToMarkdown } from '../../lib/resultsManager';
import { cn } from '../../lib/utils';

export function ExportModal({ onClose }) {
    const [exams, setExams] = useState([]);
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        const loadExams = async () => {
            const uniqueExams = await getUniqueExamsFromResults();
            setExams(uniqueExams);
            // Select all by default
            setSelected(uniqueExams.map(e => e.key));
        };
        loadExams();
    }, []);

    const toggleExam = (key) => {
        if (selected.includes(key)) {
            setSelected(selected.filter(k => k !== key));
        } else {
            setSelected([...selected, key]);
        }
    };

    const toggleAll = () => {
        if (selected.length === exams.length) {
            setSelected([]);
        } else {
            setSelected(exams.map(e => e.key));
        }
    };

    const handleExportExcel = async () => {
        if (selected.length === 0) return;
        await exportToExcel(selected);
        onClose();
    };

    const handleExportMarkdown = async () => {
        if (selected.length === 0) return;
        await exportToMarkdown(selected);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Export Results</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                        <span>Select exams to include:</span>
                        <button
                            onClick={toggleAll}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            {selected.length === exams.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {exams.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">No exam results found.</p>
                        ) : (
                            exams.map((exam) => (
                                <div
                                    key={exam.key}
                                    onClick={() => toggleExam(exam.key)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                        selected.includes(exam.key)
                                            ? "bg-indigo-500/10 border-indigo-500/50"
                                            : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                                    )}
                                >
                                    {selected.includes(exam.key) ? (
                                        <CheckSquare className="h-5 w-5 text-indigo-400" />
                                    ) : (
                                        <Square className="h-5 w-5 text-slate-600" />
                                    )}
                                    <div>
                                        <p className="font-medium text-slate-200">{exam.year} {exam.subject}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex gap-3">
                    <Button
                        className="flex-1"
                        variant="secondary"
                        onClick={handleExportExcel}
                        disabled={selected.length === 0}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                    <Button
                        className="flex-1"
                        variant="secondary"
                        onClick={handleExportMarkdown}
                        disabled={selected.length === 0}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Export MD
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
