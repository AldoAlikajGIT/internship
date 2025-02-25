document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const full_name = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!full_name || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/register', {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password })
        });

        const data = await response.json();
        alert(data.message); 

        if (data.success) {
            window.location.href = '/index.html';  
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred. Please try again.");
    }
});
