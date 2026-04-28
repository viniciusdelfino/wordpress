# Integração Inforlube & X-Lab (Technical Guide)

Este documento detalha a integração técnica com os serviços externos de inteligência de frota (X-Lab) e recomendação de produtos (Inforlube).

## 1. Inforlube (Engine de Recomendação)

### 1.1. Visão Geral Técnica
A Inforlube atua como um microserviço de inteligência técnica. Sua única responsabilidade é correlacionar um `vehicle_id` (fornecido pela X-Lab) com uma lista de SKUs da Mobil.
*   **Escopo:** Especificações técnicas, capacidades de litragem e intervalos de troca.
*   **Limitação:** Não possui dados comerciais (Preço, Estoque, Nome de Marketing).

### 1.2. Estrutura de Resposta (31 Sistemas)
A API não retorna uma lista plana. Ela devolve um objeto JSON onde as chaves representam os sistemas do veículo.
*   **Dinamicidade:** O retorno pode conter de 1 a 31 chaves (ex: Motor, Freio, Diferencial).
*   **Chaves de Sistema:** IDs fixos como `Fluid_Oil_MotorOil`, `Fluid_Oil_BrakeFluid`.
*   **Implementação Frontend:** O componente deve iterar sobre as chaves do objeto de resposta. Não hardcode a exibição de sistemas.

### 1.3. Fluxo de Integração
**Endpoint:** `GET /vehicle/{vehicleId}/recommendations`

**Lógica de Processamento:**
1.  **Extração de SKU:** O campo `Product_SKU` é a chave estrangeira (Foreign Key) para buscar o produto no Salesforce/WordPress.
2.  **Capacidade:** O campo `Capacity` retorna um float (ex: `4.5`). A unidade de medida deve ser tratada via helper (`lib/utils/units.ts`).

### 1.4. Arquivos Chave
*   `src/services/inforlube.service.ts`: Camada de serviço, tratamento de erros e tipagem.
*   `src/components/VehicleResults/SystemGrid.tsx`: Mapeamento visual dos IDs de sistema para ícones e labels traduzidas.

---

## 2. X-Lab (Identificação de Frota)

### 2.1. Visão Geral
A X-Lab resolve a identificação do veículo, atuando como gateway para a Inforlube.

### 2.2. Busca por Placa (Assíncrona)
**Endpoint:** `GET /plate-search/{plate}`

*   **Sucesso:** Retorna objeto com `Brand`, `Model`, `Year`, `Engine` e o `inforlube_id`.
*   **Falha:** Se a placa não for encontrada ou a API falhar, o frontend deve realizar fallback automático para a Busca Manual.

### 2.3. Busca Manual (Cascata de Dependência)
Implementa o padrão *Hierarchy Selects*.

1.  **Montadora:** `/makes`
2.  **Ano:** `/years/{makeId}` (Depende de Make)
3.  **Modelo:** `/models/{makeId}/{year}` (Depende de Make + Year)
4.  **Versão:** `/variants/{modelId}` (Retorna o `inforlube_id`)

**Regra de Frontend:** Ao alterar um nível superior, todos os níveis inferiores devem ser resetados e desabilitados para garantir integridade referencial.

### 2.4. Mídia (Foto do Veículo)
A API retorna uma URL pública para a imagem do veículo.
*   **Performance:** Utilizar `next/image` com domínio configurado no `next.config.js`.
*   **Fallback:** Obrigatório implementar imagem padrão caso a URL seja `null` ou retorne 404.

---

## 3. Fluxo de Dados Unificado (Exemplo Prático)

O fluxo completo de uma recomendação segue a seguinte ordem de execução:

1.  **Input:** Usuário submete placa `ABC-1234`.
2.  **X-Lab Service:** Identifica "Honda Civic 2020" -> Retorna `inforlube_id: 5050`.
3.  **Inforlube Service:** Consulta ID `5050` -> Retorna lista de sistemas (ex: Motor -> SKU `999`).
4.  **Salesforce Integration:** Consulta banco local (WP) pelo SKU `999`.
5.  **Renderização:** Exibe "Mobil Super 3000" (Dados SF) como recomendação para "Honda Civic" (Dados X-Lab).

---

## 4. Manutenção e Troubleshooting

### Mapeamento de Ícones
Os ícones dos sistemas residem em `src/assets/icons/systems/`.
*   **Convenção:** O nome do arquivo SVG deve corresponder exatamente ao ID técnico da Inforlube (ex: `Fluid_Oil_Differential.svg`).

### Problemas Comuns
*   **Busca por Placa Falhando:** Verificar `X-LAB-TOKEN` no `.env`. Atentar para Rate Limits.
*   **Veículos Pesados:** Para testes de carga com muitas categorias (10+ sistemas), utilize SKUs de caminhões (Volvo FH, Scania).