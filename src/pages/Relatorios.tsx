import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Download, Calendar, Plus, Bot, Loader2, AlertCircle, Building2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ConfiguracoesIA, { IAConfig } from "@/components/ConfiguracoesIA";
import ConfiguracaoTimbrado from "@/components/ConfiguracaoTimbrado";
import { iaService } from "@/services/iaService";
import { gerarPDF } from "@/utils/pdfGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ExemploIA from "@/components/ExemploIA";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

const Relatorios = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    nomeEmpresa: "",
    tributos: [],
    valorMensal: 100000,
    periodo: 12,
    percentualCredito: 95,
    percentualHonorarios: 70,
  });

  const [configIA, setConfigIA] = useState<IAConfig | null>(iaService.getConfig());
  const [gerandoRelatorio, setGerandoRelatorio] = useState<string | null>(null);
  const [promptPersonalizado, setPromptPersonalizado] = useState("");
  const [dialogPersonalizadoAberto, setDialogPersonalizadoAberto] = useState(false);

  const handleConfigIASaved = (config: IAConfig) => {
    setConfigIA(config);
    iaService.setConfig(config);
    toast({
      title: "IA configurada",
      description: "Funcionalidades de IA ativadas com sucesso",
    });
  };

  const gerarRelatorioComIA = async (tipo: "executivo" | "detalhado" | "projecao") => {
    if (!configIA || !configIA.habilitado) {
      toast({
        title: "IA não configurada",
        description: "Configure a IA primeiro para gerar relatórios",
        variant: "destructive",
      });
      return;
    }

    setGerandoRelatorio(tipo);
    
    try {
      let relatorio;
      let nomeArquivo;

      switch (tipo) {
        case "executivo":
          relatorio = await iaService.gerarRelatorioExecutivo(formData);
          nomeArquivo = "Relatório_Executivo";
          break;
        case "detalhado":
          relatorio = await iaService.gerarAnaliseDetalhada(formData);
          nomeArquivo = "Análise_Detalhada";
          break;
        case "projecao":
          relatorio = await iaService.gerarProjecaoAnual(formData);
          nomeArquivo = "Projeção_Anual";
          break;
        default:
          throw new Error("Tipo de relatório não suportado");
      }

      await gerarPDF(relatorio, formData, nomeArquivo);
      
      toast({
        title: "Relatório gerado!",
        description: `${nomeArquivo} foi gerado e baixado com sucesso`,
      });

    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        title: "Erro na geração",
        description: error instanceof Error ? error.message : "Falha ao gerar relatório com IA. Verifique a configuração.",
        variant: "destructive",
      });
    } finally {
      setGerandoRelatorio(null);
    }
  };

  const gerarRelatorioPersonalizadoComIA = async () => {
    if (!configIA || !configIA.habilitado) {
      toast({
        title: "IA não configurada",
        description: "Configure a IA primeiro para gerar relatórios",
        variant: "destructive",
      });
      return;
    }

    if (!promptPersonalizado.trim()) {
      toast({
        title: "Prompt necessário",
        description: "Descreva o que você gostaria no relatório personalizado",
        variant: "destructive",
      });
      return;
    }

    setGerandoRelatorio("personalizado");
    
    try {
      const relatorio = await iaService.gerarRelatorioPersonalizado(formData, promptPersonalizado);
      await gerarPDF(relatorio, formData, "Relatório_Personalizado");
      
      toast({
        title: "Relatório personalizado gerado!",
        description: "Seu relatório foi criado e baixado com sucesso",
      });

      setDialogPersonalizadoAberto(false);
      setPromptPersonalizado("");

    } catch (error) {
      console.error("Erro ao gerar relatório personalizado:", error);
      toast({
        title: "Erro na geração",
        description: error instanceof Error ? error.message : "Falha ao gerar relatório personalizado. Verifique a configuração.",
        variant: "destructive",
      });
    } finally {
      setGerandoRelatorio(null);
    }
  };

  const relatorios = [
    {
      title: "Relatório Executivo",
      description: "Resumo completo da economia tributária gerado por IA",
      icon: <BarChart3 className="h-6 w-6" />,
      status: configIA?.habilitado ? "Disponível" : "Configure IA",
      tipo: "executivo" as const
    },
    {
      title: "Análise Detalhada", 
      description: "Breakdown mensal dos créditos com análise aprofundada",
      icon: <FileText className="h-6 w-6" />,
      status: configIA?.habilitado ? "Disponível" : "Configure IA",
      tipo: "detalhado" as const
    },
    {
      title: "Projeção Anual",
      description: "Estimativa de economia para os próximos 12 meses",
      icon: <Calendar className="h-6 w-6" />,
      status: configIA?.habilitado ? "Disponível" : "Configure IA", 
      tipo: "projecao" as const
    }
  ];

  return (
    <DashboardLayout formData={formData} onDataChange={setFormData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-2">
              Análises detalhadas geradas por IA da sua economia tributária
            </p>
          </div>
          <div className="flex gap-2">
            <ConfiguracaoTimbrado />
            <ConfiguracoesIA 
              onConfigSaved={handleConfigIASaved}
              currentConfig={configIA || undefined}
            />
            {configIA?.habilitado && (
              <div className="flex items-center gap-2 text-sm text-success bg-success-light px-3 py-2 rounded-lg">
                <Bot className="h-4 w-4" />
                IA Ativa
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatorios.map((relatorio, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    {relatorio.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{relatorio.title}</CardTitle>
                    <CardDescription>{relatorio.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    relatorio.status === "Disponível" 
                      ? "bg-success/10 text-success" 
                      : relatorio.status === "Configure IA"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted/50 text-muted-foreground"
                  }`}>
                    {relatorio.status}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={relatorio.status !== "Disponível" || gerandoRelatorio !== null}
                    onClick={() => gerarRelatorioComIA(relatorio.tipo)}
                  >
                    {gerandoRelatorio === relatorio.tipo ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Gerar com IA
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Geração Personalizada</CardTitle>
              <CardDescription>
                Crie relatórios customizados com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!configIA?.habilitado ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure a IA para gerar relatórios personalizados
                  </p>
                  <ConfiguracoesIA 
                    onConfigSaved={handleConfigIASaved}
                    currentConfig={configIA || undefined}
                  />
                </div>
              ) : (
                <>
                  <Dialog open={dialogPersonalizadoAberto} onOpenChange={setDialogPersonalizadoAberto}>
                    <DialogTrigger asChild>
                      <Button className="w-full" disabled={gerandoRelatorio !== null}>
                        {gerandoRelatorio === "personalizado" ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Gerar Relatório Personalizado
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Relatório Personalizado com IA</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="prompt">Descreva o que você gostaria no relatório:</Label>
                          <Textarea
                            id="prompt"
                            placeholder="Ex: Quero um relatório focado na análise de fluxo de caixa, com projeções trimestrais e comparativo com o setor..."
                            value={promptPersonalizado}
                            onChange={(e) => setPromptPersonalizado(e.target.value)}
                            rows={6}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setDialogPersonalizadoAberto(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={gerarRelatorioPersonalizadoComIA}
                            disabled={!promptPersonalizado.trim() || gerandoRelatorio !== null}
                            className="flex-1"
                          >
                            {gerandoRelatorio === "personalizado" ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Gerando...
                              </>
                            ) : (
                              "Gerar Relatório"
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="text-sm text-muted-foreground">
                    <p>• Análise automática dos dados com IA</p>
                    <p>• Recomendações personalizadas</p>
                    <p>• Relatórios sob medida para suas necessidades</p>
                    <p>• Usando {configIA.provider.toUpperCase()} {configIA.modelo}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
                <CardTitle>Como Usar IA</CardTitle>
                <CardDescription>
                  Guia prático para configurar e usar IA nos relatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExemploIA formData={formData} />
              </CardContent>
            </Card>
          </div>
        </div>
    </DashboardLayout>
  );
};

export default Relatorios;