import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Plus, Presentation, ScrollText, ExternalLink, Mail, Globe, Users, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { documentosService } from "@/services/documentosService";
import { DocumentoUpload } from "@/types/documentos";

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

  const [documentosUpload, setDocumentosUpload] = useState<DocumentoUpload[]>([]);
  const fileInputRefApresentacao = useRef<HTMLInputElement>(null);
  const fileInputRefContrato = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const config = documentosService.obterDocumentos();
    setDocumentosUpload(config.documentosDisponiveis);
  }, []);

  const handleUpload = async (file: File, categoria: DocumentoUpload['categoria']) => {
    try {
      await documentosService.adicionarDocumento(file, categoria);
      const config = documentosService.obterDocumentos();
      setDocumentosUpload(config.documentosDisponiveis);
      toast({
        title: "Upload realizado com sucesso",
        description: `${file.name} foi adicionado`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleRemover = (id: string) => {
    try {
      documentosService.removerDocumento(id);
      const config = documentosService.obterDocumentos();
      setDocumentosUpload(config.documentosDisponiveis);
      toast({
        title: "Documento removido",
        description: "Documento excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o documento",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (id: string) => {
    try {
      documentosService.baixarDocumento(id);
      toast({
        title: "Download iniciado",
        description: "O arquivo está sendo baixado",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o documento",
        variant: "destructive",
      });
    }
  };

  const getDocumentosPorCategoria = (categoria: DocumentoUpload['categoria']) => {
    return documentosUpload.filter(doc => doc.categoria === categoria);
  };

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
      description: "www.uniqueassessoria.com",
      icon: Globe,
      url: "https://www.uniqueassessoria.com"
    },
    {
      title: "Central de Contatos",
      description: "Contatos e informações de atendimento",
      icon: ExternalLink,
      url: "https://portal.uniqueassessoria.com"
    },
    {
      title: "Assinatura Digital",
      description: "Sistema de assinatura eletrônica",
      icon: Download,
      url: "https://downloads.uniqueassessoria.com"
    }
  ];

  const emailsEmpresa = [
    {
      departamento: "Comercial",
      email: "comercial@uniqueassessoria.com",
      responsavel: "Equipe de Vendas"
    },
    {
      departamento: "Técnico",
      email: "contabil@uniqueassessoria.com",
      responsavel: "Consultores Tributários"
    },
    {
      departamento: "Suporte",
      email: "assistente@uniqueassessoria.com",
      responsavel: "Atendimento ao Cliente"
    },
    {
      departamento: "Diretoria",
      email: "diretoria@uniqueassessoria.com",
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Presentation className="h-6 w-6 text-primary" />
              Modelos de Apresentação
            </h2>
            <div className="flex gap-2">
              <input
                ref={fileInputRefApresentacao}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUpload(file, 'modelo');
                    e.target.value = ''; // Reset input
                  }
                }}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRefApresentacao.current?.click()}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Modelos padrão */}
            {modelosApresentacao.map((modelo, index) => (
              <Card key={`default-${index}`} className="hover:shadow-md transition-shadow">
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

            {/* Documentos enviados por upload */}
            {getDocumentosPorCategoria('modelo').map((documento) => (
              <Card key={documento.id} className="hover:shadow-md transition-shadow border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{documento.nome}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {documentosService.formatarTamanhoArquivo(documento.tamanho)} • 
                        {new Date(documento.dataUpload).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(documento.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemover(documento.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Modelos de Contratos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <ScrollText className="h-6 w-6 text-primary" />
              Contratos e Termos
            </h2>
            <div className="flex gap-2">
              <input
                ref={fileInputRefContrato}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUpload(file, 'contrato');
                    e.target.value = ''; // Reset input
                  }
                }}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRefContrato.current?.click()}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Modelos padrão */}
            {modelosContratos.map((contrato, index) => (
              <Card key={`default-${index}`} className="hover:shadow-md transition-shadow">
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

            {/* Documentos enviados por upload - Contratos */}
            {getDocumentosPorCategoria('contrato').map((documento) => (
              <Card key={documento.id} className="hover:shadow-md transition-shadow border-secondary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ScrollText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{documento.nome}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {documentosService.formatarTamanhoArquivo(documento.tamanho)} • 
                        {new Date(documento.dataUpload).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(documento.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemover(documento.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Documentos enviados por upload - Termos */}
            {getDocumentosPorCategoria('termo').map((documento) => (
              <Card key={documento.id} className="hover:shadow-md transition-shadow border-accent/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{documento.nome}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {documentosService.formatarTamanhoArquivo(documento.tamanho)} • 
                        {new Date(documento.dataUpload).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(documento.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemover(documento.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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