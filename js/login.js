document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Replace with your real auth
    if(username && password) {
        localStorage.setItem('loggedIn', 'true');
        alert('Login successful!');
        window.location.href = '/shop.html'; // or redirect back to last page
    } else {
        alert('Invalid credentials!');
    }
});
