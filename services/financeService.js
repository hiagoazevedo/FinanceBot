// services/financeService.js
const Expense = require('../models/expense');
const User = require('../models/user');
const formatters = require('../utils/formatters');
const ExpenseValidator = require('../validators/expenseValidator');
const DateService = require('./dateService');

// Função para capitalizar primeira letra
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Função para normalizar texto em português
function normalizeText(text) {
  // Converter para minúsculo
  const lowerCase = text.toLowerCase();
  
  // Capitalizar primeira letra de cada palavra
  const words = lowerCase.split(' ');
  const capitalized = words.map(word => {
    // Lista de palavras que devem permanecer minúsculas
    const smallWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas'];
    if (smallWords.includes(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  return capitalized.join(' ');
}

class FinanceService {
  async addExpense(userId, description, value, category) {
    try {
      console.log('📝 Adicionando despesa:', {
        userId,
        description,
        value,
        category,
        date: new Date()
      });

      // Validar dados
      const validatedData = ExpenseValidator.validateExpenseData(userId, description, value, category);

      // Verificar se o usuário existe
      const user = await User.findOne({ phoneNumber: userId });
      if (!user) {
        console.log('❌ Usuário não encontrado:', userId);
        throw new Error('Usuário não encontrado');
      }
      console.log('✅ Usuário encontrado:', user._id);

      // Criar despesa
      const expense = await Expense.create({
        userId,
        description: validatedData.description,
        value: validatedData.value,
        category: validatedData.category,
        date: new Date()
      });

      console.log('✅ Despesa criada:', {
        _id: expense._id,
        userId: expense.userId,
        description: expense.description,
        value: expense.value,
        category: expense.category,
        date: expense.date
      });

      // Atualizar categorias do usuário
      await User.findOneAndUpdate(
        { phoneNumber: userId },
        { $addToSet: { categories: validatedData.category } }
      );

      return expense;
    } catch (error) {
      console.error('❌ Erro ao adicionar despesa:', error);
      throw error;
    }
  }

  async editExpense(expenseId, userId, updates) {
    try {
      // Se houver uma data no formato DD/MM/YYYY, converter para Date
      if (updates.date && typeof updates.date === 'string') {
        const [day, month, year] = updates.date.split('/');
        updates.date = new Date(year, month - 1, day);
      }

      // Se houver descrição, normalizar
      if (updates.description) {
        updates.description = normalizeText(updates.description);
      }

      const expense = await Expense.findOneAndUpdate(
        { _id: expenseId, userId },
        updates,
        { new: true }
      );
      
      if (!expense) {
        throw new Error('Despesa não encontrada ou não pertence ao usuário');
      }
      
      return expense;
    } catch (error) {
      console.error('Erro ao editar despesa:', error);
      throw error;
    }
  }

  async deleteExpense(expenseId, userId) {
    try {
      const result = await Expense.deleteOne({ _id: expenseId, userId });
      
      if (result.deletedCount === 0) {
        throw new Error('Despesa não encontrada ou não pertence ao usuário');
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      throw error;
    }
  }

  async getLastExpenses(user, limit = 5) {
    try {
      const expenses = await Expense.find({ userId: user.phoneNumber })
        .sort({ date: -1 })
        .limit(limit);
      return expenses;
    } catch (error) {
      console.error('❌ Erro ao buscar últimas despesas:', error);
      throw error;
    }
  }

  async checkBudgetAlert(user) {
    if (!user.monthlyBudget) return null;

    const { startDate, endDate } = DateService.getPeriodDates('mensal');
    const expenses = await Expense.find({
      userId: user.phoneNumber,
      date: { $gte: startDate, $lte: endDate }
    });

    const total = expenses.reduce((sum, exp) => sum + exp.value, 0);
    return ExpenseValidator.validateBudgetAlert(total, user.monthlyBudget);
  }

  async generateReport(user, period = 'mensal') {
    try {
      console.log('📊 Gerando relatório:', {
        userId: user.phoneNumber,
        period,
        user: {
          _id: user._id,
          phoneNumber: user.phoneNumber
        }
      });

      const { startDate, endDate } = DateService.getPeriodDates(period);

      console.log('🔍 Período de busca:', {
        startDate: DateService.formatDateTime(startDate),
        endDate: DateService.formatDateTime(endDate)
      });

      const expenses = await Expense.find({
        userId: user.phoneNumber,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });

      console.log(`✅ Encontradas ${expenses.length} despesas para o período`);

      if (expenses.length === 0) {
        return `📊 *Relatório ${period}*\n\n` +
               `Nenhuma despesa registrada para este período.`;
      }

      const total = expenses.reduce((sum, exp) => sum + exp.value, 0);
      const byCategory = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.value;
        return acc;
      }, {});

      // Calcular média diária
      const daysInPeriod = DateService.getDaysInPeriod(startDate, endDate);
      const dailyAverage = total / daysInPeriod;

      // Calcular maior e menor despesa
      const maxExpense = expenses.reduce((max, exp) => exp.value > max.value ? exp : max, expenses[0]);
      const minExpense = expenses.reduce((min, exp) => exp.value < min.value ? exp : min, expenses[0]);

      // Verificar alerta de orçamento
      let budgetStatus = '';
      if (user.monthlyBudget) {
        const percentage = (total / user.monthlyBudget) * 100;
        budgetStatus = `💰 *Status do Orçamento*\n` +
                      `• Orçamento mensal: ${formatters.currency(user.monthlyBudget)}\n` +
                      `• Gasto atual: ${formatters.currency(total)}\n` +
                      `• Percentual usado: ${formatters.percentage(percentage)}\n`;
        
        if (percentage >= 90) {
          budgetStatus += `⚠️ Alerta: Você já gastou ${formatters.percentage(percentage)} do seu orçamento mensal!\n`;
        }
      }

      let report = `📊 *Relatório ${period}*\n\n` +
                  `📅 *Período*\n` +
                  `• Início: ${DateService.formatDate(startDate)}\n` +
                  `• Fim: ${DateService.formatDate(endDate)}\n\n` +
                  
                  `💰 *Resumo*\n` +
                  `• Total gasto: ${formatters.currency(total)}\n` +
                  `• Média diária: ${formatters.currency(dailyAverage)}\n` +
                  `• Maior despesa: ${maxExpense.description}\n` +
                  `  💰 ${formatters.currency(maxExpense.value)}\n` +
                  `• Menor despesa: ${minExpense.description}\n` +
                  `  💰 ${formatters.currency(minExpense.value)}\n` +
                  `• Total de despesas: ${expenses.length}\n\n` +

                  `📋 *Por categoria*\n`;

      // Adicionar resumo por categoria
      Object.entries(byCategory)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, value]) => {
          const percentage = (value / total) * 100;
          report += `• ${formatters.capitalizeFirstLetter(category)}: ${formatters.currency(value)} (${formatters.percentage(percentage)})\n`;
        });

      // Adicionar status do orçamento se existir
      if (budgetStatus) {
        report += `\n${budgetStatus}`;
      }

      return report;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw error;
    }
  }

  getStartDate(period) {
    const now = moment();
    switch (period.toLowerCase()) {
      case 'semanal':
        return now.subtract(7, 'days').toDate();
      case 'mensal':
        return now.startOf('month').toDate();
      case 'anual':
        return now.startOf('year').toDate();
      default:
        return now.startOf('month').toDate();
    }
  }
}

module.exports = new FinanceService();