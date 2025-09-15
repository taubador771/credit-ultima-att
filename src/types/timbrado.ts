export interface ConfiguracaoTimbrado {
  // Dados da empresa
  razaoSocial: string;
  cnpj: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    cep: string;
    cidade: string;
    uf: string;
  };
  contato: {
    telefone: string;
    email: string;
    website?: string;
  };
  // Logo da empresa
  logo?: {
    base64: string;
    nome: string;
    tipo: string;
  };
  // Configurações visuais
  tema: {
    corPrimaria: string;
    corSecundaria: string;
    mostrarMarcaDagua: boolean;
  };
  // Numeração de relatórios
  numeroSequencial: number;
  prefixoRelatorio: string;
}

export const configuracaoTimbradoPadrao: ConfiguracaoTimbrado = {
  razaoSocial: "Unique Assessoria Empresarial",
  cnpj: "00.000.000/0001-00",
  endereco: {
    logradouro: "Rua das Empresas",
    numero: "123",
    cep: "00000-000",
    cidade: "São Paulo",
    uf: "SP",
  },
  contato: {
    telefone: "(11) 9999-9999",
    email: "contato@uniqueassessoria.com",
    website: "www.uniqueassessoria.com",
  },
  tema: {
    corPrimaria: "#3b82f6",
    corSecundaria: "#64748b", 
    mostrarMarcaDagua: true,
  },
  numeroSequencial: 1,
  prefixoRelatorio: "UC",
};