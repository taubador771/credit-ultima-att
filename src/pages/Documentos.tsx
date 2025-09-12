import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Plus, Presentation, ScrollText, ExternalLink, Mail, Globe, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

const Documentos = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    nomeEmpresa: "",
    tributos: [],
    valorMensal: 100000,
    periodo: 12,
    percentualCredito: 95,
    percentualHonorarios: 70,
  });

  const modelosApresentacao = [
    {
      title: "Apresentação Executiva",
      description: "Apresentação completa dos serviços de economia tributária",
      icon: Presentation,
      arquivo: "apresentacao-executiva.pptx"
    },
    {
      title: "Pitch Comercial",
      description: "Apresentação focada em vendas e resultados",
      icon: Presentation,
      arquivo: "pitch-comercial.pptx"
    },
    {
      title: "Cases de Sucesso",
      description: "Exemplos de clientes com resultados alcançados",
      icon: Users,
      arquivo: "cases-sucesso.pdf"
    }
  ];

  const modelosContratos = [
    {
      title: "Contrato de Prestação de Serviços",
      description: "Minuta Contratual Modelo",
      icon: ScrollText,
      arquivo: "contrato-prestacao-servicos.docx"
    },
    {
      title: "Termo de Cessão de Direitos",
      description: "Termo de Cessão Modelo",
      icon: FileText,
      arquivo: "termo-cessao-direitos.docx"
    },
    {
      title: "Acordo de Confidencialidade",
      description: "NDA para proteção de informações comerciais",
      icon: FileText,
      arquivo: "acordo-confidencialidade.docx"
    }
  ];

  const linksEmpresa = [
    {
      title: "Site Institucional",
      description: "www.uniqueassessoria.com.br",
      icon: Globe,
      url: "https://www.uniqueassessoria.com.br"
    },
    {
      title: "Central de Contatos",
      description: "Contatos e informações de atendimento",
      icon: ExternalLink,
      url: "https://portal.uniqueassessoria.com.br"
    },
    {
      title: "Assinatura Digital",
      description: "Sistema de assinatura eletrônica",
      icon: Download,
      url: "https://downloads.uniqueassessoria.com.br"
    }
  ];

  const emailsEmpresa = [
    {
      departamento: "Comercial",
      email: "comercial@uniqueassessoria.com.br",
      responsavel: "Equipe de Vendas"
    },
    {
      departamento: "Técnico",
      email: "tecnico@uniqueassessoria.com.br",
      responsavel: "Consultores Tributários"
    },
    {
      departamento: "Suporte",
      email: "suporte@uniqueassessoria.com.br",
      responsavel: "Atendimento ao Cliente"
    },
    {
      departamento: "Diretoria",
      email: "diretoria@uniqueassessoria.com.br",
      responsavel: "Direção Executiva"
    }
  ];


  return (
    <DashboardLayout formData={formData} onDataChange={setFormData}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Central de Documentos</h1>
            <p className="text-muted-foreground mt-2">
              Modelos, contratos, links e informações da Unique Assessoria Empresarial
            </p>
          </div>
        </div>

        {/* Modelos de Apresentação */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Presentation className="h-6 w-6 text-primary" />
            Modelos de Apresentação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelosApresentacao.map((modelo, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <modelo.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{modelo.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{modelo.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Visualizando modelo",
                          description: modelo.title,
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Download iniciado",
                          description: `Baixando ${modelo.arquivo}`,
                        });
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
        </div>

        {/* Modelos de Contratos */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" />
            Contratos e Termos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelosContratos.map((contrato, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary/10 p-2 rounded-lg">
                      <contrato.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{contrato.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{contrato.description}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Visualizando documento",
                          description: contrato.title,
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        toast({
                          title: "Download iniciado",
                          description: `Baixando ${contrato.arquivo}`,
                        });
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
        </div>

        {/* Links da Empresa */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Links da Empresa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {linksEmpresa.map((link, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 p-2 rounded-lg">
                      <link.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => {
                        window.open(link.url, '_blank');
                        toast({
                          title: "Abrindo link",
                          description: link.title,
                        });
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Acessar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Lista de E-mails */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Contatos da Empresa
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emailsEmpresa.map((contato, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{contato.departamento}</h3>
                      <p className="text-sm text-muted-foreground">{contato.responsavel}</p>
                      <p className="text-sm font-medium text-primary">{contato.email}</p>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `mailto:${contato.email}`;
                        toast({
                          title: "Abrindo e-mail",
                          description: `Enviando para ${contato.departamento}`,
                        });
                      }}
                    >
                      Enviar E-mail
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentos;