export const EXAMS = [
    { id: '2024', year: 2024, subject: 'Mathematics', status: 'Available', totalQuestions: 50 },
    { id: '2023', year: 2023, subject: 'Mathematics', status: 'Available', totalQuestions: 50 },
    { id: '2022', year: 2022, subject: 'Mathematics', status: 'Available', totalQuestions: 50 },
    { id: '2021', year: 2021, subject: 'Mathematics', status: 'Available', totalQuestions: 50 },
    { id: '2020', year: 2020, subject: 'Mathematics', status: 'Archived', totalQuestions: 50 },
    { id: '2019', year: 2019, subject: 'Mathematics', status: 'Archived', totalQuestions: 50 },
];

export const QUESTIONS = {
    '2024': [
        {
            id: 1,
            text: "Which of the following is a prime number?",
            options: [
                { id: 'a', text: "15" },
                { id: 'b', text: "21" },
                { id: 'c', text: "29" },
                { id: 'd', text: "33" }
            ],
            correctAnswer: 'c',
            explanation: "29 is a prime number because it has only two factors: 1 and itself."
        },
        {
            id: 2,
            text: "Solve for x: 2x + 5 = 15",
            options: [
                { id: 'a', text: "5" },
                { id: 'b', text: "10" },
                { id: 'c', text: "7.5" },
                { id: 'd', text: "2.5" }
            ],
            correctAnswer: 'a',
            explanation: "2x = 10, so x = 5."
        },
        {
            id: 3,
            text: "What is the area of a circle with radius 3?",
            options: [
                { id: 'a', text: "6π" },
                { id: 'b', text: "9π" },
                { id: 'c', text: "3π" },
                { id: 'd', text: "1.5π" }
            ],
            correctAnswer: 'b',
            explanation: "Area = πr². 3² = 9, so Area = 9π."
        },
        {
            id: 4,
            text: "What is 15% of 200?",
            options: [
                { id: 'a', text: "30" },
                { id: 'b', text: "15" },
                { id: 'c', text: "25" },
                { id: 'd', text: "35" }
            ],
            correctAnswer: 'a',
            explanation: "15% of 200 = 0.15 × 200 = 30."
        },
        {
            id: 5,
            text: "If a triangle has sides 3, 4, and 5, what type is it?",
            options: [
                { id: 'a', text: "Equilateral" },
                { id: 'b', text: "Isosceles" },
                { id: 'c', text: "Right Triangle" },
                { id: 'd', text: "Obtuse" }
            ],
            correctAnswer: 'c',
            explanation: "Since 3² + 4² = 9 + 16 = 25 = 5², this is a right triangle (Pythagorean theorem)."
        }
    ],
    '2023': [
        {
            id: 1,
            text: "What is the value of √64?",
            options: [
                { id: 'a', text: "6" },
                { id: 'b', text: "7" },
                { id: 'c', text: "8" },
                { id: 'd', text: "9" }
            ],
            correctAnswer: 'c',
            explanation: "√64 = 8 because 8 × 8 = 64."
        },
        {
            id: 2,
            text: "Simplify: 3x + 2x - x",
            options: [
                { id: 'a', text: "4x" },
                { id: 'b', text: "5x" },
                { id: 'c', text: "6x" },
                { id: 'd', text: "x" }
            ],
            correctAnswer: 'a',
            explanation: "3x + 2x - x = (3 + 2 - 1)x = 4x."
        },
        {
            id: 3,
            text: "What is the perimeter of a square with side length 7?",
            options: [
                { id: 'a', text: "14" },
                { id: 'b', text: "21" },
                { id: 'c', text: "28" },
                { id: 'd', text: "49" }
            ],
            correctAnswer: 'c',
            explanation: "Perimeter of a square = 4 × side = 4 × 7 = 28."
        }
    ]
};

// User accounts for login
export const USERS = [
    { username: 'student1', password: 'pass123', name: 'John Doe', role: 'student' },
    { username: 'student2', password: 'pass456', name: 'Jane Smith', role: 'student' },
    { username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
];
