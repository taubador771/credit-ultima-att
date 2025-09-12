interface RelatorioIA {
  tipo: "executivo" | "detalhado" | "projecao";
  conteudo: string;
  resumoExecutivo: string;
  recomendacoes: string[];
}

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

export const gerarPDF = (relatorio: RelatorioIA, formData: FormData, tipoRelatorio: string): void => {
  try {
    // Calcula métricas básicas
    const economiaCredito = formData.valorMensal * (formData.percentualCredito / 100);
    const honorarios = economiaCredito * (formData.percentualHonorarios / 100);
    const economiaMensal = economiaCredito - honorarios;
    const economiaTotal = economiaMensal * formData.periodo;

    // Cria o conteúdo do PDF
    const conteudoPDF = `
RELATÓRIO DE ECONOMIA TRIBUTÁRIA
${tipoRelatorio.toUpperCase()}
=====================================

DADOS DA EMPRESA
- Empresa: ${formData.nomeEmpresa || "Empresa Consultada"}
- Data: ${new Date().toLocaleDateString('pt-BR')}
- Período de Análise: ${formData.periodo} meses
- Tributos: ${formData.tributos.join(", ") || "PIS/COFINS"}

RESUMO FINANCEIRO
- Valor Mensal de Tributos: R$ ${formData.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Percentual de Crédito: ${formData.percentualCredito}%
- Economia Mensal: R$ ${economiaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Economia Total Projetada: R$ ${economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

RESUMO EXECUTIVO
${relatorio.resumoExecutivo}

ANÁLISE DETALHADA
${relatorio.conteudo}

RECOMENDAÇÕES
${relatorio.recomendacoes.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

---
Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
Sistema de Análise Tributária - Unique Créditos Federais
    `.trim();

    // Cria e baixa o arquivo
    const blob = new Blob([conteudoPDF], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `${tipoRelatorio.replace(/\s+/g, '_')}_${formData.nomeEmpresa || 'Empresa'}_${new Date().toISOString().split('T')[0]}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpa a URL do objeto
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha na geração do PDF');
  }
};

export const gerarPDFPersonalizado = (conteudo: string, nomeArquivo: string): void => {
  try {
    const conteudoCompleto = `
RELATÓRIO PERSONALIZADO
=======================

${conteudo}

---
Gerado em: ${new Date().toLocaleString('pt-BR')}
Sistema de Análise Tributária - Unique Créditos Federais
    `.trim();

    const blob = new Blob([conteudoCompleto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
  } catch (error) {
    console.error('Erro ao gerar PDF personalizado:', error);
    throw new Error('Falha na geração do PDF personalizado');
  }
};