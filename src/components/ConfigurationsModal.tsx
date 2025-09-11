import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  DollarSign, 
  Clock, 
  Settings, 
  Info,
  Save,
  Bot,
  Upload,
  Palette,
  Globe,
  Shield,
  Database
} from "lucide-react";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
  // Configurações de IA
  aiApiKey?: string;
  aiProvider?: string;
  aiModel?: string;
  autoGenerateReports?: boolean;
  // Configurações visuais
  companyLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  // Configurações de sistema
  backupEnabled?: boolean;
  notificationsEnabled?: boolean;
  dataRetentionDays?: number;
}

interface ConfigurationsModalProps {
  formData: FormData;
  onDataChange: (data: FormData) => void;
  trigger?: React.ReactNode;
}

export function ConfigurationsModal({ formData, onDataChange, trigger }: ConfigurationsModalProps) {
  const [localData, setLocalData] = useState<FormData>({
    ...formData,
    // Valores padrão para novas configurações
    aiProvider: formData.aiProvider || "openai",
    aiModel: formData.aiModel || "gpt-4",
    autoGenerateReports: formData.autoGenerateReports ?? true,
    primaryColor: formData.primaryColor || "#3b82f6",
    secondaryColor: formData.secondaryColor || "#64748b",
    backupEnabled: formData.backupEnabled ?? true,
    notificationsEnabled: formData.notificationsEnabled ?? true,
    dataRetentionDays: formData.dataRetentionDays || 365
  });
  const [isOpen, setIsOpen] = useState(false);

  const tributosList = [
    { id: "irpj", label: "IRPJ" },
    { id: "csll", label: "CSLL" },
    { id: "pis", label: "PIS" },
    { id: "cofins", label: "COFINS" },
  ];

  const handleTributoChange = (tributoId: string, checked: boolean) => {
    const newTributos = checked
      ? [...localData.tributos, tributoId]
      : localData.tributos.filter(t => t !== tributoId);
    
    setLocalData({ ...localData, tributos: newTributos });
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setLocalData({ ...localData, [field]: value });
  };

  const handleSave = () => {
    onDataChange(localData);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalData(formData);
    setIsOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </DialogTitle>
          <DialogDescription>
            Configure parâmetros do simulador, integrações e personalização
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="simulador" className="py-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="simulador">Simulador</TabsTrigger>
            <TabsTrigger value="ia">IA & Relatórios</TabsTrigger>
            <TabsTrigger value="visual">Personalização</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
            <TabsTrigger value="backup">Backup & Dados</TabsTrigger>
          </TabsList>

          {/* Aba Simulador */}
          <TabsContent value="simulador" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Dados da Empresa
                </CardTitle>
                <CardDescription>
                  Informações básicas para cálculo de economia tributária
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                  <Input
                    id="nomeEmpresa"
                    placeholder="Digite o nome da empresa"
                    value={localData.nomeEmpresa}
                    onChange={(e) => handleInputChange("nomeEmpresa", e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Tributos Pagos *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {tributosList.map((tributo) => (
                      <div key={tributo.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tributo.id}
                          checked={localData.tributos.includes(tributo.id)}
                          onCheckedChange={(checked) => handleTributoChange(tributo.id, !!checked)}
                        />
                        <Label htmlFor={tributo.id} className="cursor-pointer">
                          {tributo.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valorMensal" className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      Valor Mensal de Impostos *
                    </Label>
                    <Input
                      id="valorMensal"
                      type="number"
                      placeholder="100000"
                      value={localData.valorMensal}
                      onChange={(e) => handleInputChange("valorMensal", parseFloat(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(localData.valorMensal)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="periodo" className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Período da Simulação *
                    </Label>
                    <Select
                      value={localData.periodo.toString()}
                      onValueChange={(value) => handleInputChange("periodo", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 meses</SelectItem>
                        <SelectItem value="6">6 meses</SelectItem>
                        <SelectItem value="12">12 meses</SelectItem>
                        <SelectItem value="24">24 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="percentualCredito">Percentual de Uso de Crédito (%)</Label>
                    <Input
                      id="percentualCredito"
                      type="number"
                      min="0"
                      max="95"
                      value={localData.percentualCredito}
                      onChange={(e) => handleInputChange("percentualCredito", parseFloat(e.target.value) || 95)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="percentualHonorarios">Percentual de Honorários (%)</Label>
                    <Input
                      id="percentualHonorarios"
                      type="number"
                      min="0"
                      max="100"
                      value={localData.percentualHonorarios}
                      onChange={(e) => handleInputChange("percentualHonorarios", parseFloat(e.target.value) || 70)}
                    />
                  </div>
                </div>

                <div className="bg-primary-light border border-primary/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Como Funciona</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Você paga apenas 5% em dinheiro + honorários sobre o crédito utilizado.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba IA & Relatórios */}
          <TabsContent value="ia" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Integração com IA
                </CardTitle>
                <CardDescription>
                  Configure a IA para geração automática de relatórios personalizados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Geração Automática de Relatórios</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilita a IA para gerar relatórios automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={localData.autoGenerateReports}
                    onCheckedChange={(checked) => handleInputChange("autoGenerateReports", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiProvider">Provedor de IA</Label>
                  <Select
                    value={localData.aiProvider}
                    onValueChange={(value) => handleInputChange("aiProvider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem value="google">Google (Gemini)</SelectItem>
                      <SelectItem value="local">IA Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiModel">Modelo de IA</Label>
                  <Select
                    value={localData.aiModel}
                    onValueChange={(value) => handleInputChange("aiModel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recomendado)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiApiKey">Chave da API</Label>
                  <Input
                    id="aiApiKey"
                    type="password"
                    placeholder="Digite sua chave da API"
                    value={localData.aiApiKey || ""}
                    onChange={(e) => handleInputChange("aiApiKey", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Mantenha sua chave segura. Ela será criptografada no sistema.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Configuração de IA</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A IA lerá os dados configurados e gerará relatórios personalizados em PDF para cada cliente, incluindo análises detalhadas e recomendações.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Personalização */}
          <TabsContent value="visual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Personalização Visual
                </CardTitle>
                <CardDescription>
                  Configure aparência e marca da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Logotipo da Empresa</Label>
                  <div className="flex gap-2">
                    <Input
                      id="companyLogo"
                      placeholder="URL do logotipo ou faça upload"
                      value={localData.companyLogo || ""}
                      onChange={(e) => handleInputChange("companyLogo", e.target.value)}
                    />
                    <Button variant="outline">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={localData.primaryColor}
                        onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={localData.primaryColor}
                        onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={localData.secondaryColor}
                        onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={localData.secondaryColor}
                        onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Sistema */}
          <TabsContent value="sistema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Configurações de segurança e notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificações</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações sobre relatórios e atualizações
                    </p>
                  </div>
                  <Switch
                    checked={localData.notificationsEnabled}
                    onCheckedChange={(checked) => handleInputChange("notificationsEnabled", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Retenção de Dados (dias)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    min="30"
                    max="3650"
                    value={localData.dataRetentionDays}
                    onChange={(e) => handleInputChange("dataRetentionDays", parseInt(e.target.value) || 365)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Por quanto tempo manter histórico de relatórios e dados
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Backup */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup e Dados
                </CardTitle>
                <CardDescription>
                  Configurações de backup e exportação de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Criar backup automático dos dados semanalmente
                    </p>
                  </div>
                  <Switch
                    checked={localData.backupEnabled}
                    onCheckedChange={(checked) => handleInputChange("backupEnabled", checked)}
                  />
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => alert("Exportando dados do sistema...")}>
                    <Database className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => alert("Importando configurações...")}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}