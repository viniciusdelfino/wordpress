# Integração Inforlube (Catálogo Técnico)

## Visão Geral
A Inforlube (Dafitech) é o motor de recomendação do site. Ela detém a inteligência que correlaciona um veículo específico aos produtos Mobil compatíveis.

## Fluxo de Dados
1.  O Frontend envia um `VehicleID` (obtido via xlab).
2.  A Inforlube retorna um JSON com os sistemas do veículo e seus respectivos lubrificantes recomendados.
3.  O sistema faz o "De-Para" do SKU Inforlube -> SKU Salesforce para exibir o produto final.

## O Conceito das "31 Estantes" (Categorias)
A API pode retornar recomendações para até 31 sistemas diferentes. O frontend deve tratar isso de forma dinâmica:

*   **Exemplos de Slugs:** `Fluid_Oil_MotorOil`, `Fluid_Oil_BrakeFluid`, `Fluid_Oil_Transmission_AutomaticTransmissionFluid`, `Fluid_Oil_Chain_Spray`.
*   **Regra de Exibição:** O layout não é fixo. Renderizamos apenas as categorias que a API retornar para aquele veículo específico.

## Endpoints Chave
*   `GET /recommendation/vehicle/{id}`: Retorna a lista de produtos por sistema.
*   **Dados retornados:** SKU Mobil, Capacidade (litros) e Observações técnicas de troca.

---

# 🔍 Integração xlab (Identificador de Frota)

## Visão Geral
A xlab atua como o "tradutor" de busca. Ela converte a entrada do usuário (seja uma placa ou o nome de um modelo) em dados estruturados que a Inforlube e o WordPress conseguem entender.

### 1. Busca por Placa (Consulta Ligeira)
Permite que o usuário encontre o óleo ideal apenas digitando a placa do veículo.

*   **Como funciona:** O frontend dispara uma requisição para o proxy da xlab.
*   **Dados Obtidos:** Marca, Modelo, Ano, Motorização e o `VehicleID` necessário para a Inforlube.
*   **Segurança:** O endpoint é protegido por token e o site utiliza o WordPress como Proxy para não expor as credenciais no client-side.

### 2. Busca por Nome (Filtro em Cascata)
Para usuários que não possuem a placa em mãos, a xlab fornece um fluxo de seleção manual:

*   **Fluxo:** Montadora —> Ano —> Modelo —> Motorização.
*   **Dependência:** O endpoint de 'Modelos' só é populado após a seleção do 'Ano', garantindo que o usuário não selecione combinações inexistentes.

## 🖼️ Foto Real do Veículo
Um diferencial da integração xlab é o retorno da URL da imagem real do modelo consultado.

*   **Uso no Frontend:** Exibida no topo da página de resultado ("Óleo Ideal para o seu [Modelo]"), aumentando a confiança do usuário na recomendação.

## 📋 Como as duas se unem (Exemplo Prático)

| Passo | Ação do Usuário | Sistema Atuante | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| 1 | Digita Placa ABC-1234 | xlab | Retorna que é um "Honda Civic 2020" + ID: 9988 |
| 2 | Visualiza Loading | Inforlube | Consulta ID: 9988 e diz que ele usa o SKU 123456 (Motor) |
| 3 | Exibe Card | Salesforce | Busca preço/nome comercial para o SKU 123456 |
| 4 | Página Final | WordPress | Adiciona vídeos e tabelas comparativas sobre o produto |