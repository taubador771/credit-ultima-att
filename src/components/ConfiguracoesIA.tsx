import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { iaService } from "@/services/iaService";

interface ConfiguracoesIAProps {
  onConfigSaved: (config: IAConfig) => void;
  currentConfig?: IAConfig;
}

export interface IAConfig {
  habilitado: boolean;
  provider: "openai" | "anthropic" | "google";
  apiKey: string;
  modelo: string;
  temperatura: number;
  promptSistema: string;
}

const ConfiguracoesIA = ({ onConfigSaved, currentConfig }: ConfiguracoesIAProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<IAConfig>(currentConfig || {
    habilitado: false,
    provider: "google",
    apiKey: "",
    modelo: "gemini-2.5-flash",
    temperatura: 0.7,
    promptSistema: "Você é um especialista em vendas e análise de economia tributária brasileira. Sua missão é mostrar de forma persuasiva o potencial de economia que a empresa pode alcançar com os serviços da Unique Assessoria Empresarial. Foque nos benefícios financeiros, ROI e impacto positivo no negócio. Seja direto, motivador e enfatize as oportunidades de crescimento através da economia tributária."
  });
  const [modeloCustomizado, setModeloCustomizado] = useState("");
  
  const [testando, setTestando] = useState(false);

  const modelos = {
    openai: [
      { value: "gpt-4o-mini", label: "GPT-4o Mini (Gratuito)" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Gratuito)" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4", label: "GPT-4" }
    ],
    anthropic: [
      { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku (Mais Barato)" },
      { value: "claude-3-5-sonnet-20241022", label: "Claude-3.5 Sonnet" },
      { value: "claude-3-5-haiku-20241022", label: "Claude-3.5 Haiku" }
    ],
    google: [
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Gratuito)" },
      { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash Experimental (Gratuito)" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Gratuito)" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { value: "gemini-pro", label: "Gemini Pro" }
    ]
  };

  const handleSave = () => {
    if (config.habilitado && !config.apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Chave de API é obrigatória quando IA está habilitada",
        variant: "destructive",
      });
      return;
    }

    onConfigSaved(config);
    setOpen(false);
    toast({
      title: "Configurações salvas",
      description: "Configurações de IA atualizadas com sucesso",
    });
  };

  const testarConexao = async () => {
    if (!config.apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Insira uma chave de API válida",
        variant: "destructive",
      });
      return;
    }

    setTestando(true);
    
    try {
      // Salva config atual e realiza teste real
      iaService.setConfig(config);
      await iaService.testarConexaoBasico();
      
      toast({
        title: "Teste realizado",
        description: `Conexão com ${config.provider.toUpperCase()} (${config.modelo}) estabelecida com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: error instanceof Error ? error.message : "Falha ao conectar com o provider de IA",
        variant: "destructive",
      });
    } finally {
      setTestando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurar IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Habilitação */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="habilitar-ia">Habilitar funcionalidades de IA</Label>
              <p className="text-sm text-muted-foreground">
                Configure o provedor de IA e funcionalidades relacionadas
              </p>
            </div>
            <Switch
              id="habilitar-ia"
              checked={config.habilitado}
              onCheckedChange={(checked) => setConfig({...config, habilitado: checked})}
            />
          </div>

          {config.habilitado && (
            <>
              {/* Provider */}
              <div className="space-y-2">
                <Label>Provedor de IA</Label>
                <Select
                  value={config.provider}
                  onValueChange={(value: "openai" | "anthropic" | "google") => 
                    setConfig({...config, provider: value, modelo: modelos[value][0].value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="google">Google (Gemini)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chave API */}
              <div className="space-y-2">
                <Label htmlFor="api-key">Chave de API</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-ant-... | sk-... | AIza..."
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Mantenha sua chave segura. Ela é criptografada no armazenamento.
                </p>
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Select
                  value={config.modelo === modeloCustomizado && modeloCustomizado ? "custom" : config.modelo}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setConfig({...config, modelo: modeloCustomizado || ""});
                    } else {
                      setConfig({...config, modelo: value});
                      setModeloCustomizado("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelos[config.provider].map((modelo) => (
                      <SelectItem key={modelo.value} value={modelo.value}>
                        {modelo.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">🔧 Modelo Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                
                {(config.modelo === "custom" || (modeloCustomizado && config.modelo === modeloCustomizado)) && (
                  <div className="mt-2">
                    <Input
                      placeholder="Digite o nome exato do modelo (ex: gemini-2.0-flash-exp)"
                      value={modeloCustomizado}
                      onChange={(e) => {
                        setModeloCustomizado(e.target.value);
                        setConfig({...config, modelo: e.target.value});
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Certifique-se de usar o nome exato do modelo conforme a documentação da API
                    </p>
                  </div>
                )}
              </div>

              {/* Temperatura */}
              <div className="space-y-3">
                <Label>Temperatura (0.0-2.0)</Label>
                <div className="px-2">
                  <Slider
                    value={[config.temperatura]}
                    onValueChange={([value]) => setConfig({...config, temperatura: value})}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Conservador</span>
                    <span className="font-medium">{config.temperatura}</span>
                    <span>Criativo</span>
                  </div>
                </div>
              </div>

              {/* Prompt Sistema */}
              <div className="space-y-2">
                <Label htmlFor="prompt-sistema">Prompt Sistema (Opcional)</Label>
                <Textarea
                  id="prompt-sistema"
                  placeholder="Defina o comportamento da IA..."
                  value={config.promptSistema}
                  onChange={(e) => setConfig({...config, promptSistema: e.target.value})}
                  rows={4}
                />
              </div>

              {/* Como obter API Key */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Como Obter API Key:
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm text-muted-foreground">
                  <p><strong>🟢 Google (Recomendado - Gratuito):</strong></p>
                  <p>1. Acesse aistudio.google.com</p>
                  <p>2. Clique "Get API Key" → "Create API Key"</p>
                  <p>3. Copie a chave (começa com "AIza")</p>
                  
                  <p className="pt-2"><strong>🟡 OpenAI (Pago):</strong></p>
                  <p>1. Acesse platform.openai.com</p>
                  <p>2. API Keys → "Create new secret key"</p>
                  <p>3. Copie a chave (começa com "sk-")</p>
                  
                  <p className="pt-2"><strong>🟠 Anthropic (Pago):</strong></p>
                  <p>1. Acesse console.anthropic.com</p>
                  <p>2. API Keys → "Create Key"</p>
                  <p>3. Copie a chave (começa com "sk-ant-")</p>
                </CardContent>
              </Card>

              {/* Configuração Recomendada */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-600">✅ Modelos Gratuitos Recomendados:</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1 text-sm text-muted-foreground">
                  <p><strong>🔥 Melhor custo-benefício:</strong></p>
                  <p>• Gemini 2.5 Flash (Gratuito)</p>
                  <p>• Gemini 2.0 Flash Experimental (Gratuito)</p>
                  <p>• GPT-4o Mini (Gratuito OpenAI)</p>
                  <p>• Claude 3 Haiku (Mais barato Anthropic)</p>
                  <p className="pt-2"><strong>Para análise financeira:</strong></p>
                  <p>• Temperatura: 0.3-0.7 (consistente)</p>
                  <p>• Use prompt sistema específico para melhores resultados</p>
                </CardContent>
              </Card>

              {/* Teste Conexão */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={testarConexao}
                  disabled={testando || !config.apiKey.trim()}
                  className="flex-1"
                >
                  {testando ? "Testando..." : "Testar Conexão IA"}
                </Button>
                <Button onClick={handleSave}>
                  Salvar Configurações
                </Button>
              </div>
            </>
          )}

          {!config.habilitado && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Habilite as funcionalidades de IA para configurar</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfiguracoesIA;