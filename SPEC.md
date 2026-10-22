# Financer — Especificação funcional e técnica

Data: 21/10/2026. Versão: 1.0. Criada antes da implementação.

## Objetivo
Aplicação React estática, em português do Brasil, para explorar financiamentos imobiliários e o efeito de amortizações extras. Processamento local, sem backend, login próprio ou consulta a bancos. Valores iniciais são exemplos editáveis, não uma proposta bancária.

## Experiência
- Dashboard responsivo: navegação lateral, parâmetros em painel, indicadores e gráficos comparativos.
- Abas Visão geral, Amortizações, Comparar sistemas e Evolução mensal.
- Parâmetros: preço do imóvel, entrada, prazo (meses), taxa efetiva anual, sistema SAC/Price, primeiro vencimento, renda mensal, limite de prestação, seguro mensal e tarifa mensal.
- Amortização mensal recorrente, aporte anual (a cada 12 prestações), e aportes pontuais com mês e valor. Estratégia de reduzir prazo ou reduzir prestação.
- Indicadores: primeira prestação, juros, custo total, prazo efetivo, quitação estimada e renda comprometida. Comparação com cenário sem extras.
- Projeção do saldo devedor e composição dos pagamentos; tabela mensal pesquisável por ano com paginação e exportação CSV.
- Comparação SAC/Price sob os mesmos parâmetros, incluindo extras. Análises determinísticas de economia de juros, meses antecipados e limite de prestação.
- Persistência automática de parâmetros e aportes no localStorage; redefinir exemplo e exportar/importar cenário JSON validado. Sem dependências de CDN em execução.
- Especificação disponível para leitura/download na aplicação.

## Modelo matemático
Taxa mensal efetiva: i = (1 + taxa_anual/100)^(1/12) − 1. Sem correção monetária (TR/IPCA), inflação, subsídios ou mudanças de taxa. Seguros e tarifas são fixos mensais e terminam na quitação. Não calcula CET regulatório.

Principal P = preço − entrada. Primeira parcela no primeiro vencimento informado. Juros de cada mês = saldo de abertura × i. Parcela = juros + amortização regular + seguro + tarifa. Extras são aplicados depois da prestação, limitados ao saldo remanescente. O aporte anual ocorre nos meses 12, 24, 36 etc. Pontuais no mesmo mês somam-se aos recorrentes.

Price: prestação financeira A = P×i/[1−(1+i)^(-n)]; se i=0, A=P/n. SAC: amortização regular P/n. Arredondamento apenas na exibição, com tolerância final de centavos para encerramento. Última amortização limitada ao saldo.

Redução de prazo: mantém a prestação financeira Price ou amortização regular SAC e encerra quando saldo zera. Redução de prestação: recalcula, após cada extra, a prestação Price/amortização SAC para os meses restantes até o vencimento original. Não mantém juros sobre principal já amortizado.

Total de juros = soma dos juros mensais. Total pago ao financiamento = amortização regular + extras + juros + encargos. Desembolso da compra = entrada + total pago ao financiamento. Economia = diferença entre base sem extras e cenário ativo, exibindo juros separadamente de encargos. Saldo devedor exclui juros futuros. Comprometimento = primeira parcela incluindo encargos / renda.

## Validações e limites
Preço > 0; entrada entre 0 e preço (exclusive); prazo inteiro de 1 a 600; taxa de 0 a 50% a.a.; renda > 0; encargos e extras não negativos. Pontuais com mês inteiro de 1 a prazo. Entradas inválidas mostram mensagem e não geram resultados NaN. Importação verifica estrutura e limites antes de alterar dados locais.

## Arquitetura
React com JSX compilado para JavaScript estático. Motor financeiro puro separado da interface e testes em Node. CSS próprio e gráficos SVG responsivos. Dist sem servidor de aplicação. Fonte e spec versionados com o projeto. CSV e JSON gerados no navegador.

## Critérios de aceite e verificação
1. Sem extras, SAC e Price quitam o principal no prazo e soma das amortizações coincide com principal.
2. Taxa zero funciona em ambos os sistemas sem divisão por zero.
3. Aportes nunca deixam saldo negativo; excedentes são limitados e não cobrados.
4. Reduzir prazo antecipa quitação; reduzir prestação preserva vencimento ou quita antes por aporte suficiente.
5. Todos os indicadores, gráficos e exportações usam o mesmo cronograma calculado.
6. Testes do motor: fórmulas conhecidas, zero, quitação antecipada, múltiplos aportes, encargos e redução de prestação.
7. QA visual em desktop e mobile, navegação, edição de parâmetros, aporte pontual, persistência e exportações.

## Fora do escopo
Integração bancária/FGTS real, elegibilidade MCMV, aprovação de crédito, taxas vigentes, dados de mercado e aconselhamento individual. O simulador explicita as hipóteses em uma seção de metodologia.

## Revisão 1.1 — Valores do imóvel, documentação e acessibilidade
- Tipografia ampliada, inputs de 16px, textos auxiliares de pelo menos 12px e grades alinhadas com espaçamento uniforme. Cartões lado a lado têm a mesma altura; parâmetros e resultados compartilham o alinhamento superior em desktop.
- Máscara pt-BR: agrupamento de milhares durante a edição de valores, vírgula decimal e duas casas monetárias ao sair do campo. Percentuais aceitam vírgula decimal. O estado mantém números, sem símbolos.
- `price` passa a significar valor de venda, preservando compatibilidade. `appraisal` é a avaliação bancária. Principal = venda − entrada, sem mudança automática por avaliação; o percentual sobre a avaliação é mostrado para análise. Não pressupõe limite de crédito bancário.
- Migração de cenários antigos: preserva parâmetros/aportes; avaliação assume a venda previamente salva e os novos custos assumem os exemplos padrão.
- Documentação: ITBI + emolumentos elegíveis com eventual redução + custas não elegíveis + avaliação do banco + certidões + outras despesas/escritura, se exigida. Os exemplos não constituem tabela oficial de município/cartório.
- ITBI: base de venda padrão, opcionalmente avaliação como hipótese ou base manual. Alíquota editável (exemplo 2%); desconto municipal de primeiro imóvel editável (padrão 0%). Ser primeiro imóvel não gera isenção nem redução automática do ITBI.
- Registro: primeira aquisição residencial E SFH aplicam 50% aos emolumentos informados como elegíveis. Custas não elegíveis não têm redução. Referência: Lei 6.015/73, art. 290 — https://www.planalto.gov.br/ccivil_03/leis/l6015compilada.htm . A estimativa depende da elegibilidade efetiva e do orçamento do cartório.
- Base de ITBI não deriva automaticamente da avaliação bancária. Referência explicativa: Tema 1.113/STJ — https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/09032022-Base-de-calculo-do-ITBI-e-o-valor-do-imovel-transmitido-em-condicoes-normais-de-mercado--define-Primeira-Secao.aspx . Ajustar conforme regra e guia do município.
- Entrada + documentação é o caixa inicial estimado. Desembolso total da compra = entrada + documentação + fluxo total do financiamento. Não há juros sobre documentação nem inclusão desses custos no saldo financiado.
- Testes adicionais: desconto condicionado à combinação de primeiro imóvel/SFH, ITBI sem desconto automático, redução municipal explícita, custas não elegíveis, base manual, avaliação independente e migração dos cenários.

## Revisão 1.2 — Salvamento explícito
Botão "Salvar parâmetros" no painel de financiamento persiste todos os parâmetros, custos de documentação e aportes no navegador e confirma o resultado. Usa a mesma persistência restaurada ao abrir a aplicação, preservando o salvamento automático existente. Fica desabilitado quando há parâmetros inválidos e informa eventual falha de armazenamento. A ação de download JSON passa a se chamar "Exportar cenário" para distinguir as duas funções.

## Revisão 2.0 — Comparador de amortizações e análise do orçamento
- Orçamento visível no painel lateral: renda líquida familiar, gastos mensais sem financiamento, margem livre de segurança, reserva disponível após entrada/documentação, meta de reserva em meses e percentual da folga destinado a amortização. Exemplos iniciais explicitados.
- Nove cenários independentes: três orçamentos mensais editáveis × três frequências (1, 6, 12 meses). Cada frequência usa o mesmo esforço mensal: valor por evento = orçamento mensal × frequência. O primeiro aporte ocorre em início + frequência − 1, com dinheiro acumulado desde o mês de início.
- Comparações não somam extras atuais, não usam reserva de emergência nem presumem bônus. Aportes são limitados ao saldo, sem rendimento do dinheiro aguardando aporte, sem inflação ou variação de renda/gastos/taxa.
- Gráficos: saldo devedor/juros acumulados para um orçamento comparando frequências; barras de juros para todos os cenários. Base sem aportes sempre identificada. Cartões indicam economia, juros, quitação, meses antecipados e adequação ao orçamento.
- Classificação: menor juro matemático entre os cenários; recomendação considera folga mensal e reserva. Não confundir cenário de maior aporte com maior eficiência da frequência: comparação de frequência usa valor mensal idêntico.
- Folga = renda − gastos − primeira prestação sem extras − margem. Usar a primeira prestação é conservador sob SAC/Price fixos. Sugestão = folga positiva × percentual escolhido, arredondada para baixo a dezenas de reais (ou centavos para valores abaixo de R$10). Percentual e meta de reserva são hipóteses editáveis do usuário, não regra oficial.
- Reserva alvo = meses de meta × (gastos + primeira prestação). Falta = máximo(0, alvo − reserva disponível). Antes dos extras sugeridos, estimar meses de formação da reserva = teto(falta/folga), reservando toda a folga. Início dos extras = meses de formação + 1; se não couber no prazo, explicar e não recomendar aporte.
- Renda insuficiente gera recomendação de ajustar o orçamento e aporte sugerido zero. Comparações seguem disponíveis como hipóteses, marcando casos fora do orçamento. Reserva não confirmada exibe orientação para formar a reserva antes de amortizar.
- Aplicar sugestão configura três orçamentos ao redor do aporte sugerido (50%, 100%, 150%, limitado à folga), mês de início após reserva e redução de prazo. Aplicar um caso substitui apenas o plano de extras atual, mantendo financiamento/documentação/orçamento. Exportação CSV de todos os casos e JSON incluindo orçamento/casos; persistência local compatível com versões anteriores.
- Fundamentos educativos: BCB, orçamento familiar (https://www.bcb.gov.br/cidadaniafinanceira/organizando-vida-familia); Portal do Investidor/CVM, planejamento de reservas (https://www.gov.br/investidor/pt-br/penso-logo-invisto/planejamento-e-gestao-de-reservas-financeiras); CAIXA, amortização habitacional (https://www.caixa.gov.br/voce/habitacao/servicos/Paginas/default.aspx). O algoritmo é uma heurística transparente do simulador, não um modelo prescrito por essas fontes.

### Janelas de início (adicional à revisão 2.0)
Controle deslizante de espera de 0 até prazo−1 meses, com atalhos: desde o começo (mês 1), após um ano (mês 13), após cinco anos (mês 61). Não há aportes ou acumulação antes do início escolhido. Dentro de cada janela, a frequência mensal aporta no mês inicial; a semestral no inicial+5; a anual no inicial+11. Datas do primeiro aporte são apresentadas para cada frequência. Atalhos fora do contrato são desabilitados. Uma seção adicional compara juros e quitação das três janelas para o orçamento selecionado, frequência mensal e objetivo selecionado. A janela livre aparece adicionalmente na comparação quando diferente dos três atalhos.

## Revisão 3.0 — Três decisões e dois gráficos
A experiência principal passa a responder diretamente: (1) quanto amortizar mensalmente, (2) quando iniciar e (3) reduzir prazo ou prestação. Retira a grade automática de nove cartões, comparadores de janelas separados e gráficos adicionais da aba de amortizações.
- Uma recomendação concisa usa a capacidade mensal fixa: renda − gastos − primeira prestação − margem; arredonda para baixo em dezenas de reais (centavos para capacidade abaixo de R$10). Esse é um limite conservador de aporte fixo no cenário, não um ótimo de todos os fluxos futuros. A recomendação não usa mais o percentual padrão de 50% da versão anterior.
- A reserva continua sendo preservada. O início recomendado ocorre após a estimativa de sua formação. É explicitada a diferença entre começar antes para reduzir juros e esperar para preservar segurança financeira.
- Formulário único: aporte mensal extra, espera em meses (slider e atalhos 0/12/60) e objetivo (prazo/prestação). A curva em edição é recalculada ao mudar qualquer parâmetro.
- "Adicionar variação" congela aquela combinação nos mesmos gráficos; até seis variações escolhidas pelo usuário, sem geração automática de casos. Atalho "Comparar prazo e prestação" adiciona as duas estratégias para o mesmo valor e início. Cada linha pode ser removida, reutilizada no formulário ou aplicada ao cronograma mensal.
- Exatamente dois gráficos lado a lado em desktop: saldo devedor × tempo (com a quitação) e juros acumulados × tempo, com alternância do segundo para total pago. Mesmas cores por variação nos dois gráficos; contrato sem extras como referência. Cursor sincronizado mostra o mesmo mês e valores em ambos. Em telas pequenas, gráficos empilham para legibilidade.
- Uma tabela compacta abaixo informa aporte, início, objetivo, meses até quitar, data, juros e total de cada variação; substitui cartões. Total pago inclui principal, extras, juros e encargos e exclui entrada/documentação.
- Estado `simulationAmount` e `comparisonVariations` persistido no salvamento/exportação existente; migração adiciona valores padrão sem descartar parâmetros anteriores.
- Nas duas estratégias o extra abate saldo. Redução de prazo mantém amortização/prestação financeira; redução de prestação recalcula a prestação futura. Aplicar um cenário substitui os extras do plano ativo, preservando financiamento e orçamento.

## Revisão 3.1 — ECharts, títulos e confirmação de variações
- Gráficos de projeção migrados para Apache ECharts 6 com renderer Canvas, tooltip sincronizado e zoom temporal, redimensionamento por ResizeObserver e liberação de instâncias ao sair da tela. As duas projeções continuam lado a lado em desktop.
- Legenda compartilhada mostra o título informado e permite ocultar/exibir linhas nos dois gráficos. Tabela e CSV reutilizam o mesmo título. Títulos são tratados como texto, inclusive em tooltips; CSV protege células textuais de execução de fórmulas.
- "Adicionar variação" abre um novo rascunho dentro de um formulário recolhível. Título obrigatório (até 60 caracteres), aporte, início e objetivo são independentes por variação. Confirmação é a única ação que inclui/atualiza as linhas e a tabela. Cancelar descarta o rascunho ou as alterações, preservando resultados confirmados.
- Até seis variações confirmadas, com possibilidade de abrir mais de um rascunho respeitando os lugares disponíveis. Títulos únicos, com "Sem extras" reservado à referência. Combinações financeiras iguais podem ter nomes distintos.
- Edição de uma variação confirmada mantém os resultados anteriores até "Salvar alterações". Ao confirmar, o formulário recolhe. Variações antigas ganham os nomes Variação 1, Variação 2 etc., preservando parâmetros e IDs.
- Navegação lateral e painel de parâmetros têm controles acessíveis de expandir/recolher. Preferências persistidas no navegador. Os gráficos reajustam a largura automaticamente, sem alterar cálculos ou formulários.

### Ajuste do controle de navegação
O menu lateral com o logo Financer passa a ter um botão permanente na própria barra: recolher junto ao logo quando expandida e expandir logo abaixo do ícone quando recolhida. O controle permanece visível durante a rolagem do conteúdo e reutiliza o estado persistido de navegação. O controle do painel de parâmetros permanece independente.


### Largura e animação das barras laterais
- Painel interno de parâmetros ampliado para 360 px em telas grandes e 340 px em layouts intermediários; telas menores mantêm a disposição responsiva em uma coluna.
- Abertura e recolhimento com transição de 360 ms, incluindo o espaço dos resultados e o conteúdo do painel. Respeitar a preferência de movimento reduzido.
- O menu principal é controlado pela navbar; remover o botão duplicado junto ao logo.
- Campos recolhidos ficam fora da navegação por teclado e da árvore de acessibilidade.


### Frequência de aporte nas variações
- Cada formulário permite todo mês, a cada 6 meses ou a cada ano, independentemente da data de início e do objetivo.
- O valor informado é por ocorrência. O mês escolhido inicia a reserva mensal de valor/frequência. O primeiro aporte ocorre ao completar 1, 6 ou 12 meses de reserva; os seguintes repetem o ciclo. Não há rendimento do saldo reservado.
- Apenas a confirmação altera as projeções. Frequência aparece no resumo, tabela e CSV; aplicar usa os mesmos eventos no cronograma.
- Variações antigas continuam mensais. Frequências inválidas são rejeitadas na confirmação e importação. O alerta orçamentário considera a reserva mensal necessária, além da prestação, gastos e margem.


### Alinhamento do formulário de variações
- Valor e frequência em duas colunas iguais quando o formulário tem pelo menos 680 px úteis. Abaixo desse limite, campos empilhados.
- Início e objetivo ocupam a largura inteira, sem colunas vazias. Ordem visual e de teclado: valor, frequência, início, objetivo.
- Labels, alturas dos controles e espaçamentos padronizados; atalhos de início em três colunas iguais e empilhados em formulários estreitos.


### Correção do ciclo e da capacidade de aporte
- R$ 9.000 semestrais desde o início equivalem a reservar R$ 1.500 nos meses 1 a 6 e amortizar nos meses 6, 12, 18 etc.
- Após 1 ano significa iniciar a reserva no mês 13: semestral amortiza pela primeira vez no mês 18, anual no mês 24.
- As variações existentes são recalculadas com essa regra. Gráficos, tabela, CSV e Aplicar usam o mesmo cronograma corrigido.
- Sem uso automático de reserva de emergência, saldo inicial ou rendimento. O alerta avalia se a provisão mensal cabe no fluxo mensal; encargos já fazem parte da prestação.


### Compartilhamento estático de cenários
- Botão Compartilhar simulação gera uma cópia imutável dos parâmetros atuais, aportes aplicados e variações confirmadas (rascunhos não incluídos).
- Dados JSON versionados em UTF-8/Base64URL no fragmento #sim=; sem backend, banco ou serviço externo. Renda e gastos estão legíveis ao destinatário; o diálogo informa isso. Não altera as permissões de hospedagem.
- Na abertura, o cenário validado do link tem prioridade sobre o armazenamento local. Cenário recebido não sobrescreve o cenário local automaticamente; Salvar cópia/Salvar parâmetros confirma a substituição e remove o fragmento. Edições não modificam o link original.
- Links inválidos ou incompatíveis mostram aviso e preservam o cenário local. Limite de 24.000 caracteres codificados; cenários grandes usam exportação JSON existente. O endereço preserva domínio, subdiretório e query do deploy.
