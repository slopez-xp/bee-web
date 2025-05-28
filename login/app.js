function togglePassword() {
    const passwordInput = document.getElementById('password'); // Selecciona por ID
    const toggleBtn = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈'; 
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}