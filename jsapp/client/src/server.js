const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       
    password: 'Aldo17%',
    database: 'internship' 
});

db.connect(err => {
    if (err) {
        console.error(' Database Connection Error:', err);
        return;
    }
    console.log(' Connected to MySQL Database');
});

app.post('/register', async (req, res) => {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error." });
        if (results.length > 0) {
            return res.status(400).json({ success: false, message: "Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)', 
            [full_name, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ success: false, message: "Database error." });
                res.json({ success: true, message: "Registration successful!" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
