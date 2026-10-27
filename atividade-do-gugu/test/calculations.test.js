import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../src/calculations.js';
import { tools } from '../src/tools.js';

const closeTo = (actual, expected, epsilon = 1e-8) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} não está próximo de ${expected}`);

test('catálogo tem mais de 20 ferramentas com metadados básicos e rotas únicas', () => {
  assert.ok(tools.length > 20);
  assert.equal(new Set(tools.map(tool => tool.id)).size, tools.length);
  for (const tool of tools) {
    assert.ok(tool.name && tool.description && tool.category && tool.type && tool.id);
    if (tool.type === 'calculator') assert.ok(tool.operation && tool.fields.length);
  }
});

test('percentuais: alíquota, acréscimo, desconto e variação', () => {
  assert.equal(calculate('percent', {base:'800',taxa:'5'}).value, 'R$ 40,00');
  assert.equal(calculate('adjust', {valor:'100',taxual:'10',acao:'desconto'}).value, 'R$ 90,00');
  assert.equal(calculate('adjust', {valor:'100',taxual:'10',acao:'acrescimo'}).value, 'R$ 110,00');
  assert.equal(calculate('variation', {inicial:'80',final:'100'}).value, '25%');
  assert.equal(calculate('variation', {inicial:'100',final:'80'}).value, '-20%');
});

test('juros simples e compostos aplicam a unidade de período informada', () => {
  assert.equal(calculate('simpleInterest', {capital:'1000',taxa:'2',periodos:'3'}).value, 'R$ 1.060,00');
  assert.equal(calculate('compoundInterest', {capital:'1000',taxa:'10',periodos:'2'}).value, 'R$ 1.210,00');
  assert.equal(calculate('futureValue', {presente:'100',taxa:'10',periodos:'1'}).value, 'R$ 110,00');
});

test('regra de três, parcelamento e ponto de equilíbrio', () => {
  assert.equal(calculate('ruleThree', {a:'2',b:'10',c:'4'}).value, '20');
  assert.equal(calculate('installment', {avista:'100',parcelas:'3',parcela:'40'}).value, 'R$ 120,00');
  assert.equal(calculate('breakEven', {fixo:'1000',preco:'30',variavel:'10'}).value, '50 unidades');
});

test('orçamento, fluxo de caixa e capital de giro', () => {
  assert.equal(calculate('budget', {receitas:'2000',despesas:'1500'}).value, 'R$ 500,00');
  assert.equal(calculate('cashflow', {saldo:'100',entradas:'50',saidas:'30'}).value, 'R$ 120,00');
  assert.equal(calculate('workingCapital', {ativos:'800',passivos:'500'}).value, 'R$ 300,00');
});

test('formação de preço, margem e ROI', () => {
  closeTo(Number(calculate('priceComposition', {custo:'50',despesas:'10',margem:'20',tributos:'0'}).value.replace(/[^0-9,]/g,'').replace(',','.')), 71.43, .01);
  assert.equal(calculate('margin', {venda:'100',custo:'60'}).value, 'R$ 40,00');
  assert.equal(calculate('roi', {retorno:'150',investimento:'100'}).value, '50%');
});

test('taxas de marketing e funil', () => {
  assert.equal(calculate('ratio', {total:'200',parte:'25'}).value, '12,5%');
  assert.equal(calculate('costPerLead', {investimento:'100',leads:'4'}).value, 'R$ 25,00');
  assert.equal(calculate('funnel', {visitantes:'1000',taxa1:'10',taxa2:'20'}).value, '20');
  assert.ok(calculate('compareTax', {base:'1000',taxa1:'5',taxa2:'8'}).steps[2].includes('R$ 30,00'));
});

test('operações tributárias didáticas e limites de descontos', () => {
  assert.equal(calculate('taxedPrice', {valor:'100',taxa:'10'}).value, 'R$ 110,00');
  assert.equal(calculate('net', {bruto:'100',deducoes:'15'}).value, 'R$ 85,00');
  assert.throws(() => calculate('net', {bruto:'100',deducoes:'101'}), /ultrapassar 100%/);
});

test('horas considera virada de dia e desconta intervalo', () => {
  assert.match(calculate('hours', {inicio:'22:00',fim:'06:30',intervalo:'30'}).value, /8 h 0 min/);
  assert.match(calculate('hours', {inicio:'09:00',fim:'17:00',intervalo:'60'}).value, /7 h 0 min/);
});

test('campos vazios, números inválidos e divisões por zero têm erros úteis', () => {
  assert.throws(() => calculate('percent', {base:'',taxa:'4'}), /Informe um valor válido/);
  assert.throws(() => calculate('percent', {base:'-1',taxa:'4'}), /não pode ser negativo/);
  assert.throws(() => calculate('roi', {retorno:'10',investimento:'0'}), /maior que zero/);
  assert.throws(() => calculate('variation', {inicial:'0',final:'10'}), /diferente de zero/);
  assert.throws(() => calculate('ruleThree', {a:'0',b:'10',c:'2'}), /diferente de zero/);
  assert.throws(() => calculate('ratio', {total:'0',parte:'1'}), /maior que zero/);
  assert.throws(() => calculate('costPerLead', {investimento:'10',leads:'0'}), /maior que zero/);
  assert.throws(() => calculate('installment', {avista:'100',parcelas:'2.5',parcela:'20'}), /número inteiro/);
  assert.throws(() => calculate('priceComposition', {custo:'10',despesas:'60',margem:'40',tributos:'1'}), /menor que 100%/);
  assert.throws(() => calculate('breakEven', {fixo:'10',preco:'5',variavel:'5'}), /maior que o custo variável/);
});
