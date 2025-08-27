document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const message = document.getElementById('message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = loginForm.querySelector('#username').value;
        const password = loginForm.querySelector('#password').value;

        try {
            // Busca todos os usuários na API
            const response = await fetch('http://localhost:3000/users');
            const users = await response.json();

            // Encontra o usuário com o username e a senha corretos
            const foundUser = users.find(user => user.username === username && user.password === password);

            if (foundUser) {
                message.textContent = 'Login bem-sucedido!';
                message.style.color = 'green';
                
                // Redireciona com base no nível do usuário
                if (foundUser.level === 'administrador') {
                    window.location.href = 'agenda_admin.html';
                } else if (foundUser.level === 'usuario_simples') {
                    window.location.href = 'agenda_publica.html';
                }
            } else {
                message.textContent = 'Usuário ou senha inválidos.';
                message.style.color = 'red';
            }
        } catch (error) {
            console.error('Erro:', error);
            message.textContent = 'Erro ao conectar com o servidor.';
            message.style.color = 'red';
        }
    });
});