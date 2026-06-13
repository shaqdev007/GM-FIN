import { useState, useMemo, useEffect, startTransition, FormEvent } from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  TrendingUp, 
  Lightbulb, 
  ArrowUpRight, 
  HelpCircle,
  PiggyBank,
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  Wallet, 
  Layers, 
  FileText, 
  Calendar,
  AlertCircle,
  Smartphone,
  Copy,
  Check,
  CheckCircle,
  Sliders,
  DollarSign,
  Lock,
  Mail,
  LogIn,
  LogOut,
  UserPlus,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SpreadsheetRow, Language, CurrencySymbol } from './types';
import SpreadsheetSimulator from './components/SpreadsheetSimulator';
import FinanceTips from './components/FinanceTips';

const initialRows: SpreadsheetRow[] = [
  { id: 'HEADER_ENTRADAS', rowNumber: 1, label: '🟢 ENTRADAS (RECEITAS)', rowType: 'header' },
  { id: 'income_salary', rowNumber: 2, label: 'Salário Principal', value: 3100, rowType: 'value', category: 'Salário' },
  { id: 'income_extra', rowNumber: 3, label: 'Renda Extra / Freelance', value: 750, rowType: 'value', category: 'Renda Extra' },
  { id: 'income_others', rowNumber: 4, label: 'Rendimentos de Investimento', value: 80, rowType: 'value', category: 'Rendimentos' },
  { id: 'TOTAL_ENTRADAS', rowNumber: 5, label: 'TOTAL DE ENTRADAS', rowType: 'formula' },
  { id: 'BLANK_1', rowNumber: 6, label: '', rowType: 'blank' },
  { id: 'HEADER_SAIDAS', rowNumber: 7, label: '🔴 SAÍDAS (DESPESAS)', rowType: 'header' },
  { id: 'expense_rent', rowNumber: 8, label: 'Moradia / Aluguel', value: 1200, rowType: 'value', category: 'Moradia' },
  { id: 'expense_food', rowNumber: 9, label: 'Supermercado (Alimentação)', value: 650, rowType: 'value', category: 'Alimentação' },
  { id: 'expense_transport', rowNumber: 10, label: 'Combustível, Rodoviária, Uber', value: 240, rowType: 'value', category: 'Transporte' },
  { id: 'expense_leisure', rowNumber: 11, label: 'Cinema, Restaurantes, Lazer', value: 350, rowType: 'value', category: 'Lazer' },
  { id: 'expense_health', rowNumber: 12, label: 'Plano de Saúde e Farmácia', value: 180, rowType: 'value', category: 'Saúde' },
  { id: 'expense_others', rowNumber: 13, label: 'Outros (Assinaturas, Tarifas)', value: 120, rowType: 'value', category: 'Outros' },
  { id: 'TOTAL_SAIDAS', rowNumber: 14, label: 'TOTAL DE SAÍDAS', rowType: 'formula' },
  { id: 'BLANK_2', rowNumber: 15, label: '', rowType: 'blank' },
  { id: 'HEADER_RESUMO', rowNumber: 16, label: '🔵 RESUMO FINANCEIRO', rowType: 'header' },
  { id: 'SALDO_FINAL', rowNumber: 17, label: 'SALDO FINAL (O que sobrou)', rowType: 'formula' }
];

interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  logoChar: string;
  textColor: string;
  logoBg: string;
}

const initialBankAccounts: BankAccount[] = [
  { id: 'acc_nu', name: 'NuConta', type: 'Conta Corrente - Nubank', balance: 1212.92, color: '#8A05BE', logoChar: 'nu', textColor: 'text-white', logoBg: 'bg-[#8A05BE]' },
  { id: 'acc_bb', name: 'Banco do Brasil', type: 'Conta Principal Salário', balance: 2212.92, color: '#0038A8', logoChar: 'BB', textColor: 'text-blue-900', logoBg: 'bg-yellow-400' },
  { id: 'acc_next', name: 'Banco Next', type: 'Crédito e Reserva', balance: 1500.00, color: '#00FF5F', logoChar: 'Nxt', textColor: 'text-black', logoBg: 'bg-[#00FF5F]' },
  { id: 'acc_itau', name: 'Itaú Unibanco', type: 'Minha Poupança', balance: 1000.00, color: '#EC7000', logoChar: 'IT', textColor: 'text-white', logoBg: 'bg-[#EC7000]' }
];

export default function App() {
  // Load registered users list
  const [registeredUsers, setRegisteredUsers] = useState<{email: string; password: string; userName: string}[]>(() => {
    const saved = localStorage.getItem('org_registered_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { email: 'demo@admin.com', password: '123', userName: 'Bety' },
      { email: 'shaquilleonil2018@gmail.com', password: '123', userName: 'Bety' }
    ];
  });

  // Current logged in user email
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('org_current_user') || null;
  });

  // Selected month competence (e.g. '2026-06')
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return localStorage.getItem('org_selected_month') || '2026-06';
  });

  // Load rows dynamically from either initialRows (if not saved) or the currentUser's saved state for that month
  const [rows, setRows] = useState<SpreadsheetRow[]>(() => {
    const user = localStorage.getItem('org_current_user') || 'guest';
    const month = localStorage.getItem('org_selected_month') || '2026-06';
    const saved = localStorage.getItem(`org_rows_${user}_${month}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Fallback to legacy single storage to avoid losing pre-existing user data!
    const savedLegacy = localStorage.getItem(`org_rows_${user}`);
    if (savedLegacy) {
      try {
        return JSON.parse(savedLegacy);
      } catch (e) {}
    }
    return initialRows;
  });

  const [selectedCellId, setSelectedCellId] = useState<string | null>('SALDO_FINAL');
  const [formulaLanguage, setFormulaLanguage] = useState<Language>('pt');
  const [currencySymbol, setCurrencySymbol] = useState<CurrencySymbol>('R$');

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  const availableMonths = useMemo(() => {
    const list = [];
    const years = [2025, 2026, 2027];
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    for (const year of years) {
      for (let m = 1; m <= 12; m++) {
        const monthStr = String(m).padStart(2, '0');
        list.push({
          value: `${year}-${monthStr}`,
          label: `${monthNames[m - 1]} de ${year}`
        });
      }
    }
    return list;
  }, []);
  
  // Custom states matching the Organizze green layout
  const [hideBalances, setHideBalances] = useState<boolean>(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  
  const [userName, setUserName] = useState<string>(() => {
    const user = localStorage.getItem('org_current_user');
    if (user) {
      const savedUsers = localStorage.getItem('org_registered_users');
      let usersList = [
        { email: 'demo@admin.com', password: '123', userName: 'Bety' },
        { email: 'shaquilleonil2018@gmail.com', password: '123', userName: 'Bety' }
      ];
      if (savedUsers) {
        try { usersList = JSON.parse(savedUsers); } catch (e) {}
      }
      const match = usersList.find(u => u.email === user);
      if (match) return match.userName;
    }
    return 'Bety';
  });

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visao' | 'planilha'>('visao');

  // Input states for Login/Register Form
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [registerUserName, setRegisterUserName] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Load rows when currentUser or selectedMonth changes
  useEffect(() => {
    const user = currentUser || 'guest';
    const saved = localStorage.getItem(`org_rows_${user}_${selectedMonth}`);
    if (saved) {
      try {
        setRows(JSON.parse(saved));
      } catch (e) {
        setRows(initialRows);
      }
    } else {
      // Fallback to legacy structure if they are looking at '2026-06'
      const legacySaved = localStorage.getItem(`org_rows_${user}`);
      if (legacySaved && selectedMonth === '2026-06') {
        try {
          setRows(JSON.parse(legacySaved));
        } catch (e) {
          setRows(initialRows);
        }
      } else {
        setRows(initialRows);
      }
    }

    const matchObj = registeredUsers.find(u => u.email === currentUser);
    if (matchObj) {
      setUserName(matchObj.userName);
    } else {
      setUserName('Bety');
    }
  }, [currentUser, registeredUsers, selectedMonth]);

  // Save rows per user account and selected month whenever they change
  useEffect(() => {
    const user = currentUser || 'guest';
    localStorage.setItem(`org_rows_${user}_${selectedMonth}`, JSON.stringify(rows));
    // Also save as legacy for compatibility
    localStorage.setItem(`org_rows_${user}`, JSON.stringify(rows));
  }, [rows, currentUser, selectedMonth]);

  // Persist selected month
  useEffect(() => {
    localStorage.setItem('org_selected_month', selectedMonth);
  }, [selectedMonth]);

  // Persist registered users
  useEffect(() => {
    localStorage.setItem('org_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Manual bank adjustment states allowing total direct value customization
  const [isAdjustingSaldos, setIsAdjustingSaldos] = useState<boolean>(false);
  const [useSync, setUseSync] = useState<boolean>(true);
  const [manualNames, setManualNames] = useState<Record<string, string>>({
    acc_nu: 'NuConta',
    acc_bb: 'Banco do Brasil',
    acc_next: 'Banco Next',
    acc_itau: 'Itaú Unibanco'
  });
  const [manualBalances, setManualBalances] = useState<Record<string, number>>({
    acc_nu: 1212.92,
    acc_bb: 2212.92,
    acc_next: 1500.00,
    acc_itau: 1000.00
  });

  // Acesso Rápido insertion module states
  const [quickType, setQuickType] = useState<'incomes' | 'expenses'>('expenses');
  const [quickDesc, setQuickDesc] = useState<string>('');
  const [quickVal, setQuickVal] = useState<string>('200');

  // Handle addition of a custom row from event-bus
  useEffect(() => {
    const handleAddRow = (e: Event) => {
      const customEvent = e as CustomEvent<{ section: 'incomes' | 'expenses'; label: string; value: number }>;
      const { section, label, value } = customEvent.detail;
      
      startTransition(() => {
        setRows((prev) => {
          const next = [...prev];
          const newId = `${section}_custom_${Date.now()}`;
          const newRow: SpreadsheetRow = {
            id: newId,
            rowNumber: 0, 
            label,
            value,
            rowType: 'value',
            category: section === 'incomes' ? 'Renda Extra' : 'Outros'
          };

          if (section === 'incomes') {
            const idx = next.findIndex((r) => r.id === 'TOTAL_ENTRADAS');
            next.splice(idx, 0, newRow);
          } else {
            const idx = next.findIndex((r) => r.id === 'TOTAL_SAIDAS');
            next.splice(idx, 0, newRow);
          }
          return next;
        });
      });
    };

    window.addEventListener('add_custom_row', handleAddRow);
    return () => window.removeEventListener('add_custom_row', handleAddRow);
  }, []);

  // Spreadsheet calculations
  const calculatedData = useMemo(() => {
    let calculatedRows = rows.map((row, index) => ({
      ...row,
      rowNumber: index + 1,
      cellRef: row.rowType !== 'blank' && row.rowType !== 'header' ? `B${index + 1}` : undefined
    }));

    const totalEntradasIdx = calculatedRows.findIndex((r) => r.id === 'TOTAL_ENTRADAS');
    const totalSaidasIdx = calculatedRows.findIndex((r) => r.id === 'TOTAL_SAIDAS');
    const saldoFinalIdx = calculatedRows.findIndex((r) => r.id === 'SALDO_FINAL');

    // Calculate sum of incomes
    let totalIncomes = 0;
    for (let i = 1; i < totalEntradasIdx; i++) {
      if (calculatedRows[i].rowType === 'value') {
        totalIncomes += calculatedRows[i].value || 0;
      }
    }

    // Calculate sum of expenses
    let totalExpenses = 0;
    for (let i = totalEntradasIdx + 1; i < totalSaidasIdx; i++) {
      if (calculatedRows[i].rowType === 'value') {
        totalExpenses += calculatedRows[i].value || 0;
      }
    }

    const remainingBalance = totalIncomes - totalExpenses;

    // Apply formulas
    calculatedRows = calculatedRows.map((row) => {
      if (row.id === 'TOTAL_ENTRADAS') {
        const lastIncomeRow = totalEntradasIdx;
        const formulaPt = `=SOMA(B2:B${lastIncomeRow})`;
        const formulaEn = `=SUM(B2:B${lastIncomeRow})`;
        return { ...row, value: totalIncomes, formulaPt, formulaEn };
      }
      if (row.id === 'TOTAL_SAIDAS') {
        const firstExpenseIdx = calculatedRows.findIndex(
          (r, idx) => idx > totalEntradasIdx && r.rowType === 'value'
        );
        const firstExpenseRow = firstExpenseIdx !== -1 ? firstExpenseIdx + 1 : 8;
        const lastExpenseRow = totalSaidasIdx;
        const formulaPt = `=SOMA(B${firstExpenseRow}:B${lastExpenseRow})`;
        const formulaEn = `=SUM(B${firstExpenseRow}:B${lastExpenseRow})`;
        return { ...row, value: totalExpenses, formulaPt, formulaEn };
      }
      if (row.id === 'SALDO_FINAL') {
        const totalEntradasRow = totalEntradasIdx + 1;
        const totalSaidasRow = totalSaidasIdx + 1;
        const formulaPt = `=B${totalEntradasRow}-B${totalSaidasRow}`;
        const formulaEn = `=B${totalEntradasRow}-B${totalSaidasRow}`;
        return { ...row, value: remainingBalance, formulaPt, formulaEn };
      }
      return row;
    });

    const firstExpenseIdx = calculatedRows.findIndex(
      (r, idx) => idx > totalEntradasIdx && r.rowType === 'value'
    );
    const firstExpenseRow = firstExpenseIdx !== -1 ? firstExpenseIdx + 1 : 8;

    return {
      rows: calculatedRows,
      totalIncomes,
      totalExpenses,
      remainingBalance,
      totalIncomesFormula: formulaLanguage === 'pt' ? `=SOMA(B2:B${totalEntradasIdx})` : `=SUM(B2:B${totalEntradasIdx})`,
      totalExpensesFormula: formulaLanguage === 'pt' ? `=SOMA(B${firstExpenseRow}:B${totalSaidasIdx})` : `=SUM(B${firstExpenseRow}:B${totalSaidasIdx})`,
      saldoFinalFormula: `=B${totalEntradasIdx + 1}-B${totalSaidasIdx + 1}`,
      totalIncomesRef: `B${totalEntradasIdx + 1}`,
      totalExpensesRef: `B${totalSaidasIdx + 1}`,
      saldoFinalRef: `B${saldoFinalIdx + 1}`
    };
  }, [rows, formulaLanguage]);

  // Adjust bank account balances proportionally or manually depending on useSync preference
  const syncedBankAccounts = useMemo(() => {
    const totalSim = calculatedData.remainingBalance;
    const baseNu = 1212.92 + (totalSim * 0.30);
    const baseBB = 2212.92 + (totalSim * 0.45);
    const baseNext = 1500.00 + (totalSim * 0.15);
    const baseItau = 1000.00 + (totalSim * 0.10);

    const proportionalAccounts = [
      { ...bankAccounts[0], name: manualNames[bankAccounts[0].id] || bankAccounts[0].name, balance: Math.max(0, baseNu) },
      { ...bankAccounts[1], name: manualNames[bankAccounts[1].id] || bankAccounts[1].name, balance: Math.max(0, baseBB) },
      { ...bankAccounts[2], name: manualNames[bankAccounts[2].id] || bankAccounts[2].name, balance: Math.max(0, baseNext) },
      { ...bankAccounts[3], name: manualNames[bankAccounts[3].id] || bankAccounts[3].name, balance: Math.max(0, baseItau) }
    ];

    if (!useSync) {
      return bankAccounts.map(acc => ({
        ...acc,
        name: manualNames[acc.id] || acc.name,
        balance: manualBalances[acc.id] !== undefined ? manualBalances[acc.id] : acc.balance
      }));
    }

    return proportionalAccounts;
  }, [calculatedData.remainingBalance, bankAccounts, useSync, manualNames, manualBalances]);

  const updateRowValue = (id: string, value: number) => {
    startTransition(() => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
    });
  };

  const updateRowLabel = (id: string, label: string) => {
    startTransition(() => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, label } : r)));
    });
  };

  const deleteRow = (id: string) => {
    startTransition(() => {
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (selectedCellId === id) {
        setSelectedCellId('SALDO_FINAL');
      }
    });
  };

  const handleQuickSubmit = () => {
    if (!quickDesc.trim()) return;
    const valueNum = parseFloat(quickVal) || 0;
    
    startTransition(() => {
      setRows((prev) => {
        const next = [...prev];
        const newId = `${quickType}_custom_${Date.now()}`;
        const newRow: SpreadsheetRow = {
          id: newId,
          rowNumber: 0, 
          label: quickDesc.trim(),
          value: valueNum,
          rowType: 'value',
          category: quickType === 'incomes' ? 'Renda Extra' : 'Outros'
        };

        if (quickType === 'incomes') {
          const idx = next.findIndex((r) => r.id === 'TOTAL_ENTRADAS');
          next.splice(idx, 0, newRow);
        } else {
          const idx = next.findIndex((r) => r.id === 'TOTAL_SAIDAS');
          next.splice(idx, 0, newRow);
        }
        return next;
      });
    });

    setQuickDesc('');
  };

  const resetRows = () => {
    startTransition(() => {
      setRows(initialRows);
      setBankAccounts(initialBankAccounts);
      setSelectedCellId('SALDO_FINAL');
      setUseSync(true);
      setIsAdjustingSaldos(false);
      setManualNames({
        acc_nu: 'NuConta',
        acc_bb: 'Banco do Brasil',
        acc_next: 'Banco Next',
        acc_itau: 'Itaú Unibanco'
      });
      setManualBalances({
        acc_nu: 1212.92,
        acc_bb: 2212.92,
        acc_next: 1500.00,
        acc_itau: 1000.00
      });
    });
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const emailClean = loginEmail.trim().toLowerCase();
    const pass = loginPassword;

    if (!emailClean || !pass) {
      setAuthError('Por favor, digite seu e-mail e senha.');
      return;
    }

    const matched = registeredUsers.find((u) => u.email.toLowerCase() === emailClean);

    if (!matched) {
      setAuthError('E-mail não localizado. Clique abaixo para Criar uma Conta!');
      return;
    }

    if (matched.password !== pass) {
      setAuthError('Senha incorreta. Tente novamente.');
      return;
    }

    startTransition(() => {
      setCurrentUser(matched.email);
      localStorage.setItem('org_current_user', matched.email);
      setAuthSuccess(`Conectado! Bem-vindo de volta, ${matched.userName}.`);
      setLoginEmail('');
      setLoginPassword('');
    });
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const name = registerUserName.trim();
    const emailClean = registerEmail.trim().toLowerCase();
    const pass = registerPassword;

    if (!name || !emailClean || !pass) {
      setAuthError('Por favor, preencha todos os campos do cadastro.');
      return;
    }

    if (pass.length < 3) {
      setAuthError('A senha deve conter no mínimo 3 caracteres.');
      return;
    }

    const alreadyExists = registeredUsers.some((u) => u.email.toLowerCase() === emailClean);
    if (alreadyExists) {
      setAuthError('Esse e-mail já está cadastrado. Altere ou vá para o Login.');
      return;
    }

    const newUser = {
      email: emailClean,
      password: pass,
      userName: name
    };

    startTransition(() => {
      const updated = [...registeredUsers, newUser];
      setRegisteredUsers(updated);
      setCurrentUser(newUser.email);
      localStorage.setItem('org_current_user', newUser.email);
      setAuthSuccess(`Cadastro realizado! Bem-vindo(a), ${newUser.userName}.`);
      setRegisterUserName('');
      setRegisterEmail('');
      setRegisterPassword('');
    });
  };

  const handleLogout = () => {
    startTransition(() => {
      setCurrentUser(null);
      localStorage.removeItem('org_current_user');
      setAuthSuccess('Sessão encerrada com segurança.');
      setAuthError(null);
      // Reset active state references
      setSelectedCellId('SALDO_FINAL');
      setActiveTab('visao');
    });
  };

  // Helper to format currency or return bullet masks
  const formatVal = (amount: number, showDecimals = true) => {
    if (hideBalances) return '••••••';
    return `${currencySymbol} ${amount.toLocaleString(undefined, { 
      minimumFractionDigits: showDecimals ? 2 : 0, 
      maximumFractionDigits: showDecimals ? 2 : 0 
    })}`;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F8FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none relative overflow-hidden">
        
        {/* Subtle decorative background bubbles */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          {/* Centered pulsing brand logo matching GM Finanças */}
          <div className="flex justify-center items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00c853] text-white flex items-center justify-center font-bold text-2xl shadow-md animate-pulse">
              G
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-slate-800">
              GM <span className="font-light text-slate-500">Finanças</span>
            </span>
          </div>
          <h2 className="mt-4 text-center text-xs text-slate-400 font-medium font-sans">
            Gerenciador financeiro pessoal minimalista e 100% seguro
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-100/80 space-y-5">
            
            {/* Error & Success Messages */}
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs flex items-start gap-2 text-left">
                <CheckCircle className="w-4 h-4 text-[#00c853] shrink-0 mt-0.5" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1">E-mail</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="Ex: bety@organizze.com.br"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-[#00c853] focus:outline-hidden font-semibold text-slate-800 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block ml-1">Senha de Acesso</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Sua senha de acesso"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-[#00c853] focus:outline-hidden font-semibold text-slate-800 transition-all shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00c853] hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Lock className="w-3.5 h-3.5" />
                Entrar no Gerenciador 🔒
              </button>
            </form>



          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-400 font-sans">
          GM Finanças &copy; {new Date().getFullYear()} &bull; Todos os dados de despesas são persistidos de forma privada e segura.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FA] pb-20 select-none">
      
       {/* 1. TOP BABY BLUE BAR - "GM Finanças Style" */}
      <nav className="bg-[#bae6fd] text-sky-950 py-4 px-6 sticky top-0 z-50 shadow-sm border-b border-sky-200/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Pulsing app logo resembling GM Finanças blue bubble */}
            <div className="w-8 h-8 rounded-full bg-sky-950 text-[#bae6fd] flex items-center justify-center font-bold text-lg shadow-xs">
              G
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-sky-950">GM <span className="font-light text-sky-800">Finanças</span></span>
            <span className="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full font-mono">Simples v2.0</span>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center bg-sky-100 p-0.5 rounded-xl text-xs font-semibold gap-1 border border-sky-200/40">
            <button 
              onClick={() => setActiveTab('visao')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'visao' ? 'bg-sky-950 text-white shadow-xs' : 'text-sky-800 hover:bg-sky-200/80'}`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setActiveTab('planilha')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${activeTab === 'planilha' ? 'bg-sky-950 text-white shadow-xs' : 'text-sky-800 hover:bg-sky-200/80'}`}
            >
              Lançamentos & Planilha
            </button>
          </div>

          {/* Quick Info Profile */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 text-sky-950 bg-sky-100/50 px-3 py-1.5 rounded-lg border border-sky-300/35">
              <User className="w-3.5 h-3.5 text-sky-800" />
              <span className="font-bold">{userName}</span>
              <span className="text-[9px] text-sky-700/80 font-mono">({currentUser})</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-sky-950 hover:bg-sky-900 text-white px-3 py-1.5 rounded-lg font-extrabold transition-all shadow-xs flex items-center gap-1 cursor-pointer text-xs"
              title="Sair do aplicativo"
            >
              <LogOut className="w-3.5 h-3.5 text-sky-200" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Sub-Header: Month Reference Selector */}
      <div className="bg-sky-50 border-b border-sky-100 py-3 px-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-sky-900 font-sans">
            <Calendar className="w-4 h-4 text-sky-600 animate-bounce" />
            <span className="font-bold">Período de Referência:</span>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-2xs border border-sky-200">
            <button 
              onClick={handlePrevMonth} 
              className="p-1 hover:bg-sky-50 rounded-lg text-sky-950 transition-all cursor-pointer"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4 text-sky-700" />
            </button>
            
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-xs text-sky-950 focus:outline-hidden cursor-pointer hover:bg-sky-50 px-2.5 py-0.5 rounded-md border-0 text-center font-sans tracking-wide"
            >
              {availableMonths.map(item => (
                <option key={item.value} value={item.value} className="font-semibold text-slate-800">
                  {item.label}
                </option>
              ))}
            </select>

            <button 
              onClick={handleNextMonth} 
              className="p-1 hover:bg-sky-50 rounded-lg text-sky-950 transition-all cursor-pointer"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4 text-sky-700" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-sky-800 font-semibold font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Histórico salvo individualmente para este mês 🔒</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 space-y-6">
        
        {/* 2. WELCOME BANNER & GENERAL SALDO HEADER */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    className="border-b border-[#00c853] font-display font-bold text-2xl text-slate-800 focus:outline-hidden"
                    autoFocus
                  />
                  <button onClick={() => setIsEditingName(false)} className="text-xs text-green-600 font-bold px-1 py-0.5">OK</button>
                </div>
              ) : (
                <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-800 tracking-tight flex items-center gap-2">
                  Boa tarde, <span className="text-[#00c853] hover:underline cursor-pointer" onClick={() => setIsEditingName(true)} title="Clique para mudar">{userName}!</span> 👋
                </h1>
              )}
              {/* Little sun mimicking sunset weather indicator at afternoon from Organizze screenshot */}
              <span className="p-1 px-1.5 bg-amber-50 text-amber-500 text-xs font-semibold rounded-md flex items-center gap-1 font-sans">
                ☀️ 26°C Sol
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-sans">
              Bem-vindo ao seu painel. Exibindo lançamentos e simulações para <strong className="text-sky-950 font-bold">{availableMonths.find(m => m.value === selectedMonth)?.label || selectedMonth}</strong>.
            </p>
          </div>

          {/* Top Control Settings */}
          <div className="flex items-center gap-3 self-end md:self-center">
            {/* Eye Hide Toggle signature */}
            <button 
              onClick={() => setHideBalances(!hideBalances)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2.5 cursor-pointer border border-slate-200/50"
              id="hide-balances-toggle"
            >
              {hideBalances ? (
                <>
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Exibir saldos</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-slate-500" />
                  <span>Ocultar saldos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. CORE STATS ROW WITNESSING REAL VALUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Receitas Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-[11px] font-bold text-[#00c853] uppercase tracking-wider">receita mensal</p>
              <h3 className="font-display font-extrabold text-2xl md:text-3xl text-slate-800 mt-2">
                <span className="text-emerald-500 font-medium mr-1 text-xl">+</span> {formatVal(calculatedData.totalIncomes)}
              </h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Ganhos Registrados</span>
              <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">100% Ativo</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/20 rounded-full -mr-6 -mt-6"></div>
          </div>

          {/* Despesas Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div>
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">despesa mensal</p>
              <h3 className="font-display font-extrabold text-2xl md:text-3xl text-slate-800 mt-2">
                <span className="text-rose-500 font-medium mr-1 text-xl">-</span> {formatVal(calculatedData.totalExpenses)}
              </h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Saídas Registradas</span>
              <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">Planilha de Custos</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/20 rounded-full -mr-6 -mt-6"></div>
          </div>

          {/* Saldo Geral Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#00c853]/40 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] bg-linear-to-b from-white to-green-50/10">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> saldo geral disponível
                </p>
                {hideBalances ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              </div>
              <h2 className={`font-display font-black text-3xl md:text-4xl mt-3 ${calculatedData.remainingBalance >= 0 ? 'text-[#00c853]' : 'text-red-650'}`}>
                {formatVal(calculatedData.remainingBalance)}
              </h2>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Balanço líquido de caixa</span>
              <span className="text-[#00c853] bg-green-100 font-semibold px-2 py-0.5 rounded-full text-[10px]">Ativo</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/30 rounded-full -mr-6 -mt-6"></div>
          </div>

        </div>

        {/* 4. MASTER BENTO GRID SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT AREA: Spreadsheets & Learn panels based on tabs */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeTab === 'visao' && (
              <div className="space-y-6 animate-fade-in" id="bento-overview">
                {/* Visual welcoming screen reminding of the home screen cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Acesso Rápido - Directly from Organizze style quick add features */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="text-left">
                          <h3 className="font-display font-bold text-slate-800 text-sm">Acesso Rápido</h3>
                          <p className="text-[9px] text-slate-400">Lance direto sem trocar de aba</p>
                        </div>
                        <span className="text-[9px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-md">Atalho</span>
                      </div>

                      {/* Type toggle buttons */}
                      <div className="grid grid-cols-2 gap-1.5 mt-3">
                        <button
                          onClick={() => setQuickType('incomes')}
                          className={`py-1.5 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            quickType === 'incomes'
                              ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-500/10'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Receita
                        </button>
                        <button
                          onClick={() => setQuickType('expenses')}
                          className={`py-1.5 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            quickType === 'expenses'
                              ? 'bg-rose-50 text-rose-800 border-2 border-rose-500/10'
                              : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Despesa
                        </button>
                      </div>

                      <div className="space-y-2 mt-3 text-left">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Descrição</label>
                          <input
                            type="text"
                            placeholder={quickType === 'incomes' ? 'Ex: Bônus, Aluguel Recebido' : 'Ex: Uber, Farmácia, Ifood'}
                            value={quickDesc}
                            onChange={(e) => setQuickDesc(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-[#00c853] focus:outline-hidden font-semibold text-slate-750 placeholder:text-slate-400/70"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Valor ({currencySymbol})</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold select-none">{currencySymbol}</span>
                            <input
                              type="number"
                              placeholder="0,00"
                              value={quickVal}
                              onChange={(e) => setQuickVal(e.target.value)}
                              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-[#00c853] focus:outline-hidden font-bold text-slate-850"
                              step="any"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleQuickSubmit}
                      disabled={!quickDesc.trim()}
                      className="w-full text-center text-xs text-white font-bold bg-[#00c853] hover:bg-green-700 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      Inserir Novo Lançamento ⚡
                    </button>
                  </div>

                  {/* Metas de Novembro - Interactive Budgeting Limits directly from screenshot */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="text-left">
                          <h3 className="font-display font-bold text-slate-800 text-sm">Metas de Gastos</h3>
                          <p className="text-[9px] text-slate-400">Distribuição sugerida: 50-30-20</p>
                        </div>
                        <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Proporções</span>
                      </div>

                      {/* Progresso de Essentials */}
                      <div className="space-y-1 text-left">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-600 font-semibold">🏠 Gastos Essenciais</span>
                          <span className="text-slate-500 font-bold">Meta: 50%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: '48%' }}></div>
                        </div>
                      </div>

                      {/* Progresso de Lazer */}
                      <div className="space-y-1 text-left">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-600 font-semibold">🍕 Lazer & Desejos</span>
                          <span className="text-slate-500 font-bold">Meta: 30%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="h-full rounded-full bg-[#fa1] style_width" style={{ width: '22%' }}></div>
                        </div>
                      </div>

                      {/* Progresso de Reserva */}
                      <div className="space-y-1 text-left">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-600 font-semibold">💰 Reserva Técnica</span>
                          <span className="text-slate-500 font-bold">Meta: 20%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="h-full rounded-full bg-[#00c853]" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-150">
                      <p className="text-[10px] text-slate-500 leading-relaxed text-left flex gap-1 items-start">
                        <span>💡</span>
                        <span>Seu saldo atual está positivo. Digite novos valores no simulador ou no atalho rápido para ver recalcular na hora!</span>
                      </p>
                    </div>
                  </div>

                </div>

                <FinanceTips
                  totalIncomes={calculatedData.totalIncomes}
                  totalExpenses={calculatedData.totalExpenses}
                  remainingBalance={calculatedData.remainingBalance}
                  currencySymbol={currencySymbol}
                />

                <div className="text-center p-3">
                  <button 
                    onClick={() => setActiveTab('planilha')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#00c853] hover:bg-green-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>Abrir Simulador de Lançamentos Mensais</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'planilha' && (
              <div className="space-y-6 animate-fade-in" id="bento-planilha">
                <SpreadsheetSimulator
                  rows={calculatedData.rows}
                  selectedCellId={selectedCellId}
                  setSelectedCellId={setSelectedCellId}
                  formulaLanguage={formulaLanguage}
                  setFormulaLanguage={setFormulaLanguage}
                  currencySymbol={currencySymbol}
                  setCurrencySymbol={setCurrencySymbol}
                  onUpdateRowValue={updateRowValue}
                  onUpdateRowLabel={updateRowLabel}
                  onAddRow={(sec) => {}} 
                  onDeleteRow={deleteRow}
                  onReset={resetRows}
                />
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR: Step indicators & Quick Copy Formula panel */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Spreadsheet Reference Sheet Layout */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5 text-left" id="sidebar-quick-reference">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-sm">Fórmulas Prontas Excel</h3>
                  <p className="text-[10px] text-slate-400">Copie e cole na sua planilha real</p>
                </div>
              </div>

              {/* Language switcher in sidebar too */}
              <div className="bg-slate-50 rounded-2xl p-2.5 flex items-center justify-between text-xs border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500">Idioma do Excel</span>
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5" id="mini-lang-switcher">
                  <button 
                    onClick={() => setFormulaLanguage('pt')} 
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${formulaLanguage === 'pt' ? 'bg-[#00c853] text-white' : 'text-slate-500'}`}
                  >
                    SOMA
                  </button>
                  <button 
                    onClick={() => setFormulaLanguage('en')} 
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${formulaLanguage === 'en' ? 'bg-[#00c853] text-white' : 'text-slate-500'}`}
                  >
                    SUM
                  </button>
                </div>
              </div>

              {/* Active Formulas Quick Cards */}
              <div className="space-y-3.5">
                
                {/* Total Receitas formula card */}
                <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">Total de Entradas (Receitas)</span>
                    <span className="text-[9px] font-mono text-emerald-600 font-bold bg-white px-1.5 py-0.2 rounded border border-emerald-100">Célula {calculatedData.totalIncomesRef}</span>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-2 font-mono text-[10px] flex items-center justify-between mt-1.5">
                    <span className="truncate">{calculatedData.totalIncomesFormula}</span>
                  </div>
                </div>

                {/* Total Despesas formula card */}
                <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100/50 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800">Total de Ganhos (Despesas)</span>
                    <span className="text-[9px] font-mono text-rose-600 font-semibold bg-white px-1.5 py-0.2 rounded border border-rose-100">Célula {calculatedData.totalExpensesRef}</span>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-2 font-mono text-[10px] flex items-center justify-between mt-1.5">
                    <span className="truncate">{calculatedData.totalExpensesFormula}</span>
                  </div>
                </div>

                {/* Balance final formula card */}
                <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-800">Saldo Final Líquido</span>
                    <span className="text-[9px] font-mono text-blue-600 font-semibold bg-white px-1.5 py-0.2 rounded border border-blue-100">Célula {calculatedData.saldoFinalRef}</span>
                  </div>
                  <div className="bg-slate-900 text-white rounded-lg p-2 font-mono text-[10px] flex items-center justify-between mt-1.5">
                    <span className="truncate">{calculatedData.saldoFinalFormula}</span>
                  </div>
                </div>

              </div>

              {/* Instructions shortcut */}
              <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                <span className="font-bold text-orange-800 block">📌 Atenção ao Copiar:</span>
                Ao preencher no seu Excel, certifique-se de que a coluna de valores é a <strong>Letra B</strong> e que os cabeçalhos correspondem exatamente às linhas descritas. Se você quiser testar as fórmulas diretamente, basta clicar no botão de "Baixar Planilha .CSV" abaixo do simulador!
              </div>

            </div>

            {/* Quick tip from the expert */}
            <div className="bg-[#00c853]/5 border-2 border-[#00c853]/20 rounded-3xl p-6 text-left space-y-3">
              <span className="text-xl">🏆</span>
              <h4 className="text-sm font-bold text-slate-800">Regra de Ouro do Planejamento</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tente reter pelo menos <strong>20%</strong> de suas fontes de receitas para investimentos imediatos. Você pode ajustar os valores das despesas do simulador ao lado para testar diferentes cenários em que seu saldo aumenta!
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
