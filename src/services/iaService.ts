interface IAConfig {
  habilitado: boolean;
  provider: "openai" | "anthropic" | "google";
  apiKey: string;
  modelo: string;
  temperatura: number;
  promptSistema: string;
}

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

interface RelatorioIA {
  tipo: "executivo" | "detalhado" | "projecao";
  conteudo: string;
  resumoExecutivo: string;
  recomendacoes: string[];
}

export class IAService {
  private static instance: IAService;
  private config: IAConfig | null = null;

  private constructor() {}

  public static getInstance(): IAService {
    if (!IAService.instance) {
      IAService.instance = new IAService();
    }
    return IAService.instance;
  }

  public setConfig(config: IAConfig) {
    this.config = config;
    // Salvar no localStorage para persistência
    localStorage.setItem('ia-config', JSON.stringify(config));
  }

  public getConfig(): IAConfig | null {
    if (!this.config) {
      const saved = localStorage.getItem('ia-config');
      if (saved) {
        this.config = JSON.parse(saved);
      }
    }
    return this.config;
  }

  public async testarConexaoBasico(): Promise<void> {
    if (!this.config || !this.config.habilitado || !this.config.apiKey) {
      throw new Error("IA não configurada ou habilitada");
    }
    // Realiza uma chamada simples para validar credenciais/modelo
    const resposta = await this.chamarIA("Responda exatamente: ok");
    if (!resposta || !resposta.toLowerCase().includes('ok')) {
      throw new Error("Conexão estabelecida, mas a resposta não foi válida. Verifique o modelo escolhido.");
    }
  }

  private async chamarIA(prompt: string): Promise<string> {
    if (!this.config || !this.config.habilitado || !this.config.apiKey) {
      throw new Error("IA não configurada ou habilitada");
    }

    const { provider, apiKey, modelo, temperatura, promptSistema } = this.config;

    try {
      switch (provider) {
        case "openai":
          return await this.chamarOpenAI(prompt, apiKey, modelo, temperatura, promptSistema);
        case "anthropic":
          return await this.chamarAnthropic(prompt, apiKey, modelo, temperatura, promptSistema);
        case "google":
          return await this.chamarGoogle(prompt, apiKey, modelo, temperatura, promptSistema);
        default:
          throw new Error("Provider não suportado");
      }
    } catch (error) {
      console.error("Erro ao chamar IA:", error);
      throw new Error("Falha na geração do relatório com IA");
    }
  }

  private async chamarOpenAI(prompt: string, apiKey: string, modelo: string, temperatura: number, promptSistema: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelo,
        messages: [
          {
            role: 'system',
            content: promptSistema || 'Você é um especialista em análise financeira brasileira.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperatura,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `OpenAI API erro ${response.status}`;
      
      if (response.status === 429) {
        errorMessage = "Limite de requisições OpenAI atingido. Aguarde alguns minutos ou use um modelo gratuito (Gemini).";
      } else if (response.status === 401) {
        errorMessage = "Chave de API OpenAI inválida. Verifique se a chave está correta.";
      } else if (response.status === 404) {
        errorMessage = `Modelo '${modelo}' não encontrado. Verifique se você tem acesso a este modelo.`;
      } else if (errorData.error?.message) {
        errorMessage += `: ${errorData.error.message}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async chamarAnthropic(prompt: string, apiKey: string, modelo: string, temperatura: number, promptSistema: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelo,
        max_tokens: 2000,
        temperature: temperatura,
        system: promptSistema || 'Você é um especialista em análise financeira brasileira.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `Anthropic API erro ${response.status}`;
      
      if (response.status === 429) {
        errorMessage = "Limite de requisições Anthropic atingido. Aguarde alguns minutos.";
      } else if (response.status === 401) {
        errorMessage = "Chave de API Anthropic inválida. Verifique se a chave está correta.";
      } else if (response.status === 404) {
        errorMessage = `Modelo '${modelo}' não encontrado no Anthropic.`;
      } else if (errorData.error?.message) {
        errorMessage += `: ${errorData.error.message}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private async chamarGoogle(prompt: string, apiKey: string, modelo: string, temperatura: number, promptSistema: string): Promise<string> {
    // Determina o endpoint baseado no modelo
    const isGemini2 = modelo.includes('gemini-2');
    const baseUrl = isGemini2 
      ? 'https://generativelanguage.googleapis.com/v1beta/models'
      : 'https://generativelanguage.googleapis.com/v1beta/models';
    
    // Formata o modelo para a API do Google
    const modelName = modelo.startsWith('models/') ? modelo : `models/${modelo}`;
    
    const response = await fetch(`${baseUrl}/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${promptSistema || 'Você é um especialista em análise financeira brasileira.'}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: temperatura,
          maxOutputTokens: 4000,
          topP: 0.95,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `Google API erro ${response.status}`;
      
      if (response.status === 429) {
        errorMessage = "Limite de requisições Google atingido. Aguarde alguns minutos.";
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = "Chave de API Google inválida ou sem permissões. Verifique se a Gemini API está ativada.";
      } else if (response.status === 404) {
        errorMessage = `Modelo '${modelo}' não encontrado no Google. Experimente 'gemini-1.5-flash'.`;
      } else if (errorData.error?.message) {
        errorMessage += `: ${errorData.error.message}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Nenhuma resposta gerada pela API do Google');
    }
    
    return data.candidates[0].content.parts[0].text;
  }

  public async gerarRelatorioExecutivo(formData: FormData): Promise<RelatorioIA> {
    const prompt = `
Analise os seguintes dados de uma empresa brasileira e gere um RELATÓRIO EXECUTIVO completo sobre economia tributária:

DADOS DA EMPRESA:
- Nome: ${formData.nomeEmpresa || "Empresa consultada"}
- Tributos pagos: ${formData.tributos.join(", ") || "PIS/COFINS"}
- Valor mensal de tributos: R$ ${formData.valorMensal.toLocaleString('pt-BR')}
- Período da análise: ${formData.periodo} meses
- Percentual de crédito disponível: ${formData.percentualCredito}%
- Percentual de honorários: ${formData.percentualHonorarios}%

Calcule e apresente:
1. RESUMO EXECUTIVO (3-4 parágrafos)
2. ANÁLISE FINANCEIRA DETALHADA
3. ECONOMIA PROJETADA (mensal e total)
4. FLUXO DE CAIXA IMPACTADO
5. RECOMENDAÇÕES ESTRATÉGICAS (3-5 itens)
6. RISCOS E MITIGAÇÃO
7. PRÓXIMOS PASSOS

Formato: Texto profissional em português brasileiro, com números formatados e análise técnica sólida.
`;

    const conteudo = await this.chamarIA(prompt);
    
    return {
      tipo: "executivo",
      conteudo,
      resumoExecutivo: "Relatório executivo gerado com análise completa da economia tributária.",
      recomendacoes: [
        "Implementar estratégia de recuperação de créditos",
        "Otimizar fluxo de caixa através dos créditos",
        "Monitorar regularmente a legislação tributária"
      ]
    };
  }

  public async gerarAnaliseDetalhada(formData: FormData): Promise<RelatorioIA> {
    const prompt = `
Elabore uma ANÁLISE DETALHADA completa dos créditos tributários para:

EMPRESA: ${formData.nomeEmpresa || "Empresa consultada"}
TRIBUTOS: ${formData.tributos.join(", ") || "PIS/COFINS"}
VALOR MENSAL: R$ ${formData.valorMensal.toLocaleString('pt-BR')}
PERÍODO: ${formData.periodo} meses

Desenvolva:
1. METODOLOGIA DE CÁLCULO (explicação técnica)
2. BREAKDOWN MENSAL DETALHADO (mês a mês)
3. ANÁLISE DE TENDÊNCIAS
4. COMPARATIVO COM MERCADO
5. OPORTUNIDADES IDENTIFICADAS
6. CRONOGRAMA DE IMPLEMENTAÇÃO
7. MÉTRICAS DE ACOMPANHAMENTO
8. ANÁLISE DE SENSIBILIDADE
9. CONSIDERAÇÕES LEGAIS
10. ANEXOS TÉCNICOS

Use tabelas, percentuais e análises quantitativas. Seja técnico e preciso.
`;

    const conteudo = await this.chamarIA(prompt);
    
    return {
      tipo: "detalhado",
      conteudo,
      resumoExecutivo: "Análise detalhada com breakdown mensal e métricas específicas.",
      recomendacoes: [
        "Revisar mensalmente os cálculos de crédito",
        "Implementar controles internos robustos",
        "Manter documentação atualizada"
      ]
    };
  }

  public async gerarProjecaoAnual(formData: FormData): Promise<RelatorioIA> {
    const prompt = `
Crie uma PROJEÇÃO ANUAL completa para economia tributária:

DADOS BASE:
- Empresa: ${formData.nomeEmpresa || "Empresa consultada"}
- Tributos: ${formData.tributos.join(", ") || "PIS/COFINS"}
- Base mensal: R$ ${formData.valorMensal.toLocaleString('pt-BR')}
- Crédito: ${formData.percentualCredito}%
- Honorários: ${formData.percentualHonorarios}%

Projete para 12 meses:
1. CENÁRIOS (Conservador, Realista, Otimista)
2. PROJEÇÃO MENSAL DETALHADA
3. IMPACTO NO FLUXO DE CAIXA
4. ANÁLISE DE SAZONALIDADE
5. FATORES DE RISCO TEMPORAL
6. METAS E MARCOS
7. ROI PROJETADO
8. BENEFÍCIOS ACUMULADOS
9. RECOMENDAÇÕES POR TRIMESTRE
10. PLANO DE CONTINGÊNCIA

Inclua gráficos conceituais e números específicos para tomada de decisão.
`;

    const conteudo = await this.chamarIA(prompt);
    
    return {
      tipo: "projecao",
      conteudo,
      resumoExecutivo: "Projeção anual com cenários e análise de viabilidade.",
      recomendacoes: [
        "Revisar projeções trimestralmente",
        "Acompanhar indicadores-chave mensalmente",
        "Ajustar estratégia conforme resultados"
      ]
    };
  }

  public async gerarRelatorioPersonalizado(formData: FormData, promptPersonalizado: string): Promise<RelatorioIA> {
    const dadosEmpresa = `
CONTEXTO DA EMPRESA:
- Nome: ${formData.nomeEmpresa || "Empresa consultada"}
- Tributos: ${formData.tributos.join(", ") || "PIS/COFINS"}
- Valor mensal: R$ ${formData.valorMensal.toLocaleString('pt-BR')}
- Período: ${formData.periodo} meses
- % Crédito: ${formData.percentualCredito}%
- % Honorários: ${formData.percentualHonorarios}%

SOLICITAÇÃO ESPECÍFICA:
${promptPersonalizado}
`;

    const conteudo = await this.chamarIA(dadosEmpresa);
    
    return {
      tipo: "executivo",
      conteudo,
      resumoExecutivo: "Relatório personalizado conforme solicitação específica.",
      recomendacoes: ["Análise personalizada conforme demanda específica"]
    };
  }
}

export const iaService = IAService.getInstance();