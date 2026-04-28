'use client';

import React, { useMemo, useState } from 'react';
import {
  useCalculatorState,
  CurrencySelector,
  UnitSelector,
  ObsNote,
  CalculatorInput,
  SectionCard,
  SectionHeader,
  ResultComparison,
  SavingsBar,
  CollapsibleSection,
  ResultRow,
  ResultsTableHeader,
  SavingsCard,
  ResetButton,
  InfoBanner,
  CalculatorDetailHero,
  formatCurrency,
  validateRange,
  type Currency,
} from './shared/CalculatorShared';

interface ElectricMotorCalculatorProps {
  title?: string;
  description?: string;
  contact_link?: string;
  product_link?: string;
  image?: { url: string; alt?: string };
  image_mobile?: { url: string; alt?: string };
}

const INITIAL_VALUES: Record<string, string> = {
  motors: '',
  'grease-per-bearings': '',
  'cost-of-grease': '',
  'cost-of-grease-product': '',
  'regreasing-interval': '',
  multiplier: '',
  'regrease-time': '',
  'labor-cost': '',
  'power-rating': '',
  'operating-time': '',
  'energy-average': '',
  'estimated-energy': '',
};

const GREASE_UNITS = ['kg', 'lb'];

// Reference table for the info modal
const REFERENCE_TABLE = [
  { rpm: 900, torqueReduction: 22, eeImprovement: 0.13 },
  { rpm: 1300, torqueReduction: 17, eeImprovement: 0.1 },
  { rpm: 1800, torqueReduction: 18, eeImprovement: 0.1 },
  { rpm: 3600, torqueReduction: 40, eeImprovement: 0.24 },
];

export default function ElectricMotorCalculator({ title, description, contact_link, product_link, image, image_mobile }: ElectricMotorCalculatorProps) {
  const {
    values,
    currency,
    unit,
    setValue,
    getNumericValue,
    reset,
    changeCurrency,
    changeUnit,
  } = useCalculatorState(INITIAL_VALUES);

  const [showInfoModal, setShowInfoModal] = useState(false);

  const results = useMemo(() => {
    const motors = getNumericValue('motors');
    const greasePerBearing = getNumericValue('grease-per-bearings');
    const costOfGrease = getNumericValue('cost-of-grease');
    const costOfGreaseProduct = getNumericValue('cost-of-grease-product');
    const regreasingInterval = getNumericValue('regreasing-interval');
    const multiplier = getNumericValue('multiplier');
    const regreaseTime = getNumericValue('regrease-time');
    const laborCost = getNumericValue('labor-cost');
    const powerRating = getNumericValue('power-rating');
    const operatingTime = getNumericValue('operating-time');
    const energyAverage = getNumericValue('energy-average');
    const estimatedEnergy = getNumericValue('estimated-energy');

    if (regreasingInterval === 0 || multiplier === 0) {
      return {
        yourGreaseCost: 0, productGreaseCost: 0,
        yourRegreaseCost: 0, productRegreaseCost: 0,
        yourEnergyCost: 0, productEnergyCost: 0,
        potentialSavings: 0,
        energyValid: true,
      };
    }

    // Annual grease cost (factor *2 for two bearings per motor)
    const yourGreaseCost = (52 / regreasingInterval) * (motors * greasePerBearing) * costOfGrease * 2;
    const productGreaseCost = (52 / multiplier) * (costOfGreaseProduct * greasePerBearing) * motors * 2;

    // Regrease cost (product + labor)
    const yourRegreaseCost = motors * regreaseTime * laborCost * (52 / regreasingInterval) + yourGreaseCost;
    const productRegreaseCost = motors * regreaseTime * laborCost * (52 / multiplier) + productGreaseCost;

    // Energy cost (168 = hours per week, 0.75 = motor efficiency)
    const yourEnergyCost = motors * powerRating * operatingTime * 0.75 * (168 * energyAverage);
    const energyValid = estimatedEnergy === 0 || validateRange(estimatedEnergy, 0.1, 0.24);
    const productEnergyCost = energyValid && estimatedEnergy > 0
      ? yourEnergyCost * (1 - estimatedEnergy / 100)
      : yourEnergyCost;

    // Total potential savings
    const potentialSavings = (yourRegreaseCost - productRegreaseCost) + (yourEnergyCost - productEnergyCost);

    return {
      yourGreaseCost, productGreaseCost,
      yourRegreaseCost, productRegreaseCost,
      yourEnergyCost, productEnergyCost,
      potentialSavings,
      energyValid,
    };
  }, [values, getNumericValue]);

  const estimatedEnergyValue = getNumericValue('estimated-energy');
  const showEnergyError = estimatedEnergyValue > 0 && !results.energyValid;

  const unitLabel = unit;
  const currencySymbol = currency;

  return (
    <>
    <CalculatorDetailHero title={title} description={description} image={image} image_mobile={image_mobile} />
    <section className="py-8 md:py-10 lg:py-[60px] bg-neutral-2">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Cards */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Simulation Parameters Card */}
            <SectionCard>
              <SectionHeader icon="barChart" title="Parâmetros da simulação" subtitle="Selecione moeda e unidade de medida antes de preencher" />
              <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                <CurrencySelector value={currency} onChange={changeCurrency} />
                <UnitSelector value={unit} options={GREASE_UNITS} onChange={changeUnit} label="Unidade de graxa" />
              </div>
              <ObsNote />
            </SectionCard>

            {/* Equipment Data Card */}
            <SectionCard>
              <SectionHeader
                icon="settings"
                title="Dados do equipamento e uso"
                rightElement={<ResetButton onClick={reset} />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Current Grease Column */}
                <div className="flex flex-col gap-5">
                  <p className="text-xs font-semibold text-medium-gray uppercase tracking-wider">Sua graxa atual</p>

                  <CalculatorInput
                    id="motors"
                    label="Número de motores"
                    value={values['motors']}
                    onChange={setValue}
                    integer
                  />
                  <CalculatorInput
                    id="grease-per-bearings"
                    label={`Qtd. média de graxa por rolamento (${unitLabel})`}
                    value={values['grease-per-bearings']}
                    onChange={setValue}
                    suffix={unitLabel}
                  />
                  <CalculatorInput
                    id="cost-of-grease"
                    label={`Custo da graxa atual (${currencySymbol}/${unitLabel})`}
                    value={values['cost-of-grease']}
                    onChange={setValue}
                    suffix={currencySymbol}
                  />
                  <CalculatorInput
                    id="regreasing-interval"
                    label="Intervalo de relubrificação (semanas)"
                    value={values['regreasing-interval']}
                    onChange={setValue}
                    suffix="sem."
                  />
                  <CalculatorInput
                    id="regrease-time"
                    label="Tempo para relubrificar (horas)"
                    value={values['regrease-time']}
                    onChange={setValue}
                    suffix="h"
                  />
                  <CalculatorInput
                    id="labor-cost"
                    label={`Custo de mão de obra (${currencySymbol}/hora)`}
                    value={values['labor-cost']}
                    onChange={setValue}
                    suffix={`${currencySymbol}/h`}
                  />
                  <CalculatorInput
                    id="power-rating"
                    label="Potência do motor (Hp)"
                    value={values['power-rating']}
                    onChange={setValue}
                    suffix="Hp"
                  />
                  <CalculatorInput
                    id="operating-time"
                    label="Tempo de operação por ano (semanas)"
                    value={values['operating-time']}
                    onChange={setValue}
                    suffix="sem."
                  />
                  <CalculatorInput
                    id="energy-average"
                    label={`Custo médio de energia (${currencySymbol}/kW-Hr)`}
                    value={values['energy-average']}
                    onChange={setValue}
                    suffix={`${currencySymbol}/kWh`}
                  />
                </div>

                {/* Proposed Column */}
                <div className="flex flex-col gap-5">
                  <p className="text-xs font-semibold text-medium-gray uppercase tracking-wider">Proposto (Mobil SHC)</p>

                  <CalculatorInput
                    id="cost-of-grease-product"
                    label={`Custo da graxa Mobil SHC (${currencySymbol}/${unitLabel})`}
                    value={values['cost-of-grease-product']}
                    onChange={setValue}
                    suffix={currencySymbol}
                  />
                  <CalculatorInput
                    id="multiplier"
                    label="Multiplicador Mobil SHC (semanas)"
                    value={values['multiplier']}
                    onChange={setValue}
                    suffix="sem."
                  />
                  <div>
                    <CalculatorInput
                      id="estimated-energy"
                      label="Economia de energia estimada (%)"
                      value={values['estimated-energy']}
                      onChange={setValue}
                      suffix="%"
                      error={showEnergyError ? 'Valor deve estar entre 0.1% e 0.24%' : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowInfoModal(!showInfoModal)}
                      className="mt-1 text-xs text-blue underline hover:no-underline"
                    >
                      Ver tabela de referência
                    </button>

                    {showInfoModal && (
                      <div className="mt-3 bg-neutral-2 rounded-xl p-4 border border-neutral">
                        <p className="text-xs font-semibold text-dark-blue mb-2">Tabela de referência</p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-light-gray">
                              <th className="py-1 text-left text-medium-gray">RPM</th>
                              <th className="py-1 text-right text-medium-gray">Redução torque (%)</th>
                              <th className="py-1 text-right text-medium-gray">Melhoria EE (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {REFERENCE_TABLE.map((row) => (
                              <tr key={row.rpm} className="border-b border-light-gray last:border-0">
                                <td className="py-1 text-dark-blue">{row.rpm}</td>
                                <td className="py-1 text-right text-dark-blue">{row.torqueReduction}</td>
                                <td className="py-1 text-right text-dark-blue">{row.eeImprovement}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Relubrication Costs Section */}
            <CollapsibleSection icon="droplet" title="Custos de relubrificação" defaultOpen>
              <ResultsTableHeader />
              <ResultRow
                label="Custo anual de relubrificação (graxa + mão de obra)"
                currentValue={formatCurrency(results.yourRegreaseCost, currency)}
                proposedValue={formatCurrency(results.productRegreaseCost, currency)}
              />
              <ResultRow
                label="Economia de relubrificação"
                currentValue="—"
                proposedValue={formatCurrency(results.yourRegreaseCost - results.productRegreaseCost, currency)}
                highlight
              />
              <SavingsBar
                label="Economia com relubrificação"
                value={formatCurrency(results.yourRegreaseCost - results.productRegreaseCost, currency)}
              />
            </CollapsibleSection>

            {/* Energy Costs Section */}
            <CollapsibleSection icon="zap" title="Consumo energético" defaultOpen>
              <InfoBanner>
                Fórmula: N.º motores × Potência × Tempo operação × 0.75 × (168 × Custo energia)
              </InfoBanner>
              <div className="mt-4">
                <ResultsTableHeader />
                <ResultRow
                  label="Custo de energia anual"
                  currentValue={formatCurrency(results.yourEnergyCost, currency)}
                  proposedValue={formatCurrency(results.productEnergyCost, currency)}
                />
                <ResultRow
                  label="Economia de energia"
                  currentValue="—"
                  proposedValue={formatCurrency(results.yourEnergyCost - results.productEnergyCost, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com energia"
                value={formatCurrency(results.yourEnergyCost - results.productEnergyCost, currency)}
              />
            </CollapsibleSection>
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-[380px] xl:w-[420px] lg:shrink-0">
            <div className="lg:sticky lg:top-6">
              <SavingsCard
                title="Economia potencial total"
                totalSavings={formatCurrency(results.potentialSavings, currency)}
                description="Economia potencial estimada com a troca para Mobil SHC™"
                currency={currency}
                contactUrl={contact_link}
                productUrl={product_link}
                items={[
                  { label: 'Economia relubrificação', value: formatCurrency(results.yourRegreaseCost - results.productRegreaseCost, currency) },
                  {
                    label: 'Economia energia',
                    value: formatCurrency(results.yourEnergyCost - results.productEnergyCost, currency),
                    isNegative: (results.yourEnergyCost - results.productEnergyCost) < 0,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
