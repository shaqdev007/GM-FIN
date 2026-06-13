import { useState, useTransition, KeyboardEvent } from 'react';
import { 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Download, 
  Layers, 
  Globe, 
  FileSpreadsheet, 
  Sparkles,
  DollarSign,
  Euro,
  Coins
} from 'lucide-react';
import { SpreadsheetRow, Language, CurrencySymbol } from '../types';

interface SpreadsheetSimulatorProps {
  rows: SpreadsheetRow[];
  selectedCellId: string | null;
  setSelectedCellId: (id: string | null) => void;
  formulaLanguage: Language;
  setFormulaLanguage: (lang: Language) => void;
  currencySymbol: CurrencySymbol;
  setCurrencySymbol: (symbol: CurrencySymbol) => void;
  onUpdateRowValue: (id: string, value: number) => void;
  onUpdateRowLabel: (id: string, label: string) => void;
  onAddRow: (section: 'incomes' | 'expenses') => void;
  onDeleteRow: (id: string) => void;
  onReset: () => void;
}

export default function SpreadsheetSimulator({
  rows,
  selectedCellId,
  setSelectedCellId,
  formulaLanguage,
  setFormulaLanguage,
  currencySymbol,
  setCurrencySymbol,
  onUpdateRowValue,
  onUpdateRowLabel,
  onAddRow,
  onDeleteRow,
  onReset
}: SpreadsheetSimulatorProps) {
  const [isAddingIncomesInUI, setIsAddingIncomesInUI] = useState(false);
  const [isAddingExpensesInUI, setIsAddingExpensesInUI] = useState(false);
  const [newRowName, setNewRowName] = useState('');
  const [newRowVal, setNewRowVal] = useState('100');
  const [, startTransition] = useTransition();

  // Find currently selected row
  const selectedRow = rows.find(r => r.id === selectedCellId);

  // Export to CSV helper
  const handleExportCSV = () => {
    // Generate simple csv payload
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // UTF-8 BOM
    csvContent += 'Descritivo / Categoria,Valor (R$)\n';
    
    rows.forEach(row => {
      if (row.rowType === 'header') {
        csvContent += `"${row.label.replace(/"/g, '""')}",\n`;
      } else if (row.rowType === 'blank') {
        csvContent += ',\n';
      } else if (row.rowType === 'value') {
        csvContent += `"${row.label.replace(/"/g, '""')}",${row.value || 0}\n`;
      } else if (row.rowType === 'formula') {
        // In CSV we write the formula so Excel can parse it!
        const formula = formulaLanguage === 'pt' ? row.formulaPt : row.formulaEn;
        csvContent += `"${row.label.replace(/"/g, '""')}","${formula}"\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'planilha_financeira_simples.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check if a row should have dependency highlighting
  const getCellHighlightClass = (row: SpreadsheetRow) => {
    if (!selectedCellId) return '';

    // Total income dependency (highlight all income values)
    if (selectedCellId === 'TOTAL_ENTRADAS') {
      const selfIndex = rows.findIndex(r => r.id === 'TOTAL_ENTRADAS');
      const rowIndex = rows.findIndex(r => r.id === row.id);
      if (rowIndex > 0 && rowIndex < selfIndex && row.rowType === 'value') {
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/50 transition-colors duration-200';
      }
    }

    // Total expense dependency (highlight all expense values)
    if (selectedCellId === 'TOTAL_SAIDAS') {
      const selfIndex = rows.findIndex(r => r.id === 'TOTAL_SAIDAS');
      const startOfExpensesIndex = rows.findIndex(r => r.id === 'HEADER_SAIDAS');
      const rowIndex = rows.findIndex(r => r.id === row.id);
      if (rowIndex > startOfExpensesIndex && rowIndex < selfIndex && row.rowType === 'value') {
        return 'bg-rose-50 text-rose-800 border-rose-200/50 transition-colors duration-200';
      }
    }

    // Balance dependency (highlight Total income B5 and Total Expense B14)
    if (selectedCellId === 'SALDO_FINAL') {
      if (row.id === 'TOTAL_ENTRADAS') {
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold transition-all';
      }
      if (row.id === 'TOTAL_SAIDAS') {
        return 'bg-rose-100 text-rose-900 border-rose-300 font-bold transition-all';
      }
    }

    return '';
  };

  const getFormulaDisplay = (row: SpreadsheetRow) => {
    if (row.rowType !== 'formula') return '';
    return formulaLanguage === 'pt' ? row.formulaPt : row.formulaEn;
  };

  const handleAddSubmit = (section: 'incomes' | 'expenses') => {
    if (!newRowName.trim()) return;
    const valueNum = parseFloat(newRowVal) || 0;
    
    // Trigger callback
    const customEvent = new CustomEvent('add_custom_row', {
      detail: { section, label: newRowName.trim(), value: valueNum }
    });
    window.dispatchEvent(customEvent);

    setNewRowName('');
    setNewRowVal('100');
    setIsAddingIncomesInUI(false);
    setIsAddingExpensesInUI(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col h-full" id="spreadsheet-simulator">
      
      {/* Simulation File Header */}
      <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" id="spreadsheet-icon" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-slate-800 text-base">planilha_mensal.xlsx</h2>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm flex items-center gap-1 font-mono">
                <Sparkles className="w-2.5 h-2.5" /> SIMULADOR ATIVO
              </span>
            </div>
            <p className="text-xs text-slate-500">Altere os dados para ver o cálculo automático em tempo real.</p>
          </div>
        </div>

        {/* Global Configuration Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 flex-wrap">
          {/* Formula Lang Toggle */}
          <button
            onClick={() => setFormulaLanguage(formulaLanguage === 'pt' ? 'en' : 'pt')}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-slate-600 font-medium cursor-pointer"
            id="formula-lang-quick"
            title="Mudar idioma do Excel"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xs:inline">Fórmulas:</span>
            <span className="text-blue-600 font-bold font-mono text-[10px] uppercase">
              {formulaLanguage === 'pt' ? 'BR (SOMA)' : 'EN (SUM)'}
            </span>
          </button>

          {/* Currency Toggle */}
          <div className="flex bg-slate-50 rounded-xl border border-slate-200 p-0.5 h-[34px] items-center" id="currency-switcher">
            <button
              onClick={() => startTransition(() => setCurrencySymbol('R$'))}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                currencySymbol === 'R$' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Real brasileiro"
            >
              R$
            </button>
            <button
              onClick={() => startTransition(() => setCurrencySymbol('$'))}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                currencySymbol === '$' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Dólar americano"
            >
              $
            </button>
            <button
              onClick={() => startTransition(() => setCurrencySymbol('€'))}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                currencySymbol === '€' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Euro"
            >
              €
            </button>
          </div>
        </div>
      </div>

      {/* Formula Bar (fx) */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-150 flex items-center gap-3 font-mono text-xs text-slate-600">
        <span className="font-bold text-slate-400 select-none text-[13px] italic bg-slate-200/50 px-2 py-0.5 rounded-sm">fx</span>
        <div className="h-4 w-[1px] bg-slate-300"></div>
        <span className="text-slate-400 font-semibold text-[11px] select-none shrink-0 w-8">
          {selectedRow?.cellRef || 'B5'}
        </span>
        <div className="h-4 w-[1px] bg-slate-300 mr-1 shrink-0"></div>
        <div className="flex-1 bg-white px-3 py-1 rounded-sm border border-slate-200 text-slate-800 font-medium min-h-[26px] flex items-center truncate">
          {selectedRow ? (
            selectedRow.rowType === 'formula' ? (
              <span className="text-blue-600 font-bold">{getFormulaDisplay(selectedRow)}</span>
            ) : selectedRow.rowType === 'value' ? (
              <span className="text-slate-700">{selectedRow.value}</span>
            ) : (
              <span className="text-slate-300 italic italic-text">Célula estática</span>
            )
          ) : (
            <span className="text-slate-300 italic italic-text">Nenhuma célula selecionada</span>
          )}
        </div>
      </div>

      {/* Spreadsheet Grid container */}
      <div className="overflow-x-auto flex-1 h-full scrollbar-thin max-h-[460px]">
        <table className="w-full border-collapse border-b border-slate-200 table-fixed select-none text-left" id="grid-spreadsheet-table">
          <thead>
            <tr className="bg-slate-100/80 text-[11px] font-mono font-bold text-slate-500 select-none border-b border-slate-200">
              <th className="w-[50px] border-r border-slate-200 text-center py-2 shrink-0 bg-slate-100"></th>
              <th className="border-r border-slate-200 pl-4 py-2 text-left font-semibold">Coluna A: Descrição / Categoria</th>
              <th className="w-[140px] pl-4 py-2 text-left font-semibold">Coluna B: Valor ({currencySymbol})</th>
              <th className="w-[55px] text-center py-2 bg-slate-100">Excluir</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isSelected = selectedCellId === row.id;
              const highlightClass = getCellHighlightClass(row);
              
              if (row.rowType === 'blank') {
                return (
                  <tr key={row.id} className="h-7 border-b border-slate-150 group" id={`row-${row.rowNumber}`}>
                    <td className="bg-slate-50/50 border-r border-slate-200 text-[10px] font-mono text-center font-semibold text-slate-300 py-1 select-none">
                      {row.rowNumber}
                    </td>
                    <td className="bg-slate-50/10 cursor-pointer" colSpan={3} onClick={() => setSelectedCellId(row.id)}></td>
                  </tr>
                );
              }

              if (row.rowType === 'header') {
                const isUnderSaidas = row.id === 'HEADER_SAIDAS';
                return (
                  <tr 
                    key={row.id}
                    id={`row-${row.rowNumber}`}
                    className={`border-b border-slate-200 ${
                      isUnderSaidas 
                        ? 'bg-rose-50/40 text-rose-800' 
                        : 'bg-emerald-50/40 text-emerald-800'
                    } group font-bold font-display text-xs`}
                  >
                    <td className="bg-slate-100/60 border-r border-slate-200 text-[10px] font-mono text-center text-slate-400 py-2.5 shrink-0">
                      {row.rowNumber}
                    </td>
                    <td colSpan={2} className="px-4 py-2 select-none">
                      {row.label}
                    </td>
                    <td className="text-center py-2.5">
                      <button 
                        onClick={() => {
                          if (isUnderSaidas) {
                            setIsAddingExpensesInUI(!isAddingExpensesInUI);
                            setIsAddingIncomesInUI(false);
                          } else {
                            setIsAddingIncomesInUI(!isAddingIncomesInUI);
                            setIsAddingExpensesInUI(false);
                          }
                        }}
                        className={`p-1 rounded-md text-[10px] ${
                          isUnderSaidas 
                            ? 'bg-rose-100 hover:bg-rose-200 text-rose-800' 
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                        } font-semibold inline-flex items-center gap-0.5 cursor-pointer`}
                        title="Adicionar item nesta seção"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr 
                  key={row.id}
                  id={`row-${row.rowNumber}`}
                  onClick={() => setSelectedCellId(row.id)}
                  className={`border-b border-slate-150 transition-all text-xs group cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50/60 ring-2 ring-blue-500/30 font-medium' 
                      : 'hover:bg-slate-50/40'
                  } ${highlightClass}`}
                >
                  {/* Row Index */}
                  <td className="bg-slate-100/30 border-r border-slate-200 text-[10px] font-mono text-slate-400 text-center font-semibold py-2">
                    {row.rowNumber}
                  </td>

                  {/* Cell A (Label) */}
                  <td className="border-r border-slate-150 px-4 py-2 relative group-hover:bg-slate-50/10">
                    <div className="flex items-center justify-between">
                      {row.rowType === 'formula' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className="font-semibold text-slate-800">{row.label}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) => onUpdateRowLabel(row.id, e.target.value)}
                          className="w-full bg-slate-50/25 hover:bg-slate-100 focus:bg-white border-2 border-transparent hover:border-slate-205 focus:border-[#00c853] focus:ring-2 focus:ring-emerald-500/5 rounded-xl px-2 py-1 text-slate-700 focus:outline-hidden font-semibold transition-all text-xs"
                          placeholder="Nome da categoria"
                        />
                      )}
                      
                      {row.rowType === 'formula' && (
                        <span className="hidden group-hover:inline-block text-[9px] font-semibold bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-mono select-none">
                          FÓRMULA
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cell B (Value or Formula Output) */}
                  <td className="px-4 py-1.5 relative text-right">
                    <div className="flex items-center justify-end h-full">
                      {row.rowType === 'formula' ? (
                        <div className="font-mono font-bold select-all bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                          <span className="text-[10px] text-blue-400 font-bold select-none">{currencySymbol}</span>
                          <span>{row.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-end w-full">
                          <span className="text-slate-450 font-mono text-xs select-none">{currencySymbol}</span>
                          <input
                            type="number"
                            value={row.value === undefined ? '' : row.value}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              onUpdateRowValue(row.id, isNaN(val) ? 0 : val);
                            }}
                            className="w-28 bg-slate-50 hover:bg-slate-100 focus:bg-white border-2 border-slate-100 hover:border-slate-300 focus:border-[#00c853] focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-2 py-1.5 text-right font-mono font-bold text-slate-800 transition-all focus:outline-hidden text-xs shadow-xs"
                            step="any"
                            placeholder="0,00"
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions Column (Delete button for values only) */}
                  <td className="text-center py-1.5 border-l border-slate-100">
                    {row.rowType === 'value' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRow(row.id);
                        }}
                        id={`delete-btn-${row.id}`}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all cursor-pointer inline-block"
                        title="Remover linha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Row add overlays nested inside spreadsheet area dynamically */}
      {(isAddingIncomesInUI || isAddingExpensesInUI) && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 animate-slide-up flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            Adicionar novo gasto ou receita na seção {isAddingIncomesInUI ? '🟢 ENTRADAS' : '🔴 SAÍDAS'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <input 
              type="text" 
              placeholder="Ex: Freelance, Uber, Academia"
              value={newRowName}
              onChange={(e) => setNewRowName(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
            <input 
              type="number" 
              placeholder="Valor inicial"
              value={newRowVal}
              onChange={(e) => setNewRowVal(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
            <div className="flex gap-2 justify-end sm:col-span-2 md:col-span-1">
              <button 
                onClick={() => {
                  setIsAddingIncomesInUI(false);
                  setIsAddingExpensesInUI(false);
                }}
                className="px-3 py-1.5 bg-transparent border border-slate-200 rounded-xl text-xs hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleAddSubmit(isAddingIncomesInUI ? 'incomes' : 'expenses')}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Inserir Linha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Cell explanation banner */}
      <div className="p-5 border-t border-slate-100 bg-linear-to-r from-slate-50/50 to-white">
        {selectedRow ? (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Explicador de Células: {selectedRow.cellRef || 'Célula Geral'}
              </span>
            </div>
            {selectedRow.rowType === 'formula' ? (
              <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 border border-blue-100 p-3.5 rounded-2xl">
                <p className="font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
                  ✨ FÓRMULA ATIVA: <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-blue-200/50">{getFormulaDisplay(selectedRow)}</code>
                </p>
                {selectedRow.id === 'TOTAL_ENTRADAS' && (
                  <span>Esta célula soma dinamicamente todas as suas receitas acima dela. No seu Excel real, clique na célula <strong>{selectedRow.cellRef}</strong> e cole exatamente o texto acima. Se você inserir novas linhas de receita, altere o intervalo para incluir a nova célula.</span>
                )}
                {selectedRow.id === 'TOTAL_SAIDAS' && (
                  <span>Esta célula soma dinamicamente todos as suas despesas na coluna B. Ao colar <strong>{getFormulaDisplay(selectedRow)}</strong> no seu computador, o aplicativo atualizará o valor total gasto de forma imediata quando qualquer item mudar.</span>
                )}
                {selectedRow.id === 'SALDO_FINAL' && (
                  <span>O coração da sua planilha! Ele pega o Total de Entradas de cima e subtrai o Total de Saídas de baixo. No Excel, cole exatamente <strong>{getFormulaDisplay(selectedRow)}</strong> na célula correspondente para saber se sobrou dinheiro ou se ficou no vermelho.</span>
                )}
              </div>
            ) : selectedRow.rowType === 'value' ? (
              <div className="text-xs text-slate-600 leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                <span className="font-semibold text-slate-800">Célula de entrada manual:</span> Este é o valor da sua categoria de <strong>{selectedRow.label}</strong>. Na sua planilha no computador, basta digitar o número diretamente sem acrescentar o R$ na hora de escrever (digite apenas o número e formate o estilo da coluna como 'Moeda' ou 'Financeiro' para obter o visual adequado!).
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Ajuste rápido no simulador:</span>
                  <button 
                    onClick={() => onUpdateRowValue(selectedRow.id, (selectedRow.value || 0) + 50)}
                    className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] hover:bg-slate-50 cursor-pointer font-bold text-slate-600"
                  >
                    +50
                  </button>
                  <button 
                    onClick={() => onUpdateRowValue(selectedRow.id, Math.max(0, (selectedRow.value || 0) - 50))}
                    className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] hover:bg-slate-50 cursor-pointer font-bold text-slate-600"
                  >
                    -50
                  </button>
                  <button 
                    onClick={() => onUpdateRowValue(selectedRow.id, (selectedRow.value || 0) + 10)}
                    className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] hover:bg-slate-50 cursor-pointer font-bold text-slate-600"
                  >
                    +10
                  </button>
                  <button 
                    onClick={() => onUpdateRowValue(selectedRow.id, Math.max(0, (selectedRow.value || 0) - 10))}
                    className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] hover:bg-slate-50 cursor-pointer font-bold text-slate-600"
                  >
                    -10
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">Esta célula serve como divisão visual ou cabeçalho informativo. Não necessita de fórmula ou valor operacional.</div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex gap-2 items-center leading-relaxed">
            <span>💡 <strong>Dica visual do Guia:</strong> Clique em qualquer valor no grid da planilha acima (Coluna B) para ver a fórmula matemática correspondente, entender o que ela faz ou simular novos cenários financeiros instantaneamente!</span>
          </div>
        )}
      </div>

      {/* Reset & Export Actions Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center gap-3">
        <button
          onClick={onReset}
          className="text-xs font-semibold px-3 py-1.5 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
          id="spreadsheet-reset-btn"
          title="Restaurar valores padrão"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar Padrão
        </button>

        <button
          onClick={handleExportCSV}
          className="text-xs font-semibold px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
          id="spreadsheet-export-btn"
          title="Exportar dados como CSV"
        >
          <Download className="w-3.5 h-3.5" />
          Baixar Planilha .CSV
        </button>
      </div>

    </div>
  );
}
