import { useState, useTransition } from 'react';
import { BookOpen, Copy, Check, Table, Tag, HelpCircle, Lightbulb } from 'lucide-react';
import { Language, CurrencySymbol } from '../types';

interface TutorialGuideProps {
  formulaLanguage: Language;
  setFormulaLanguage: (lang: Language) => void;
  currencySymbol: CurrencySymbol;
  totalIncomesRef: string;
  totalExpensesRef: string;
  saldoFinalRef: string;
  totalIncomesFormula: string;
  totalExpensesFormula: string;
  saldoFinalFormula: string;
}

export default function TutorialGuide({
  formulaLanguage,
  setFormulaLanguage,
  currencySymbol,
  totalIncomesRef,
  totalExpensesRef,
  saldoFinalRef,
  totalIncomesFormula,
  totalExpensesFormula,
  saldoFinalFormula
}: TutorialGuideProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleCopy = (text: string, identifier: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(identifier);
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedText(identifier);
        setTimeout(() => setCopiedText(null), 2000);
      } catch (err) {
        console.error("Cópia falhou", err);
      }
      document.body.removeChild(textArea);
    }
  };

  const steps = [
    { id: 1, title: "1. Estrutura Básica", icon: Table },
    { id: 2, title: "2. Categorias Úteis", icon: Tag },
    { id: 3, title: "3. Fórmulas Inteligentes", icon: HelpCircle },
    { id: 4, title: "4. Dicas de Especialista", icon: Lightbulb },
  ];

  return (
    <div id="tutorial-guide" className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-5 h-5" id="book-icon" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-800">Guia de Aprendizado</h2>
            <p className="text-xs text-slate-500">Crie sua planilha do zero, passo a passo.</p>
          </div>
        </div>
      </div>

      {/* Nav steps */}
      <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex gap-2 overflow-x-auto min-h-[56px] items-center">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              id={`step-tab-${step.id}`}
              onClick={() => startTransition(() => setActiveStep(step.id))}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 border border-slate-200/60 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {step.title}
            </button>
          );
        })}
      </div>

      {/* Steps Content */}
      <div className="p-6 flex-1 overflow-y-auto max-h-[500px] md:max-h-none scrollbar-thin">
        {activeStep === 1 && (
          <div className="space-y-5 animate-fade-in" id="step-1-content">
            <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
              Como estruturar as colunas?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Abra uma planilha em branco no <strong>Google Planilhas</strong> ou <strong>Excel</strong>. 
              Para manter as coisas limpas, direto ao ponto e fáceis de visualizar, usaremos apenas <strong>duas colunas essenciais</strong>:
            </p>
            
            <div className="bg-slate-55 p-4 rounded-2xl border border-slate-200 space-y-3 bg-slate-50">
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 border-b border-slate-200 pb-2">
                <div>COLUNA A (Linha 1)</div>
                <div>COLUNA B (Linha 1)</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
                <div className="font-medium bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                  ⌨️ Descrição / Categoria
                </div>
                <div className="font-medium bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                  💰 Valor (R$)
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <span className="font-bold text-amber-800 flex items-center gap-1.5 mb-1 text-sm">
                📌 Regra de Ouro do Especialista:
              </span>
              Não tente criar uma coluna diferente para cada tipo de gasto. Use <strong>linhas para designar cada item</strong> e a <strong>Coluna B apenas para valores numéricos</strong>. Isso permite que o Excel calcule tudo sem erros e sem planilhas confusas com dezenas de colunas vazias.
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-5 animate-fade-in" id="step-2-content">
            <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
              Categorias Essenciais Explicadas
            </h3>
            <p className="text-sm text-slate-600">
              Para quem está começando, o segredo é <strong>menos é mais</strong>. Se você tiver dezenas de categorias, logo desanimará de preencher sua planilha. Use estas categorias essenciais agrupadas:
            </p>

            <div className="space-y-4">
              <div className="border border-emerald-100 bg-emerald-50/20 p-4 rounded-xl">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-2">🟢 ENTRADAS (Tudo que soma)</span>
                <ul className="text-xs space-y-2 text-slate-600">
                  <li><strong className="text-slate-800">Salário Principal:</strong> Seus rendimentos fixos mensais líquidos da sua ocupação principal.</li>
                  <li><strong className="text-slate-800">Renda Extra:</strong> Trabalhos autônomos, freelancers, vendas informais ou mimos.</li>
                  <li><strong className="text-slate-800">Rendimentos:</strong> Juros de investimentos ou cashback de contas digitais.</li>
                </ul>
              </div>

              <div className="border border-red-100 bg-red-50/20 p-4 rounded-xl">
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider block mb-2">🔴 SAÍDAS (Tudo que subtrai)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="space-y-1">
                    <strong className="text-slate-800 block">🏠 Saídas Fixas / Essenciais:</strong>
                    Moradia (Aluguel, Luz, Internet), Alimentação (Mercado essencial) e Saúde. São despesas indispensáveis para viver.
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-800 block">🥳 Estilo de Vida / Lazer:</strong>
                    Cinema, restaurantes, assinaturas (Netflix, Spotify) e compras pessoais. São despesas flexíveis de lazer.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-5 animate-fade-in" id="step-3-content">
            <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
              Fórmulas Mágicas Automáticas
            </h3>
            <p className="text-sm text-slate-600">
              Essas são as únicas fórmulas que você precisa digitar na sua planilha do computador para que ela se torne totalmente automatizada:
            </p>

            {/* Formula Controls */}
            <div className="flex items-center justify-between bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Idioma do seu Excel / Planilhas:</span>
              <div className="flex bg-white rounded-lg border border-slate-200 p-0.5" id="language-switcher">
                <button
                  id="lang-pt-btn"
                  onClick={() => setFormulaLanguage('pt')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                    formulaLanguage === 'pt' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  🇧🇷 Português
                </button>
                <button
                  id="lang-en-btn"
                  onClick={() => setFormulaLanguage('en')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                    formulaLanguage === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  🇺🇸 Inglês
                </button>
              </div>
            </div>

            {/* Formula Cards */}
            <div className="space-y-4">
              {/* Formula Incomes */}
              <div className="border border-slate-100 rounded-2xl bg-white p-4 space-y-3 shadow-xs hover:border-slate-200 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Total de Entradas</span>
                    <h4 className="text-sm font-semibold text-slate-800 mt-1">Copa e cole na célula <strong className="font-mono bg-slate-100 px-1 rounded-sm">{totalIncomesRef}</strong>:</h4>
                  </div>
                  <button
                    onClick={() => handleCopy(totalIncomesFormula, 'incomes')}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all relative group"
                    title="Copiar fórmula"
                    id="copy-income-formula"
                  >
                    {copiedText === 'incomes' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-100 px-3 py-2 rounded-xl font-mono text-sm flex justify-between items-center overflow-x-auto">
                  <span>{totalIncomesFormula}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Essa fórmula pega todos os valores de receita contidos na coluna B (Ganhos) de cima até em baixo e soma automaticamente.
                </p>
              </div>

              {/* Formula Expenses */}
              <div className="border border-slate-100 rounded-2xl bg-white p-4 space-y-3 shadow-xs hover:border-slate-200 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">Total de Saídas</span>
                    <h4 className="text-sm font-semibold text-slate-800 mt-1">Copa e cole na célula <strong className="font-mono bg-slate-100 px-1 rounded-sm">{totalExpensesRef}</strong>:</h4>
                  </div>
                  <button
                    onClick={() => handleCopy(totalExpensesFormula, 'expenses')}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all relative group"
                    title="Copiar fórmula"
                    id="copy-expense-formula"
                  >
                    {copiedText === 'expenses' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-100 px-3 py-2 rounded-xl font-mono text-sm flex justify-between items-center overflow-x-auto">
                  <span>{totalExpensesFormula}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Calcula de forma automática a soma de todos os gastos da coluna B que você tiver listado abaixo do título de saídas.
                </p>
              </div>

              {/* Formula Net Balance */}
              <div className="border border-slate-100 rounded-2xl bg-white p-4 space-y-3 shadow-xs hover:border-slate-200 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Saldo Final</span>
                    <h4 className="text-sm font-semibold text-slate-800 mt-1">Copa e cole na célula <strong className="font-mono bg-slate-100 px-1 rounded-sm">{saldoFinalRef}</strong>:</h4>
                  </div>
                  <button
                    onClick={() => handleCopy(saldoFinalFormula, 'balance')}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all relative group"
                    title="Copiar fórmula"
                    id="copy-balance-formula"
                  >
                    {copiedText === 'balance' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-100 px-3 py-2 rounded-xl font-mono text-sm flex justify-between items-center overflow-x-auto">
                  <span>{saldoFinalFormula}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Indica a sobra líquida de capital. Ele subtrai o total de despesas ({totalExpensesRef}) diretamente do total de ganhos ({totalIncomesRef}).
                </p>
              </div>
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div className="space-y-5 animate-fade-in" id="step-4-content">
            <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">4</span>
              Dicas Práticas do Especialista Financeiro
            </h3>
            <p className="text-sm text-slate-600">
              Com as fórmulas rodando e sua estrutura pronta, aplique estas duas grandes regras para colocar ordem na sua vida financeira hoje mesmo:
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl flex gap-3.5 items-start">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-xl font-semibold text-sm shrink-0">
                  50-30-20
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <h4 className="font-semibold text-slate-800 text-sm">A Filosofia do Orçamento Equilibrado</h4>
                  <p className="leading-relaxed">
                    Sua meta básica de organização deve idealmente focar em:
                  </p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li><strong>50%</strong> de tudo que entra para contas essenciais de sobrevivência (Moradia, Alimentação Básica).</li>
                    <li><strong>30%</strong> para diversão, saídas e desejos de estilo de vida individuais.</li>
                    <li><strong>20%</strong> diretamente para investimentos e formação de reserva de segurança emergencial.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl flex gap-3.5 items-start">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl font-semibold text-sm shrink-0">
                  📅
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <h4 className="font-semibold text-slate-800 text-sm">O Dia da Planilha: Compromisso Semanal</h4>
                  <p className="leading-relaxed">
                    Não tente atualizar sua planilha todo dia útil, isso gera fadiga rapidamente. Escolha um dia fixo na semana (um sábado ou domingo de manhã por exemplo), gaste apenas 10 minutinhos abrindo o aplicativo do seu banco, liste todos os gastos acumulados da semana e feche a planilha.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation bar inside container */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <button
          onClick={() => activeStep > 1 && startTransition(() => setActiveStep(activeStep - 1))}
          disabled={activeStep === 1}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border select-none transition-all ${
            activeStep === 1
              ? 'border-slate-150 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
          }`}
          id="prev-step-btn"
        >
          Voltar
        </button>
        <span className="text-xs font-semibold text-slate-500 font-mono">
          {activeStep} / 4
        </span>
        <button
          onClick={() => activeStep < 4 && startTransition(() => setActiveStep(activeStep + 1))}
          disabled={activeStep === 4}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-all ${
            activeStep === 4
              ? 'border-slate-150 text-slate-300 bg-slate-50 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
          }`}
          id="next-step-btn"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
