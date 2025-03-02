document.addEventListener("DOMContentLoaded", function () {
    const doctorButtons = document.querySelectorAll(".doctor-btn");
    const appointmentSection = document.getElementById("appointment-selection");
    const appointmentDate = document.getElementById("appointment-date");
    const appointmentTime = document.getElementById("appointment-time");
    const confirmButton = document.getElementById("confirm-appointment");
    const appointmentMessage = document.getElementById("appointment-message");
    

    const statusText = document.getElementById("status-text");
    const logoutButton = document.getElementById("logout-btn");

    let selectedDoctor = "";
    let userFullName = localStorage.getItem("userFullName");
    let userEmail = localStorage.getItem("userEmail");

    // Check if user is logged in and update status
    function updateLoginStatus() {
        if (userEmail) {
            statusText.textContent = "Logged in as "+ userEmail;
            logoutButton.style.display = "block"; // Show logout button
        } else {
            statusText.textContent = "Logged out";
            logoutButton.style.display = "none"; // Hide logout button
        }
    }

    updateLoginStatus();

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("userEmail"); // Remove user session
        userEmail = null;
        updateLoginStatus();
        appointmentMessage.textContent = "You have logged out.";
    });

    doctorButtons.forEach(button => {
        button.addEventListener("click", function () {
            if (!userEmail) {
                appointmentMessage.textContent = "You must sign in first!";
                return;
            }

            selectedDoctor = this.dataset.doctor;
            appointmentSection.style.display = "block";
            generateAppointmentTimes();
        });
    });

    function generateAppointmentTimes() {
        appointmentTime.innerHTML = "";
        for (let hour = 9; hour <= 17; hour++) {
            let option = document.createElement("option");
            option.value = `${hour}:00`;
            option.textContent = `${hour}:00`;
            appointmentTime.appendChild(option);
        }
    }

    confirmButton.addEventListener("click", function () {
        userFullName = localStorage.getItem("userFullName");
        userEmail = localStorage.getItem("userEmail"); // Ensure we get the latest value

        if (!userEmail) {
            appointmentMessage.textContent = "You must sign in first.";
            return;
        }

        const date = appointmentDate.value;
        const time = appointmentTime.value;
        if (!date || !time) {
            appointmentMessage.textContent = "Please select a valid date and time.";
            return;
        }

        // Log the data before sending it
        console.log("Sending Appointment Data:");
        console.log({
            full_name: userFullName,
            email: userEmail,
            doctor: selectedDoctor,
            appointment_date: date,
            appointment_time: time
        });

        fetch("http://localhost:5000/book-appointment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                full_name: userFullName,
                email: userEmail,
                doctor: selectedDoctor,
                appointment_date: date,
                appointment_time: time
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                appointmentMessage.textContent = `Appointment confirmed with ${selectedDoctor} on ${date} at ${time}`;
            } else {
                appointmentMessage.textContent = "Error booking appointment. Try again.";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            appointmentMessage.textContent = "An error occurred. Please try again later.";
        });
    });
});
