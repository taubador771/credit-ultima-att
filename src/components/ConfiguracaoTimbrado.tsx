import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timbradoService } from "@/services/timbradoService";
import { documentosService } from "@/services/documentosService";
import type { ConfiguracaoTimbrado } from "@/types/timbrado";
import type { DocumentoUpload } from "@/types/documentos";
import { 
  Building2, Upload, X, Palette, FileText, 
  Download, UploadCloud, RotateCcw, Settings2, File, Trash2
} from "lucide-react";

interface ConfiguracaoTimbradoProps {
  onConfigSaved?: (config: ConfiguracaoTimbrado) => void;
}

const ConfiguracaoTimbrado = ({ onConfigSaved }: ConfiguracaoTimbradoProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfiguracaoTimbrado>(timbradoService.getConfiguracao());
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documentos, setDocumentos] = useState(documentosService.obterDocumentos());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    try {
      timbradoService.atualizarConfiguracao(config);
      onConfigSaved?.(config);
      setIsOpen(false);
      
      toast({
        title: "Configurações salvas!",
        description: "Timbrado da empresa configurado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Falha ao salvar configurações",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      await timbradoService.definirLogo(file);
      const updatedConfig = timbradoService.getConfiguracao();
      setConfig(updatedConfig);
      
      toast({
        title: "Logo atualizado!",
        description: "Logo da empresa carregado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha ao carregar logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    timbradoService.removerLogo();
    const updatedConfig = timbradoService.getConfiguracao();
    setConfig(updatedConfig);
    
    toast({
      title: "Logo removido",
      description: "Logo da empresa foi removido",
    });
  };

  const handleExportConfig = () => {
    try {
      const configJson = timbradoService.exportarConfiguracoes();
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timbrado-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Configurações exportadas!",
        description: "Arquivo de backup baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao exportar configurações",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    timbradoService.resetarConfiguracoes();
    const resetConfig = timbradoService.getConfiguracao();
    setConfig(resetConfig);
    
    toast({
      title: "Configurações resetadas",
      description: "Voltou às configurações padrão da Unique",
    });
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, categoria: DocumentoUpload['categoria']) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      await documentosService.adicionarDocumento(file, categoria);
      const updatedDocs = documentosService.obterDocumentos();
      setDocumentos(updatedDocs);
      
      toast({
        title: "Documento carregado!",
        description: `Documento ${file.name} foi adicionado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Falha ao carregar documento",
        variant: "destructive",
      });
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) {
        docInputRef.current.value = '';
      }
    }
  };

  const handleRemoveDocument = (id: string) => {
    try {
      documentosService.removerDocumento(id);
      const updatedDocs = documentosService.obterDocumentos();
      setDocumentos(updatedDocs);
      
      toast({
        title: "Documento removido",
        description: "Documento foi removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Falha ao remover documento",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDocument = (id: string) => {
    try {
      documentosService.baixarDocumento(id);
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Falha ao baixar documento",
        variant: "destructive",
      });
    }
  };

  const updateConfig = (updates: Partial<ConfiguracaoTimbrado>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const currentConfig = timbradoService.getConfiguracao();
  const hasCustomLogo = !!currentConfig.logo;
  const hasCustomData = currentConfig.razaoSocial !== "Unique Assessoria Empresarial";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Building2 className="h-4 w-4 mr-2" />
          Configurar Timbrado
          {(hasCustomLogo || hasCustomData) && (
            <Badge variant="secondary" className="ml-2">
              Configurado
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Configuração de Timbrado Empresarial
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="visual">Personalização</TabsTrigger>
          </TabsList>

          <TabsContent value="empresa" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Logo da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {config.logo ? (
                  <div className="space-y-4">
                    <img 
                      src={config.logo.base64} 
                      alt="Logo da empresa" 
                      className="mx-auto max-h-24 object-contain"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">{config.logo.nome}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRemoveLogo}
                        className="mt-2"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <UploadCloud className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Envie o logo da sua empresa</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG ou SVG (máx. 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingLogo}
                className="w-full"
              >
                {uploadingLogo ? "Carregando..." : config.logo ? "Substituir Logo" : "Enviar Logo"}
              </Button>
            </CardContent>
          </Card>

          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Dados da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input
                    id="razaoSocial"
                    value={config.razaoSocial}
                    onChange={(e) => updateConfig({ razaoSocial: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={config.cnpj}
                    onChange={(e) => updateConfig({ cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={config.contato.telefone}
                      onChange={(e) => updateConfig({ 
                        contato: { ...config.contato, telefone: e.target.value }
                      })}
                      placeholder="(11) 9999-9999"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      value={config.contato.email}
                      onChange={(e) => updateConfig({ 
                        contato: { ...config.contato, email: e.target.value }
                      })}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website (opcional)</Label>
                  <Input
                    id="website"
                    value={config.contato.website || ''}
                    onChange={(e) => updateConfig({ 
                      contato: { ...config.contato, website: e.target.value }
                    })}
                    placeholder="www.empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={config.endereco.logradouro}
                    onChange={(e) => updateConfig({ 
                      endereco: { ...config.endereco, logradouro: e.target.value }
                    })}
                    placeholder="Rua, Av, etc."
                  />
                </div>
                
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={config.endereco.numero}
                    onChange={(e) => updateConfig({ 
                      endereco: { ...config.endereco, numero: e.target.value }
                    })}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={config.endereco.cidade}
                    onChange={(e) => updateConfig({ 
                      endereco: { ...config.endereco, cidade: e.target.value }
                    })}
                    placeholder="São Paulo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={config.endereco.uf}
                    onChange={(e) => updateConfig({ 
                      endereco: { ...config.endereco, uf: e.target.value.toUpperCase() }
                    })}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={config.endereco.cep}
                  onChange={(e) => updateConfig({ 
                    endereco: { ...config.endereco, cep: e.target.value }
                  })}
                  placeholder="00000-000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações Visuais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Personalização Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Marca d'água</Label>
                  <p className="text-xs text-muted-foreground">
                    Adicionar logo como marca d'água no fundo
                  </p>
                </div>
                <Switch
                  checked={config.tema.mostrarMarcaDagua}
                  onCheckedChange={(checked) => updateConfig({
                    tema: { ...config.tema, mostrarMarcaDagua: checked }
                  })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Prefixo dos Relatórios</Label>
                <Input
                  value={config.prefixoRelatorio}
                  onChange={(e) => updateConfig({ prefixoRelatorio: e.target.value.toUpperCase() })}
                  placeholder="UC"
                  maxLength={5}
                />
                <p className="text-xs text-muted-foreground">
                  Próximo número: {config.prefixoRelatorio}-{config.numeroSequencial.toString().padStart(4, '0')}
                </p>
              </div>
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Templates de Documentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload de Minuta Contratual */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Minuta Contratual Modelo</Label>
                      <p className="text-xs text-muted-foreground">
                        Template padrão para contratos de serviços tributários
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.doc,.docx';
                        input.onchange = (e) => handleDocumentUpload(e as any, 'contrato');
                        input.click();
                      }}
                      disabled={uploadingDoc}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {documentos.templates.minutaContratual ? 'Substituir' : 'Upload'}
                    </Button>
                  </div>
                  
                  {documentos.templates.minutaContratual && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{documentos.templates.minutaContratual.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {documentosService.formatarTamanhoArquivo(documentos.templates.minutaContratual.tamanho)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(documentos.templates.minutaContratual!.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(documentos.templates.minutaContratual!.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Upload de Termo de Cessão */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Termo de Cessão Modelo</Label>
                      <p className="text-xs text-muted-foreground">
                        Template para cessão de créditos tributários
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.doc,.docx';
                        input.onchange = (e) => handleDocumentUpload(e as any, 'termo');
                        input.click();
                      }}
                      disabled={uploadingDoc}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {documentos.templates.termoCessao ? 'Substituir' : 'Upload'}
                    </Button>
                  </div>
                  
                  {documentos.templates.termoCessao && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{documentos.templates.termoCessao.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {documentosService.formatarTamanhoArquivo(documentos.templates.termoCessao.tamanho)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(documentos.templates.termoCessao!.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(documentos.templates.termoCessao!.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Outros Documentos */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Outros Documentos</Label>
                      <p className="text-xs text-muted-foreground">
                        Outros templates e documentos úteis
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.doc,.docx';
                        input.onchange = (e) => handleDocumentUpload(e as any, 'outro');
                        input.click();
                      }}
                      disabled={uploadingDoc}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Documento
                    </Button>
                  </div>
                  
                  {documentos.templates.outrosDocumentos.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{doc.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {documentosService.formatarTamanhoArquivo(doc.tamanho)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {documentos.templates.outrosDocumentos.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Nenhum documento adicional carregado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Logo da Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Logo da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {config.logo ? (
                      <div className="space-y-4">
                        <img 
                          src={config.logo.base64} 
                          alt="Logo da empresa" 
                          className="mx-auto max-h-24 object-contain"
                        />
                        <div>
                          <p className="text-sm text-muted-foreground">{config.logo.nome}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRemoveLogo}
                            className="mt-2"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <UploadCloud className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Envie o logo da sua empresa</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG ou SVG (máx. 5MB)</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="w-full"
                  >
                    {uploadingLogo ? "Carregando..." : config.logo ? "Substituir Logo" : "Enviar Logo"}
                  </Button>
                </CardContent>
              </Card>

              {/* Configurações Visuais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Personalização Visual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Marca d'água</Label>
                      <p className="text-xs text-muted-foreground">
                        Adicionar logo como marca d'água no fundo
                      </p>
                    </div>
                    <Switch
                      checked={config.tema.mostrarMarcaDagua}
                      onCheckedChange={(checked) => updateConfig({
                        tema: { ...config.tema, mostrarMarcaDagua: checked }
                      })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Prefixo dos Relatórios</Label>
                    <Input
                      value={config.prefixoRelatorio}
                      onChange={(e) => updateConfig({ prefixoRelatorio: e.target.value.toUpperCase() })}
                      placeholder="UC"
                      maxLength={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Próximo número: {config.prefixoRelatorio}-{config.numeroSequencial.toString().padStart(4, '0')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportConfig}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Settings2 className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfiguracaoTimbrado;