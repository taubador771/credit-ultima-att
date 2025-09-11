import { useMemo } from "react";

interface FormData {
  valorMensal: number;
  periodo: number;
  percentualCredito: number;
  percentualHonorarios: number;
}

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

export const useCalculations = (formData: FormData): CalculationResults => {
  return useMemo(() => {
    const { valorMensal, periodo, percentualCredito, percentualHonorarios } = formData;

    // Cálculo 1 - Valor real de tributo que será compensado com crédito
    const valorCredito = valorMensal * (percentualCredito / 100);

    // Cálculo 2 - Honorários da assessoria
    const honorarios = valorCredito * (percentualHonorarios / 100);

    // Cálculo 3 - Total pago pelo cliente com Unique
    const totalComUnique = honorarios + (valorMensal * (1 - percentualCredito / 100));

    // Cálculo 4 - Economia mensal
    const economiaMensal = valorMensal - totalComUnique;

    // Cálculo 5 - Economia acumulada no período
    const economiaTotal = economiaMensal * periodo;

    // Cálculo 6 - Percentual de economia mensal
    const percentualEconomia = economiaMensal / valorMensal;

    return {
      valorMensal,
      valorCredito,
      honorarios,
      totalComUnique,
      economiaMensal,
      economiaTotal,
      percentualEconomia,
      periodo,
    };
  }, [formData]);
};