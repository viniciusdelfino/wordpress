import React from "react";
import Image from "next/image";

export interface InforlubeModel {
  Model: string;
  Name: any;
  MakeName: any;
  Fuel: string;
  Id: string;
  Year: string;
  Version?: string;
  DisplayName?: string;
  Image?: string;
}

interface ModelListProps {
  models: InforlubeModel[];
  onSelect: (model: InforlubeModel) => void;
  onReset: () => void;
  loading: boolean;
}

export default function ModelList({
  models,
  onSelect,
  onReset,
  loading,
}: ModelListProps) {
  return (
    <div className="p-4 lg:p-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg text-dark-blue">Selecione a versão exata:</h3>
        </div>
        <button
          onClick={onReset}
          className="text-low-dark-blue text-sm font-semibold flex items-center gap-1"
        >
          <span className="text-lg">↺</span> NOVA BUSCA
        </button>
      </div>

      <div className="flex flex-col max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {models.map((model) => (
          <article
            key={model.Id}
            onClick={() => !loading && onSelect(model)} 
            className={`bg-white py-4 transition-opacity ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-neutral-50"}`}
          >
            <p className="text-xs md:text-sm text-low-dark-blue mb-2">
              Montadora / Modelo / Ano de Fabricação / Motorização / Combustível
            </p>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full">
                <div className="w-[5rem] h-[4.375rem] relative flex-shrink-0 bg-neutral-2 rounded-lg flex items-center justify-center overflow-hidden">
                  {model.Image ? (
                    <img
                      src={model.Image}
                      alt={model.Name}
                      className="object-contain w-full h-full p-1"
                    />
                  ) : (
                    <Image
                      src="/icons/car-blue.svg"
                      width={30}
                      height={30}
                      alt="Carro"
                      className="opacity-30"
                    />
                  )}
                </div>

                <h2 className="text-dark-blue text-base lg:text-lg leading-tight">
                  {model.DisplayName ||
                    `${model.MakeName} ${model.Name} ${model.Year}`}
                </h2>
              </div>

              <div className="w-full lg:w-auto">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-white bg-dark-blue lg:bg-transparent lg:text-dark-blue border lg:border-dark-blue rounded-sm px-6 py-2 text-xs font-semibold uppercase whitespace-nowrap min-w-[140px]">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      Selecionar
                      <Image
                        src="/icons/arrow-right-white.svg"
                        width={6}
                        height={10}
                        alt="Seta"
                        className="lg:invert"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
        {models.length === 0 && !loading && (
          <div className="text-center py-12 bg-neutral-2 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">
              Nenhum modelo compatível encontrado.
            </p>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark-blue"></div>
          <span className="text-dark-blue font-bold animate-pulse">
            Buscando detalhes...
          </span>
        </div>
      )}
    </div>
  );
}
