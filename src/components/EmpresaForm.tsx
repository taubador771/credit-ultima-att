import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Building2, 
  DollarSign, 
  Clock, 
  Save,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

interface EmpresaFormProps {
  formData: FormData;
  onDataChange: (data: FormData) => void;
  compact?: boolean;
}

export function EmpresaForm({ formData, onDataChange, compact = false }: EmpresaFormProps) {
  const [localData, setLocalData] = useState<FormData>(formData);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar com props quando mudarem
  useEffect(() => {
    setLocalData(formData);
    setHasChanges(false);
  }, [formData]);

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
    setHasChanges(true);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setLocalData({ ...localData, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onDataChange(localData);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalData(formData);
    setHasChanges(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (compact) {
    return (
      <Card className="w-full">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Dados da Empresa
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
              {!isExpanded && (
                <div className="text-xs text-muted-foreground">
                  {localData.nomeEmpresa || "Não configurado"}
                </div>
              )}
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-3">
              {/* Nome da Empresa */}
              <div className="space-y-1">
                <Label htmlFor="nomeEmpresa" className="text-xs">Nome da Empresa</Label>
                <Input
                  id="nomeEmpresa"
                  placeholder="Digite o nome"
                  value={localData.nomeEmpresa}
                  onChange={(e) => handleInputChange("nomeEmpresa", e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Tributos */}
              <div className="space-y-2">
                <Label className="text-xs">Tributos</Label>
                <div className="grid grid-cols-2 gap-1">
                  {tributosList.map((tributo) => (
                    <div key={tributo.id} className="flex items-center space-x-1">
                      <Checkbox
                        id={tributo.id}
                        checked={localData.tributos.includes(tributo.id)}
                        onCheckedChange={(checked) => handleTributoChange(tributo.id, !!checked)}
                        className="h-3 w-3"
                      />
                      <Label htmlFor={tributo.id} className="text-xs cursor-pointer">
                        {tributo.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Valor Mensal */}
              <div className="space-y-1">
                <Label htmlFor="valorMensal" className="text-xs flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Valor Mensal
                </Label>
                <Input
                  id="valorMensal"
                  type="number"
                  placeholder="100000"
                  value={localData.valorMensal || ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                    handleInputChange("valorMensal", value);
                  }}
                  className="h-8 text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(localData.valorMensal)}
                </p>
              </div>

              {/* Período */}
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Período
                </Label>
                <Select
                  value={localData.periodo.toString()}
                  onValueChange={(value) => handleInputChange("periodo", parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botões */}
              {hasChanges && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="flex-1 h-7 text-xs"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  // Versão completa (não compacta)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Dados da Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ... resto do formulário completo ... */}
      </CardContent>
    </Card>
  );
}