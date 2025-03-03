document.addEventListener("DOMContentLoaded", async function () {
    const tableBody = document.getElementById("appointments-list");

    // ✅ Check if user is an admin before loading the page
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
        alert("Access Denied: Admins only.");
        window.location.href = "home.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/admin/appointments");
        const data = await response.json();

        if (response.ok) {
            data.appointments.forEach(app => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${app.full_name}</td>
                    <td>${app.email}</td>
                    <td>${app.doctor}</td>
                    <td>${app.appointment_date}</td>
                    <td>${app.appointment_time}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            throw new Error(data.message || "Failed to fetch appointments.");
        }
    } catch (error) {
        console.error("Error fetching appointments:", error.message);
    }
});
