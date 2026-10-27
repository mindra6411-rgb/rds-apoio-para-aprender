const money = n => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
const number = (n, digits = 2) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits }).format(n);
const pct = n => `${number(n)}%`;
const checked = (v, label) => {
  const n = Number(v);
  if (v === '' || !Number.isFinite(n)) throw new Error(`Informe um valor válido para “${label}”.`);
  if (n < 0) throw new Error(`“${label}” não pode ser negativo nesta simulação.`);
  return n;
};
const result = (title, value, steps, extra = []) => ({ title, value, steps, extra });

export function calculate(operation, data) {
  const get = (key, label = key) => checked(data[key], label);
  switch (operation) {
    case 'percent': {
      const base = get('base', 'Valor base'), rate = get('taxa', 'Alíquota'), amount = base * rate / 100;
      return result('Valor calculado', money(amount), [`${money(base)} × ${number(rate)} ÷ 100`, `Resultado arredondado para centavos: ${money(amount)}.`]);
    }
    case 'adjust': {
      const initial = get('valor', 'Valor inicial'), rate = get('taxual', 'Percentual'), change = initial * rate / 100;
      const final = data.acao === 'desconto' ? initial - change : initial + change;
      return result(data.acao === 'desconto' ? 'Preço após desconto' : 'Valor após acréscimo', money(final), [`Variação: ${money(initial)} × ${number(rate)} ÷ 100 = ${money(change)}.`, `Valor final = ${money(initial)} ${data.acao === 'desconto' ? '−' : '+'} ${money(change)} = ${money(final)}.`]);
    }
    case 'taxedPrice': case 'net': {
      const base = get(operation === 'net' ? 'bruto' : 'valor', operation === 'net' ? 'Valor bruto' : 'Valor antes do tributo'), rate = get(operation === 'net' ? 'deducoes' : 'taxa', operation === 'net' ? 'Deduções' : 'Alíquota');
      if (operation === 'net' && rate > 100) throw new Error('As deduções não podem ultrapassar 100% nesta simulação.');
      const amount = base * rate / 100, final = operation === 'net' ? base - amount : base + amount;
      return result(operation === 'net' ? 'Valor líquido didático' : 'Valor com tributo simulado', money(final), [`Parcela percentual: ${money(base)} × ${number(rate)} ÷ 100 = ${money(amount)}.`, `Resultado = ${money(base)} ${operation === 'net' ? '−' : '+'} ${money(amount)}.`]);
    }
    case 'simpleInterest': case 'compoundInterest': case 'futureValue': {
      const initial = get(operation === 'futureValue' ? 'presente' : 'capital', operation === 'futureValue' ? 'Valor presente' : 'Capital inicial'), rate = get('taxa', 'Taxa') / 100, periods = get('periodos', 'Número de períodos');
      const future = operation === 'simpleInterest' ? initial * (1 + rate * periods) : initial * (1 + rate) ** periods;
      const interest = future - initial;
      return result(operation === 'futureValue' ? 'Valor futuro' : 'Montante', money(future), [operation === 'simpleInterest' ? `J = C × i × t = ${money(initial)} × ${number(rate * 100)}% × ${number(periods)} = ${money(interest)}.` : `VF = VP × (1 + i)ᵗ = ${money(initial)} × (1 + ${number(rate * 100)}%)^${number(periods)}.`, `Juros/variação acumulada = ${money(future)} − ${money(initial)} = ${money(interest)}.`, 'A taxa e o prazo devem usar a mesma unidade de período.']);
    }
    case 'variation': {
      const from = get('inicial', 'Valor inicial'), to = get('final', 'Valor final');
      if (from === 0) throw new Error('Para calcular a variação percentual, o valor inicial precisa ser diferente de zero.');
      const change = (to - from) / from * 100;
      return result('Variação', pct(change), [`(${number(to)} − ${number(from)}) ÷ ${number(from)} × 100 = ${number(change)}%.`, change > 0 ? 'O valor aumentou em relação ao inicial.' : change < 0 ? 'O valor diminuiu em relação ao inicial.' : 'Os valores são iguais.']);
    }
    case 'ruleThree': {
      const a = get('a', 'A'), b = get('b', 'B'), c = get('c', 'C');
      if (a === 0) throw new Error('O valor A precisa ser diferente de zero.');
      const x = b * c / a;
      return result('Valor de x', number(x), [`A proporção é A/B = C/x.`, `x = (B × C) ÷ A = (${number(b)} × ${number(c)}) ÷ ${number(a)} = ${number(x)}.`]);
    }
    case 'installment': {
      const cash = get('avista', 'Preço à vista'), count = get('parcelas', 'Número de parcelas'), installment = get('parcela', 'Valor da parcela');
      if (!Number.isInteger(count) || count < 1) throw new Error('Informe um número inteiro de parcelas (mínimo 1).');
      const total = count * installment, difference = total - cash;
      return result('Total parcelado', money(total), [`${number(count, 0)} × ${money(installment)} = ${money(total)}.`, `Diferença para o preço à vista: ${money(difference)} (${difference > 0 ? 'a mais' : difference < 0 ? 'a menos' : 'mesmo valor'}).`], [`Valor à vista: ${money(cash)}`, `Diferença percentual: ${cash === 0 ? 'não calculável (preço à vista igual a zero)' : pct(difference / cash * 100)}`]);
    }
    case 'breakEven': {
      const fixed = get('fixo', 'Custos fixos'), price = get('preco', 'Preço unitário'), variable = get('variavel', 'Custo variável unitário'), contribution = price - variable;
      if (contribution <= 0) throw new Error('O preço unitário precisa ser maior que o custo variável unitário.');
      const units = fixed / contribution;
      return result('Unidades para equilíbrio', `${number(Math.ceil(units), 0)} unidades`, [`Margem de contribuição unitária = ${money(price)} − ${money(variable)} = ${money(contribution)}.`, `Unidades = ${money(fixed)} ÷ ${money(contribution)} = ${number(units)}.`, 'A quantidade é arredondada para cima para cobrir integralmente os custos fixos.']);
    }
    case 'budget': {
      const income = get('receitas', 'Receitas'), expenses = get('despesas', 'Despesas'), balance = income - expenses;
      return result('Saldo do período', money(balance), [`${money(income)} − ${money(expenses)} = ${money(balance)}.`, balance < 0 ? 'As despesas informadas superam as receitas.' : 'Este resultado considera apenas os valores informados.']);
    }
    case 'priceComposition': {
      const cost = get('custo', 'Custo'), expenses = get('despesas', 'Despesas') / 100, margin = get('margem', 'Margem') / 100, taxes = get('tributos', 'Tributos') / 100, retained = 1 - expenses - margin - taxes;
      if (retained <= 0) throw new Error('A soma de despesas, margem e tributos precisa ser menor que 100%.');
      const price = cost / retained;
      return result('Preço estimado', money(price), [`Percentual que cobre o custo: 100% − ${number(expenses * 100)}% − ${number(margin * 100)}% − ${number(taxes * 100)}% = ${number(retained * 100)}%.`, `${money(cost)} ÷ ${number(retained * 100)}% = ${money(price)}.`, 'Estimativa baseada somente nos percentuais informados; revise custos e premissas.']);
    }
    case 'compareTax': {
      const base = get('base', 'Base'), a = get('taxa1', 'Alíquota A'), b = get('taxa2', 'Alíquota B'), va = base * a / 100, vb = base * b / 100;
      return result('Comparação de tributos simulados', `${money(va)} (A) · ${money(vb)} (B)`, [`Cenário A: ${money(base)} × ${number(a)}% = ${money(va)}.`, `Cenário B: ${money(base)} × ${number(b)}% = ${money(vb)}.`, `Diferença entre cenários: ${money(Math.abs(va - vb))}.`]);
    }
    case 'roi': {
      const returned = get('retorno', 'Retorno'), investment = get('investimento', 'Investimento');
      if (investment === 0) throw new Error('O investimento precisa ser maior que zero para calcular o ROI.');
      const roi = (returned - investment) / investment * 100;
      return result('ROI', pct(roi), [`(${money(returned)} − ${money(investment)}) ÷ ${money(investment)} × 100 = ${number(roi)}%.`, 'O indicador não considera, por si só, prazo, risco, custos indiretos ou atribuição de resultados.']);
    }
    case 'ratio': {
      const total = get('total', 'Total'), part = get('parte', 'Parte');
      if (total === 0) throw new Error('O total precisa ser maior que zero.');
      const rate = part / total * 100;
      return result('Proporção', pct(rate), [`${number(part)} ÷ ${number(total)} × 100 = ${number(rate)}%.`, 'A proporção pode ultrapassar 100% se a parte informada for maior que o total.']);
    }
    case 'costPerLead': {
      const investment = get('investimento', 'Investimento'), leads = get('leads', 'Quantidade de leads');
      if (leads === 0) throw new Error('A quantidade de leads precisa ser maior que zero.');
      const cpl = investment / leads;
      return result('Custo médio por lead', money(cpl), `${money(investment)} ÷ ${number(leads)} = ${money(cpl)}.`);
    }
    case 'funnel': {
      const visitors = get('visitantes', 'Visitantes'), contactRate = get('taxa1', 'Taxa visita para contato'), saleRate = get('taxa2', 'Taxa contato para venda');
      if (contactRate > 100 || saleRate > 100) throw new Error('As taxas do funil devem estar entre 0% e 100%.');
      const contacts = visitors * contactRate / 100, sales = contacts * saleRate / 100;
      return result('Vendas estimadas no cenário', number(sales), [`Contatos: ${number(visitors)} × ${number(contactRate)}% = ${number(contacts)}.`, `Vendas: ${number(contacts)} × ${number(saleRate)}% = ${number(sales)}.`, 'Estimativa matemática baseada apenas nas taxas hipotéticas informadas.']);
    }
    case 'margin': {
      const price = get('venda', 'Preço de venda'), cost = get('custo', 'Custo total'), profit = price - cost;
      if (price === 0) throw new Error('O preço de venda precisa ser maior que zero.');
      const margin = profit / price * 100, markup = cost === 0 ? null : profit / cost * 100;
      return result('Lucro bruto', money(profit), [`Lucro = ${money(price)} − ${money(cost)} = ${money(profit)}.`, `Margem sobre venda = ${money(profit)} ÷ ${money(price)} × 100 = ${number(margin)}%.`, `Acréscimo sobre custo (markup) = ${markup === null ? 'não calculável com custo zero' : pct(markup)}.`]);
    }
    case 'cashflow': {
      const start = get('saldo', 'Saldo inicial'), income = get('entradas', 'Entradas'), out = get('saidas', 'Saídas'), end = start + income - out;
      return result('Saldo final', money(end), [`${money(start)} + ${money(income)} − ${money(out)} = ${money(end)}.`]);
    }
    case 'workingCapital': {
      const assets = get('ativos', 'Ativos circulantes'), liabilities = get('passivos', 'Obrigações');
      return result('Capital de giro líquido', money(assets - liabilities), [`${money(assets)} − ${money(liabilities)} = ${money(assets - liabilities)}.`, 'Exercício didático baseado nos componentes fornecidos; não é análise contábil completa.']);
    }
    case 'hours': {
      const [sh, sm] = data.inicio.split(':').map(Number), [eh, em] = data.fim.split(':').map(Number), interval = get('intervalo', 'Intervalo');
      let mins = eh * 60 + em - (sh * 60 + sm);
      if (mins <= 0) mins += 24 * 60;
      mins -= interval;
      if (mins < 0) throw new Error('O intervalo não pode ser maior que a duração do período.');
      return result('Tempo trabalhado', `${Math.floor(mins / 60)} h ${mins % 60} min`, [`Duração entre horários menos intervalo: ${Math.floor(mins / 60)} hora(s) e ${mins % 60} minuto(s).`, 'Se o fim for antes do início, considera-se que o período terminou no dia seguinte.']);
    }
    default: throw new Error('Esta operação ainda não está disponível.');
  }
}

export { money, number, pct };
