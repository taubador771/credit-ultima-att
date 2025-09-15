import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

interface CalculationResults {
  valorMensal: number;
  valorCredito: number;
  honorarios: number;
  totalComUnique: number;
  economiaMensal: number;
  economiaTotal: number;
  percentualEconomia: number;
  periodo: number;
}

interface ChartsSectionProps {
  results: CalculationResults;
}

const ChartsSection = ({ results }: ChartsSectionProps) => {
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

  // Dados para gráfico de barras duplas
  const barData = [
    {
      name: 'Mensal',
      'Sem Unique': results.valorMensal,
      'Com Unique': results.totalComUnique,
      economia: results.economiaMensal,
    },
    {
      name: 'Período Total',
      'Sem Unique': results.valorMensal * results.periodo,
      'Com Unique': results.totalComUnique * results.periodo,
      economia: results.economiaTotal,
    }
  ];

  // Dados para gráfico de pizza
  const pieData = [
    { name: 'Pago Diretamente (5%)', value: results.valorMensal * 0.05, color: '#f59e0b' },
    { name: 'Honorários (70% do crédito)', value: results.honorarios, color: '#3b82f6' },
    { name: 'Economia Líquida', value: results.economiaMensal, color: '#10b981' },
  ];

  // Dados para gráfico de linha temporal
  const timelineData = Array.from({ length: results.periodo }, (_, i) => ({
    mes: i + 1,
    economiaAcumulada: results.economiaMensal * (i + 1),
  }));

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Gráficos principais em uma linha */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gráfico de Barras Duplas */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Comparativo de Custos
            </CardTitle>
            <CardDescription>
              Valor pago sem Unique vs com Unique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData} margin={{ top: 20, right: 50, left: 80, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} width={70} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Sem Unique" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Com Unique" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Distribuição do Valor Mensal
            </CardTitle>
            <CardDescription>
              Como o valor mensal é dividido com Unique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => label}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => `${value}: ${formatPercent(entry.payload.value / results.valorMensal)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha Temporal em linha separada */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Evolução da Economia Acumulada
          </CardTitle>
          <CardDescription>
            Como a economia cresce ao longo do período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timelineData} margin={{ top: 20, right: 50, left: 80, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="mes" 
                label={{ value: 'Mês', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                tickFormatter={formatCurrency} 
                width={70}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Economia Acumulada']}
                labelFormatter={(label) => `Mês ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="economiaAcumulada" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;