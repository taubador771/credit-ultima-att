import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, Book, MessageCircle, Phone, Mail } from "lucide-react";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

const Ajuda = () => {
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
      resposta: "O cálculo considera o percentual de crédito utilizado aplicado sobre o valor mensal, subtraindo os honorários e mantendo o pagamento direto da diferença."
    },
    {
      pergunta: "Qual é o prazo para recuperação dos créditos?",
      resposta: "O prazo varia conforme o tipo de tributo e pode levar de 30 a 180 dias para aprovação pelos órgãos competentes."
    },
    {
      pergunta: "Como alterar os parâmetros de simulação?",
      resposta: "Acesse o menu 'Configurações' → 'Simulador' na sidebar para ajustar todos os parâmetros de cálculo."
    },
    {
      pergunta: "É possível gerar relatórios personalizados?",
      resposta: "Sim, na seção 'Relatórios' você pode gerar diferentes tipos de análises baseadas nos seus dados configurados."
    }
  ];

  const tutoriais = [
    {
      titulo: "Primeiros Passos",
      descricao: "Configure sua primeira simulação",
      duracao: "5 min"
    },
    {
      titulo: "Interpretando Resultados",
      descricao: "Entenda os cálculos e gráficos",
      duracao: "8 min"
    },
    {
      titulo: "Gerando Relatórios",
      descricao: "Crie documentos profissionais",
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
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  (11) 99999-9999
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  suporte@unique.com.br
                </Button>
                <Button className="w-full">
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
                <Button variant="outline" className="w-full">
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
              <Button variant="outline" className="h-20 flex-col">
                <Book className="h-6 w-6 mb-2" />
                Manual do Usuário
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <HelpCircle className="h-6 w-6 mb-2" />
                Guia de Cálculos
              </Button>
              <Button variant="outline" className="h-20 flex-col">
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