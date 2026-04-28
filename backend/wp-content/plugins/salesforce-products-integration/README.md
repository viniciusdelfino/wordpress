# Salesforce Products Integration (Moove Engine)

Este plugin é o "cérebro" de dados do ecossistema Moove. Ele orquestra a tríade de informações: Salesforce (Comercial), Inforlube (Técnico) e WordPress (Editorial), servindo tudo via uma API de alta performance para o Next.js.

## Responsabilidades Centrais

1.  **Ingestão e Higienização:** Consome o Salesforce e aplica regras de limpeza de strings (remoção de artefatos de banco de dados e normalização de unidades).
2.  **Indexação de Performance:** Persiste atributos técnicos como Post Meta ocultos (_sf_viscosity) para permitir filtros SQL instantâneos, evitando o overhead de taxonomias nativas do WP.
3. **Proxy de Inteligência (Inforlube):** Atua como ponte para as recomendações técnicas, mapeando os SKUs do Salesforce dentro das 31 categorias de sistemas da Inforlube.

## ⚠️ Regras de Negócio Críticas

Para que um produto do Salesforce seja sincronizado e apareça no site, ele **deve** atender às seguintes regras:

1.  **Nome Comercial Obrigatório (`B2BProductName__c`):** Produtos sem nome comercial são descartados. O campo padrão Name do SF é ignorado por conter códigos internos de faturamento.
2.  **Produto Ativo no B2B (`EnabledProductB2BCommerce__c`):**
    *   Deve estar marcado como `true`. A query SOQL principal já filtra por este campo.
3.  **SKU (`StockKeepingUnit`):**
    *   É a chave primária da integração. Produtos sem SKU são ignorados. O sistema usa o SKU para verificar se um produto já existe no WordPress e decidir entre criar um novo post ou atualizar um existente.
4. **Sanitização de Strings:**  
    * O plugin executa uma limpeza automática em campos de texto para remover aspas duplas residuais e normalizar termos como POL para " (polegadas).

## 🔄 Sincronização de Produtos

A sincronização pode ser disparada manualmente via painel administrativo (`Salesforce > Sync Produtos`).

### Fluxo de Execução:
1.  **Busca:** O plugin consulta a API do Salesforce buscando todos os produtos onde `EnabledProductB2BCommerce__c = true`.
2.  **Smart Sync (Sincronização Inteligente):**
    *   Compara a data de modificação do Salesforce (`LastModifiedDate`) com a data salva localmente (`_salesforce_last_modified_ts`).
    *   Se a data do Salesforce for mais recente (ou se for uma sincronização forçada), o produto é atualizado.
    *   Caso contrário, o produto é pulado para economizar recursos.
3.  **Persistência de Dados:**
    *   Um post do tipo `produtos` é criado ou atualizado.
    *   **Metadados Essenciais:** Campos como `_salesforce_sku`, `_salesforce_viscosity`, e `_salesforce_technology` são salvos para uso nos filtros da API.
    *   **Dados Brutos:** O JSON completo do Salesforce é salvo em `_salesforce_raw_data` para debug e exibição no painel do produto.
4.  **Categorização Automática:** Após salvar, o sistema aplica regras para categorizar o produto nas taxonomias `segmento` e `aplicacoes`.
5.  **Limpeza de Cache:** Ao final da sincronização, o cache de filtros (Transients) é automaticamente limpo para garantir que o frontend receba os dados mais recentes.

---

## 🤖 Categorização Automática

Para evitar trabalho manual, o plugin analisa o nome e a aplicação do produto (`B2BProductName__c`, `ProductApplication__c`) e atribui termos automaticamente.

*   **Lógica:** O sistema busca por palavras-chave (ex: "MOTO", "CARRO", "MOTOR") e associa o produto ao slug correspondente (ex: `motos`, `carros`, `oleos-para-motor`).
*   **Local das Regras:** As regras estão centralizadas no método `get_categorization_rules()` dentro de `class-product-manager.php`.
*   **Preservação Manual:** Esta lógica **só é executada se o produto ainda não tiver um termo** na respectiva taxonomia. Isso garante que qualquer categorização manual feita pelo cliente no painel do WordPress seja preservada em sincronizações futuras.

---

## 🔌 Endpoints da API para o Frontend

O plugin expõe endpoints REST otimizados sob o namespace `moove/v1` para o frontend Next.js.

### 1. Endpoint de Filtros
**URL:** `GET /wp-json/moove/v1/filters/{segmento}`
*   **Propósito:** Retorna as opções de filtros (`aplicacao`, `tecnologia`, `viscosidade`) disponíveis para um determinado segmento (ex: `carros`).
*   **Performance:** Utiliza queries SQL diretas e `WP_Transients` para cachear os resultados por 1 hora, garantindo alta performance.
*   **Lógica de Dependência (Filtros em Cascata):**
    *   Este endpoint é a base para a experiência de filtro dinâmico no frontend.
    *   Aceita os parâmetros `?aplicacao=...` e `?tecnologia=...`.
    *   Quando `aplicacao` é fornecido, as opções de `tecnologia` e `viscosidade` são recalculadas para mostrar apenas as que existem dentro daquela aplicação.
    *   Quando `tecnologia` é fornecido, as opções de `viscosidade` são recalculadas.
    *   Isso permite que o filtro no frontend seja contextual e inteligente (ex: desabilitar "Viscosidade" até que uma "Tecnologia" seja selecionada).

### 2. Endpoint de Produtos
**URL:** `GET /wp-json/moove/v1/products/{segmento}`
*   **Propósito:** Retorna a lista de produtos de um segmento, com suporte a filtros e paginação.
*   **Parâmetros Suportados:**
    *   `?page=2`: Para paginação.
    *   `?aplicacao=motor,transmissao`: Filtra por uma ou mais aplicações (slugs).
    *   `?tecnologia=Sintético`: Filtra por uma ou mais tecnologias.
    *   `?viscosidade=SAE 5W-30`: Filtra por uma ou mais viscosidades.
*   **Funcionamento:** Constrói uma `WP_Query` complexa com `tax_query` (para `segmento` e `aplicacoes`) e `meta_query` (para `tecnologia` e `viscosidade`) para retornar os resultados precisos.

---

## 🗂️ Dicionário de Dados (Campos Mapeados)

| Campo Salesforce (API) | Meta Key / Taxonomia no WP | Uso no Sistema |
| :--- | :--- | :--- |
| **Id** | `_salesforce_id` | ID interno do Salesforce. |
| **StockKeepingUnit** | `_salesforce_sku` | **Chave Única.** Usada para identificar produtos. |
| **B2BProductName__c** | `post_title` | **Obrigatório.** Nome do produto exibido no site. |
| **Description** | `_salesforce_description` | Descrição curta do produto, usada nos cards. |
| **ProductApplication__c** | (usado para categorização) | Define a aplicação (ex: "MOTOR DE MOTOS"). |
| **IndustryClassifications__c** | `_salesforce_technology` | **Filtro.** Tecnologia do óleo (Sintético, Mineral, etc). |
| **Technology__c** | `_salesforce_technology` | **Filtro (Fallback).** Usado se `IndustryClassifications__c` for vazio. |
| **Viscosity__c** | `_salesforce_viscosity` | **Filtro.** Viscosidade (ex: "SAE 5W-30"). |
| **LastModifiedDate** | `_salesforce_last_modified_ts` | Usado para o "Smart Sync". |
| (outros campos) | `_salesforce_raw_data` | Todos os outros dados são armazenados em um único JSON. |

> **Nota:** Se um campo novo do Salesforce precisar ser usado como **filtro**, ele deve ser salvo como um meta-campo individual durante a sincronização em `sync_single_product()`. Caso contrário, ele já estará disponível dentro do JSON `_salesforce_raw_data`.

---

## ⚙️ Estrutura de Filtros Condicionais (Frontend)

O componente `ProductFilter.tsx` no frontend possui uma lógica para renderizar diferentes conjuntos de filtros com base no segmento atual.

*   **Segmentos `carros` e `motos`:** Exibem o filtro padrão com a cascata de dependência: `Aplicação` -> `Tecnologia` -> `Viscosidade`.
*   **Segmentos `caminhoes` e `industria`:** Exibem placeholders ("Filtro A (Em breve)"), preparando o terreno para futuras regras de negócio específicas para esses segmentos, sem quebrar a funcionalidade atual.

---

## 🛠️ Desenvolvimento e Manutenção

### Adicionar/Modificar Regras de Categorização
1.  Abra o arquivo `includes/class-product-manager.php`.
2.  Navegue até o método `get_categorization_rules()`.
3.  Adicione ou altere as palavras-chave para os slugs existentes nas taxonomias `segmento` ou `aplicacoes`.
4.  Após a alteração, execute uma **Sincronização Forçada** para que as novas regras sejam aplicadas aos produtos não categorizados.

### Debug
*   **Logs:** A página `Sync Produtos` possui uma área de "Logs do Sistema" que registra os principais eventos e erros da sincronização.
*   **Painel do Produto:** Na tela de edição de um produto, o box "Detalhes do Salesforce (Somente Leitura)" exibe os dados de Viscosidade, Tecnologia e o JSON bruto recebido da API, o que é extremamente útil para depurar problemas com campos específicos.
*   **Cache:** Lembre-se que o endpoint de filtros (`/filters/...`) usa cache (Transients). Durante o desenvolvimento, pode ser útil limpar o cache para ver as alterações imediatamente. O plugin já faz isso automaticamente ao final de cada sincronização.

