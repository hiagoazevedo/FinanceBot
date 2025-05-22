class ExpenseValidator {
  static validateExpenseData(userId, description, value, category) {
    if (!userId || !description || !value || !category) {
      throw new Error('Dados incompletos para registrar despesa');
    }

    if (isNaN(value) || value <= 0) {
      throw new Error('Valor inválido');
    }

    return {
      userId,
      description: description.trim(),
      value: parseFloat(value),
      category: category.toLowerCase()
    };
  }

  static validateExpensePattern(message) {
    const expensePattern = /^(.+?)\s*-\s*R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)(?:\s*#\s*(\w+))?$/i;
    const match = message.match(expensePattern);

    if (!match) {
      return null;
    }

    const description = match[1].trim();
    const valueStr = match[2].replace(/\./g, '').replace(',', '.');
    const value = parseFloat(valueStr);
    const category = match[3] ? match[3].toLowerCase() : 'outros';

    return { description, value, category };
  }

  static validateBudgetAlert(total, budget) {
    if (!budget) return null;
    
    const percentage = (total / budget) * 100;
    if (percentage >= 90) {
      return `⚠️ Alerta: Você já gastou ${percentage.toFixed(1)}% do seu orçamento mensal!`;
    }
    
    return null;
  }
}

module.exports = ExpenseValidator; 