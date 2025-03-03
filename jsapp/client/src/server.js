const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',  /* i have not added the correct information for privacy reasosn*/
    database: 'database'
});

db.connect(err => {
    if (err) {
        console.error('Database Connection Error:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// User Sign-in with role check
app.post('/signin', async (req, res) => {
    const { full_name, password } = req.body;

    if (!full_name || !password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    db.query('SELECT * FROM users WHERE full_name = ?', [full_name], async (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error." });
        if (results.length === 0) {
            return res.status(400).json({ success: false, message: "User not found. Please register first." });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password." });
        }

        res.json({ 
            success: true, 
            email: user.email, 
            role: user.role,  // ✅ Send role to frontend
            message: "Sign-in successful!" 
        });
    });
});

app.post("/register", async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Hash password (if using bcrypt)
        const bcrypt = require("bcrypt");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into MySQL
        const sql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [full_name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(201).json({ message: "User registered successfully" });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/book-appointment', (req, res) => {
    const { email, doctor, appointment_date, appointment_time } = req.body;

    // Ensure all fields are provided
    if (!email || !doctor || !appointment_date || !appointment_time) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Ensure user exists before allowing appointment booking
    db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: "User not found. Please sign in first." });
        }

        const userId = results[0].id;

        // Prevent double booking for the same doctor at the same time
        db.query('SELECT * FROM appointments WHERE doctor = ? AND appointment_date = ? AND appointment_time = ?',
            [doctor, appointment_date, appointment_time], (err, results) => {
                if (err) {
                    console.error("Database query error (double booking check):", err);
                    return res.status(500).json({ success: false, message: "Database error." });
                }

                if (results.length > 0) {
                    console.log("This time slot is already booked.");
                    return res.status(400).json({ success: false, message: "This time slot is already booked." });
                }

                // Insert the new appointment
                db.query('INSERT INTO appointments (user_id, doctor, appointment_date, appointment_time) VALUES (?, ?, ?, ?)', 
                    [userId, doctor, appointment_date, appointment_time], (err, result) => {
                        if (err) {
                            console.error("Database query error (inserting appointment):", err);
                            return res.status(500).json({ success: false, message: "Database error." });
                        }

                        console.log("Appointment booked successfully!");
                        res.json({ success: true, message: "Appointment confirmed!" });
                });
            });
    });
});

// Fetch Appointments
app.get('/admin/appointments', (req, res) => {
    const query = `
        SELECT users.full_name, users.email, appointments.doctor, appointments.appointment_date, appointments.appointment_time
        FROM appointments
        JOIN users ON appointments.user_id = users.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Database error fetching appointments:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        res.json({ success: true, appointments: results });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
