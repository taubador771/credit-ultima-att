import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, Download, Calendar } from "lucide-react";

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
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Relatórios</CardTitle>
            <CardDescription>
              Acesse relatórios gerados anteriormente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum histórico de relatórios encontrado</p>
              <p className="text-sm">Configure os dados do simulador para gerar relatórios</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Relatorios;