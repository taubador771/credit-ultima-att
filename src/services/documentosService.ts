import { DocumentoUpload, ConfiguracaoDocumentos, configuracaoDocumentosPadrao } from "@/types/documentos";

const STORAGE_KEY = 'configuracao_documentos';

class DocumentosService {
  private config: ConfiguracaoDocumentos;

  constructor() {
    this.config = this.carregarConfiguracao();
  }

  private carregarConfiguracao(): ConfiguracaoDocumentos {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        return { ...configuracaoDocumentosPadrao, ...config };
      }
    } catch (error) {
      console.warn('Erro ao carregar configuração de documentos:', error);
    }
    return { ...configuracaoDocumentosPadrao };
  }

  private salvarConfiguracao(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Erro ao salvar configuração de documentos:', error);
      throw new Error('Falha ao salvar documentos');
    }
  }

  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async processarDocumentoUpload(file: File, categoria: DocumentoUpload['categoria']): Promise<DocumentoUpload> {
    // Validar tipo do arquivo
    const tiposPermitidos = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (!tiposPermitidos.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use PDF, DOC, DOCX, PPT ou PPTX.');
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo 10MB.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const documento: DocumentoUpload = {
          id: this.gerarId(),
          nome: file.name,
          tipo: file.type,
          base64: reader.result as string,
          tamanho: file.size,
          dataUpload: new Date().toISOString(),
          categoria
        };
        resolve(documento);
      };

      reader.onerror = () => {
        reject(new Error('Erro ao processar arquivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  async adicionarDocumento(file: File, categoria: DocumentoUpload['categoria']): Promise<void> {
    const documento = await this.processarDocumentoUpload(file, categoria);
    
    // Adicionar à lista geral
    this.config.documentosDisponiveis.push(documento);
    
    // Adicionar ao template específico se aplicável
    if (categoria === 'contrato') {
      this.config.templates.minutaContratual = documento;
    } else if (categoria === 'termo') {
      this.config.templates.termoCessao = documento;
    } else {
      this.config.templates.outrosDocumentos.push(documento);
    }
    
    this.salvarConfiguracao();
  }

  removerDocumento(id: string): void {
    // Remover da lista geral
    this.config.documentosDisponiveis = this.config.documentosDisponiveis.filter(doc => doc.id !== id);
    
    // Remover dos templates
    if (this.config.templates.minutaContratual?.id === id) {
      this.config.templates.minutaContratual = undefined;
    }
    
    if (this.config.templates.termoCessao?.id === id) {
      this.config.templates.termoCessao = undefined;
    }
    
    this.config.templates.outrosDocumentos = this.config.templates.outrosDocumentos.filter(doc => doc.id !== id);
    
    this.salvarConfiguracao();
  }

  obterDocumentos(): ConfiguracaoDocumentos {
    return { ...this.config };
  }

  obterDocumentoPorId(id: string): DocumentoUpload | undefined {
    return this.config.documentosDisponiveis.find(doc => doc.id === id);
  }

  baixarDocumento(id: string): void {
    const documento = this.obterDocumentoPorId(id);
    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    // Converter base64 para blob e fazer download
    const byteCharacters = atob(documento.base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: documento.tipo });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = documento.nome;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  formatarTamanhoArquivo(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const documentosService = new DocumentosService();