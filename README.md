# EstudAI - Resumidor de PDFs com IA

Uma aplicação web moderna que utiliza a API do Gemini Pro para gerar resumos inteligentes de documentos PDF.

## 🚀 Funcionalidades

- **Upload de PDFs**: Interface drag-and-drop intuitiva
- **Processamento Inteligente**: Extração automática de texto dos PDFs
- **Resumos com IA**: Geração de resumos estruturados usando Gemini Pro
- **Interface Moderna**: Design responsivo e user-friendly
- **Download e Cópia**: Facilidade para salvar e compartilhar resumos

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Chave da API do Google Gemini Pro

## 🛠️ Instalação

1. **Clone ou baixe o projeto**
   ```bash
   cd estudaAI
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure a API do Gemini Pro**
   - Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crie uma nova chave de API
   - Edite o arquivo `.env` e substitua `sua_chave_api_aqui` pela sua chave:
   ```
   GEMINI_API_KEY=sua_chave_real_aqui
   PORT=3000
   ```

4. **Inicie o servidor**
   ```bash
   npm start
   ```

5. **Acesse a aplicação**
   - Abra seu navegador e vá para: `http://localhost:3000`

## 📖 Como Usar

1. **Upload do PDF**
   - Arraste e solte um arquivo PDF na área de upload
   - Ou clique para selecionar um arquivo
   - Arquivos suportados: PDF (máximo 10MB)

2. **Processamento**
   - Clique em "Gerar Resumo"
   - Aguarde o processamento (pode levar alguns segundos)

3. **Resultado**
   - Visualize o resumo estruturado
   - Copie para área de transferência
   - Baixe como arquivo Markdown

## 🏗️ Estrutura do Projeto

```
estudaAI/
├── public/
│   ├── index.html      # Interface principal
│   ├── style.css       # Estilos da aplicação
│   └── script.js       # Lógica do frontend
├── uploads/            # Pasta temporária para PDFs
├── server.js           # Servidor Express
├── package.json        # Dependências do projeto
├── .env               # Configurações (API keys)
└── README.md          # Este arquivo
```

## 🔧 Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **IA**: Google Gemini Pro API
- **Upload**: Multer
- **PDF**: pdf-parse
- **Ambiente**: dotenv

## 📝 Formato do Resumo

Os resumos são estruturados nas seguintes seções:

- **Introdução**: Tema principal e objetivo
- **Metodologia/Abordagem**: Métodos e técnicas utilizadas
- **Resultados/Descobertas Principais**: Achados relevantes
- **Discussão/Implicações**: Significado e limitações
- **Conclusão**: Sumário e impacto geral

## ⚠️ Limitações

- Arquivos PDF máximo de 10MB
- Apenas arquivos PDF são suportados
- Requer conexão com internet para API do Gemini
- PDFs com texto não extraível podem não funcionar

## 🔒 Segurança

- Arquivos são processados temporariamente e removidos após o processamento
- Chaves de API são armazenadas em variáveis de ambiente
- Validação de tipo e tamanho de arquivo

## 🐛 Solução de Problemas

### Erro: "Chave de API inválida"
- Verifique se a chave do Gemini Pro está correta no arquivo `.env`
- Certifique-se de que a API está ativa no Google Cloud Console

### Erro: "Não foi possível extrair texto do PDF"
- O PDF pode estar protegido ou ser uma imagem
- Tente converter o PDF para um formato com texto selecionável

### Erro: "Arquivo muito grande"
- Reduza o tamanho do PDF (máximo 10MB)
- Comprima o arquivo ou divida em partes menores

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Enviar pull requests

---

**Desenvolvido com ❤️ usando Gemini Pro AI**