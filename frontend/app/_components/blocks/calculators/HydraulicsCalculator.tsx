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

interface HydraulicsCalculatorProps {
  title?: string;
  description?: string;
  contact_link?: string;
  product_link?: string;
  image?: { url: string; alt?: string };
  image_mobile?: { url: string; alt?: string };
}

const INITIAL_VALUES: Record<string, string> = {
  hydraulic: '',
  'average-quantity': '',
  'oil-drain': '',
  'price-of-oil': '',
  'price-of-oil-product': '',
  'time-to-change-oil': '',
  'cost-of-labor': '',
  'power-rating': '',
  'operating-time': '',
  'power-cost': '',
  'estimated-energy': '',
};

const OIL_UNITS = ['litros', 'galões', 'lbs', 'kGs'];
const MULTIPLIER_OPTIONS = [3, 4, 5, 6];

export default function HydraulicsCalculator({ title, description, contact_link, product_link, image, image_mobile }: HydraulicsCalculatorProps) {
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
    const hydraulic = getNumericValue('hydraulic');
    const averageQuantity = getNumericValue('average-quantity');
    const oilDrain = getNumericValue('oil-drain');
    const priceOfOil = getNumericValue('price-of-oil');
    const priceOfOilProduct = getNumericValue('price-of-oil-product');
    const timeToChangeOil = getNumericValue('time-to-change-oil');
    const costOfLabor = getNumericValue('cost-of-labor');
    const powerRating = getNumericValue('power-rating');
    const operatingTime = getNumericValue('operating-time');
    const powerCost = getNumericValue('power-cost');
    const estimatedEnergy = getNumericValue('estimated-energy');

    if (oilDrain === 0) {
      return {
        multiplier: 0,
        yourOil: 0, productOil: 0,
        yourOilCost: 0, productOilCost: 0,
        yourLabor: 0, productLabor: 0,
        yourEnergy: 0, productEnergy: 0,
        potentialSavings: 0,
        energyValid: true,
      };
    }

    const multiplier = oilDrain * multiplierFactor;

    // Annual oil usage
    const yourOil = hydraulic * averageQuantity * 8760 / oilDrain;
    const productOil = yourOil * oilDrain / multiplier;

    // Annual oil cost
    const yourOilCost = yourOil * priceOfOil;
    const productOilCost = productOil * priceOfOilProduct;

    // Annual labor
    const yourLabor = hydraulic * timeToChangeOil * costOfLabor * 8760 / oilDrain;
    const productLabor = hydraulic * timeToChangeOil * costOfLabor * 8760 / multiplier;

    // Annual energy cost (24 = hours per day)
    const yourEnergy = hydraulic * powerRating * 0.75 * operatingTime * (24 * powerCost);
    const energyValid = estimatedEnergy === 0 || validateRange(estimatedEnergy, 1, 6);
    const productEnergy = energyValid && estimatedEnergy > 0
      ? yourEnergy * (1 - estimatedEnergy / 100)
      : yourEnergy;

    // Total
    const potentialSavings = (yourOilCost - productOilCost) + (yourLabor - productLabor) + (yourEnergy - productEnergy);

    return {
      multiplier,
      yourOil, productOil,
      yourOilCost, productOilCost,
      yourLabor, productLabor,
      yourEnergy, productEnergy,
      potentialSavings,
      energyValid,
    };
  }, [values, multiplierFactor, getNumericValue]);

  const estimatedEnergyValue = getNumericValue('estimated-energy');
  const showEnergyError = estimatedEnergyValue > 0 && !results.energyValid;

  const unitLabel = unit === 'litros' ? 'L' : unit === 'galões' ? 'gal' : unit;
  const currencySymbol = currency;

  const oilSavings = results.yourOilCost - results.productOilCost;
  const laborSavings = results.yourLabor - results.productLabor;
  const energySavings = results.yourEnergy - results.productEnergy;

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
                    id="hydraulic"
                    label="Número de sistemas hidráulicos"
                    value={values['hydraulic']}
                    onChange={setValue}
                    integer
                  />
                  <CalculatorInput
                    id="average-quantity"
                    label={`Qtd. média de óleo por sistema (${unitLabel})`}
                    value={values['average-quantity']}
                    onChange={setValue}
                    suffix={unitLabel}
                  />
                  <CalculatorInput
                    id="oil-drain"
                    label="Intervalo de drenagem de óleo (horas)"
                    value={values['oil-drain']}
                    onChange={setValue}
                    suffix="h"
                  />
                  <CalculatorInput
                    id="price-of-oil"
                    label={`Preço do óleo hidráulico (${currencySymbol}/${unitLabel})`}
                    value={values['price-of-oil']}
                    onChange={setValue}
                    suffix={currencySymbol}
                  />
                  <CalculatorInput
                    id="time-to-change-oil"
                    label="Tempo de troca de óleo (horas/sistema)"
                    value={values['time-to-change-oil']}
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
                    label="Potência hidráulica (Hp)"
                    value={values['power-rating']}
                    onChange={setValue}
                    suffix="Hp"
                  />
                  <CalculatorInput
                    id="operating-time"
                    label="Tempo de operação por ano (dias)"
                    value={values['operating-time']}
                    onChange={setValue}
                    suffix="dias"
                  />
                  <CalculatorInput
                    id="power-cost"
                    label={`Custo da energia (${currencySymbol}/kWHr)`}
                    value={values['power-cost']}
                    onChange={setValue}
                    suffix={`${currencySymbol}/kWh`}
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
                    id="price-of-oil-product"
                    label={`Preço do óleo Mobil SHC (${currencySymbol}/${unitLabel})`}
                    value={values['price-of-oil-product']}
                    onChange={setValue}
                    suffix={currencySymbol}
                  />

                  <CalculatorInput
                    id="estimated-energy"
                    label="Economia de energia estimada (%)"
                    value={values['estimated-energy']}
                    onChange={setValue}
                    suffix="%"
                    info="Valor deve estar entre 1% e 6%"
                    error={showEnergyError ? 'Valor deve estar entre 1% e 6%' : undefined}
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
                  proposedValue={formatCurrency(oilSavings, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com lubrificante"
                value={formatCurrency(oilSavings, currency)}
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
                proposedValue={formatCurrency(laborSavings, currency)}
                highlight
              />
              <SavingsBar
                label="Economia com manutenção"
                value={formatCurrency(laborSavings, currency)}
              />
            </CollapsibleSection>

            {/* Energy Costs Section */}
            <CollapsibleSection icon="zap" title="Consumo energético" defaultOpen>
              <InfoBanner>
                Fórmula: N.º sistemas × Potência × 0.75 × Tempo operação × 24h × Custo energia
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
                  proposedValue={formatCurrency(energySavings, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com energia"
                value={formatCurrency(energySavings, currency)}
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
                  { label: 'Economia lubrificante', value: formatCurrency(oilSavings, currency) },
                  { label: 'Economia mão de obra', value: formatCurrency(laborSavings, currency) },
                  {
                    label: 'Economia energia',
                    value: formatCurrency(energySavings, currency),
                    isNegative: energySavings < 0,
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
