import { db } from './firebase.js';
import { collection, getDocs, doc, setDoc, query, where, writeBatch } from 'firebase/firestore';
import * as XLSX from 'xlsx';


const USERS_COLLECTION = 'users';

// Authenticate user against Firestore (fallback to mock if empty/error)
export const authenticateUser = async (username, password) => {
    try {
        const q = query(collection(db, USERS_COLLECTION), where("username", "==", username));
        const querySnapshot = await getDocs(q);

        let user = null;
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.password === password) {
                    user = data;
                }
            });
        }

        // Failsafe: Always allow default admin if Firestore auth failed
        if (!user && username === 'admin' && password === 'admin123') {
            console.log("Using failsafe admin login");
            return { username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' };
        }

        return user;
    } catch (error) {
        console.error("Auth error:", error);
        // On error, allow default admin
        if (username === 'admin' && password === 'admin123') {
            return { username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' };
        }
        return null;
    }
};

// Parse Excel file for users
export const parseExcelUsers = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                console.log("Raw Excel Data:", jsonData); // Debug log

                if (!jsonData || jsonData.length === 0) {
                    throw new Error("Excel file appears to be empty");
                }

                // Helper to find key case-insensitively
                const getValue = (row, key) => {
                    const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
                    return foundKey ? row[foundKey] : undefined;
                };

                // Validate structure
                const users = jsonData.map(row => {
                    const username = getValue(row, 'username');
                    const password = getValue(row, 'password');
                    const name = getValue(row, 'name');
                    const role = getValue(row, 'role');

                    return {
                        username: username?.toString().trim(),
                        password: password?.toString().trim(),
                        name: name?.toString().trim() || '', // Default to empty string
                        role: role?.toString().toLowerCase().trim() || 'student'
                    };
                }).filter(u => u.username && u.password); // Filter invalid rows

                console.log("Parsed Users:", users); // Debug log
                resolve(users);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

// Save users to Firestore (Batch)
export const saveUsers = async (users) => {
    const batch = writeBatch(db);

    users.forEach(user => {
        const userRef = doc(db, USERS_COLLECTION, user.username);
        batch.set(userRef, user);
    });

    await batch.commit();
};

// Generate User Template
export const generateUserTemplate = () => {
    const headers = [['Username', 'Password', 'Name', 'Role']];
    const example = [['student101', 'pass123', 'Alice Chen', 'student'], ['admin2', 'securePass', 'Vice Principal', 'admin']];

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "user_import_template.xlsx");
};
