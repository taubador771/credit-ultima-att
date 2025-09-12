export interface DocumentoUpload {
  id: string;
  nome: string;
  tipo: string;
  base64: string;
  tamanho: number;
  dataUpload: string;
  categoria: 'contrato' | 'termo' | 'modelo' | 'outro';
}

export interface ConfiguracaoDocumentos {
  documentosDisponiveis: DocumentoUpload[];
  templates: {
    minutaContratual?: DocumentoUpload;
    termoCessao?: DocumentoUpload;
    outrosDocumentos: DocumentoUpload[];
  };
}

export const configuracaoDocumentosPadrao: ConfiguracaoDocumentos = {
  documentosDisponiveis: [],
  templates: {
    outrosDocumentos: []
  }
};