'use client';

import React, { useMemo, useState } from 'react';
import {
  useCalculatorState,
  CurrencySelector,
  UnitSelector,
  ObsNote,
  CalculatorInput,
  MultiplierButtons,
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
  formatNumber,
  validateRange,
  type Currency,
} from './shared/CalculatorShared';

interface GearCalculatorProps {
  title?: string;
  description?: string;
  contact_link?: string;
  product_link?: string;
  image?: { url: string; alt?: string };
  image_mobile?: { url: string; alt?: string };
}

const INITIAL_VALUES: Record<string, string> = {
  gearboxes: '',
  quantity: '',
  'drain-interval': '',
  'change-time': '',
  'labor-cost': '',
  'motor-power': '',
  'operating-time': '',
  'energy-cost': '',
  'energy-savings': '',
  'gear-oil': '',
  'gear-oil-product': '',
};

const OIL_UNITS = ['litros', 'galões', 'lbs', 'kGs'];
const MULTIPLIER_OPTIONS = [3, 4, 6, 12];

export default function GearCalculator({ title, description, contact_link, product_link, image, image_mobile }: GearCalculatorProps) {
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

  const [multiplierFactor, setMultiplierFactor] = useState(3);

  const results = useMemo(() => {
    const gearboxes = getNumericValue('gearboxes');
    const quantity = getNumericValue('quantity');
    const drainInterval = getNumericValue('drain-interval');
    const changeTime = getNumericValue('change-time');
    const laborCost = getNumericValue('labor-cost');
    const motorPower = getNumericValue('motor-power');
    const operatingTime = getNumericValue('operating-time');
    const energyCost = getNumericValue('energy-cost');
    const energySavings = getNumericValue('energy-savings');
    const gearOilPrice = getNumericValue('gear-oil');
    const gearOilProductPrice = getNumericValue('gear-oil-product');

    if (drainInterval === 0) {
      return {
        multiplier: 0,
        yourOil: 0, productOil: 0,
        costOil: 0, productCostOil: 0,
        yourLabor: 0, productLabor: 0,
        yourEnergy: 0, productEnergy: 0,
        incrementalCost: 0, laborSavings: 0, costSavings: 0,
        potentialSavings: 0,
        energyValid: true,
      };
    }

    const multiplier = drainInterval * multiplierFactor;

    const yourOil = gearboxes * quantity * (8760 / drainInterval);
    const productOil = Math.round(yourOil) * drainInterval / multiplier;

    const costOil = gearOilPrice * yourOil;
    const productCostOil = gearOilProductPrice * productOil;

    const yourLabor = gearboxes * changeTime * (laborCost * 8760 / drainInterval);
    const productLabor = gearboxes * changeTime * (laborCost * 8760 / multiplier);

    const yourEnergy = gearboxes * motorPower * 0.75 * (operatingTime * energyCost);
    const energyValid = energySavings === 0 || validateRange(energySavings, 1.0, 3.6);
    const productEnergy = energyValid && energySavings > 0
      ? Math.round(yourEnergy) * (1 - energySavings / 100)
      : yourEnergy;

    const incrementalCost = costOil - productCostOil;
    const laborSavings = yourLabor - productLabor;
    const costSavings = yourEnergy - productEnergy;

    const oilSavings = Math.round(yourOil) * gearOilPrice - Math.round(productOil) * gearOilProductPrice;
    const potentialSavings = oilSavings + laborSavings + (energyValid && energySavings > 0 ? costSavings : 0);

    return {
      multiplier,
      yourOil, productOil,
      costOil, productCostOil,
      yourLabor, productLabor,
      yourEnergy, productEnergy,
      incrementalCost, laborSavings, costSavings,
      potentialSavings,
      energyValid,
    };
  }, [values, multiplierFactor, getNumericValue]);

  const energySavingsValue = getNumericValue('energy-savings');
  const showEnergyError = energySavingsValue > 0 && !results.energyValid;

  const unitLabel = unit === 'litros' ? 'L' : unit === 'galões' ? 'gal' : unit;
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
                <UnitSelector value={unit} options={OIL_UNITS} onChange={changeUnit} label="Unidade de volume" />
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
                {/* Current Oil Column */}
                <div className="flex flex-col gap-5">
                  <p className="text-xs font-semibold text-medium-gray uppercase tracking-wider">Seu óleo atual</p>

                  <CalculatorInput
                    id="gearboxes"
                    label="N.º de caixas de engrenagem"
                    value={values['gearboxes']}
                    onChange={setValue}
                    integer
                  />
                  <CalculatorInput
                    id="quantity"
                    label={`Qtd. média de óleo por caixa (${unitLabel})`}
                    value={values['quantity']}
                    onChange={setValue}
                    suffix={unitLabel}
                  />
                  <CalculatorInput
                    id="drain-interval"
                    label="Intervalo de drenagem de óleo (horas)"
                    value={values['drain-interval']}
                    onChange={setValue}
                    suffix="h"
                  />
                  <CalculatorInput
                    id="change-time"
                    label="Tempo de troca de óleo (horas)"
                    value={values['change-time']}
                    onChange={setValue}
                    suffix="h"
                  />
                  <CalculatorInput
                    id="labor-cost"
                    label={`Custo da mão de obra (${currencySymbol}/hora)`}
                    value={values['labor-cost']}
                    onChange={setValue}
                    suffix={`${currencySymbol}/h`}
                  />
                  <CalculatorInput
                    id="motor-power"
                    label="Potência do motor elétrico"
                    value={values['motor-power']}
                    onChange={setValue}
                    suffix="Hp"
                  />
                  <CalculatorInput
                    id="operating-time"
                    label="Tempo de operação por ano"
                    value={values['operating-time']}
                    onChange={setValue}
                    suffix="h"
                  />
                  <CalculatorInput
                    id="energy-cost"
                    label={`Custo da energia (${currencySymbol}/kWh)`}
                    value={values['energy-cost']}
                    onChange={setValue}
                    suffix={`${currencySymbol}/kWh`}
                  />
                  <CalculatorInput
                    id="gear-oil"
                    label={`Preço estimado do óleo de engrenagem (${currencySymbol}/${unitLabel})`}
                    value={values['gear-oil']}
                    onChange={setValue}
                    suffix={currencySymbol}
                  />
                </div>

                {/* Proposed Column */}
                <div className="flex flex-col gap-5">
                  <p className="text-xs font-semibold text-medium-gray uppercase tracking-wider">Proposto (Mobil SHC)</p>

                  <MultiplierButtons
                    options={MULTIPLIER_OPTIONS}
                    selected={multiplierFactor}
                    onChange={setMultiplierFactor}
                  />

                  <CalculatorInput
                    id="multiplier-display"
                    label="Intervalo estendido (horas)"
                    value={results.multiplier > 0 ? String(results.multiplier) : '0'}
                    onChange={() => {}}
                    disabled
                    suffix="h"
                  />

                  <CalculatorInput
                    id="energy-savings"
                    label="Economia de energia estimada (%)"
                    value={values['energy-savings']}
                    onChange={setValue}
                    suffix="%"
                    info="Valor deve estar entre 1.0% e 3.6%"
                    error={showEnergyError ? 'Valor deve estar entre 1.0% e 3.6%' : undefined}
                  />

                  <CalculatorInput
                    id="gear-oil-product"
                    label={`Preço estimado do óleo Mobil SHC (${currencySymbol}/${unitLabel})`}
                    value={values['gear-oil-product']}
                    onChange={setValue}
                    suffix={currencySymbol}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Lubricant Costs Section */}
            <CollapsibleSection icon="droplet" title="Custos com lubrificante" defaultOpen>
              <ResultComparison
                label={`Consumo de óleo por ano`}
                currentValue={formatNumber(results.yourOil)}
                proposedValue={formatNumber(results.productOil)}
                unit={unitLabel}
              />
              <div className="mt-4">
                <ResultsTableHeader />
                <ResultRow
                  label="Custo anual do óleo"
                  currentValue={formatCurrency(results.costOil, currency)}
                  proposedValue={formatCurrency(results.productCostOil, currency)}
                />
                <ResultRow
                  label="Diferença de custo do óleo"
                  currentValue="—"
                  proposedValue={formatCurrency(results.incrementalCost, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com lubrificante"
                value={formatCurrency(results.incrementalCost, currency)}
              />
            </CollapsibleSection>

            {/* Maintenance Costs Section */}
            <CollapsibleSection icon="wrench" title="Custos de manutenção" defaultOpen>
              <ResultsTableHeader />
              <ResultRow
                label="Custo de mão de obra anual"
                currentValue={formatCurrency(results.yourLabor, currency)}
                proposedValue={formatCurrency(results.productLabor, currency)}
              />
              <ResultRow
                label="Economia de mão de obra"
                currentValue="—"
                proposedValue={formatCurrency(results.laborSavings, currency)}
                highlight
              />
              <SavingsBar
                label="Economia com manutenção"
                value={formatCurrency(results.laborSavings, currency)}
              />
            </CollapsibleSection>

            {/* Energy Costs Section */}
            <CollapsibleSection icon="zap" title="Consumo energético" defaultOpen>
              <InfoBanner>
                Fórmula: N.º caixas × Potência motor × 0.75 × Tempo operação × Custo energia
              </InfoBanner>
              <div className="mt-4">
                <ResultsTableHeader />
                <ResultRow
                  label="Custo de energia anual"
                  currentValue={formatCurrency(results.yourEnergy, currency)}
                  proposedValue={formatCurrency(results.productEnergy, currency)}
                />
                <ResultRow
                  label="Economia de energia"
                  currentValue="—"
                  proposedValue={formatCurrency(results.costSavings, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com energia"
                value={formatCurrency(results.costSavings, currency)}
              />
            </CollapsibleSection>
          </div>

          {/* Right Column: Sidebar */}
          <div className="w-full lg:w-[380px] xl:w-[420px] lg:shrink-0">
            <div className="lg:sticky lg:top-6">
              <SavingsCard
                title="Economia total / ano"
                totalSavings={formatCurrency(results.potentialSavings, currency)}
                description="Economia potencial estimada com a troca para Mobil SHC™"
                currency={currency}
                contactUrl={contact_link}
                productUrl={product_link}
                items={[
                  { label: 'Volume de lubrificante', value: `${formatNumber(results.yourOil - results.productOil)} ${unitLabel}` },
                  { label: 'Economia lubrificante', value: formatCurrency(results.incrementalCost, currency) },
                  { label: 'Economia mão de obra', value: formatCurrency(results.laborSavings, currency) },
                  {
                    label: 'Economia energia',
                    value: formatCurrency(results.costSavings, currency),
                    isNegative: results.costSavings < 0,
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
