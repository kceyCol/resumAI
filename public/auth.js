// Elementos do DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const authLoading = document.getElementById('authLoading');
const authMessage = document.getElementById('authMessage');
const messageContent = document.getElementById('messageContent');
const loadingMessage = document.getElementById('loadingMessage');

// Verificar se já está autenticado
checkAuthStatus();

// Event listeners
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
});

loginFormElement.addEventListener('submit', handleLogin);
registerFormElement.addEventListener('submit', handleRegister);

// Funções para alternar entre formulários
function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    hideMessage();
}

function showLoginForm() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    hideMessage();
}

// Função para mostrar loading
function showLoading(message = 'Processando...') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    authLoading.style.display = 'block';
    loadingMessage.textContent = message;
    hideMessage();
}

// Função para esconder loading
function hideLoading() {
    authLoading.style.display = 'none';
}

// Função para mostrar mensagem
function showMessage(message, type = 'error') {
    messageContent.textContent = message;
    messageContent.className = `message-content ${type}`;
    authMessage.style.display = 'block';
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 3000);
    }
}

// Função para esconder mensagem
function hideMessage() {
    authMessage.style.display = 'none';
}

// Função para verificar status de autenticação
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/status');
        const data = await response.json();
        
        if (data.authenticated) {
            // Usuário já está logado, redirecionar para a página principal
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
    }
}

// Função para lidar com login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Validações básicas
    if (!email || !password) {
        showMessage('Por favor, preencha todos os campos.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, insira um email válido.');
        return;
    }
    
    showLoading('Fazendo login...');
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            showMessage('Login realizado com sucesso! Redirecionando...', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            showLoginForm();
            showMessage(data.error || 'Erro ao fazer login.');
        }
    } catch (error) {
        hideLoading();
        showLoginForm();
        showMessage('Erro de conexão. Tente novamente.');
        console.error('Erro no login:', error);
    }
}

// Função para lidar com registro
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Validações básicas
    if (!name || !email || !password) {
        showMessage('Por favor, preencha todos os campos.');
        return;
    }
    
    if (name.length < 2) {
        showMessage('O nome deve ter pelo menos 2 caracteres.');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Por favor, insira um email válido.');
        return;
    }
    
    if (password.length < 6) {
        showMessage('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    
    showLoading('Criando conta...');
    
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        hideLoading();
        
        if (data.success) {
            showMessage('Conta criada com sucesso! Agora você pode fazer login.', 'success');
            setTimeout(() => {
                showLoginForm();
                // Preencher email no formulário de login
                document.getElementById('loginEmail').value = email;
            }, 2000);
        } else {
            showRegisterForm();
            showMessage(data.error || 'Erro ao criar conta.');
        }
    } catch (error) {
        hideLoading();
        showRegisterForm();
        showMessage('Erro de conexão. Tente novamente.');
        console.error('Erro no registro:', error);
    }
}

// Função para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Adicionar validação em tempo real
document.getElementById('registerEmail').addEventListener('blur', function() {
    const email = this.value;
    if (email && !isValidEmail(email)) {
        this.style.borderColor = '#dc3545';
    } else {
        this.style.borderColor = '#e1e5e9';
    }
});

document.getElementById('registerPassword').addEventListener('input', function() {
    const password = this.value;
    const small = this.nextElementSibling;
    
    if (password.length > 0 && password.length < 6) {
        this.style.borderColor = '#dc3545';
        small.style.color = '#dc3545';
        small.textContent = 'A senha deve ter pelo menos 6 caracteres';
    } else if (password.length >= 6) {
        this.style.borderColor = '#28a745';
        small.style.color = '#28a745';
        small.textContent = 'Senha válida';
    } else {
        this.style.borderColor = '#e1e5e9';
        small.style.color = '#888';
        small.textContent = 'Mínimo de 6 caracteres';
    }
});

// Adicionar funcionalidade de Enter para alternar entre campos
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        const form = activeElement.closest('form');
        
        if (form && activeElement.tagName === 'INPUT' && activeElement.type !== 'submit') {
            e.preventDefault();
            const inputs = Array.from(form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]'));
            const currentIndex = inputs.indexOf(activeElement);
            
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            } else {
                form.querySelector('button[type="submit"]').click();
            }
        }
    }
});