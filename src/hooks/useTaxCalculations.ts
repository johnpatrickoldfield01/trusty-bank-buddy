import { useState, useEffect } from 'react';

interface TaxCalculationInputs {
  totalBalance: number;
  mainAccountBalance: number;
  savingsBalance: number;
  creditCardBalance: number;
}

interface TaxBreakdownItem {
  category: string;
  taxableAmount: number;
  rate: string;
  taxDue: number;
  status: 'Outstanding' | 'Estimated';
}

export const useTaxCalculations = ({ 
  totalBalance, 
  mainAccountBalance, 
  savingsBalance, 
  creditCardBalance 
}: TaxCalculationInputs) => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalTaxableIncome, setTotalTaxableIncome] = useState(0);
  const [incomeTax, setIncomeTax] = useState(0);
  const [capitalGainsTax, setCapitalGainsTax] = useState(0);
  const [cryptoTaxLiability, setCryptoTaxLiability] = useState(0);
  const [totalTaxLiability, setTotalTaxLiability] = useState(0);
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdownItem[]>([]);

  useEffect(() => {
    const calculateTaxes = () => {
      setIsLoading(true);

      // Simulate crypto portfolio value (from CryptoPage data)
      // Using simulated values based on the crypto data structure
      const cryptoPortfolioValue = 1250000000; // Simulated total crypto value in ZAR
      const cryptoGains = cryptoPortfolioValue * 0.25; // Assume 25% gains
      
      // South African tax brackets (2024/2025 tax year - simulated)
      const incomeTaxBrackets = [
        { min: 0, max: 237100, rate: 0.18 },
        { min: 237100, max: 370500, rate: 0.26 },
        { min: 370500, max: 512800, rate: 0.31 },
        { min: 512800, max: 673000, rate: 0.36 },
        { min: 673000, max: 857900, rate: 0.39 },
        { min: 857900, max: 1817000, rate: 0.41 },
        { min: 1817000, max: Infinity, rate: 0.45 }
      ];

      // Calculate taxable income (assuming bank balances represent taxable income)
      const simulatedAnnualIncome = totalBalance * 12; // Simulate annual income
      setTotalTaxableIncome(simulatedAnnualIncome);

      // Calculate income tax using progressive brackets
      let calculatedIncomeTax = 0;
      let remainingIncome = simulatedAnnualIncome;

      for (const bracket of incomeTaxBrackets) {
        if (remainingIncome <= 0) break;
        
        const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
        calculatedIncomeTax += taxableInBracket * bracket.rate;
        remainingIncome -= taxableInBracket;
      }

      setIncomeTax(calculatedIncomeTax);

      // Calculate Capital Gains Tax (CGT)
      // Assume 40% inclusion rate for individuals
      const cgtInclusionRate = 0.4;
      const annualExclusion = 40000; // R40,000 annual exclusion
      const savingsGains = Math.max(0, savingsBalance * 0.05 - annualExclusion); // 5% gains on savings
      const calculatedCGT = savingsGains * cgtInclusionRate * 0.45; // Top marginal rate
      setCapitalGainsTax(calculatedCGT);

      // Calculate Crypto Tax Liability
      // Crypto gains are treated as capital gains in SA
      const cryptoGainsAboveExclusion = Math.max(0, cryptoGains - 40000);
      const calculatedCryptoTax = cryptoGainsAboveExclusion * cgtInclusionRate * 0.45;
      setCryptoTaxLiability(calculatedCryptoTax);

      // Calculate total tax liability
      const total = calculatedIncomeTax + calculatedCGT + calculatedCryptoTax;
      setTotalTaxLiability(total);

      // Create tax breakdown
      const breakdown: TaxBreakdownItem[] = [
        {
          category: 'Personal Income Tax',
          taxableAmount: simulatedAnnualIncome,
          rate: 'Progressive (18%-45%)',
          taxDue: calculatedIncomeTax,
          status: 'Outstanding'
        },
        {
          category: 'Capital Gains Tax - Savings',
          taxableAmount: savingsGains + annualExclusion,
          rate: '18% (40% inclusion)',
          taxDue: calculatedCGT,
          status: 'Estimated'
        },
        {
          category: 'Capital Gains Tax - Crypto',
          taxableAmount: cryptoGains,
          rate: '18% (40% inclusion)',
          taxDue: calculatedCryptoTax,
          status: 'Outstanding'
        },
        {
          category: 'Dividend Withholding Tax',
          taxableAmount: mainAccountBalance * 0.02, // 2% dividend yield simulation
          rate: '20%',
          taxDue: mainAccountBalance * 0.02 * 0.2,
          status: 'Estimated'
        },
        {
          category: 'Interest Income Tax',
          taxableAmount: savingsBalance * 0.06, // 6% interest simulation
          rate: 'Marginal Rate',
          taxDue: savingsBalance * 0.06 * 0.31,
          status: 'Outstanding'
        }
      ];

      setTaxBreakdown(breakdown);
      setIsLoading(false);
    };

    // Simulate loading delay
    const timer = setTimeout(calculateTaxes, 1000);
    return () => clearTimeout(timer);
  }, [totalBalance, mainAccountBalance, savingsBalance, creditCardBalance]);

  return {
    totalTaxableIncome,
    incomeTax,
    capitalGainsTax,
    cryptoTaxLiability,
    totalTaxLiability,
    taxBreakdown,
    isLoading
  };
};