class PDFProcessor {
    constructor() {
        this.selectedFile = null;
        this.currentSummary = '';
        this.currentFilename = '';
        this.selectedSummaryType = 'informativo';
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkAuthStatus();
        this.initializeDefaultSelection();
    }
    
    initializeElements() {
        // Elementos principais
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.removeFileBtn = document.getElementById('removeFileBtn');
        this.processBtn = document.getElementById('processBtn');
        this.loading = document.getElementById('loading');
        this.resultSection = document.getElementById('resultSection');
        this.resultContent = document.getElementById('resultContent');
        this.summaryTypeValue = document.getElementById('summaryTypeValue');
        this.summaryTypesSection = document.getElementById('summaryTypesSection');
        
        // Novos elementos para exibir tipo selecionado no topo com ícone
        this.selectedTypeInfo = document.getElementById('selectedTypeInfo');
        this.typeBadge = document.getElementById('typeBadge');
        this.typeBadgeIcon = document.getElementById('typeBadgeIcon');
        this.typeBadgeText = document.getElementById('typeBadgeText');
        
        // Elementos para cards de tipo de resumo
        this.summaryCards = document.querySelectorAll('.summary-card');
        this.selectedSummaryInfo = document.getElementById('selectedSummaryInfo');
        this.selectedCardPreview = document.getElementById('selectedCardPreview');
        this.selectedCardTitle = document.getElementById('selectedCardTitle');
        this.selectedCardDescription = document.getElementById('selectedCardDescription');
        
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
        
        // Summary type cards
        console.log('Anexando event listeners aos cards:', this.summaryCards.length);
        this.summaryCards.forEach((card, index) => {
            console.log(`Card ${index}:`, card.dataset.type);
            card.addEventListener('click', () => {
                console.log('Card clicado:', card.dataset.type);
                this.selectSummaryCard(card);
            });
        });
        
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

    // Método para inicializar seleção padrão
    initializeDefaultSelection() {
        const defaultCard = document.querySelector('.summary-card[data-type="informativo"]');
        if (defaultCard) {
            this.selectSummaryCard(defaultCard);
        }
    }

    // Método para selecionar card de tipo de resumo
    selectSummaryCard(selectedCard) {
        console.log('Selecionando card:', selectedCard.dataset.type);
        
        // Remove seleção anterior
        this.summaryCards.forEach(card => {
            card.classList.remove('selected');
        });
        
        // Adiciona seleção ao card clicado
        selectedCard.classList.add('selected');
        
        // Atualiza o tipo selecionado
        this.selectedSummaryType = selectedCard.dataset.type;
        console.log('Tipo selecionado:', this.selectedSummaryType);
        
        // Atualiza a informação do card selecionado
        this.updateSelectedSummaryInfo(selectedCard);
    }

    // Método para atualizar informações do resumo selecionado
    updateSelectedSummaryInfo(card) {
        const icon = card.querySelector('.card-icon i').className;
        const title = card.querySelector('h4').textContent;
        
        console.log('Atualizando info:', { icon, title });
        
        // Atualiza o badge no topo com ícone e texto
        if (this.typeBadgeIcon) {
            this.typeBadgeIcon.className = icon;
        }
        if (this.typeBadgeText) {
            this.typeBadgeText.textContent = title;
        }
        if (this.selectedTypeInfo) {
            this.selectedTypeInfo.style.display = 'block';
        }
        
        if (this.selectedCardPreview) {
            this.selectedCardPreview.innerHTML = `<i class="${icon}"></i>`;
        }
        
        if (this.selectedCardTitle) {
            this.selectedCardTitle.textContent = title;
        }
        
        // Mostra a seção de informações
        if (this.selectedSummaryInfo) {
            this.selectedSummaryInfo.style.display = 'block';
            console.log('Mostrando selected summary info');
        }
    }

    // Drag and drop handlers
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        
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
        if (file.type !== 'application/pdf') {
            this.showError('Por favor, selecione apenas arquivos PDF.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            this.showError('O arquivo é muito grande. Tamanho máximo: 10MB.');
            return;
        }

        this.selectedFile = file;
        this.showFileInfo(file);
        this.hideError();
    }

    showFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileInfo.style.display = 'block';
        this.uploadArea.style.display = 'none';
        
        // ADICIONAR ESTAS LINHAS:
        if (this.summaryTypesSection) {
            this.summaryTypesSection.style.display = 'block';
        }
    }

    removeSelectedFile() {
        this.selectedFile = null;
        this.fileInfo.style.display = 'none';
        this.uploadArea.style.display = 'block';
        this.fileInput.value = '';
        
        // Esconde o tipo selecionado no topo
        if (this.selectedTypeInfo) {
            this.selectedTypeInfo.style.display = 'none';
        }
        
        // ADICIONAR ESTAS LINHAS:
        if (this.summaryTypesSection) {
            this.summaryTypesSection.style.display = 'none';
        }
        if (this.selectedSummaryInfo) {
            this.selectedSummaryInfo.style.display = 'none';
        }
    }

    // Progress and loading
    showLoading() {
        this.loading.style.display = 'block';
        this.fileInfo.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.resultSection.style.display = 'none';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }

    updateProgress(step, percentage, text) {
        this.loadingText.textContent = text;
        this.progressFill.style.width = percentage + '%';
        
        // Reset all steps
        [this.step1, this.step2, this.step3, this.step4].forEach(stepEl => {
            stepEl.classList.remove('active', 'completed');
        });
        
        // Mark completed steps
        for (let i = 1; i < step; i++) {
            const stepEl = this[`step${i}`];
            if (stepEl) stepEl.classList.add('completed');
        }
        
        // Mark current step
        const currentStep = this[`step${step}`];
        if (currentStep) currentStep.classList.add('active');
    }

    resetProgress() {
        this.progressFill.style.width = '0%';
        [this.step1, this.step2, this.step3, this.step4].forEach(stepEl => {
            stepEl.classList.remove('active', 'completed');
        });
    }

    // Results and errors
    showResult(summary, filename) {
        this.currentSummary = summary;
        this.currentFilename = filename;
        this.resultContent.innerHTML = this.formatMarkdown(summary);
        
        // Atualiza o tipo de resumo exibido
        if (this.summaryTypeValue) {
            const typeNames = {
                'informativo': 'Informativo',
                'critico': 'Crítico',
                'indicativo': 'Indicativo',
                'estruturado': 'Estruturado',
                'expandido': 'Expandido',
                'corrido': 'Corrido',
                'fichamento': 'Fichamento',
                'topicos': 'Tópicos'
            };
            this.summaryTypeValue.textContent = typeNames[this.selectedSummaryType] || this.selectedSummaryType;
        }
        
        this.hideLoading();
        this.resultSection.style.display = 'block';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
        this.hideLoading();
    }

    hideError() {
        this.errorSection.style.display = 'none';
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
        formData.append('summaryType', this.selectedSummaryType || 'informativo');

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

    // Utility functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    // Export functions
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.currentSummary);
            this.showToast('Resumo copiado para a área de transferência!');
        } catch (err) {
            console.error('Erro ao copiar:', err);
            this.showToast('Erro ao copiar o texto.', 'error');
        }
    }

    async exportToPdf() {
        try {
            await this.loadJsPDF();
            this.generatePdf();
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            this.showToast('Erro ao exportar PDF.', 'error');
        }
    }

    async loadJsPDF() {
        if (typeof window.jsPDF !== 'undefined') {
            return;
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    generatePdf() {
        const { jsPDF } = window.jsPDF;
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;
        
        doc.setFontSize(16);
        doc.text('Resumo do Documento', margin, 30);
        
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(this.currentSummary, maxWidth);
        doc.text(lines, margin, 50);
        
        const filename = this.currentFilename ? 
            `resumo_${this.currentFilename.replace('.pdf', '')}.pdf` : 
            'resumo.pdf';
        
        doc.save(filename);
        this.showToast('PDF exportado com sucesso!');
    }

    exportToDocx() {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Resumo</title>
            </head>
            <body>
                <h1>Resumo do Documento</h1>
                <div>${this.formatMarkdown(this.currentSummary)}</div>
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const filename = this.currentFilename ? 
            `resumo_${this.currentFilename.replace('.pdf', '')}.doc` : 
            'resumo.doc';
        
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Documento exportado com sucesso!');
    }

    // Citation functions
    toggleCitationDropdown() {
        const dropdown = this.exportCitationBtn.parentElement;
        dropdown.classList.toggle('active');
    }

    exportCitation(e, format) {
        e.preventDefault();
        
        const currentDate = new Date().toISOString().split('T')[0];
        const title = this.currentFilename ? 
            this.currentFilename.replace('.pdf', '') : 
            'Documento';
        
        let citation = '';
        
        if (format === 'endnote') {
            citation = `%0 Generic\n%T ${title}\n%D ${new Date().getFullYear()}\n%8 ${currentDate}\n%X Resumo gerado por IA`;
        } else if (format === 'ris') {
            citation = `TY  - GEN\nTI  - ${title}\nPY  - ${new Date().getFullYear()}\nDA  - ${currentDate}\nN1  - Resumo gerado por IA\nER  -`;
        }
        
        const blob = new Blob([citation], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `citation.${format === 'endnote' ? 'enw' : 'ris'}`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast(`Citação ${format.toUpperCase()} exportada com sucesso!`);
        
        // Close dropdown
        const dropdown = this.exportCitationBtn.parentElement;
        dropdown.classList.remove('active');
    }

    // Navigation functions
    resetApp() {
        this.selectedFile = null;
        this.currentSummary = '';
        this.currentFilename = '';
        
        this.fileInfo.style.display = 'none';
        this.uploadArea.style.display = 'block';
        this.resultSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.loading.style.display = 'none';
        
        this.fileInput.value = '';
        this.initializeDefaultSelection();
    }

    resetToUpload() {
        this.errorSection.style.display = 'none';
        this.loading.style.display = 'none';
        this.fileInfo.style.display = 'block';
    }

    // Authentication
    async checkAuthStatus() {
        try {
            const response = await fetch('/auth/status');
            const data = await response.json();
            
            if (data.authenticated) {
                this.userName.textContent = data.user.name;
            } else {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            window.location.href = '/login.html';
        }
    }

    async handleLogout() {
        try {
            await fetch('/auth/logout', { method: 'POST' });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    // Utility functions
    handleOutsideClick(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    }

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
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new PDFProcessor();
});

// Modify the fetch request in your PDF processing function
fetch('/process-pdf', {
    method: 'POST',
    body: formData
})
.then(response => {
    if (response.status === 429) {
        return response.json().then(data => {
            throw new Error(`Limite diário atingido. ${data.resetTime ? 'Reset em: ' + new Date(data.resetTime).toLocaleString() : 'Tente novamente mais tarde.'}`);
        });
    }
    return response.json();
})
.then(data => {
    // ... existing success handling ...
})
.catch(error => {
    console.error('Erro:', error);
    showToast(error.message || 'Erro ao processar PDF', 'error');
    // ... existing error handling ...
});