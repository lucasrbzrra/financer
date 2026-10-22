# Publicar Financer

Publique SOMENTE o conteúdo de dist/ na raiz do seu domínio estático. Não é preciso Node ou backend no servidor. Use HTTP/HTTPS, não file://.

O ZIP contém código-fonte React, dependências declaradas, testes e a versão já compilada. Para editar: npm ci; npm test; npm run build. Para testar com Python 3: python -m http.server 8080 --directory dist.

## Configurar correção do seu contrato

Em Correção e regras do contrato, informe o indexador (TR/IPCA ou nenhum), a hipótese anual de correção ou índices mensais específicos, taxa de juros nominal/efetiva e seguro. Nenhum índice futuro é presumido automaticamente: os cenários anteriores permanecem sem correção até configuração explícita.

A hipótese anual não é previsão oficial. O saldo é corrigido antes dos juros e da amortização. Seguro pode ser fixo ou MIP mensal sobre saldo + DFI informado. Para reproduzir a cobrança, use os dados da proposta e da apólice; existem diferenças de datas, índices, recálculo e seguros por idade que dependem do contrato. Leia SPEC.md.

Use Compartilhar simulação para gerar link com os seus parâmetros e variações. O link inclui renda e gastos e abre uma cópia independente. A hospedagem define o acesso; o app não tem autenticação própria. Parâmetros pessoais do navegador não vêm no ZIP.

## Documentação do projeto

# Financer

Simulador imobiliário estático em React, em português do Brasil.

## Executar

Requer Node 22 ou superior.

```sh
npm ci
npm test
npm run build
npx serve dist
```

O diretório `dist` pode ser publicado em um servidor estático. A aplicação não usa CDN ou APIs bancárias; cálculos e persistência são locais ao navegador.

## Experiência principal

Três decisões: quanto amortizar mensalmente, quando começar e reduzir prazo ou prestação. A recomendação usa renda, gastos, margem e reserva; o usuário abre um formulário recolhível, informa título, aporte, início e objetivo e confirma. Somente a confirmação adiciona ou altera uma linha. Até seis combinações são exibidas nos mesmos dois gráficos ECharts: saldo devedor ao longo do tempo e juros acumulados (alternável para total pago). Tooltip e zoom temporal sincronizados, cores consistentes e tabela compacta mostram quitação e custos. A legenda e a tabela usam o título informado; edição e cancelamento preservam os dados confirmados. Não há geração automática de uma grade de cenários. A comparação pode ser exportada e cada combinação pode ser aplicada à evolução mensal.

Parâmetros de financiamento, documentação e comparações são salvos no navegador, pelo botão ou automaticamente, e podem ser exportados/importados em JSON. A avaliação do imóvel é separada da venda. Custos de documentação são estimativas editáveis com hipóteses explícitas para ITBI e emolumentos.

## Estrutura

- `SPEC.md`: especificação e histórico de revisões, atual na versão 3.1.
- `src/finance.mjs`: SAC/Price, documentação, validação e migração.
- `src/planner.mjs`: análise de orçamento, recomendações e projeções.
- `src/Planner.jsx`: formulários recolhíveis de variações e três gráficos sincronizados.
- `src/EChart.jsx` e `src/chart-options.mjs`: integração React/ECharts, responsividade e opções de projeção.
- `src/variation-form.mjs`: confirmação de rascunhos e tratamento de títulos/CSV.
- `src/app.jsx`: navegação, parâmetros, visão geral e evolução mensal.
- `src/style.css`: layout responsivo e tipografia.
- `tests/`: 98 testes financeiros, de projeção e de confirmação de variações.

## Hipóteses

Taxa efetiva ou nominal anual; correção opcional TR/IPCA com hipótese anual e índices mensais específicos; seguro fixo ou MIP sobre saldo corrigido + DFI informado. Não calcula CET regulatório. Extras entram após a prestação e são limitados ao saldo. A recomendação prioriza formar a reserva configurada antes dos extras; a capacidade fixa preserva a margem mensal escolhida. Não inclui rendimento de recursos durante a espera nem mudanças futuras na renda, gastos ou taxa. As projeções não substituem uma proposta bancária.

Navegação e parâmetros podem ser expandidos/recolhidos por botões com estado acessível; as preferências ficam salvas no navegador. ResizeObserver redimensiona os gráficos sem alterar dados.

## Correção do contrato

Configure em Correção e regras do contrato o indexador, a hipótese anual (ou índices mensais), tipo da taxa e seguro da proposta. A correção é aplicada ao saldo antes dos juros e da amortização. O gráfico discrimina juros + correção; o cronograma e CSV mostram o valor da atualização. Nenhum valor futuro de TR/IPCA é presumido: cenários antigos continuam sem correção até você configurá-la.

Fatores de aniversário, pro rata diário, fase de obras, defasagem de índices, reenquadramentos etários e regras particulares exigem dados do contrato e podem divergir da projeção. Consulte SPEC.md.

O terceiro gráfico compara as parcelas mensais do contrato sem extras e das variações confirmadas. Alterne Só prestação / Prestação + aporte para distinguir a parcela regular do desembolso do mês.
