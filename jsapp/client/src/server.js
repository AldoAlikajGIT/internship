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
    user: 'root',
    password: 'Aldo17%', 
    database: 'internship'
});

db.connect(err => {
    if (err) {
        console.error('Database Connection Error:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// User Sign-in
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

        res.json({ success: true, email: user.email, message: "Sign-in successful!" });
    });
});

app.post('/book-appointment', (req, res) => {
    const { email, full_name, doctor, appointment_date, appointment_time } = req.body;

    // Log incoming data for debugging
    console.log("Received appointment request:");
    console.log("Email:", email);
    console.log("Doctor:", doctor);
    console.log("Appointment Date:", appointment_date);
    console.log("Appointment Time:", appointment_time);

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


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
