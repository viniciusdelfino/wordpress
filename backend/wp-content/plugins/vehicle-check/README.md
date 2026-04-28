# Vehicle Check - Gateway Seguro

Este plugin atua como um **Middleware de Segurança** e **Proxy** para a consulta de dados de veículos (Busca por Placa).

## 🎯 Objetivo
O objetivo principal deste plugin é proteger as credenciais da API externa (CheckTudo/X-Lab). Em vez do frontend (Next.js) chamar a API externa diretamente (o que exporia a chave de API na aba "Network" do navegador), o frontend chama este plugin no WordPress, que por sua vez realiza a chamada segura no servidor.

## 📂 Estrutura de Arquivos

```text
vehicle-check/
├── tv1-vehicle-check.php       # Arquivo principal (Bootstrap e Rotas REST)
├── README.md                   # Documentação Técnica
├── includes/
│   ├── class-api-handler.php   # Faz a chamada HTTP (cURL/wp_remote_post) para a API externa
│   └── class-data-filter.php   # Limpa o JSON bruto, retornando apenas o necessário para o front
└── admin/
    └── settings-page.php       # Cria a tela no WP Admin para inserir Token/User/Pass
```

## Detalhes dos Arquivos Internos
### includes/class-api-handler.php
Este arquivo é o motor de comunicação. Ele abstrai toda a complexidade da requisição HTTP e garante que a chave de API nunca saia do servidor.

* Gerenciamento de Credenciais: No __construct, a classe recupera o user_id e o auth_token diretamente do banco de dados do WordPress (wp_options), centralizando a configuração.

* Sanitização Rigorosa (sanitize_plate): Antes de enviar a placa para a CheckTudo, o plugin remove caracteres especiais e espaços, convertendo tudo para maiúsculas (ex: abc-12 34 vira ABC1234). Isso evita erros de sintaxe na API externa.

* Implementação wp_remote_post: Utiliza a API nativa do WordPress para requisições assíncronas, definindo um timeout de 15 segundos para evitar que o site trave caso a API externa esteja lenta.

* QueryCode 71: O método consult_vehicle está fixado no código 71, que corresponde à consulta específica de dados cadastrais de veículos da CheckTudo.

### includes/class-data-filter.php
Este arquivo é a camada de privacidade e proteção. Ele age como um "funil" para os dados que vêm da API externa.

* Princípio do Privilégio Mínimo: A API da CheckTudo retorna dezenas de informações (chassi, Renavam, histórico de roubo, etc.). Este arquivo garante que apenas a placa confirmada (ou outros dados estritamente necessários) sejam repassados ao frontend.

* Tratamento de Erros Silencioso: Utiliza o operador de coalescência nula (?? '') para evitar que erros de PHP (Undefined Index) ocorram caso a API retorne um JSON com estrutura inesperada.

* Sucesso Condicional: Ele mapeia a estrutura complexa do JSON de retorno ($api_response['body']['headerInfos']...) para um formato simples e limpo que o Next.js consome facilmente.

### Fluxo de Dados (Sequência)
* Frontend (Next.js): Envia uma placa via POST para o endpoint REST do WP.

* Plugin (Middleware): Valida a origem da requisição e chama o moove_Vehicle_API_Handler.

* Handler: Sanitiza a placa, anexa o Token de autorização secreto e dispara a chamada para a api.checktudo.com.br.

* Filter: Recebe o JSON "pesado" da CheckTudo, extrai apenas a confirmação da placa e limpa o restante.

* Resposta: O WordPress devolve um JSON enxuto e seguro para o Next.js.

## ⚙️ Configuração

1.  Acesse o Painel Administrativo do WordPress.
2.  Navegue até **Configurações > Vehicle Check** (ou o menu dedicado criado pelo plugin).
3.  Insira as credenciais da API de terceiros (Token, Usuário, etc).

## 🔌 API Endpoints (REST)8

O plugin expõe um endpoint customizado no WordPress REST API.

### Verificar Placa
**Rota:** `POST /wp-json/moove-vehicle/v1/verify-plate`

**Segurança (CORS & Origin):**
O endpoint verifica o header `Origin` da requisição. Apenas origens permitidas (ex: `localhost:3000`, `seu-site.com`) podem consumir este dado.

**Payload (Request):**
```json
{
  "plate": "ABC1234"
}
```

**Response (Success 200):**
Retorna os dados filtrados do veículo.
```json
{
  "success": true,
  "data": {
    "plate": "ABC1234",
    "brand": "Honda",
    "model": "Civic",
    "year": "2020",
    "fuel": "Flex"
  }
}
```

**Response (Error 400/404):**
```json
{
  "success": false,
  "message": "Placa não encontrada ou inválida"
}
```

## 🛡️ Segurança Implementada

1.  **Sanitização:** O input `plate` passa por `sanitize_text_field` para evitar injeção.
2.  **Ocultação de Dados:** O `class-data-filter.php` garante que dados sensíveis ou irrelevantes retornados pela API externa não cheguem ao frontend.
3.  **Restrição de Origem:** Implementação manual de verificação de `Origin` dentro do `permission_callback`.

## 📝 Notas para Desenvolvedores

*   **Ambiente Local:** Se estiver testando em uma porta diferente de `3000`, adicione sua URL no array `$allowed_origins` dentro de `tv1-vehicle-check.php`.
*   **Logs:** Erros de comunicação com a API externa devem ser logados usando `error_log()` do PHP para debug no servidor.
