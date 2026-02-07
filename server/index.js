//If you uncheck a box, we DELETE the row. (This is bad now, because it would delete your note too!)

// const express = require('express');
// const cors = require('cors');
// const db = require('./db');

// const app = express();
// const PORT = 3001;

// app.use(cors());
// app.use(express.json());

// // --- API ROUTES ---

// // 1. GET Request: Fetch all questions
// app.get('/api/questions/:userId', (req, res) => {
//     const userId = req.params.userId;
    
//     const sql = `
//         SELECT q.id, q.title, q.link, q.difficulty, q.topic,
//         CASE WHEN up.completed_at IS NOT NULL THEN TRUE ELSE FALSE END AS isCompleted
//         FROM questions q
//         LEFT JOIN user_progress up ON q.id = up.question_id AND up.user_id = ?
//     `;

//     db.query(sql, [userId], (err, results) => {
//         if (err) {
//             console.error("Database Error:", err); // Log error to terminal
//             return res.status(500).send('Database error');
//         }
//         res.json(results);
//     });
// });

// // 2. POST Request: Toggle status
// app.post('/api/mark-complete', (req, res) => {
//     const { userId, questionId } = req.body;

//     const checkSql = "SELECT * FROM user_progress WHERE user_id = ? AND question_id = ?";
    
//     db.query(checkSql, [userId, questionId], (err, data) => {
//         if (err) return res.status(500).json(err);

//         if (data.length > 0) {
//             const deleteSql = "DELETE FROM user_progress WHERE user_id = ? AND question_id = ?";
//             db.query(deleteSql, [userId, questionId], () => {
//                 res.json({ message: "Unmarked" });
//             });
//         } else {
//             const insertSql = "INSERT INTO user_progress (user_id, question_id) VALUES (?)";
//             db.query(insertSql, [[userId, questionId]], () => {
//                 res.json({ message: "Marked" });
//             });
//         }
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


//NEW: If you uncheck a box, we just update the completed_at date to NULL, but keep the row (and the note) alive.

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Import CORS
require('dotenv').config();

const db = require('./db');

const app = express();

// --- CRITICAL STEP: CORS MUST BE HERE (BEFORE ROUTES) ---
app.use(cors()); 
app.use(express.json()); 
// -------------------------------------------------------

const PORT = process.env.PORT || 3001;

// Test Route
app.get('/', (req, res) => {
    res.send("DSA Tracker Backend is Live!");
});

// Route to get questions for a user
app.get('/api/questions/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT q.id, q.title, q.link, q.difficulty, q.topic, q.sheet_name,
       COALESCE(up.completed_at IS NOT NULL, 0) as isCompleted,
       up.notes
        FROM questions q
        LEFT JOIN user_progress up ON q.id = up.question_id AND up.user_id = ?
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Database error");
        } else {
            res.send(result);
        }
    });
});

// Route to toggle completion status
app.post('/api/mark-complete', (req, res) => {
    const { userId, questionId } = req.body;

    // Check if already completed
    const checkSql = "SELECT * FROM user_progress WHERE user_id = ? AND question_id = ?";
    db.query(checkSql, [userId, questionId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error checking progress");
        }

        if (result.length > 0) {
            // If exists, delete it (unmark)
            const deleteSql = "DELETE FROM user_progress WHERE user_id = ? AND question_id = ?";
            db.query(deleteSql, [userId, questionId], (err) => {
                if (err) console.error(err);
                res.send("Unmarked");
            });
        } else {
            // If not exists, add it (mark done)
            const insertSql = "INSERT INTO user_progress (user_id, question_id) VALUES (?, ?)";
            db.query(insertSql, [userId, questionId], (err) => {
                if (err) console.error(err);
                res.send("Marked");
            });
        }
    });
});

// Route to save notes
app.post('/api/save-note', (req, res) => {
    const { userId, questionId, note } = req.body;

    const checkSql = "SELECT * FROM user_progress WHERE user_id = ? AND question_id = ?";
    db.query(checkSql, [userId, questionId], (err, result) => {
        if (err) return res.status(500).send("Error");

        if (result.length > 0) {
            // Update existing row
            const updateSql = "UPDATE user_progress SET notes = ? WHERE user_id = ? AND question_id = ?";
            db.query(updateSql, [note, userId, questionId], (err) => {
                if (err) return res.status(500).send("Error updating note");
                res.send("Note updated");
            });
        } else {
            // Insert new row if they haven't marked it complete yet but added a note
            const insertSql = "INSERT INTO user_progress (user_id, question_id, notes) VALUES (?, ?, ?)";
            db.query(insertSql, [userId, questionId, note], (err) => {
                if (err) return res.status(500).send("Error saving note");
                res.send("Note saved");
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});