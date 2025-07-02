class PDFProcessor {
    constructor() {
        this.selectedFile = null;
        this.currentSummary = '';
        this.currentFilename = '';
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkAuthStatus();
    }

    initializeElements() {
        // Elementos principais
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.removeFile = document.getElementById('removeFile');
        this.processBtn = document.getElementById('processBtn');
        
        // Estados da aplicação
        this.loading = document.getElementById('loading');
        this.resultSection = document.getElementById('resultSection');
        this.resultContent = document.getElementById('resultContent');
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Elementos de progresso
        this.loadingText = document.getElementById('loadingText');
        this.progressFill = document.getElementById('progressFill');
        this.step1 = document.getElementById('step1');
        this.step2 = document.getElementById('step2');
        this.step3 = document.getElementById('step3');
        this.step4 = document.getElementById('step4');
        
        // Botões de ação
        this.copyBtn = document.getElementById('copyBtn');
        this.exportPdfBtn = document.getElementById('exportPdfBtn');
        this.exportDocxBtn = document.getElementById('exportDocxBtn');
        this.exportCitationBtn = document.getElementById('exportCitationBtn');
        this.newUploadBtn = document.getElementById('newUploadBtn');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Dropdown de citação
        this.exportEndnote = document.getElementById('exportEndnote');
        this.exportRis = document.getElementById('exportRis');
        
        // Elementos de autenticação
        this.userName = document.getElementById('userName');
        this.logoutBtn = document.getElementById('logoutBtn');
    }

    attachEventListeners() {
        // Upload events
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', () => {
                this.fileInput.click();
            });
        }
        
        if (this.uploadBtn) {
            this.uploadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.fileInput.click();
            });
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e);
            });
        }
        
        // Drag and drop
        this.uploadArea?.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea?.addEventListener('drop', (e) => this.handleDrop(e));
        
        // File management
        this.removeFile?.addEventListener('click', () => this.removeSelectedFile());
        this.processBtn?.addEventListener('click', () => this.processFile());
        
        // Result actions
        this.copyBtn?.addEventListener('click', () => this.copyToClipboard());
        this.exportPdfBtn?.addEventListener('click', () => this.exportToPdf());
        this.exportDocxBtn?.addEventListener('click', () => this.exportToDocx());
        this.exportCitationBtn?.addEventListener('click', () => this.toggleCitationDropdown());
        
        // Citation exports
        this.exportEndnote?.addEventListener('click', (e) => this.exportCitation(e, 'endnote'));
        this.exportRis?.addEventListener('click', (e) => this.exportCitation(e, 'ris'));
        
        // Navigation
        this.newUploadBtn?.addEventListener('click', () => this.resetApp());
        this.retryBtn?.addEventListener('click', () => this.resetToUpload());
        
        // Authentication
        this.logoutBtn?.addEventListener('click', () => this.handleLogout());
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    // Drag and Drop handlers
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    // File handling
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        // Validate file type
        if (file.type !== 'application/pdf') {
            this.showError('Por favor, selecione apenas arquivos PDF.');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('O arquivo é muito grande. Máximo permitido: 10MB.');
            return;
        }

        this.selectedFile = file;
        this.showFileInfo(file);
    }

    showFileInfo(file) {
        this.fileName.textContent = file.name;
        this.uploadArea.style.display = 'none';
        this.fileInfo.style.display = 'block';
        this.hideError();
    }

    removeSelectedFile() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.uploadArea.style.display = 'block';
        this.fileInfo.style.display = 'none';
    }

    // Progress control methods
    updateProgress(step, percentage, message) {
        // Atualiza a barra de progresso
        this.progressFill.style.width = percentage + '%';
        
        // Atualiza o texto de loading
        this.loadingText.textContent = message;
        
        // Remove classes anteriores
        [this.step1, this.step2, this.step3, this.step4].forEach(stepEl => {
            stepEl.classList.remove('active', 'completed');
        });
        
        // Marca etapas completadas
        for (let i = 1; i < step; i++) {
            this[`step${i}`].classList.add('completed');
        }
        
        // Marca etapa atual
        if (step <= 4) {
            this[`step${step}`].classList.add('active');
        }
    }
    
    resetProgress() {
        this.progressFill.style.width = '0%';
        this.loadingText.textContent = 'Processando seu PDF e gerando resumo...';
        [this.step1, this.step2, this.step3, this.step4].forEach(stepEl => {
            stepEl.classList.remove('active', 'completed');
        });
    }

    // File processing
    async processFile() {
        if (!this.selectedFile) {
            this.showError('Nenhum arquivo selecionado.');
            return;
        }

        this.showLoading();
        this.resetProgress();
        
        // Etapa 1: Upload
        this.updateProgress(1, 10, 'Fazendo upload do arquivo...');
        await this.delay(500);

        const formData = new FormData();
        formData.append('pdf', this.selectedFile);

        try {
            // Etapa 2: Enviando para o servidor
            this.updateProgress(2, 30, 'Extraindo texto do PDF...');
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            // Etapa 3: Processando
            this.updateProgress(3, 70, 'Gerando resumo com IA...');
            await this.delay(1000);

            const result = await response.json();

            if (response.ok && result.success) {
                // Etapa 4: Finalizado
                this.updateProgress(4, 100, 'Resumo gerado com sucesso!');
                await this.delay(500);
                this.showResult(result.summary, result.filename);
            } else {
                throw new Error(result.error || 'Erro desconhecido');
            }
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            this.showError(error.message || 'Erro ao processar o arquivo. Tente novamente.');
        }
    }
    
    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // UI State management
    showLoading() {
        this.fileInfo.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.loading.style.display = 'block';
        this.resetProgress();
    }

    showResult(summary, filename) {
        this.loading.style.display = 'none';
        this.resultContent.innerHTML = this.formatMarkdown(summary);
        this.resultSection.style.display = 'block';
        this.currentSummary = summary;
        this.currentFilename = filename;
    }

    showError(message) {
        this.loading.style.display = 'none';
        this.fileInfo.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }

    resetApp() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.uploadArea.style.display = 'block';
        this.fileInfo.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.loading.style.display = 'none';
    }

    resetToUpload() {
        this.errorSection.style.display = 'none';
        if (this.selectedFile) {
            this.fileInfo.style.display = 'block';
        } else {
            this.uploadArea.style.display = 'block';
        }
    }

    // Markdown formatting
    formatMarkdown(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^### (.+$)/gm, '<h3>$1</h3>')
            .replace(/^## (.+$)/gm, '<h2>$1</h2>')
            .replace(/^# (.+$)/gm, '<h1>$1</h1>')
            .replace(/^- (.+$)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[h|u|l])(.+$)/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<h[1-6]>)/g, '$1')
            .replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    }

    // Export functions
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.currentSummary);
            this.showToast('Resumo copiado para a área de transferência!');
        } catch (error) {
            console.error('Erro ao copiar:', error);
            this.showToast('Erro ao copiar. Tente selecionar e copiar manualmente.', 'error');
        }
    }

    exportToPdf() {
        if (typeof window.jsPDF === 'undefined') {
            this.loadJsPDF(() => this.generatePdf());
        } else {
            this.generatePdf();
        }
    }

    loadJsPDF(callback) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = callback;
        script.onerror = () => this.showToast('Erro ao carregar biblioteca PDF', 'error');
        document.head.appendChild(script);
    }

    generatePdf() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(16);
            doc.text('Resumo do Documento', 20, 20);
            
            doc.setFontSize(12);
            doc.text(`Arquivo: ${this.currentFilename}`, 20, 35);
            doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
            
            doc.line(20, 50, 190, 50);
            
            const lines = doc.splitTextToSize(this.currentSummary, 170);
            doc.text(lines, 20, 60);
            
            doc.save(`resumo-${this.currentFilename.replace('.pdf', '')}.pdf`);
            this.showToast('PDF gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showToast('Erro ao gerar PDF', 'error');
        }
    }

    exportToDocx() {
        try {
            // Convert markdown to HTML
            const htmlContent = this.formatMarkdown(this.currentSummary);
            
            // Create a complete HTML document that Word can import properly
            const htmlDocument = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word 15">
<meta name="Originator" content="Microsoft Word 15">
<title>Resumo do Documento</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>90</w:Zoom>
<w:DoNotPromptForConvert/>
<w:DoNotShowInsertionsAndDeletions/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
@page {
    margin: 2.54cm;
}
body {
    font-family: 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #000;
}
h1 {
    font-size: 18pt;
    font-weight: bold;
    text-align: center;
    color: #2c3e50;
    margin-bottom: 20pt;
}
h2 {
    font-size: 16pt;
    font-weight: bold;
    color: #34495e;
    margin-top: 15pt;
    margin-bottom: 10pt;
}
h3 {
    font-size: 14pt;
    font-weight: bold;
    color: #34495e;
    margin-top: 12pt;
    margin-bottom: 8pt;
}
p {
    margin-bottom: 10pt;
    text-align: justify;
}
ul, ol {
    margin-bottom: 10pt;
}
li {
    margin-bottom: 5pt;
}
strong {
    font-weight: bold;
}
em {
    font-style: italic;
}
.header {
    text-align: center;
    margin-bottom: 30pt;
    border-bottom: 2pt solid #2c3e50;
    padding-bottom: 15pt;
}
.metadata {
    margin-bottom: 20pt;
    padding: 10pt;
    background-color: #f8f9fa;
    border-left: 4pt solid #2c3e50;
}
</style>
</head>
<body>
<div class="header">
<h1>RESUMO DO DOCUMENTO</h1>
</div>
<div class="metadata">
<p><strong>Arquivo:</strong> ${this.currentFilename}</p>
<p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
<p><strong>Gerado por:</strong> EstudAI</p>
</div>
<div class="content">
${htmlContent}
</div>
</body>
</html>`;
            
            // Create Blob with HTML MIME type that Word can open
            const blob = new Blob([htmlDocument], { 
                type: 'application/msword' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resumo-${this.currentFilename.replace('.pdf', '')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Documento DOCX gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar DOCX:', error);
            this.showToast('Erro ao gerar documento', 'error');
        }
    }

    // Citation dropdown
    toggleCitationDropdown() {
        const dropdown = this.exportCitationBtn.parentElement;
        dropdown.classList.toggle('active');
    }

    handleOutsideClick(e) {
        const dropdown = this.exportCitationBtn?.parentElement;
        if (dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    }

    // Extract metadata from summary
    extractMetadata() {
        const metadata = {
            title: 'Não identificado',
            authors: 'Não identificado',
            institution: 'Não identificado',
            location: 'Não identificado',
            journal: 'Não identificado',
            volume: 'Não identificado',
            number: 'Não identificado',
            year: 'Não identificado',
            month: 'Não identificado',
            received: 'Não identificado',
            accepted: 'Não identificado',
            pages: 'Não identificado',
            doi: 'Não identificado',
            keywords: 'Não identificado'
        };
        
        if (!this.currentSummary) return metadata;
        
        const lines = this.currentSummary.split('\n');
        
        for (const line of lines) {
            const cleanLine = line.trim();
            
            if (cleanLine.includes('**Título:**')) {
                metadata.title = cleanLine.replace('**Título:**', '').trim();
            } else if (cleanLine.includes('**Autores:**')) {
                metadata.authors = cleanLine.replace('**Autores:**', '').trim();
            } else if (cleanLine.includes('**Instituição:**')) {
                metadata.institution = cleanLine.replace('**Instituição:**', '').trim();
            } else if (cleanLine.includes('**Local:**')) {
                metadata.location = cleanLine.replace('**Local:**', '').trim();
            } else if (cleanLine.includes('**Revista/Journal:**')) {
                metadata.journal = cleanLine.replace('**Revista/Journal:**', '').trim();
            } else if (cleanLine.includes('**Volume:**')) {
                metadata.volume = cleanLine.replace('**Volume:**', '').trim();
            } else if (cleanLine.includes('**Número:**')) {
                metadata.number = cleanLine.replace('**Número:**', '').trim();
            } else if (cleanLine.includes('**Ano:**')) {
                metadata.year = cleanLine.replace('**Ano:**', '').trim();
            } else if (cleanLine.includes('**Mês:**')) {
                metadata.month = cleanLine.replace('**Mês:**', '').trim();
            } else if (cleanLine.includes('**Data de Recebimento:**')) {
                metadata.received = cleanLine.replace('**Data de Recebimento:**', '').trim();
            } else if (cleanLine.includes('**Data de Aceitação:**')) {
                metadata.accepted = cleanLine.replace('**Data de Aceitação:**', '').trim();
            } else if (cleanLine.includes('**Páginas:**')) {
                metadata.pages = cleanLine.replace('**Páginas:**', '').trim();
            } else if (cleanLine.includes('**DOI/ISBN:**')) {
                metadata.doi = cleanLine.replace('**DOI/ISBN:**', '').trim();
            } else if (cleanLine.includes('**Palavras-chave:**')) {
                metadata.keywords = cleanLine.replace('**Palavras-chave:**', '').trim();
            }
        }
        
        return metadata;
    }

    exportCitation(e, format) {
        e.preventDefault();
        
        const metadata = this.extractMetadata();
        const filename = this.currentFilename.replace('.pdf', '');
        const currentYear = new Date().getFullYear();
        const date = new Date().toISOString().split('T')[0];
        
        // Use extracted metadata or fallback to filename
        const title = metadata.title !== 'Não identificado' ? metadata.title : filename;
        const authors = metadata.authors !== 'Não identificado' ? metadata.authors : 'Autor não identificado';
        const journal = metadata.journal !== 'Não identificado' ? metadata.journal : 'Publicação não identificada';
        const volume = metadata.volume !== 'Não identificado' ? metadata.volume : '';
        const number = metadata.number !== 'Não identificado' ? metadata.number : '';
        const year = metadata.year !== 'Não identificado' ? metadata.year : currentYear;
        const month = metadata.month !== 'Não identificado' ? metadata.month : '';
        const received = metadata.received !== 'Não identificado' ? metadata.received : '';
        const accepted = metadata.accepted !== 'Não identificado' ? metadata.accepted : '';
        const pages = metadata.pages !== 'Não identificado' ? metadata.pages : '';
        const doi = metadata.doi !== 'Não identificado' ? metadata.doi : '';
        const institution = metadata.institution !== 'Não identificado' ? metadata.institution : '';
        const location = metadata.location !== 'Não identificado' ? metadata.location : '';
        
        let citation = '';
        
        switch (format) {
            case 'endnote':
                citation = `%0 Journal Article\n%T ${title}\n%A ${authors}\n%J ${journal}`;
                if (volume) citation += `\n%V ${volume}`;
                if (number) citation += `\n%N ${number}`;
                citation += `\n%D ${year}`;
                if (month) citation += `\n%8 ${month}`;
                if (pages) citation += `\n%P ${pages}`;
                if (doi) citation += `\n%R ${doi}`;
                if (institution) citation += `\n%I ${institution}`;
                if (location) citation += `\n%C ${location}`;
                if (received) citation += `\n%7 Received: ${received}`;
                if (accepted) citation += `\n%7 Accepted: ${accepted}`;
                citation += `\n%X Resumo gerado por EstudAI`;
                break;
                 
            case 'ris':
                citation = `TY  - JOUR\nTI  - ${title}\nAU  - ${authors}\nJO  - ${journal}`;
                if (volume) citation += `\nVL  - ${volume}`;
                if (number) citation += `\nIS  - ${number}`;
                citation += `\nPY  - ${year}`;
                if (month) citation += `\nY2  - ${year}/${month}`;
                if (pages) citation += `\nSP  - ${pages.split('-')[0] || pages}\nEP  - ${pages.split('-')[1] || pages}`;
                if (doi) citation += `\nDO  - ${doi}`;
                if (institution) citation += `\nAD  - ${institution}`;
                if (location) citation += `\nCY  - ${location}`;
                if (received) citation += `\nN1  - Received: ${received}`;
                if (accepted) citation += `\nN1  - Accepted: ${accepted}`;
                citation += `\nN1  - Resumo gerado por EstudAI\nER  -`;
                break;
        }
        
        const blob = new Blob([citation], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${format === 'bibtex' ? 'bib' : format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast(`Citação ${format.toUpperCase()} baixada com sucesso!`);
        this.toggleCitationDropdown();
    }

    // Authentication methods
    async checkAuthStatus() {
        try {
            const response = await fetch('/auth/status');
            const data = await response.json();
            
            if (!data.authenticated) {
                // Usuário não está logado, redirecionar para login
                window.location.href = '/login';
                return;
            }
            
            // Atualizar informações do usuário
            if (this.userName) {
                this.userName.textContent = `Olá, ${data.user.name}`;
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            window.location.href = '/login';
        }
    }

    async handleLogout() {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.location.href = '/login';
            } else {
                this.showToast('Erro ao fazer logout. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro no logout:', error);
            this.showToast('Erro de conexão. Tente novamente.', 'error');
        }
    }

    // Toast notifications
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    try {
        new PDFProcessor();
    } catch (error) {
        console.error('Erro ao inicializar PDFProcessor:', error);
    }
});