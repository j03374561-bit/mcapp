import * as XLSX from 'xlsx';
import { db } from './firebase.js';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';

// Fetch all exams (Firestore only)
export const fetchExams = async () => {
    console.log("Fetching exams (Firestore)...");
    try {
        // Get custom exams from Firestore
        const querySnapshot = await getDocs(collection(db, "exams"));
        const firestoreExams = [];
        querySnapshot.forEach((doc) => {
            firestoreExams.push(doc.data());
        });

        let mergedExams = [...firestoreExams];

        // Apply archive status
        const archivedIds = new Set(getArchivedExams());
        mergedExams = mergedExams.map(exam => ({
            ...exam,
            status: archivedIds.has(exam.id) ? 'Archived' : (exam.status || 'Available')
        }));

        return mergedExams.sort((a, b) => b.year - a.year);
    } catch (error) {
        console.error("Error fetching exams:", error);
        return [];
    }
};

// Fetch questions for a specific exam
export const fetchQuestionsForExam = async (examId) => {
    // Check Firestore
    try {
        const docRef = doc(db, "exams", examId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().questions || [];
        } else {
            console.log("No such exam!");
            return [];
        }
    } catch (error) {
        console.error("Error fetching questions:", error);
        return [];
    }
};

// Save exam to Firestore
export const saveExam = async (examId, examData) => {
    console.log(`Saving exam ${examId} to Firestore...`);
    try {
        await setDoc(doc(db, "exams", examId), examData);
        console.log("Exam saved successfully.");
        return true;
    } catch (error) {
        console.error("Error saving exam:", error);
        alert(`Error saving exam: ${error.message}`);
        return false;
    }
};

// Update Exam Metadata (Year, Subject)
export const updateExamMetadata = async (examId, metadata) => {
    try {
        const examRef = doc(db, "exams", examId);
        await updateDoc(examRef, metadata);
        return true;
    } catch (error) {
        console.error("Error updating exam metadata:", error);
        return false;
    }
};

// Delete exam
export const deleteExam = async (examId) => {
    // Delete from Firestore
    try {
        await deleteDoc(doc(db, "exams", examId));
        return true;
    } catch (error) {
        console.error("Error deleting exam:", error);
        return false;
    }
};

// Archive Management
const ARCHIVED_KEY = 'archived_exams';

export const getArchivedExams = () => {
    const stored = localStorage.getItem(ARCHIVED_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const toggleExamArchive = async (examId) => {
    const archived = getArchivedExams();
    const index = archived.indexOf(examId);

    if (index >= 0) {
        // Unarchive
        archived.splice(index, 1);
    } else {
        // Archive
        archived.push(examId);
    }

    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(archived));
    return true;
};

// Parse Excel file (unchanged logic, just helper)
export const parseExcelQuestions = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Transform flat JSON to structured format
                const structuredData = {};

                jsonData.forEach((row, index) => {
                    // Validate required fields
                    if (!row.Question || !row.OptionA || !row.CorrectAnswer) {
                        console.warn(`Skipping row ${index + 2}: Missing required fields`);
                        return;
                    }

                    const examId = row.ExamID || 'custom-exam';

                    if (!structuredData[examId]) {
                        structuredData[examId] = [];
                    }

                    structuredData[examId].push({
                        id: `q-${Date.now()}-${index}`,
                        text: row.Question,
                        options: [
                            { id: 'a', text: row.OptionA },
                            { id: 'b', text: row.OptionB },
                            { id: 'c', text: row.OptionC },
                            { id: 'd', text: row.OptionD },
                        ].filter(opt => opt.text), // Remove empty options
                        correctAnswer: row.CorrectAnswer.toLowerCase(),
                        explanation: row.Explanation || 'No explanation provided.',
                    });
                });

                resolve(structuredData);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

// Generate Template (unchanged)
export const generateTemplate = () => {
    const headers = [
        'ExamID', 'Question', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer', 'Explanation'
    ];

    const sampleData = [
        {
            ExamID: 'math-2024',
            Question: 'What is 2 + 2?',
            OptionA: '3',
            OptionB: '4',
            OptionC: '5',
            OptionD: '6',
            CorrectAnswer: 'b',
            Explanation: 'Basic arithmetic.'
        }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'question-upload-template.xlsx');
};
