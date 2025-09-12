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
import { timbradoService } from "@/services/timbradoService";
import type { ConfiguracaoTimbrado } from "@/types/timbrado";
import { 
  Building2, Upload, X, Palette, FileText, 
  Download, UploadCloud, RotateCcw, Settings2
} from "lucide-react";

interface ConfiguracaoTimbradoProps {
  onConfigSaved?: (config: ConfiguracaoTimbrado) => void;
}

const ConfiguracaoTimbrado = ({ onConfigSaved }: ConfiguracaoTimbradoProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfiguracaoTimbrado>(timbradoService.getConfiguracao());
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const updateConfig = (updates: Partial<ConfiguracaoTimbrado>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const currentConfig = timbradoService.getConfiguracao();
  const hasCustomLogo = !!currentConfig.logo;
  const hasCustomData = currentConfig.razaoSocial !== "Unique Créditos Tributários LTDA";

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Configuração de Timbrado Empresarial
          </DialogTitle>
        </DialogHeader>

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
                    placeholder="www.empresa.com.br"
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