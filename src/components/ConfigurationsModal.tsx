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
import { 
  Building2, 
  DollarSign, 
  Clock, 
  Settings, 
  Info,
  Save
} from "lucide-react";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

interface ConfigurationsModalProps {
  formData: FormData;
  onDataChange: (data: FormData) => void;
  trigger?: React.ReactNode;
}

export function ConfigurationsModal({ formData, onDataChange, trigger }: ConfigurationsModalProps) {
  const [localData, setLocalData] = useState<FormData>(formData);
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

  const handleInputChange = (field: keyof FormData, value: string | number) => {
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
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            Configurações do Simulador
          </DialogTitle>
          <DialogDescription>
            Configure os parâmetros para o cálculo de economia tributária
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados da Empresa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa" className="text-sm font-medium">
                Nome da Empresa *
              </Label>
              <Input
                id="nomeEmpresa"
                placeholder="Digite o nome da empresa"
                value={localData.nomeEmpresa}
                onChange={(e) => handleInputChange("nomeEmpresa", e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Tributos Pagos *</Label>
              <div className="grid grid-cols-2 gap-2">
                {tributosList.map((tributo) => (
                  <div key={tributo.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tributo.id}
                      checked={localData.tributos.includes(tributo.id)}
                      onCheckedChange={(checked) => handleTributoChange(tributo.id, !!checked)}
                    />
                    <Label
                      htmlFor={tributo.id}
                      className="text-sm cursor-pointer"
                    >
                      {tributo.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorMensal" className="flex items-center gap-2 text-sm font-medium">
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
              <Label htmlFor="periodo" className="flex items-center gap-2 text-sm font-medium">
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

          <Separator />

          {/* Configurações Avançadas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold border-b pb-2">
              <Settings className="h-5 w-5" />
              Configurações Avançadas
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="percentualCredito" className="text-sm font-medium">
                Percentual de Uso de Crédito (%)
              </Label>
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
              <Label htmlFor="percentualHonorarios" className="text-sm font-medium">
                Percentual de Honorários (%)
              </Label>
              <Input
                id="percentualHonorarios"
                type="number"
                min="0"
                max="100"
                value={localData.percentualHonorarios}
                onChange={(e) => handleInputChange("percentualHonorarios", parseFloat(e.target.value) || 70)}
              />
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
          </div>
        </div>

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