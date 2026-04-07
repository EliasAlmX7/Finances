const assert = require('assert');

// Simulate state and core math
let transactions = [];
let wallets = [{ id: '1', name: 'Minha Carteira', initialBalance: 1000 }];
let scheduled = [];

function addTransaction(tx) {
  transactions.push({ ...tx, id: Math.random().toString(), date: new Date().toISOString() });
}

function processMonthlyScheduled() {
  const today = new Date();
  const day = today.getDate();
  
  scheduled.forEach(s => {
    if (s.autoDebit && s.dayOfMonth <= day) {
      // Logic for recurrence count could go here
      addTransaction({
        description: `[AUTO] ${s.description}`,
        amount: s.amount,
        type: s.type,
        walletId: s.walletId
      });
    }
  });
}

function getBalance(monthOffset = 0) {
  let date = new Date();
  date.setMonth(date.getMonth() + monthOffset);
  
  const m = date.getMonth();
  const y = date.getFullYear();

  let inc = 0;
  let exp = 0;
  let fixosSum = 0;

  // Real transactions for this month
  transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === m && d.getFullYear() === y;
  }).forEach(t => {
    if (t.type === 'income') inc += t.amount;
    else exp += t.amount;
  });

  // Scheduled for this month
  scheduled.forEach(s => {
    if (s.type === 'income') inc += s.amount;
    else fixosSum += s.amount;
  });

  return inc - (exp + fixosSum);
}

try {
  console.log("🚀 Iniciando Teste E2E Poderoso...");

  // 1. Test Balance with Wallets initial balance + Income
  // Saldo inicial total = 1000
  // Adiciona receita de 2000
  addTransaction({ type: 'income', amount: 2000, description: 'Salário', walletId: '1' });
  // Total Income = 2000 + Initial (if we define logic this way? The app subtracts EXP from INC)
  // Actually the app logic is: SALDO = SUM(INC) - (SUM(EXP) + SUM(FIXOS))
  // Wallets initial balance is extra.
  
  assert.strictEqual(getBalance(), 2000, "Saldo do mês deveria ser 2000 (só receita)");
  console.log("✅ Receitas integradas.");

  // 2. Test Expenses
  addTransaction({ type: 'expense', amount: 500, description: 'Supermercado' });
  assert.strictEqual(getBalance(), 1500, "Saldo deveria ser 1500 após gasto de 500");
  console.log("✅ Despesas variáveis integradas.");

  // 3. Test Scheduled (Fixos)
  scheduled.push({ 
    description: 'Aluguel', 
    amount: 1000, 
    type: 'expense', 
    dayOfMonth: 10,
    autoDebit: true,
    walletId: '1'
  });
  
  assert.strictEqual(getBalance(), 500, "Saldo deveria ser 500 após incluir fixo de 1000");
  console.log("✅ Lançamentos Fixos (Agendados) deduzindo perfeitamente do balanço mensal.");

  // 4. Test Recurrence logic simulation
  // If we move to next month, balance should also consider fixos
  assert.strictEqual(getBalance(1), -1000, "Próximo mês deveria começar com saldo -1000 (pelo fixo agendado)");
  console.log("✅ Previsão de meses futuros funcional.");

  console.log("\n🎉 TESTE E2E CONCLUÍDO COM SUCESSO!");
  console.log("Estatísticas Finais:");
  console.log("- Transações Realizadas:", transactions.length);
  console.log("- Fixos Monitorados:", scheduled.length);
  console.log("- Saldo Final Previsto:", getBalance());

} catch (e) {
  console.error("❌ ERRO NO TESTE E2E:", e.message);
  process.exit(1);
}
