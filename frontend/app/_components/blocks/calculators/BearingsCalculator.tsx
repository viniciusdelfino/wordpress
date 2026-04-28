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
  type Currency,
} from './shared/CalculatorShared';

interface BearingsCalculatorProps {
  title?: string;
  description?: string;
  contact_link?: string;
  product_link?: string;
  image?: { url: string; alt?: string };
  image_mobile?: { url: string; alt?: string };
}

const INITIAL_VALUES: Record<string, string> = {
  bearings: '',
  'grease-per-bearings': '',
  'cost-of-grease': '',
  'cost-of-grease-product': '',
  'regreasing-interval': '',
  'regreasing-interval-product': '',
  'regrease-time': '',
  'cost-of-labor': '',
};

const GREASE_UNITS = ['kg', 'lb'];

export default function BearingsCalculator({ title, description, contact_link, product_link, image, image_mobile }: BearingsCalculatorProps) {
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
    const bearings = getNumericValue('bearings');
    const greasePerBearing = getNumericValue('grease-per-bearings');
    const costOfGrease = getNumericValue('cost-of-grease');
    const costOfGreaseProduct = getNumericValue('cost-of-grease-product');
    const regreasingInterval = getNumericValue('regreasing-interval');
    const regreasingIntervalProduct = getNumericValue('regreasing-interval-product');
    const regreaseTime = getNumericValue('regrease-time');
    const costOfLabor = getNumericValue('cost-of-labor');

    if (regreasingInterval === 0 || regreasingIntervalProduct === 0) {
      return {
        yourGreaseCost: 0, productGreaseCost: 0,
        yourLaborCost: 0, productLaborCost: 0,
        potentialSavings: 0,
      };
    }

    // Annual grease cost
    const yourGreaseCost = (52 / regreasingInterval) * bearings * (greasePerBearing * costOfGrease);
    const productGreaseCost = (52 / regreasingIntervalProduct) * costOfGreaseProduct * (greasePerBearing * bearings);

    // Annual labor cost
    const yourLaborCost = bearings * regreaseTime * costOfLabor * (52 / regreasingInterval);
    const productLaborCost = bearings * regreaseTime * costOfLabor * (52 / regreasingIntervalProduct);

    // Total potential savings
    const potentialSavings = (yourGreaseCost - productGreaseCost) + (yourLaborCost - productLaborCost);

    return {
      yourGreaseCost, productGreaseCost,
      yourLaborCost, productLaborCost,
      potentialSavings,
    };
  }, [values, getNumericValue]);

  const unitLabel = unit;
  const currencySymbol = currency;

  const greaseSavings = results.yourGreaseCost - results.productGreaseCost;
  const laborSavings = results.yourLaborCost - results.productLaborCost;

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
                    id="bearings"
                    label="Número de rolamentos"
                    value={values['bearings']}
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
                    id="cost-of-labor"
                    label={`Custo de mão de obra (${currencySymbol}/hora)`}
                    value={values['cost-of-labor']}
                    onChange={setValue}
                    suffix={`${currencySymbol}/h`}
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
                    id="regreasing-interval-product"
                    label="Intervalo de relubrificação Mobil SHC (semanas)"
                    value={values['regreasing-interval-product']}
                    onChange={setValue}
                    suffix="sem."
                  />
                </div>
              </div>
            </SectionCard>

            {/* Grease Costs Section */}
            <CollapsibleSection icon="droplet" title="Custos com graxa" defaultOpen>
              <ResultComparison
                label="Custo anual da graxa"
                currentLabel="Sua graxa atual"
                proposedLabel="Mobil SHC™ sugerido"
                currentValue={formatCurrency(results.yourGreaseCost, currency)}
                proposedValue={formatCurrency(results.productGreaseCost, currency)}
              />
              <div className="mt-4">
                <ResultsTableHeader />
                <ResultRow
                  label="Custo anual da graxa"
                  currentValue={formatCurrency(results.yourGreaseCost, currency)}
                  proposedValue={formatCurrency(results.productGreaseCost, currency)}
                />
                <ResultRow
                  label="Economia de graxa"
                  currentValue="—"
                  proposedValue={formatCurrency(greaseSavings, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com graxa"
                value={formatCurrency(greaseSavings, currency)}
              />
            </CollapsibleSection>

            {/* Maintenance Costs Section */}
            <CollapsibleSection icon="wrench" title="Custos de manutenção" defaultOpen>
              <ResultComparison
                label="Custo de mão de obra anual"
                currentLabel="Sua graxa atual"
                proposedLabel="Mobil SHC™ sugerido"
                currentValue={formatCurrency(results.yourLaborCost, currency)}
                proposedValue={formatCurrency(results.productLaborCost, currency)}
              />
              <div className="mt-4">
                <ResultsTableHeader />
                <ResultRow
                  label="Custo de mão de obra anual"
                  currentValue={formatCurrency(results.yourLaborCost, currency)}
                  proposedValue={formatCurrency(results.productLaborCost, currency)}
                />
                <ResultRow
                  label="Economia de mão de obra"
                  currentValue="—"
                  proposedValue={formatCurrency(laborSavings, currency)}
                  highlight
                />
              </div>
              <SavingsBar
                label="Economia com manutenção"
                value={formatCurrency(laborSavings, currency)}
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
                  { label: 'Economia graxa', value: formatCurrency(greaseSavings, currency) },
                  { label: 'Economia mão de obra', value: formatCurrency(laborSavings, currency) },
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
