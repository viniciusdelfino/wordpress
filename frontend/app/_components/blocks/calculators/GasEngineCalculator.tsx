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

interface GasEngineCalculatorProps {
  title?: string;
  description?: string;
  contact_link?: string;
  product_link?: string;
  image?: { url: string; alt?: string };
  image_mobile?: { url: string; alt?: string };
}

const INITIAL_VALUES: Record<string, string> = {
  'gas-engines': '',
  capacity: '',
  'drain-interval': '',
  'make-up-oil': '',
  'make-up-oil-product': '',
  'estimated-oil-price': '',
  'estimated-oil-price-product': '',
  'estimated-time': '',
  'cost-of-labor': '',
  'power-rating': '',
  'fuel-consumption': '',
  'operation-time': '',
  'estimated-fuel-cost': '',
  'estimated-energy': '',
};

const OIL_UNITS = ['litros', 'galões', 'lbs', 'kGs'];
const MULTIPLIER_OPTIONS = [4, 6, 8];

export default function GasEngineCalculator({ title, description, contact_link, product_link, image, image_mobile }: GasEngineCalculatorProps) {
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

  const [multiplierFactor, setMultiplierFactor] = useState(4);

  const results = useMemo(() => {
    const gasEngines = getNumericValue('gas-engines');
    const capacity = getNumericValue('capacity');
    const drainInterval = getNumericValue('drain-interval');
    const makeUpOil = getNumericValue('make-up-oil');
    const makeUpOilProduct = getNumericValue('make-up-oil-product');
    const estimatedOilPrice = getNumericValue('estimated-oil-price');
    const estimatedOilPriceProduct = getNumericValue('estimated-oil-price-product');
    const estimatedTime = getNumericValue('estimated-time');
    const costOfLabor = getNumericValue('cost-of-labor');
    const powerRating = getNumericValue('power-rating');
    const fuelConsumption = getNumericValue('fuel-consumption');
    const operationTime = getNumericValue('operation-time');
    const estimatedFuelCost = getNumericValue('estimated-fuel-cost');
    const estimatedEnergy = getNumericValue('estimated-energy');

    if (drainInterval === 0) {
      return {
        multiplier: 0,
        yourOil: 0, productOil: 0,
        yourOilCost: 0, productOilCost: 0,
        yourLabor: 0, productLabor: 0,
        yourFuelCost: 0, productFuelCost: 0,
        potentialSavings: 0,
        energyValid: true,
      };
    }

    const multiplier = drainInterval * multiplierFactor;

    // Annual oil quantity (includes make-up oil)
    const yourOil = gasEngines * (8760 * capacity / drainInterval + parseInt(String(makeUpOil)) || 0);
    const productOil = gasEngines * (8760 * capacity / multiplier + parseInt(String(makeUpOilProduct)) || 0);

    // Annual oil cost
    const yourOilCost = yourOil * estimatedOilPrice;
    const productOilCost = productOil * estimatedOilPriceProduct;

    // Annual labor
    const yourLabor = gasEngines * estimatedTime * costOfLabor * 8760 / drainInterval;
    const productLabor = gasEngines * estimatedTime * costOfLabor * 8760 / multiplier;

    // Annual fuel cost (divisor 1000000 converts Btu to MBtu)
    const yourFuelCost = gasEngines * powerRating * fuelConsumption * operationTime * estimatedFuelCost * 24 / 1000000;
    const energyValid = estimatedEnergy === 0 || validateRange(estimatedEnergy, 0.5, 1.5);
    const productFuelCost = energyValid && estimatedEnergy > 0
      ? parseInt(String(yourFuelCost)) * (1 - estimatedEnergy / 100)
      : yourFuelCost;

    // Total
    const potentialSavings = (yourOilCost - productOilCost) + (yourLabor - productLabor) + (yourFuelCost - productFuelCost);

    return {
      multiplier,
      yourOil, productOil,
      yourOilCost, productOilCost,
      yourLabor, productLabor,
      yourFuelCost, productFuelCost,
      potentialSavings,
      energyValid,
    };
  }, [values, multiplierFactor, getNumericValue]);

  const estimatedEnergyValue = getNumericValue('estimated-energy');
  const showEnergyError = estimatedEnergyValue > 0 && !results.energyValid;

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
                    id="gas-engines"
                    label="Número de motores a gás"
                    value={values['gas-engines']}
                    onChange={setValue}
                    integer
                  />
                  <CalculatorInput
                    id="capacity"
                    label={`Capacidade média do cárter (${unitLabel})`}
                    value={values['capacity']}
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
                    id="make-up-oil"
                    label={`Óleo de reposição por motor por ano (${unitLabel})`}
                    value={values['make-up-oil']}
                    onChange={setValue}
                    suffix={unitLabel}
                  />
                  <CalculatorInput
                    id="estimated-oil-price"
                    label={`Preço estimado do óleo (${currencySymbol}/${unitLabel})`}
                    value={values['estimated-oil-price']}
                    onChange={setValue}
                    suffix={currencySymbol}
                  />
                  <CalculatorInput
                    id="estimated-time"
                    label="Tempo estimado de troca de óleo (horas/motor)"
                    value={values['estimated-time']}
                    onChange={setValue}
                    suffix="h"
                  />
                  <CalculatorInput
                    id="cost-of-labor"
                    label={`Custo de mão de obra (${currencySymbol}/hora)`}
                    value={values['cost-of-labor']}
                    onChange={setValue}
                    suffix={`${currencySymbol}/h`}
                  />
                  <CalculatorInput
                    id="power-rating"
                    label="Potência do motor (Bhp)"
                    value={values['power-rating']}
                    onChange={setValue}
                    suffix="Bhp"
                  />
                  <CalculatorInput
                    id="fuel-consumption"
                    label="Consumo de combustível (Btu/Bhp-hr)"
                    value={values['fuel-consumption']}
                    onChange={setValue}
                    suffix="Btu/Bhp-hr"
                  />
                  <CalculatorInput
                    id="operation-time"
                    label="Tempo de operação (dias/ano)"
                    value={values['operation-time']}
                    onChange={setValue}
                    suffix="dias"
                  />
                  <CalculatorInput
                    id="estimated-fuel-cost"
                    label={`Custo estimado de combustível (${currencySymbol}/MBtu)`}
                    value={values['estimated-fuel-cost']}
                    onChange={setValue}
                    suffix={`${currencySymbol}/MBtu`}
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
                    id="make-up-oil-product"
                    label={`Óleo de reposição Mobil SHC (${unitLabel})`}
                    value={values['make-up-oil-product']}
                    onChange={setValue}
                    suffix={unitLabel}
                  />
                  <CalculatorInput
                    id="estimated-oil-price-product"
                    label={`Preço estimado do óleo Mobil SHC (${currencySymbol}/${unitLabel})`}
                    value={values['estimated-oil-price-product']}
                    onChange={setValue}
                    suffix={currencySymbol}
                  />

                  <CalculatorInput
                    id="estimated-energy"
                    label="Economia de energia estimada (%)"
                    value={values['estimated-energy']}
                    onChange={setValue}
                    suffix="%"
                    info="Valor deve estar entre 0.5% e 1.5%"
                    error={showEnergyError ? 'Valor deve estar entre 0.5% e 1.5%' : undefined}
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
                  currentValue={formatCurrency(results.yourOilCost, currency)}
                  proposedValue={formatCurrency(results.productOilCost, currency)}
                />
                <ResultRow
                  label="Diferença de custo do óleo"
                  currentValue="—"
                  proposedValue={formatCurrency(results.yourOilCost - results.productOilCost, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com lubrificante"
                value={formatCurrency(results.yourOilCost - results.productOilCost, currency)}
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
                proposedValue={formatCurrency(results.yourLabor - results.productLabor, currency)}
                highlight
              />
              <SavingsBar
                label="Economia com manutenção"
                value={formatCurrency(results.yourLabor - results.productLabor, currency)}
              />
            </CollapsibleSection>

            {/* Fuel Costs Section */}
            <CollapsibleSection icon="fuel" title="Custos de combustível" defaultOpen>
              <InfoBanner>
                Fórmula: N.º motores x Potência (Bhp) x Consumo (Btu/Bhp-hr) x Tempo operação (dias) x Custo combustível (MBtu) x 24 / 1.000.000
              </InfoBanner>
              <div className="mt-4">
                <ResultsTableHeader />
                <ResultRow
                  label="Custo de combustível anual"
                  currentValue={formatCurrency(results.yourFuelCost, currency)}
                  proposedValue={formatCurrency(results.productFuelCost, currency)}
                />
                <ResultRow
                  label="Economia de combustível"
                  currentValue="—"
                  proposedValue={formatCurrency(results.yourFuelCost - results.productFuelCost, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com combustível"
                value={formatCurrency(results.yourFuelCost - results.productFuelCost, currency)}
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
                  { label: 'Economia lubrificante', value: formatCurrency(results.yourOilCost - results.productOilCost, currency) },
                  { label: 'Economia mão de obra', value: formatCurrency(results.yourLabor - results.productLabor, currency) },
                  {
                    label: 'Economia combustível',
                    value: formatCurrency(results.yourFuelCost - results.productFuelCost, currency),
                    isNegative: (results.yourFuelCost - results.productFuelCost) < 0,
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
