import * as XLSX from 'xlsx';

import { db } from './firebase.js';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, writeBatch, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'exam_results';

// Save a new result to Firestore
export const saveResult = async (result) => {
    try {
        const newResult = {
            ...result,
            timestamp: new Date().toISOString(),
        };

        await addDoc(collection(db, COLLECTION_NAME), newResult);
        console.log("Result saved to Firestore.");
        return newResult;
    } catch (e) {
        console.error("Error saving result to Firestore: ", e);
        throw e;
    }
};

// Get all results from Firestore
export const getAllResults = async () => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const results = [];
        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });

        return results;
    } catch (e) {
        console.error("Error getting results from Firestore: ", e);
        return [];
    }
};

// Clear all results (Not implemented for Firestore for safety)
export const clearAllResults = async () => {
    console.warn("Clear all results not implemented for Firestore");
};

// Delete results for specific exams
export const deleteResultsForExams = async (examKeys) => {
    if (!examKeys || examKeys.length === 0) return 0;

    let deletedCount = 0;
    const batch = writeBatch(db);
    let batchCount = 0;

    try {
        // Since we can't easily do a generic "OR" query for composite keys, 
        // we'll fetch all and filter, or query one by one. 
        // Querying one by one is safer for large datasets.

        for (const key of examKeys) {
            const [year, subject] = key.split('-');
            const q = query(
                collection(db, COLLECTION_NAME),
                where("examYear", "==", parseInt(year)),
                where("subject", "==", subject)
            );

            const snapshot = await getDocs(q);
            snapshot.forEach((document) => {
                batch.delete(doc(db, COLLECTION_NAME, document.id));
                batchCount++;
                deletedCount++;
            });
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        return deletedCount;
    } catch (error) {
        console.error("Error deleting results:", error);
        throw error;
    }
};

// Export results to Excel
export const exportToExcel = async (selectedExams = null) => {
    let results = await getAllResults();

    // Filter if selectedExams is provided
    if (selectedExams && selectedExams.length > 0) {
        results = results.filter(r => {
            const examKey = `${r.examYear}-${r.subject}`;
            return selectedExams.includes(examKey);
        });
    }

    if (results.length === 0) {
        alert('No results to export!');
        return;
    }

    // Determine max number of questions to set up dynamic columns
    let maxQuestions = 0;
    results.forEach(r => {
        if (r.totalQuestions > maxQuestions) maxQuestions = r.totalQuestions;
    });

    // Prepare data for Excel
    const excelData = results.map((result, index) => {
        const row = {
            'No.': index + 1,
            'Student Name': result.userName,
            'Exam Year': result.examYear,
            'Subject': result.subject,
            'Score': result.score,
            'Total Questions': result.totalQuestions,
            'Percentage': `${result.percentage}%`,
            'Status': result.percentage >= 70 ? 'Pass' : result.percentage >= 50 ? 'Fair' : 'Fail',
            'Date': new Date(result.timestamp).toLocaleString(),
            'Duration (min)': result.duration || 'N/A'
        };

        // Add detailed answers if available
        if (result.details) {
            // Since details is an object keyed by index, we can just access it directly
            for (let i = 0; i < maxQuestions; i++) {
                const detail = result.details[i];
                if (detail) {
                    const answerText = detail.selectedText ? `: ${detail.selectedText}` : '';

                    row[`Q${i + 1} Answer`] = detail.selected ? `${detail.selected.toUpperCase()}${answerText}` : '-';
                } else {
                    row[`Q${i + 1} Answer`] = '-';
                }
            }
        }

        return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const cols = [
        { wch: 5 },  // No.
        { wch: 20 }, // Student Name
        { wch: 12 }, // Exam Year
        { wch: 15 }, // Subject
        { wch: 8 },  // Score
        { wch: 15 }, // Total Questions
        { wch: 12 }, // Percentage
        { wch: 10 }, // Status
        { wch: 20 }, // Date
        { wch: 12 }, // Duration
    ];

    // Add widths for dynamic columns - wider for text
    for (let i = 0; i < maxQuestions; i++) {
        cols.push({ wch: 30 }); // Answer
    }

    worksheet['!cols'] = cols;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exam Results');

    // Generate Excel file
    const fileName = `all-exam-results-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
};

// Export single result to Excel
export const exportSingleResultToExcel = (result) => {
    const row = {
        'Student Name': result.userName || 'Anonymous',
        'Exam Year': result.examYear,
        'Subject': result.subject,
        'Score': result.score,
        'Total Questions': result.totalQuestions,
        'Percentage': `${result.percentage}%`,
        'Status': result.percentage >= 50 ? 'Pass' : 'Fail',
        'Date': new Date().toLocaleString(),
    };

    // Add detailed answers if available
    if (result.details) {
        const maxQuestions = result.totalQuestions;
        for (let i = 0; i < maxQuestions; i++) {
            const detail = result.details[i];
            if (detail) {
                const answerText = detail.selectedText ? `: ${detail.selectedText}` : '';
                const correctText = detail.correctText ? `: ${detail.correctText}` : '';

                row[`Q${i + 1} Answer`] = detail.selected ? `${detail.selected.toUpperCase()}${answerText}` : '-';
                row[`Q${i + 1} Correct`] = detail.correct ? `${detail.correct.toUpperCase()}${correctText}` : '-';
            } else {
                row[`Q${i + 1} Answer`] = '-';
                row[`Q${i + 1} Correct`] = '-';
            }
        }
    }

    const excelData = [row];

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const cols = [
        { wch: 20 }, // Student Name
        { wch: 12 }, // Exam Year
        { wch: 15 }, // Subject
        { wch: 8 },  // Score
        { wch: 15 }, // Total Questions
        { wch: 12 }, // Percentage
        { wch: 10 }, // Status
        { wch: 20 }, // Date
    ];

    // Add widths for dynamic columns
    if (result.details) {
        for (let i = 0; i < result.totalQuestions; i++) {
            cols.push({ wch: 30 }); // Answer
            cols.push({ wch: 30 }); // Correct
        }
    }

    worksheet['!cols'] = cols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Result');

    const fileName = `exam-result-${result.examYear}-${result.userName || 'student'}-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
};

// Export results to Markdown
export const exportToMarkdown = async (selectedExams = null) => {
    let results = await getAllResults();

    // Filter if selectedExams is provided
    if (selectedExams && selectedExams.length > 0) {
        results = results.filter(r => {
            const examKey = `${r.examYear}-${r.subject}`;
            return selectedExams.includes(examKey);
        });
    }

    if (results.length === 0) {
        alert('No results to export!');
        return;
    }

    let content = `# All Exam Results Report\n`;
    content += `**Generated Date:** ${new Date().toLocaleString()}\n\n`;

    results.forEach((result, index) => {
        const status = result.percentage >= 70 ? 'Pass' : result.percentage >= 50 ? 'Fair' : 'Fail';
        const statusIcon = result.percentage >= 50 ? '✅' : '❌';

        content += `## ${index + 1}. ${result.userName} - ${result.examYear} ${result.subject}\n`;
        content += `- **Score:** ${result.score}/${result.totalQuestions} (${result.percentage}%)\n`;
        content += `- **Status:** ${statusIcon} ${status}\n`;
        content += `- **Date:** ${new Date(result.timestamp).toLocaleString()}\n\n`;

        if (result.details) {
            content += `### Question Breakdown\n`;
            content += `| Q# | Question | Your Answer | Status |\n`;
            content += `|---|---|---|---|\n`;

            // Iterate through details
            // Assuming details is object { 0: {...}, 1: {...} }
            const maxQ = result.totalQuestions || 0;
            for (let i = 0; i < maxQ; i++) {
                const detail = result.details[i];
                if (detail) {
                    const icon = detail.isCorrect ? '✅' : '❌';
                    const qText = detail.questionText ? detail.questionText.replace(/\|/g, '-') : '-';
                    const aText = detail.selectedText ? ` (${detail.selectedText})` : '';

                    content += `| ${i + 1} | ${qText} | ${detail.selected ? detail.selected.toUpperCase() + aText : '-'} | ${icon} |\n`;
                }
            }
            content += `\n`;
        } else {
            content += `*Detailed answers not available for this record.*\n\n`;
        }
        content += `---\n\n`;
    });

    content += `\n*Total Records: ${results.length}*`;

    // Create download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-exam-results-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
};

// Get results count
export const getResultsCount = async () => {
    const results = await getAllResults();
    return results.length;
};

// Get results by user
export const getResultsByUser = async (userName) => {
    const results = await getAllResults();
    return results.filter(r => r.userName === userName);
};

// Get unique exams from results for filtering
export const getUniqueExamsFromResults = async () => {
    const results = await getAllResults();
    const exams = new Set();

    results.forEach(r => {
        exams.add(`${r.examYear}-${r.subject}`);
    });

    return Array.from(exams).map(key => {
        const [year, subject] = key.split('-');
        return { year, subject, key };
    }).sort((a, b) => b.year - a.year);
};
