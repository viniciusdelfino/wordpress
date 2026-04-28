'use client';

import React, { useMemo } from 'react';
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
  CalculatorDetailHero,
  formatCurrency,
  formatNumber,
  type Currency,
} from './shared/CalculatorShared';

interface CompressorCalculatorProps {
  title?: string;
  description?: string;
  contact_link?: string;
  product_link?: string;
  image?: { url: string; alt?: string };
  image_mobile?: { url: string; alt?: string };
}

const INITIAL_VALUES: Record<string, string> = {
  compressors: '',
  quantity: '',
  'drain-interval': '',
  'compressor-oil': '',
  'compressor-oil-product': '',
  'change-time': '',
  'labor-cost': '',
  'flushing-cost': '',
  'flush-time': '',
};

const OIL_UNITS = ['litros', 'galões', 'lbs', 'kGs'];
const FIXED_MULTIPLIER = 3;

export default function CompressorCalculator({ title, description, contact_link, product_link, image, image_mobile }: CompressorCalculatorProps) {
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

  const results = useMemo(() => {
    const compressors = getNumericValue('compressors');
    const quantity = getNumericValue('quantity');
    const drainInterval = getNumericValue('drain-interval');
    const compressorOilPrice = getNumericValue('compressor-oil');
    const compressorOilProductPrice = getNumericValue('compressor-oil-product');
    const changeTime = getNumericValue('change-time');
    const laborCost = getNumericValue('labor-cost');
    const flushingCost = getNumericValue('flushing-cost');
    const flushTime = getNumericValue('flush-time');

    if (drainInterval === 0) {
      return {
        multiplier: 0,
        yourOil: 0, productOil: 0,
        costOil: 0, productCostOil: 0,
        yourLabor: 0, productLabor: 0,
        flushOilCost: 0, flushLaborCost: 0, initialFlushCost: 0,
        potentialSavings: 0,
      };
    }

    const multiplier = drainInterval * FIXED_MULTIPLIER;

    // Annual oil quantity
    const yourOil = compressors * quantity * (8760 / drainInterval);
    const productOil = Math.round(yourOil) * drainInterval / multiplier;

    // Annual oil cost
    const costOil = compressorOilPrice * yourOil;
    const productCostOil = compressorOilProductPrice * productOil;

    // Annual labor
    const yourLabor = compressors * changeTime * laborCost * (8760 / drainInterval);
    const productLabor = compressors * changeTime * laborCost * (8760 / multiplier);

    // Flush cost (amortized)
    const flushOilCost = flushingCost * compressors * compressorOilProductPrice * (8760 / multiplier);
    const flushLaborCost = flushTime * compressors * laborCost * (8760 / multiplier);
    const initialFlushCost = -(flushOilCost + flushLaborCost);

    // Total potential savings
    const potentialSavings = (costOil - productCostOil) + (yourLabor - productLabor) - (flushOilCost + flushLaborCost);

    return {
      multiplier,
      yourOil, productOil,
      costOil, productCostOil,
      yourLabor, productLabor,
      flushOilCost, flushLaborCost, initialFlushCost,
      potentialSavings,
    };
  }, [values, getNumericValue]);

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
                    id="compressors"
                    label="Número de compressores"
                    value={values['compressors']}
                    onChange={setValue}
                    integer
                  />
                  <CalculatorInput
                    id="quantity"
                    label={`Qtd. média de óleo por compressor (${unitLabel})`}
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
                    id="compressor-oil"
                    label={`Preço do óleo de compressor (${currencySymbol}/${unitLabel})`}
                    value={values['compressor-oil']}
                    onChange={setValue}
                    suffix={currencySymbol}
                  />
                  <CalculatorInput
                    id="change-time"
                    label="Tempo de troca de óleo (horas/máquina)"
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
                    id="flushing-cost"
                    label={`Volume de óleo de lavagem (${unitLabel}/máquina)`}
                    value={values['flushing-cost']}
                    onChange={setValue}
                    suffix={unitLabel}
                  />
                  <CalculatorInput
                    id="flush-time"
                    label="Tempo de lavagem (horas/máquina)"
                    value={values['flush-time']}
                    onChange={setValue}
                    suffix="h"
                  />
                </div>

                {/* Proposed Column */}
                <div className="flex flex-col gap-5">
                  <p className="text-xs font-semibold text-medium-gray uppercase tracking-wider">Proposto (Mobil SHC)</p>

                  <div className="flex flex-col gap-3">
                    <span className="text-base text-[#002959] leading-[1.5]">Multiplicador Mobil SHC</span>
                    <div className="h-[44px] rounded-lg border border-gray bg-neutral-2 px-4 flex items-center text-sm font-medium text-dark-blue">
                      {FIXED_MULTIPLIER}x (fixo)
                    </div>
                  </div>

                  <CalculatorInput
                    id="multiplier-display"
                    label="Intervalo estendido (horas)"
                    value={results.multiplier > 0 ? String(results.multiplier) : '0'}
                    onChange={() => {}}
                    disabled
                    suffix="h"
                  />

                  <CalculatorInput
                    id="compressor-oil-product"
                    label={`Preço do óleo Mobil SHC (${currencySymbol}/${unitLabel})`}
                    value={values['compressor-oil-product']}
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
                  proposedValue={formatCurrency(results.costOil - results.productCostOil, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com lubrificante"
                value={formatCurrency(results.costOil - results.productCostOil, currency)}
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

            {/* Flush Cost Section */}
            <CollapsibleSection icon="droplet" title="Custo inicial de lavagem (flush)" defaultOpen>
              <ResultsTableHeader />
              <ResultRow
                label="Custo de óleo de lavagem"
                currentValue="—"
                proposedValue={formatCurrency(-results.flushOilCost, currency)}
              />
              <ResultRow
                label="Custo de mão de obra de lavagem"
                currentValue="—"
                proposedValue={formatCurrency(-results.flushLaborCost, currency)}
              />
              <ResultRow
                label="Custo total de lavagem"
                currentValue="—"
                proposedValue={formatCurrency(results.initialFlushCost, currency)}
                highlight
              />
              <SavingsBar
                label="Custo de lavagem (amortizado)"
                value={formatCurrency(results.initialFlushCost, currency)}
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
                  { label: 'Economia lubrificante', value: formatCurrency(results.costOil - results.productCostOil, currency) },
                  { label: 'Economia mão de obra', value: formatCurrency(results.yourLabor - results.productLabor, currency) },
                  { label: 'Custo de lavagem', value: formatCurrency(results.initialFlushCost, currency), isNegative: results.initialFlushCost < 0 },
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
