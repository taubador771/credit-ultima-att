import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Plus } from "lucide-react";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

const Documentos = () => {
  const [formData, setFormData] = useState<FormData>({
    nomeEmpresa: "",
    tributos: [],
    valorMensal: 100000,
    periodo: 12,
    percentualCredito: 95,
    percentualHonorarios: 70,
  });

  const documentos = [
    {
      title: "Proposta Comercial",
      description: "Proposta de serviços de recuperação tributária",
      tipo: "Proposta",
      status: "Rascunho",
      data: "15/01/2024"
    },
    {
      title: "Contrato de Prestação de Serviços",
      description: "Contrato para execução dos serviços tributários",
      tipo: "Contrato",
      status: "Pendente",
      data: "20/01/2024"
    },
    {
      title: "Termo de Confidencialidade",
      description: "Acordo de confidencialidade para proteção de dados",
      tipo: "Termo",
      status: "Assinado",
      data: "10/01/2024"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Assinado":
        return "bg-success/10 text-success";
      case "Pendente":
        return "bg-warning/10 text-warning";
      case "Rascunho":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout formData={formData} onDataChange={setFormData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documentos</h1>
            <p className="text-muted-foreground mt-2">
              Propostas e contratos relacionados ao projeto
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {documentos.map((documento, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{documento.title}</h3>
                      <p className="text-muted-foreground text-sm">{documento.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Tipo: {documento.tipo}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Data: {documento.data}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(documento.status)}`}>
                      {documento.status}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Documento</CardTitle>
              <CardDescription>
                Templates pré-configurados para novos documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Modelo de Proposta
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Modelo de Contrato
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Modelo de Termo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Personalize a geração de documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Logotipo da Empresa</label>
                  <Button variant="outline" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Fazer Upload
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium">Assinatura Digital</label>
                  <Button variant="outline" className="w-full mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentos;