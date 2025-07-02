const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'resumai-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Funções auxiliares para gerenciar usuários
const getUsersFilePath = () => path.join(__dirname, 'users.json');

const loadUsers = () => {
  try {
    const data = fs.readFileSync(getUsersFilePath(), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(getUsersFilePath(), JSON.stringify(users, null, 2));
};

const findUserByEmail = (email) => {
  const users = loadUsers();
  return users.find(user => user.email === email);
};

// Middleware de autenticação
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Acesso negado. Faça login para continuar.' });
  }
};

// Rota principal - redireciona para login se não autenticado
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

// Rota para página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para registro de usuário
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }
    
    // Verificar se o usuário já existe
    if (findUserByEmail(email)) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }
    
    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Criar novo usuário
    const users = loadUsers();
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    res.json({ success: true, message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    
    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    
    // Criar sessão
    req.session.userId = user.id;
    req.session.userName = user.name;
    
    res.json({ 
      success: true, 
      message: 'Login realizado com sucesso!',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ success: true, message: 'Logout realizado com sucesso!' });
  });
});

// Rota para verificar status de autenticação
app.get('/auth/status', (req, res) => {
  if (req.session.userId) {
    const user = loadUsers().find(u => u.id === req.session.userId);
    res.json({ 
      authenticated: true, 
      user: { id: user.id, name: user.name, email: user.email }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Rota para upload e processamento de PDF (protegida)
app.post('/upload', requireAuth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    // Ler e extrair texto do PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length === 0) {
      return res.status(400).json({ error: 'Não foi possível extrair texto do PDF' });
    }

    // Prompt para o Gemini Pro
    const prompt = `
Você é um assistente de IA especializado em analisar e resumir documentos técnicos e científicos. Analise o texto PDF fornecido e extraia as seguintes informações:

**PRIMEIRA PARTE - METADADOS DO DOCUMENTO:**
Extraia e identifique (quando disponível):
- **Título:** Título completo do documento
- **Autores:** Nome(s) do(s) autor(es)
- **Instituição/Afiliação:** Universidade, empresa ou instituição dos autores
- **Local de Publicação:** Cidade, país
- **Revista/Journal:** Nome da revista, periódico ou conferência
- **Volume:** Número do volume da publicação
- **Número/Issue:** Número da edição ou issue
- **Ano de Publicação:** Ano de publicação
- **Mês de Publicação:** Mês de publicação (se disponível)
- **Data de Recebimento:** Data em que o artigo foi recebido (Received)
- **Data de Aceitação:** Data em que o artigo foi aceito (Accepted)
- **Páginas:** Intervalo de páginas do artigo
- **DOI/ISBN:** Identificador digital (se disponível)
- **Palavras-chave:** Palavras-chave principais do documento

**SEGUNDA PARTE - RESUMO ESTRUTURADO:**
Gere um resumo conciso e informativo seguindo esta estrutura (se aplicável):
- **Introdução:** Tema principal e objetivo
- **Metodologia/Abordagem:** Métodos e técnicas utilizadas
- **Resultados/Descobertas Principais:** Achados relevantes e conclusões primárias
- **Discussão/Implicações:** Significado dos resultados, implicações e limitações
- **Conclusão:** Sumário dos pontos importantes e impacto geral

**Instruções de Formatação:**
- Use formato Markdown com títulos em negrito
- Para metadados não encontrados, use "Não identificado"
- Mantenha o resumo entre 300-500 palavras
- Use linguagem formal, clara e objetiva
- Procure especialmente por informações como "VOLUME 63 | NUMBER 3 | SEPTEMBER 2008 | Received, October 30, 2007. Accepted, April 21, 2008" no cabeçalho ou rodapé

**Texto do Documento:**
${pdfText}

**Formato de Saída Esperado:**
## METADADOS DO DOCUMENTO
**Título:** [título]
**Autores:** [autores]
**Instituição:** [instituição]
**Local:** [local]
**Revista/Journal:** [revista]
**Volume:** [volume]
**Número:** [número]
**Ano:** [ano]
**Mês:** [mês]
**Data de Recebimento:** [data recebimento]
**Data de Aceitação:** [data aceitação]
**Páginas:** [páginas]
**DOI/ISBN:** [doi]
**Palavras-chave:** [palavras-chave]

## RESUMO
[resumo estruturado conforme solicitado]`;

    // Gerar resumo com Gemini Pro
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // Limpar arquivo temporário
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      filename: req.file.originalname,
      summary: summary,
      textLength: pdfText.length
    });

  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    
    // Limpar arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor ao processar o PDF',
      details: error.message 
    });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' });
    }
  }
  
  if (error.message === 'Apenas arquivos PDF são permitidos!') {
    return res.status(400).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Certifique-se de configurar sua GEMINI_API_KEY no arquivo .env');
});