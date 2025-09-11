import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Download, Calendar, Plus } from "lucide-react";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

const Relatorios = () => {
  const [formData, setFormData] = useState<FormData>({
    nomeEmpresa: "",
    tributos: [],
    valorMensal: 100000,
    periodo: 12,
    percentualCredito: 95,
    percentualHonorarios: 70,
  });

  const relatorios = [
    {
      title: "Relatório Executivo",
      description: "Resumo completo da economia tributária",
      icon: <BarChart3 className="h-6 w-6" />,
      status: "Disponível"
    },
    {
      title: "Análise Detalhada",
      description: "Breakdown mensal dos créditos utilizados",
      icon: <FileText className="h-6 w-6" />,
      status: "Disponível"
    },
    {
      title: "Projeção Anual",
      description: "Estimativa de economia para os próximos 12 meses",
      icon: <Calendar className="h-6 w-6" />,
      status: "Em processamento"
    }
  ];

  return (
    <DashboardLayout formData={formData} onDataChange={setFormData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-2">
              Análises detalhadas da sua economia tributária
            </p>
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
                      : "bg-warning/10 text-warning"
                  }`}>
                    {relatorio.status}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={relatorio.status !== "Disponível"}
                    onClick={() => {
                      if (relatorio.status === "Disponível") {
                        // Simula geração e download do relatório
                        const link = document.createElement('a');
                        link.href = '#';
                        link.download = `${relatorio.title.replace(/\s+/g, '_')}.pdf`;
                        alert(`Gerando relatório: ${relatorio.title}\nO download iniciará em breve...`);
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
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
              <Button className="w-full" onClick={() => alert("Iniciando geração de relatório personalizado com IA...")}>
                <Plus className="h-4 w-4 mr-2" />
                Gerar Relatório com IA
              </Button>
              <div className="text-sm text-muted-foreground">
                <p>• Análise automática dos dados</p>
                <p>• Recomendações personalizadas</p>
                <p>• Geração em PDF profissional</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico Privado</CardTitle>
              <CardDescription>
                Relatórios gerados (acesso restrito)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Histórico protegido</p>
                <p className="text-xs">Entre com credenciais para acessar</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => alert("Funcionalidade disponível após autenticação de usuário")}>
                  Acessar Histórico
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Relatorios;