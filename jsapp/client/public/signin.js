document.addEventListener("DOMContentLoaded", function () {
    const signinForm = document.getElementById("signin-form");
    const fullNameInput = document.getElementById("full-name");
    const passwordInput = document.getElementById("password");
    const errorMessageDiv = document.getElementById("error-message");
    const successMessageDiv = document.getElementById("success-message");

    signinForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        errorMessageDiv.textContent = "";
        successMessageDiv.textContent = "";
        
        const fullName = fullNameInput.value;
        const password = passwordInput.value;

        if (!fullName || !password) {
            errorMessageDiv.textContent = "Please fill in all fields.";
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ full_name: fullName, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                successMessageDiv.textContent = "Sign-in successful!";
                localStorage.setItem("userEmail", data.email);
                setTimeout(() => {
                    window.location.href = "home.html";
                }, 1000);
            } else {
                throw new Error(data.message || "Invalid credentials. Please try again.");
            }
        } catch (error) {
            errorMessageDiv.textContent = error.message;
        }
    });
});
