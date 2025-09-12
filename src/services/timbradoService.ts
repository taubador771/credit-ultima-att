import { ConfiguracaoTimbrado, configuracaoTimbradoPadrao } from "@/types/timbrado";

const STORAGE_KEY = 'configuracao_timbrado';

class TimbradoService {
  private config: ConfiguracaoTimbrado;

  constructor() {
    this.config = this.carregarConfiguracao();
  }

  private carregarConfiguracao(): ConfiguracaoTimbrado {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        // Garantir compatibilidade com versões anteriores
        return { ...configuracaoTimbradoPadrao, ...config };
      }
    } catch (error) {
      console.warn('Erro ao carregar configuração do timbrado:', error);
    }
    return { ...configuracaoTimbradoPadrao };
  }

  private salvarConfiguracao(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Erro ao salvar configuração do timbrado:', error);
      throw new Error('Falha ao salvar configurações');
    }
  }

  getConfiguracao(): ConfiguracaoTimbrado {
    return { ...this.config };
  }

  atualizarConfiguracao(novaConfig: Partial<ConfiguracaoTimbrado>): void {
    this.config = { ...this.config, ...novaConfig };
    this.salvarConfiguracao();
  }

  async processarLogoUpload(file: File): Promise<{ base64: string; nome: string; tipo: string }> {
    // Validar tipo do arquivo
    const tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!tiposPermitidos.includes(file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use PNG, JPG ou SVG.');
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Máximo 5MB.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve({
          base64,
          nome: file.name,
          tipo: file.type,
        });
      };

      reader.onerror = () => {
        reject(new Error('Erro ao processar arquivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  async definirLogo(file: File): Promise<void> {
    const logo = await this.processarLogoUpload(file);
    this.atualizarConfiguracao({ logo });
  }

  removerLogo(): void {
    const { logo, ...configSemLogo } = this.config;
    this.config = configSemLogo as ConfiguracaoTimbrado;
    this.salvarConfiguracao();
  }

  obterProximoNumeroRelatorio(): string {
    const numero = this.config.numeroSequencial.toString().padStart(4, '0');
    const numeroCompleto = `${this.config.prefixoRelatorio}-${numero}`;
    
    // Incrementar para próxima vez
    this.atualizarConfiguracao({ 
      numeroSequencial: this.config.numeroSequencial + 1 
    });
    
    return numeroCompleto;
  }

  resetarConfiguracoes(): void {
    this.config = { ...configuracaoTimbradoPadrao };
    this.salvarConfiguracao();
  }

  exportarConfiguracoes(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importarConfiguracoes(configJson: string): void {
    try {
      const novaConfig = JSON.parse(configJson);
      // Validar estrutura básica
      if (!novaConfig.razaoSocial || !novaConfig.cnpj) {
        throw new Error('Arquivo de configuração inválido');
      }
      this.config = { ...configuracaoTimbradoPadrao, ...novaConfig };
      this.salvarConfiguracao();
    } catch (error) {
      throw new Error('Erro ao importar configurações: ' + (error as Error).message);
    }
  }
}

export const timbradoService = new TimbradoService();