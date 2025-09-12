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

// Fontes Unicode para jsPDF
let fontesCarregadas = false;

const carregarFontesPDF = async (pdf: jsPDF) => {
  if (fontesCarregadas) {
    try { pdf.setFont('Roboto', 'normal'); } catch {}
    return;
  }
  try {
    const [regularRes, boldRes] = await Promise.all([
      fetch('/fonts/Roboto-Regular.base64.txt'),
      fetch('/fonts/Roboto-Bold.base64.txt'),
    ]);

    const [regularB64, boldB64] = await Promise.all([
      regularRes.text(),
      boldRes.text(),
    ]);

    pdf.addFileToVFS('Roboto-Regular.ttf', regularB64.trim());
    pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    pdf.addFileToVFS('Roboto-Bold.ttf', boldB64.trim());
    pdf.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

    pdf.setFont('Roboto', 'normal');
    fontesCarregadas = true;
  } catch (e) {
    console.warn('Falha ao carregar fontes para PDF. Continuando com fonte padrão.', e);
  }
};

// Função para criar gráfico de pizza (donut chart) em canvas
const criarGraficoPizza = (dados: { label: string; valor: number; cor: string }[]): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 - 20;
  const radius = 80;
  const innerRadius = 40;

  let startAngle = 0;
  const total = dados.reduce((sum, item) => sum + item.valor, 0);

  // Desenhar fatias
  dados.forEach((item, index) => {
    const sliceAngle = (item.valor / total) * 2 * Math.PI;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = item.cor;
    ctx.fill();
    
    startAngle += sliceAngle;
  });

  // Título
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Distribuição dos Valores', centerX, 30);

  // Legenda
  let legendY = centerY + radius + 30;
  dados.forEach((item, index) => {
    const x = 50 + (index % 2) * 150;
    const y = legendY + Math.floor(index / 2) * 25;
    
    // Cor
    ctx.fillStyle = item.cor;
    ctx.fillRect(x, y - 10, 15, 15);
    
    // Texto
    ctx.fillStyle = '#1F2937';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, x + 20, y);
    
    const percentual = ((item.valor / total) * 100).toFixed(1);
    ctx.fillText(`${percentual}%`, x + 20, y + 12);
  });

  return canvas;
};

// Função para criar gráfico de barras comparativo
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
    await carregarFontesPDF(pdf);
    
    // Calcula métricas básicas
    const economiaCredito = formData.valorMensal * (formData.percentualCredito / 100);
    const honorarios = economiaCredito * (formData.percentualHonorarios / 100);
    const economiaMensal = economiaCredito - honorarios;
    const economiaTotal = economiaMensal * formData.periodo;
    const pagamentoDireto = formData.valorMensal * (1 - formData.percentualCredito / 100);

    // Configurações
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Cabeçalho com gradiente visual
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text('ANÁLISE DE ECONOMIA TRIBUTÁRIA', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text(`${formData.nomeEmpresa || "Sua Empresa"}`, pageWidth / 2, 35, { align: 'center' });

    yPosition = 70;

    // KPIs Visuais - Caixas destacadas
    const criarKPIBox = (x: number, y: number, width: number, height: number, titulo: string, valor: string, cor: [number, number, number]) => {
      // Background da caixa
      pdf.setFillColor(cor[0], cor[1], cor[2]);
      pdf.rect(x, y, width, height, 'F');
      
      // Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text(titulo, x + width/2, y + 12, { align: 'center' });
      
      // Valor
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(valor, x + width/2, y + 25, { align: 'center' });
    };

    // Linha de KPIs
    const kpiWidth = (pageWidth - 2 * margin - 15) / 4;
    const kpiHeight = 30;
    
    criarKPIBox(margin, yPosition, kpiWidth, kpiHeight, 
      'Economia Mensal', 
      `R$ ${economiaMensal.toLocaleString('pt-BR')}`, 
      [16, 185, 129]);
    
    criarKPIBox(margin + kpiWidth + 5, yPosition, kpiWidth, kpiHeight, 
      'Economia Total', 
      `R$ ${economiaTotal.toLocaleString('pt-BR')}`, 
      [59, 130, 246]);
    
    criarKPIBox(margin + (kpiWidth + 5) * 2, yPosition, kpiWidth, kpiHeight, 
      '% Economia', 
      `${((economiaMensal / formData.valorMensal) * 100).toFixed(1)}%`, 
      [245, 158, 11]);
    
    criarKPIBox(margin + (kpiWidth + 5) * 3, yPosition, kpiWidth, kpiHeight, 
      'ROI Anual', 
      `${((economiaTotal * 12 / formData.periodo / honorarios) * 100).toFixed(0)}%`, 
      [168, 85, 247]);

    yPosition += kpiHeight + 25;

    // Seção de impacto financeiro
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('SEU POTENCIAL DE ECONOMIA', margin, yPosition);
    yPosition += 15;

    // Box comparativo visual
    pdf.setFillColor(244, 63, 94); // Vermelho para situação atual
    pdf.rect(margin, yPosition, 80, 35, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text('SITUAÇÃO ATUAL', margin + 40, yPosition + 10, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(`R$ ${formData.valorMensal.toLocaleString('pt-BR')}/mês`, margin + 40, yPosition + 25, { align: 'center' });

    pdf.setFillColor(16, 185, 129); // Verde para com Unique
    pdf.rect(margin + 90, yPosition, 80, 35, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text('COM UNIQUE CRÉDITOS', margin + 130, yPosition + 10, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    const novoValor = pagamentoDireto + honorarios;
    pdf.text(`R$ ${novoValor.toLocaleString('pt-BR')}/mês`, margin + 130, yPosition + 25, { align: 'center' });

    yPosition += 50;

    // Criar gráfico de pizza
    const dadosPizza = [
      { label: 'Pagamento Direto', valor: pagamentoDireto, cor: '#f59e0b' },
      { label: 'Honorários Unique', valor: honorarios, cor: '#3b82f6' },
      { label: 'ECONOMIA LÍQUIDA', valor: economiaMensal, cor: '#10b981' }
    ];

    const canvasPizza = criarGraficoPizza(dadosPizza);
    const imgDataPizza = canvasPizza.toDataURL('image/png');
    
    if (yPosition + 90 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.addImage(imgDataPizza, 'PNG', margin, yPosition, 100, 75);

    // Texto de vendas ao lado do gráfico
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('Por que escolher a Unique?', margin + 110, yPosition + 10);
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    const beneficios = [
      `• Economia garantida de R$ ${economiaMensal.toLocaleString('pt-BR')} por mês`,
      `• ROI de ${((economiaTotal * 12 / formData.periodo / honorarios) * 100).toFixed(0)}% ao ano`,
      '• Processo 100% legal e seguro',
      '• Equipe especializada em créditos federais',
      `• Em ${formData.periodo} meses você economiza R$ ${economiaTotal.toLocaleString('pt-BR')}`,
      '• Sem riscos operacionais para sua empresa'
    ];
    
    beneficios.forEach((beneficio, index) => {
      pdf.text(beneficio, margin + 110, yPosition + 25 + (index * 8));
    });

    yPosition += 95;

    // Projeção temporal visual
    if (yPosition + 60 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('PROJEÇÃO DE CRESCIMENTO DA ECONOMIA', margin, yPosition);
    yPosition += 15;

    // Criar gráfico de barras temporais
    const dadosTemporais = [];
    for (let i = 1; i <= Math.min(12, formData.periodo); i++) {
      dadosTemporais.push({
        label: `${i}º mês`,
        valor: economiaMensal * i
      });
    }

    const canvasBarras = criarGraficoBarras(dadosTemporais);
    const imgDataBarras = canvasBarras.toDataURL('image/png');
    
    pdf.addImage(imgDataBarras, 'PNG', margin, yPosition, 170, 127);
    yPosition += 140;

    // Call to Action forte
    if (yPosition + 40 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFillColor(16, 185, 129);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('🎯 RESULTADO FINAL:', margin + 10, yPosition + 15);
    pdf.setFontSize(18);
    pdf.text(`ECONOMIA DE R$ ${economiaTotal.toLocaleString('pt-BR')} EM ${formData.periodo} MESES`, 
             margin + 10, yPosition + 30);

    yPosition += 50;

    // Análise de IA resumida e persuasiva
    if (tipoRelatorio === 'detalhado' && relatorio.conteudo) {
      if (yPosition + 30 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('🤖 ANÁLISE INTELIGENTE PERSONALIZADA', margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      // Resumir o conteúdo da IA em pontos-chave para vendas
      const pontosPrincipais = relatorio.resumoExecutivo.split('.').slice(0, 3);
      pontosPrincipais.forEach((ponto, index) => {
        if (ponto.trim()) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(`• ${ponto.trim()}`, margin, yPosition);
          yPosition += 8;
        }
      });
      
      yPosition += 10;
      
      // Recomendações resumidas
      if (relatorio.recomendacoes.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('💡 PRÓXIMOS PASSOS RECOMENDADOS:', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        relatorio.recomendacoes.slice(0, 3).forEach((rec, index) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(`${index + 1}. ${rec}`, margin, yPosition);
          yPosition += 8;
        });
      }
    }

    // Rodapé com contato
    const finalPageHeight = pdf.internal.pageSize.getHeight();
    yPosition = finalPageHeight - 30;
    
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, finalPageHeight - 25, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.text(`📞 Entre em contato conosco para começar a economizar hoje mesmo!`, margin, finalPageHeight - 15);
    pdf.text(`📅 Gerado em ${new Date().toLocaleDateString('pt-BR')} • Unique Créditos Federais`, 
             pageWidth - margin, finalPageHeight - 15, { align: 'right' });

    // Download do PDF
    const fileName = `Economia_${formData.nomeEmpresa?.replace(/\s+/g, '_') || 'Empresa'}_${new Date().toISOString().split('T')[0]}.pdf`;
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