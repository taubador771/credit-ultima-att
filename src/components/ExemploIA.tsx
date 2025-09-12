import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Lightbulb, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { iaService } from "@/services/iaService";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

interface ExemploIAProps {
  formData: FormData;
}

const ExemploIA = ({ formData }: ExemploIAProps) => {
  const { toast } = useToast();

  const configurarExemplo = () => {
    // Configuração de exemplo (usando dados simulados para demonstração)
    const configExemplo = {
      habilitado: true,
      provider: "openai" as const,
      apiKey: "sk-demo-exemplo-apenas-para-demonstracao",
      modelo: "gpt-4o",
      temperatura: 0.7,
      promptSistema: "Você é um especialista em vendas e análise de economia tributária brasileira. Sua missão é mostrar de forma persuasiva o potencial de economia que a empresa pode alcançar com os serviços da Unique Assessoria Empresarial. Foque nos benefícios financeiros, ROI e impacto positivo no negócio. Seja direto, motivador e enfatize as oportunidades de crescimento através da economia tributária."
    };

    iaService.setConfig(configExemplo);
    
    toast({
      title: "Configuração de exemplo aplicada",
      description: "Use uma chave de API real para gerar relatórios funcionais",
    });
  };

  const exemplosPrompt = [
    {
      titulo: "Análise de Fluxo de Caixa",
      descricao: "Focado no impacto dos créditos no fluxo de caixa mensal",
      prompt: "Analise detalhadamente como os créditos tributários impactam o fluxo de caixa da empresa, considerando prazos de recuperação e otimização de capital de giro."
    },
    {
      titulo: "Comparativo Setorial",
      descricao: "Benchmarking com empresas similares do setor",
      prompt: "Compare a economia tributária desta empresa com benchmarks do setor, identificando oportunidades de melhoria e posicionamento competitivo."
    },
    {
      titulo: "Análise de Riscos",
      descricao: "Identificação de riscos fiscais e mitigação",
      prompt: "Identifique potenciais riscos fiscais na estratégia de recuperação de créditos e sugira medidas de mitigação e compliance."
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Como usar IA para Relatórios
          </CardTitle>
          <CardDescription>
            Configure uma API key real para gerar relatórios profissionais automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Recursos Disponíveis
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Relatório Executivo personalizado</li>
                <li>• Análise detalhada com insights</li>
                <li>• Projeções anuais inteligentes</li>
                <li>• Relatórios sob medida</li>
                <li>• Recomendações estratégicas</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                Providers Suportados
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• OpenAI (GPT-4o, GPT-4o-mini)</li>
                <li>• Anthropic (Claude-3.5 Sonnet)</li>
                <li>• Google (Gemini Pro)</li>
                <li>• Configuração de temperatura</li>
                <li>• Prompts personalizados</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Exemplos de Prompts Personalizados:</h4>
            <div className="space-y-2">
              {exemplosPrompt.map((exemplo, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-lg">
                  <h5 className="font-medium text-sm">{exemplo.titulo}</h5>
                  <p className="text-xs text-muted-foreground mb-2">{exemplo.descricao}</p>
                  <p className="text-xs bg-background p-2 rounded italic">
                    "{exemplo.prompt}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={configurarExemplo}
              className="flex-1"
            >
              Aplicar Config. Exemplo
            </Button>
            <Button asChild className="flex-1">
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Obter Chave OpenAI
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExemploIA;