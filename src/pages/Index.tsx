import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import KPICard from "@/components/KPICard";
import ChartsSection from "@/components/ChartsSection";
import { useCalculations } from "@/hooks/useCalculations";
import { DollarSign, TrendingUp, Percent, Calculator, Building2 } from "lucide-react";

interface FormData {
  nomeEmpresa: string;
  tributos: string[];
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

const Index = () => {
  const [formData, setFormData] = useState<FormData>({
    nomeEmpresa: "",
    tributos: [],
    valorMensal: 100000,
    periodo: 12,
    percentualCredito: 95,
    percentualHonorarios: 70,
  });

  const results = useCalculations(formData);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <DashboardLayout formData={formData} onDataChange={setFormData}>
      <div className="space-y-8">
        {/* Cabeçalho da empresa */}
        {formData.nomeEmpresa && (
          <div className="bg-gradient-primary text-primary-foreground p-6 rounded-xl shadow-primary">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{formData.nomeEmpresa}</h2>
                <p className="text-primary-foreground/80">
                  Simulação de economia tributária para {results.periodo} meses
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="💸 Economia Mensal"
            value={formatCurrency(results.economiaMensal)}
            subtitle="vs pagamento tradicional"
            trend="up"
            variant="success"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          
          <KPICard
            title="📈 Economia Total"
            value={formatCurrency(results.economiaTotal)}
            subtitle={`em ${results.periodo} meses`}
            trend="up"
            variant="success"
            icon={<DollarSign className="h-5 w-5" />}
          />
          
          <KPICard
            title="📊 Percentual de Economia"
            value={formatPercent(results.percentualEconomia)}
            subtitle="do valor total"
            trend="up"
            variant="default"
            icon={<Percent className="h-5 w-5" />}
          />
          
          <KPICard
            title="💰 Novo Valor Mensal"
            value={formatCurrency(results.totalComUnique)}
            subtitle="com Unique"
            trend="down"
            variant="warning"
            icon={<Calculator className="h-5 w-5" />}
          />
        </div>

        {/* Resumo executivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-success-light border-l-4 border-success p-6 rounded-r-xl">
            <h3 className="font-bold text-success text-lg mb-4 flex items-center gap-2">
              📊 Resumo Financeiro
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor atual mensal:</span>
                <span className="font-semibold">{formatCurrency(results.valorMensal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor com Unique:</span>
                <span className="font-semibold text-success">{formatCurrency(results.totalComUnique)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium">Economia mensal:</span>
                <span className="font-bold text-success text-lg">{formatCurrency(results.economiaMensal)}</span>
              </div>
            </div>
          </div>

          <div className="bg-primary-light border-l-4 border-primary p-6 rounded-r-xl">
            <h3 className="font-bold text-primary text-lg mb-4 flex items-center gap-2">
              🎯 Projeção do Período
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Período selecionado:</span>
                <span className="font-semibold">{results.periodo} meses</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total sem Unique:</span>
                <span className="font-semibold">{formatCurrency(results.valorMensal * results.periodo)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-sm font-medium">Economia total:</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(results.economiaTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <ChartsSection results={results} />
      </div>
    </DashboardLayout>
  );
};

export default Index;
