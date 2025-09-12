import jsPDF from 'jspdf';

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

// Função para criar gráfico de barras simples em canvas
const criarGraficoBarras = (dados: { label: string; valor: number }[]): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Configurações do gráfico
  const margins = { top: 40, right: 40, bottom: 60, left: 80 };
  const chartWidth = canvas.width - margins.left - margins.right;
  const chartHeight = canvas.height - margins.top - margins.bottom;

  // Encontrar valor máximo
  const maxValue = Math.max(...dados.map(d => d.valor));
  const scale = chartHeight / maxValue;

  // Desenhar barras
  const barWidth = chartWidth / dados.length * 0.8;
  const barSpacing = chartWidth / dados.length * 0.2;

  dados.forEach((item, index) => {
    const x = margins.left + index * (barWidth + barSpacing);
    const barHeight = item.valor * scale;
    const y = margins.top + chartHeight - barHeight;

    // Barra
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Valor no topo da barra
    ctx.fillStyle = '#1F2937';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `R$ ${item.valor.toLocaleString('pt-BR')}`,
      x + barWidth / 2,
      y - 5
    );

    // Label no eixo X
    ctx.save();
    ctx.translate(x + barWidth / 2, canvas.height - 20);
    ctx.rotate(-Math.PI / 6);
    ctx.textAlign = 'right';
    ctx.fillText(item.label, 0, 0);
    ctx.restore();
  });

  // Título
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Análise Financeira', canvas.width / 2, 25);

  // Eixos
  ctx.strokeStyle = '#6B7280';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Eixo Y
  ctx.moveTo(margins.left, margins.top);
  ctx.lineTo(margins.left, margins.top + chartHeight);
  // Eixo X
  ctx.moveTo(margins.left, margins.top + chartHeight);
  ctx.lineTo(margins.left + chartWidth, margins.top + chartHeight);
  ctx.stroke();

  return canvas;
};

export const gerarPDF = async (relatorio: RelatorioIA, formData: FormData, tipoRelatorio: string): Promise<void> => {
  try {
    const pdf = new jsPDF();
    
    // Calcula métricas básicas
    const economiaCredito = formData.valorMensal * (formData.percentualCredito / 100);
    const honorarios = economiaCredito * (formData.percentualHonorarios / 100);
    const economiaMensal = economiaCredito - honorarios;
    const economiaTotal = economiaMensal * formData.periodo;

    // Configurações
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Cabeçalho
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('RELATÓRIO DE ECONOMIA TRIBUTÁRIA', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text(tipoRelatorio.toUpperCase(), pageWidth / 2, 32, { align: 'center' });

    yPosition = 60;
    pdf.setTextColor(0, 0, 0);

    // Dados da Empresa
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('DADOS DA EMPRESA', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Empresa: ${formData.nomeEmpresa || "Empresa Consultada"}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Período de Análise: ${formData.periodo} meses`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Tributos: ${formData.tributos.join(", ") || "PIS/COFINS"}`, margin, yPosition);
    yPosition += 15;

    // Resumo Financeiro com gráfico
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('RESUMO FINANCEIRO', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Valor Mensal de Tributos: R$ ${formData.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Percentual de Crédito: ${formData.percentualCredito}%`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Economia Mensal: R$ ${economiaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
    yPosition += 7;
    pdf.text(`Economia Total Projetada: R$ ${economiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
    yPosition += 15;

    // Criar gráfico
    const dadosGrafico = [
      { label: 'Tributos Mensais', valor: formData.valorMensal },
      { label: 'Crédito Gerado', valor: economiaCredito },
      { label: 'Honorários', valor: honorarios },
      { label: 'Economia Líquida', valor: economiaMensal }
    ];

    const canvas = criarGraficoBarras(dadosGrafico);
    const imgData = canvas.toDataURL('image/png');
    
    // Adicionar gráfico ao PDF
    if (yPosition + 80 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.addImage(imgData, 'PNG', margin, yPosition, 100, 75);
    yPosition += 85;

    // Resumo Executivo
    if (yPosition + 30 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('RESUMO EXECUTIVO', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    const resumoLines = pdf.splitTextToSize(relatorio.resumoExecutivo, pageWidth - 2 * margin);
    resumoLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Análise Detalhada
    if (yPosition + 30 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('ANÁLISE DETALHADA', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    const conteudoLines = pdf.splitTextToSize(relatorio.conteudo, pageWidth - 2 * margin);
    conteudoLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 10;

    // Recomendações
    if (yPosition + 30 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('RECOMENDAÇÕES', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    relatorio.recomendacoes.forEach((recomendacao, index) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      const recLines = pdf.splitTextToSize(`${index + 1}. ${recomendacao}`, pageWidth - 2 * margin);
      recLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 3;
    });

    // Rodapé
    yPosition = pageHeight - margin;
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
    pdf.text('Sistema de Análise Tributária - Unique Créditos Federais', pageWidth - margin, yPosition, { align: 'right' });

    // Download do PDF
    const fileName = `${tipoRelatorio.replace(/\s+/g, '_')}_${formData.nomeEmpresa || 'Empresa'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha na geração do PDF');
  }
};

export const gerarPDFPersonalizado = async (conteudo: string, nomeArquivo: string): Promise<void> => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Cabeçalho
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('RELATÓRIO PERSONALIZADO', pageWidth / 2, 25, { align: 'center' });

    yPosition = 60;
    pdf.setTextColor(0, 0, 0);

    // Conteúdo
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    const conteudoLines = pdf.splitTextToSize(conteudo, pageWidth - 2 * margin);
    conteudoLines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });

    // Rodapé
    yPosition = pageHeight - margin;
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
    pdf.text('Sistema de Análise Tributária - Unique Créditos Federais', pageWidth - margin, yPosition, { align: 'right' });

    // Download
    const fileName = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Erro ao gerar PDF personalizado:', error);
    throw new Error('Falha na geração do PDF personalizado');
  }
};