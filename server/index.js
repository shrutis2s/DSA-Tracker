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
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// 1. GET Request: Fetch questions AND notes
app.get('/api/questions/:userId', (req, res) => {
    const userId = req.params.userId;
    
    // We now select 'up.notes' as well
    const sql = `
        SELECT q.id, q.title, q.link, q.difficulty, q.topic, 
        up.notes,
        CASE WHEN up.completed_at IS NOT NULL THEN TRUE ELSE FALSE END AS isCompleted
        FROM questions q
        LEFT JOIN user_progress up ON q.id = up.question_id AND up.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).send('Database error');
        }
        res.json(results);
    });
});

// 2. POST Request: Toggle Completion (Updated to be Note-Safe)
app.post('/api/mark-complete', (req, res) => {
    const { userId, questionId } = req.body;

    const checkSql = "SELECT * FROM user_progress WHERE user_id = ? AND question_id = ?";
    
    db.query(checkSql, [userId, questionId], (err, data) => {
        if (err) return res.status(500).json(err);

        if (data.length > 0) {
            // Row exists. We toggle the 'completed_at' field only.
            // If it was completed, make it NULL (uncheck). If NULL, make it NOW() (check).
            const isCurrentlyCompleted = data[0].completed_at !== null;
            const newStatus = isCurrentlyCompleted ? null : new Date(); // Javascript Date object
            
            const updateSql = "UPDATE user_progress SET completed_at = ? WHERE user_id = ? AND question_id = ?";
            db.query(updateSql, [newStatus, userId, questionId], () => {
                res.json({ message: isCurrentlyCompleted ? "Unmarked" : "Marked" });
            });
        } else {
            // Row doesn't exist. Create it as completed.
            const insertSql = "INSERT INTO user_progress (user_id, question_id, completed_at) VALUES (?, ?, NOW())";
            db.query(insertSql, [userId, questionId], () => {
                res.json({ message: "Marked" });
            });
        }
    });
});

// 3. POST Request: Save Note (New Endpoint)
app.post('/api/save-note', (req, res) => {
    const { userId, questionId, note } = req.body;

    const checkSql = "SELECT * FROM user_progress WHERE user_id = ? AND question_id = ?";
    
    db.query(checkSql, [userId, questionId], (err, data) => {
        if (err) return res.status(500).json(err);

        if (data.length > 0) {
            // Row exists (maybe completed, maybe not). Just update the note.
            const updateSql = "UPDATE user_progress SET notes = ? WHERE user_id = ? AND question_id = ?";
            db.query(updateSql, [note, userId, questionId], () => {
                res.json({ message: "Note Updated" });
            });
        } else {
            // Row doesn't exist. Create it (Not completed, but has a note).
            const insertSql = "INSERT INTO user_progress (user_id, question_id, notes, completed_at) VALUES (?, ?, ?, NULL)";
            db.query(insertSql, [userId, questionId, note], () => {
                res.json({ message: "Note Created" });
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});