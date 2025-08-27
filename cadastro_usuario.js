document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const message = document.getElementById('message');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = registerForm.querySelector('#username').value;
        const password = registerForm.querySelector('#password').value;
        const level = registerForm.querySelector('#level').value;

        try {
            const response = await fetch('http://localhost:3000/users', { // Endereço corrigido
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, level }),
            });

            const result = await response.json();

            if (response.ok) {
                message.textContent = 'Usuário cadastrado com sucesso!';
                message.style.color = 'green';
                registerForm.reset();
            } else {
                message.textContent = result.error || 'Erro ao cadastrar usuário.';
                message.style.color = 'red';
            }
        } catch (error) {
            console.error('Erro:', error);
            message.textContent = 'Erro ao conectar com o servidor.';
            message.style.color = 'red';
        }
    });
});