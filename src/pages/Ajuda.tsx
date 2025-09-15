import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, Book, MessageCircle, Phone, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

const Ajuda = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    nomeEmpresa: "",
    tributos: [],
    valorMensal: 100000,
    periodo: 12,
    percentualCredito: 95,
    percentualHonorarios: 70,
  });

  const faqItems = [
    {
      pergunta: "Como funciona o cálculo de economia tributária?",
      resposta: "O sistema calcula a economia baseado nos créditos de PIS/COFINS e outros tributos. Você paga apenas 5% do valor dos tributos em dinheiro + honorários sobre o crédito utilizado. A diferença é compensada através dos créditos acumulados."
    },
    {
      pergunta: "Qual é o prazo para recuperação dos créditos?",
      resposta: "O prazo varia conforme o tipo de tributo: PIS/COFINS (30-60 dias), IRPJ/CSLL (60-120 dias). Após aprovação pela Receita Federal, os créditos podem ser utilizados para compensação."
    },
    {
      pergunta: "Como alterar os parâmetros de simulação?",
      resposta: "Acesse 'Configurações' → 'Simulador' na sidebar. Configure: nome da empresa, tributos pagos, valor mensal, período da simulação e percentuais de crédito e honorários."
    },
    {
      pergunta: "É possível gerar relatórios personalizados?",
      resposta: "Sim, na seção 'Relatórios' você pode gerar: Relatório Executivo (resumo completo), Análise Detalhada (breakdown mensal) e Projeção Anual (estimativas futuras)."
    },
    {
      pergunta: "Como funciona a seção de Documentos?",
      resposta: "A seção permite gerar, visualizar e gerenciar documentos essenciais: propostas comerciais, contratos de prestação de serviços e termos de confidencialidade. Use os modelos pré-configurados para agilizar o processo."
    },
    {
      pergunta: "Posso fazer upload de documentos personalizados?",
      resposta: "Sim, você pode fazer upload de logotipos, assinaturas digitais e outros documentos necessários através da seção 'Configurações' dentro de Documentos."
    },
    {
      pergunta: "Como configurar a integração com IA?",
      resposta: "Acesse 'Configurações' → 'Integração IA' para conectar com serviços de inteligência artificial que automatizam a geração de relatórios personalizados em PDF para cada cliente."
    },
    {
      pergunta: "Os dados ficam seguros no sistema?",
      resposta: "Sim, todos os dados são protegidos com criptografia e seguem as melhores práticas de segurança. Apenas usuários autorizados podem acessar as configurações administrativas."
    }
  ];

  const tutoriais = [
    {
      titulo: "Primeiros Passos",
      descricao: "Configure sua primeira simulação de economia tributária",
      duracao: "5 min"
    },
    {
      titulo: "Interpretando Resultados",
      descricao: "Entenda os cálculos, gráficos e projeções do dashboard",
      duracao: "8 min"
    },
    {
      titulo: "Gerando Relatórios",
      descricao: "Crie relatórios executivos, análises detalhadas e projeções",
      duracao: "6 min"
    },
    {
      titulo: "Gerenciando Documentos",
      descricao: "Como criar, editar e gerenciar propostas e contratos",
      duracao: "7 min"
    },
    {
      titulo: "Configuração de Upload",
      descricao: "Configure logotipos, assinaturas e documentos personalizados",
      duracao: "4 min"
    },
    {
      titulo: "Integração com IA",
      descricao: "Configure a IA para geração automática de relatórios em PDF",
      duracao: "10 min"
    },
    {
      titulo: "Configurações Avançadas",
      descricao: "Ajuste percentuais, períodos e parâmetros personalizados",
      duracao: "6 min"
    }
  ];

  return (
    <DashboardLayout formData={formData} onDataChange={setFormData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Central de Ajuda</h1>
            <p className="text-muted-foreground mt-2">
              Suporte, tutoriais e documentação
            </p>
          </div>
        </div>

        {/* Busca */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Buscar na central de ajuda..." 
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Perguntas Frequentes
                </CardTitle>
                <CardDescription>
                  Respostas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <h4 className="font-medium mb-2">{item.pergunta}</h4>
                    <p className="text-sm text-muted-foreground">{item.resposta}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contato e Tutoriais */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Contato
                </CardTitle>
                <CardDescription>
                  Entre em contato conosco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  toast({
                    title: "Contato telefônico",
                    description: "Número copiado para área de transferência",
                  });
                  navigator.clipboard.writeText("(11) 99999-9999");
                }}>
                  <Phone className="h-4 w-4 mr-2" />
                  (11) 99999-9999
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => {
                  toast({
                    title: "Email de contato", 
                    description: "E-mail copiado para área de transferência",
                  });
                  navigator.clipboard.writeText("assistente@uniqueassessoria.com");
                }}>
                  <Mail className="h-4 w-4 mr-2" />
                  assistente@uniqueassessoria.com
                </Button>
                <Button className="w-full" onClick={() => {
                  toast({
                    title: "Chat de suporte",
                    description: "Iniciando conversa com nossa equipe",
                  });
                }}>
                  Abrir Chat de Suporte
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Tutoriais
                </CardTitle>
                <CardDescription>
                  Aprenda a usar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tutoriais.map((tutorial, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{tutorial.titulo}</p>
                      <p className="text-xs text-muted-foreground">{tutorial.descricao}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tutorial.duracao}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => {
                  toast({
                    title: "Tutoriais completos",
                    description: "Redirecionando para área de tutoriais",
                  });
                }}>
                  Ver Todos os Tutoriais
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documentação */}
        <Card>
          <CardHeader>
            <CardTitle>Documentação Técnica</CardTitle>
            <CardDescription>
              Guias detalhados sobre funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col" onClick={() => {
                toast({
                  title: "Manual do usuário",
                  description: "Abrindo documentação completa do sistema",
                });
              }}>
                <Book className="h-6 w-6 mb-2" />
                Manual do Usuário
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={() => {
                toast({
                  title: "Guia de cálculos",
                  description: "Abrindo explicação detalhada dos cálculos tributários",
                });
              }}>
                <HelpCircle className="h-6 w-6 mb-2" />
                Guia de Cálculos
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={() => {
                toast({
                  title: "Base de conhecimento",
                  description: "Acessando biblioteca de artigos e tutoriais",
                });
              }}>
                <MessageCircle className="h-6 w-6 mb-2" />
                Base de Conhecimento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Ajuda;