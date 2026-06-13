import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';
import { CurrencySymbol } from '../types';

interface FinanceTipsProps {
  totalIncomes: number;
  totalExpenses: number;
  remainingBalance: number;
  currencySymbol: CurrencySymbol;
}

export default function FinanceTips({
  totalIncomes,
  totalExpenses,
  remainingBalance,
  currencySymbol
}: FinanceTipsProps) {
  const expensePercentage = totalIncomes > 0 ? (totalExpenses / totalIncomes) * 100 : 0;
  const savingsRate = totalIncomes > 0 ? (remainingBalance / totalIncomes) * 100 : 0;

  let adviceTitle = "Pronto para Começar!";
  let adviceText = "Insira suas primeiras receitas e despesas no simulador ao lado para receber conselhos imediatos do especialista.";
  let adviceColorClass = "bg-slate-50 border-slate-200 text-slate-700";
  let AdviceIcon = Lightbulb;

  if (totalIncomes > 0) {
    if (remainingBalance < 0) {
      adviceTitle = "⚠️ Cuidado! Saldo Negativo";
      adviceText = `Suas despesas ultrapassam seus ganhos em R$ ${Math.abs(remainingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}. É hora de fazer uma varredura nas Saídas, principalmente em lazer e assinaturas não utilizadas, para reequilibrar o caixa.`;
      adviceColorClass = "bg-rose-50 border-rose-100 text-rose-800";
      AdviceIcon = AlertTriangle;
    } else if (savingsRate >= 20) {
      adviceTitle = "🏆 Excelente Saúde Financeira!";
      adviceText = `Parabéns! Você está poupando ${savingsRate.toFixed(1)}% do seu orçamento. Essa taxa de poupança é ideal para acelerar sua independência financeira e formar uma robusta reserva de emergência.`;
      adviceColorClass = "bg-emerald-50 border-emerald-100 text-emerald-850";
      AdviceIcon = CheckCircle2;
    } else if (savingsRate > 0 && savingsRate < 20) {
      adviceTitle = "📈 No Caminho Certo!";
      adviceText = `Você está poupando ${savingsRate.toFixed(1)}% dos seus ganhos (são ${currencySymbol} ${remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}). Experimente revisar pequenas despesas desnecessárias para atingir a meta recomendada de 20% de economia mensal!`;
      adviceColorClass = "bg-blue-50 border-blue-100 text-blue-800";
      AdviceIcon = TrendingUp;
    } else {
      adviceTitle = "⚖️ Orçamento no Limite";
      adviceText = "Seu saldo final está exatamente zerado. Lembre-se que qualquer imprevisto médico ou residencial pode te empurrar para o endividamento. Recomenda-se cortar pequenas despesas ou buscar renda complementar.";
      adviceColorClass = "bg-amber-50 border-amber-100 text-amber-800";
      AdviceIcon = TrendingDown;
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 space-y-6" id="finance-tips-panel">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
          <Lightbulb className="w-5 h-5" id="tips-panel-btn" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">Diagnóstico do Especialista</h3>
          <p className="text-xs text-slate-500">Métricas baseadas na sua simulação atual.</p>
        </div>
      </div>

      {/* Main stats layout */}
      <div className="grid grid-cols-3 gap-3">
        {/* Income Card */}
        <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100/40 text-center space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Entra (Receitas)</span>
          <p className="font-display font-bold text-slate-800 text-xs sm:text-sm lg:text-base truncate">
            {currencySymbol} {totalIncomes.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-rose-50/40 p-3.5 rounded-2xl border border-rose-100/40 text-center space-y-1">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Sai (Despesas)</span>
          <p className="font-display font-bold text-slate-800 text-xs sm:text-sm lg:text-base truncate">
            {currencySymbol} {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Remaining Card */}
        <div className={`${remainingBalance >= 0 ? 'bg-blue-50/40 border-blue-100/40' : 'bg-red-50/50 border-red-200'} p-3.5 rounded-2xl border text-center space-y-1`}>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Sobra (Saldo)</span>
          <p className={`font-display font-bold text-xs sm:text-sm lg:text-base truncate ${remainingBalance >= 0 ? 'text-blue-800' : 'text-red-650 font-bold'}`}>
            {currencySymbol} {remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Efficiency Bar Meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Comprometimento da Renda:</span>
          <span className={`font-bold ${expensePercentage > 100 ? 'text-rose-600' : expensePercentage > 80 ? 'text-amber-600' : 'text-slate-600'}`}>
            {expensePercentage.toFixed(0)}% Utilizado
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              expensePercentage > 100 
                ? 'bg-red-500' 
                : expensePercentage > 80 
                  ? 'bg-amber-500' 
                  : expensePercentage > 50 
                    ? 'bg-blue-500' 
                    : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, expensePercentage)}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400">
          <span>0% (Livre de Gastos)</span>
          <span>50% (Meta Essencial)</span>
          <span>100% (Estourado)</span>
        </div>
      </div>

      {/* Tailored Advice Section */}
      <div className={`p-4 border rounded-2xl ${adviceColorClass} flex gap-3 transition-colors duration-300`}>
        <AdviceIcon className="w-5 h-5 mt-0.5 shrink-0" />
        <div className="text-xs space-y-1 leading-relaxed">
          <h4 className="font-bold">{adviceTitle}</h4>
          <p>{adviceText}</p>
        </div>
      </div>
    </div>
  );
}
