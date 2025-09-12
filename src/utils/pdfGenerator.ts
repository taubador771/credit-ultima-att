import jsPDF from 'jspdf';
import { timbradoService } from '@/services/timbradoService';
import type { ConfiguracaoTimbrado } from '@/types/timbrado';

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

// Função para adicionar cabeçalho personalizado com timbrado
const adicionarCabecalho = (pdf: jsPDF, config: ConfiguracaoTimbrado, numeroRelatorio: string) => {
  // Fundo do cabeçalho com gradiente simulado
  pdf.setFillColor(59, 130, 246); // Azul primário
  pdf.rect(0, 0, 210, 45, 'F');
  
  // Logo da empresa se disponível
  if (config.logo) {
    try {
      pdf.addImage(config.logo.base64, 'PNG', 15, 8, 25, 15);
    } catch (error) {
      console.warn('Erro ao adicionar logo:', error);
    }
  }
  
  // Nome da empresa
  pdf.setFont("Roboto", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  const startX = config.logo ? 45 : 15;
  pdf.text(config.razaoSocial, startX, 15);
  
  // CNPJ
  pdf.setFont("Roboto", "normal");
  pdf.setFontSize(10);
  pdf.text(`CNPJ: ${config.cnpj}`, startX, 22);
  
  // Endereço resumido
  const enderecoCompleto = `${config.endereco.logradouro}, ${config.endereco.numero} - ${config.endereco.cidade}/${config.endereco.uf}`;
  pdf.text(enderecoCompleto, startX, 28);
  
  // Contato
  pdf.text(`${config.contato.telefone} | ${config.contato.email}`, startX, 34);
  
  // Data, hora e número do relatório
  pdf.setFontSize(9);
  const agora = new Date().toLocaleString('pt-BR');
  pdf.text(`Relatório Nº: ${numeroRelatorio}`, 140, 15);
  pdf.text(`Gerado em: ${agora}`, 140, 22);
  
  if (config.contato.website) {
    pdf.text(config.contato.website, 140, 29);
  }
  
  // Linha separadora
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.5);
  pdf.line(15, 40, 195, 40);
};

// Função para adicionar rodapé com timbrado
const adicionarRodape = (pdf: jsPDF, config: ConfiguracaoTimbrado, numeroRelatorio: string, numeroPagina: number, totalPaginas: number) => {
  const pageHeight = pdf.internal.pageSize.height;
  
  // Linha separadora
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(15, pageHeight - 30, 195, pageHeight - 30);
  
  // Informações da empresa
  pdf.setFont("Roboto", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  
  pdf.text(config.razaoSocial.toUpperCase(), 15, pageHeight - 23);
  pdf.text(`${config.endereco.logradouro}, ${config.endereco.numero} - ${config.endereco.cidade}/${config.endereco.uf} - CEP: ${config.endereco.cep}`, 15, pageHeight - 19);
  pdf.text(`${config.contato.telefone} | ${config.contato.email}`, 15, pageHeight - 15);
  
  if (config.contato.website) {
    pdf.text(config.contato.website, 15, pageHeight - 11);
  }
  
  // Numeração das páginas
  pdf.text(`Página ${numeroPagina} de ${totalPaginas}`, 150, pageHeight - 15);
  
  // Código de validação
  const codigoValidacao = `${numeroRelatorio}-${Date.now().toString().slice(-6)}`;
  pdf.text(`Cód. Validação: ${codigoValidacao}`, 150, pageHeight - 11);
  
  // Disclaimer
  pdf.setFontSize(6);
  pdf.text("Este documento foi gerado automaticamente pelo sistema Unique Créditos Tributários", 15, pageHeight - 7);
};

// Função para adicionar marca d'água com timbrado
const adicionarMarcaDagua = (pdf: jsPDF, config: ConfiguracaoTimbrado) => {
  if (!config.tema.mostrarMarcaDagua) return;
  
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  // Transparência via GState não é suportada pelos typings aqui;
  // usamos cor clara para simular marca d'água.
  if (config.logo) {
    // Usar logo como marca d'água se disponível
    try {
      const logoSize = 80;
      const x = (pageWidth - logoSize) / 2;
      const y = (pageHeight - logoSize) / 2;
      pdf.addImage(config.logo.base64, 'PNG', x, y, logoSize, logoSize);
    } catch (error) {
      console.warn("Erro ao adicionar marca d'água com logo:", error);
    }
  } else {
    // Texto da marca d'água
    pdf.setFont("Roboto", "bold");
    pdf.setFontSize(45);
    pdf.setTextColor(200, 200, 200);
    
    // Rotacionar e posicionar o texto (graus)
    const angle = -45;
    const nomeEmpresa = config.razaoSocial.split(' ').slice(0, 2).join(' ').toUpperCase();
    pdf.text(nomeEmpresa, pageWidth / 2, pageHeight / 2, {
      angle,
      align: 'center'
    });
  }
};

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
  dados.forEach((item) => {
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

  return canvas;
};

const criarGraficoBarras = (dados: { label: string; valor: number }[]): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const margin = { top: 30, right: 20, bottom: 50, left: 40 };
  const chartWidth = canvas.width - margin.left - margin.right;
  const chartHeight = canvas.height - margin.top - margin.bottom;
  const maxValor = Math.max(...dados.map(d => d.valor), 1);
  const gap = 10;
  const barWidth = Math.max(10, chartWidth / dados.length - gap);
  const xStart = margin.left;
  const yStart = canvas.height - margin.bottom;

  // Eixos
  ctx.strokeStyle = '#e5e7eb';
  ctx.beginPath();
  ctx.moveTo(xStart, margin.top);
  ctx.lineTo(xStart, yStart);
  ctx.lineTo(canvas.width - margin.right, yStart);
  ctx.stroke();

  // Título
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Projeção de Economia', canvas.width / 2, 20);

  // Barras
  dados.forEach((d, i) => {
    const x = xStart + i * (barWidth + gap) + 5;
    const h = (d.valor / maxValor) * (chartHeight - 10);
    const y = yStart - h;

    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x, y, barWidth, h);

    // Rótulos
    ctx.fillStyle = '#374151';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(d.label, x + barWidth / 2, yStart + 15);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(`${Math.round(d.valor).toLocaleString('pt-BR')}`, x + barWidth / 2, y - 5);
  });

  return canvas;
};

export const gerarPDF = async (relatorio: RelatorioIA, formData: FormData, tipoRelatorio: string): Promise<void> => {
  try {
    const pdf = new jsPDF();
    await carregarFontesPDF(pdf);
    
    // Configurar timbrado
    const config = timbradoService.getConfiguracao();
    const numeroRelatorio = timbradoService.obterProximoNumeroRelatorio();
    let totalPaginas = 1;
    
    // Adicionar cabeçalho e marca d'água
    adicionarCabecalho(pdf, config, numeroRelatorio);
    adicionarMarcaDagua(pdf, config);
    
    
    // ... rest of PDF content generation would continue here

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

    // Cabeçalho com dados da empresa configurada
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text('ANÁLISE DE ECONOMIA TRIBUTÁRIA', pageWidth / 2, 20, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text(`${formData.nomeEmpresa || config.razaoSocial}`, pageWidth / 2, 35, { align: 'center' });

    yPosition = 60;

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
    
    if (yPosition + 90 > pageHeight - 40) { // Ajustado para rodapé expandido
      totalPaginas++;
      pdf.addPage();
      adicionarCabecalho(pdf, config, numeroRelatorio);
      adicionarMarcaDagua(pdf, config);
      yPosition = 55;
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
    if (yPosition + 60 > pageHeight - 40) {
      totalPaginas++;
      pdf.addPage();
      adicionarCabecalho(pdf, config, numeroRelatorio);
      adicionarMarcaDagua(pdf, config);
      yPosition = 55;
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
    if (yPosition + 40 > pageHeight - 40) {
      totalPaginas++;
      pdf.addPage();
      adicionarCabecalho(pdf, config, numeroRelatorio);
      adicionarMarcaDagua(pdf, config);
      yPosition = 55;
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
      if (yPosition + 30 > pageHeight - 40) {
        totalPaginas++;
        pdf.addPage();
        adicionarCabecalho(pdf, config, numeroRelatorio);
        adicionarMarcaDagua(pdf, config);
        yPosition = 55;
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
          if (yPosition > pageHeight - 40) {
            totalPaginas++;
            pdf.addPage();
            adicionarCabecalho(pdf, config, numeroRelatorio);
            adicionarMarcaDagua(pdf, config);
            yPosition = 55;
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
          if (yPosition > pageHeight - 40) {
            totalPaginas++;
            pdf.addPage();
            adicionarCabecalho(pdf, config, numeroRelatorio);
            adicionarMarcaDagua(pdf, config);
            yPosition = 55;
          }
          pdf.text(`${index + 1}. ${rec}`, margin, yPosition);
          yPosition += 8;
        });
      }
    }
    // Adicionar rodapé em todas as páginas
    for (let i = 1; i <= totalPaginas; i++) {
      pdf.setPage(i);
      adicionarRodape(pdf, config, numeroRelatorio, i, totalPaginas);
    }

    // Download do PDF com número sequencial
    const dataFormatada = new Date().toISOString().split('T')[0];
    const fileName = `${numeroRelatorio}_${tipoRelatorio}_${formData.nomeEmpresa?.replace(/\s+/g, '_') || config.razaoSocial.replace(/\s+/g, '_')}_${dataFormatada}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha na geração do PDF');
  }
};

export const gerarPDFPersonalizado = async (conteudo: string, nomeArquivo: string): Promise<void> => {
  try {
    const pdf = new jsPDF();
    await carregarFontesPDF(pdf);
    
    // Configurar timbrado
    const config = timbradoService.getConfiguracao();
    const numeroRelatorio = timbradoService.obterProximoNumeroRelatorio();
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    
    // Adicionar cabeçalho e marca d'água
    adicionarCabecalho(pdf, config, numeroRelatorio);
    adicionarMarcaDagua(pdf, config);
    
    let yPosition = 65; // Maior espaçamento devido ao cabeçalho expandido
    // Título do conteúdo personalizado
    pdf.setFontSize(18);
    pdf.setFont("Roboto", "bold");
    pdf.text('RELATÓRIO PERSONALIZADO', pageWidth / 2, 20, { align: 'center' });
    pdf.setTextColor(0, 0, 0);

    let totalPaginas = 1;
    
    // Conteúdo
    pdf.setFontSize(11);
    pdf.setFont("Roboto", "normal");
    const conteudoLines = pdf.splitTextToSize(conteudo, pageWidth - 2 * margin);
    conteudoLines.forEach((line: string) => {
      if (yPosition > pageHeight - 50) { // Espaço para rodapé
        totalPaginas++;
        pdf.addPage();
        adicionarCabecalho(pdf, config, numeroRelatorio);
        adicionarMarcaDagua(pdf, config);
        yPosition = 65;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });

    // Adicionar rodapé em todas as páginas
    for (let i = 1; i <= totalPaginas; i++) {
      pdf.setPage(i);
      adicionarRodape(pdf, config, numeroRelatorio, i, totalPaginas);
    }

    // Download com número sequencial
    const dataFormatada = new Date().toISOString().split('T')[0];
    const fileName = `${numeroRelatorio}_${nomeArquivo}_${dataFormatada}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Erro ao gerar PDF personalizado:', error);
    throw new Error('Falha na geração do PDF personalizado');
  }
};
