import * as XLSX from 'xlsx';

// import { db } from './firebase.js';
// import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const COLLECTION_NAME = 'exam_results';

// Save a new result to LocalStorage
export const saveResult = async (result) => {
    try {
        const newResult = {
            ...result,
            id: `result-${Date.now()}`,
            timestamp: new Date().toISOString(),
        };

        const storedResults = localStorage.getItem(COLLECTION_NAME);
        const results = storedResults ? JSON.parse(storedResults) : [];
        results.push(newResult);

        localStorage.setItem(COLLECTION_NAME, JSON.stringify(results));
        console.log("Result saved locally.");
        return newResult;
    } catch (e) {
        console.error("Error saving result locally: ", e);
        throw e;
    }
};

// Get all results from LocalStorage
export const getAllResults = async () => {
    try {
        const storedResults = localStorage.getItem(COLLECTION_NAME);
        const results = storedResults ? JSON.parse(storedResults) : [];
        // Sort by timestamp desc
        return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) {
        console.error("Error getting local results: ", e);
        return [];
    }
};

// Clear all results
export const clearAllResults = async () => {
    localStorage.removeItem(COLLECTION_NAME);
    console.log("All results cleared from local storage.");
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

    // Prepare data for Excel
    const excelData = results.map((result, index) => ({
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
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet['!cols'] = [
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

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exam Results');

    // Generate Excel file
    const fileName = `all-exam-results-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
};

// Export single result to Excel
export const exportSingleResultToExcel = (result) => {
    const excelData = [{
        'Student Name': result.userName || 'Anonymous',
        'Exam Year': result.examYear,
        'Subject': result.subject,
        'Score': result.score,
        'Total Questions': result.totalQuestions,
        'Percentage': `${result.percentage}%`,
        'Status': result.percentage >= 50 ? 'Pass' : 'Fail',
        'Date': new Date().toLocaleString(),
    }];

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet['!cols'] = [
        { wch: 20 }, // Student Name
        { wch: 12 }, // Exam Year
        { wch: 15 }, // Subject
        { wch: 8 },  // Score
        { wch: 15 }, // Total Questions
        { wch: 12 }, // Percentage
        { wch: 10 }, // Status
        { wch: 20 }, // Date
    ];

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
    content += `| No. | Student Name | Exam Year | Subject | Score | Percentage | Status | Date |\n`;
    content += `|---|---|---|---|---|---|---|---|\n`;

    results.forEach((result, index) => {
        const status = result.percentage >= 70 ? 'Pass' : result.percentage >= 50 ? 'Fair' : 'Fail';
        const statusIcon = result.percentage >= 50 ? '✅' : '❌';

        content += `| ${index + 1} | ${result.userName} | ${result.examYear} | ${result.subject} | ${result.score}/${result.totalQuestions} | ${result.percentage}% | ${statusIcon} ${status} | ${new Date(result.timestamp).toLocaleString()} |\n`;
    });

    content += `\n---\n*Total Records: ${results.length}*`;

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
