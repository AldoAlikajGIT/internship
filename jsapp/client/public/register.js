document.addEventListener("DOMContentLoaded", function () {
    const registerButton = document.getElementById("register-btn");
    const fullNameInput = document.getElementById("full-name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorMessageDiv = document.getElementById("error-message");
    const successMessageDiv = document.getElementById("success-message");
  
    // Attach event listener to the register button
    registerButton.addEventListener("click", async function (event) {
      // Prevent the default action (form submission)
      event.preventDefault();
  
      // Reset error and success messages
      errorMessageDiv.textContent = "";
      successMessageDiv.textContent = "";
  
      const fullName = fullNameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;
  
      // Validation: Ensure all fields are filled out
      if (!fullName || !email || !password) {
        errorMessageDiv.textContent = "Please fill in all fields.";
        return;
      }
  
      try {
  
        // API call to register user
        const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            email: email,
            password: password,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Handle success
          successMessageDiv.textContent =
            "Registration successful! Please check your email for confirmation.";
            setTimeout(() => {
              window.location.href = "index.html";
            }, 2000);
        } else {
          // Handle error
          throw new Error(
            data.message || "Something went wrong. Please try again."
          );
        }
      } catch (error) {
        // Display error message
        errorMessageDiv.textContent = error.message;
      }
    });
  });
  
