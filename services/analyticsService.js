const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const _ = require('lodash');
const math = require('mathjs');
const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');
const formatters = require('../utils/formatters');
const ChartConfigService = require('./chartConfigService');
const DateService = require('./dateService');

class AnalyticsService {
  constructor() {
    // Configuração do Chart.js
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: 800,
      height: 600,
      backgroundColour: 'white'
    });

    // Garantir que o diretório temp existe
    this.ensureTempDirectory();
  }

  // Função para garantir que o diretório temp existe
  async ensureTempDirectory() {
    const tempDir = path.join(__dirname, '../temp');
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir);
    }
  }

  // Função auxiliar para formatar valores monetários
  formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  // Função auxiliar para formatar porcentagem
  formatPercentage(value) {
    return `${value.toFixed(1)}%`;
  }

  // Gerar gráfico de pizza por categoria
  async generatePieChart(expenses) {
    const expensesByCategory = _.groupBy(expenses, 'category');
    const categories = Object.keys(expensesByCategory);
    const values = categories.map(category => 
      _.sumBy(expensesByCategory[category], 'value')
    );

    const total = _.sum(values);
    const percentages = values.map(value => (value / total) * 100);

    // Ordenar por valor e pegar top 5
    const sortedData = _.zip(categories, values, percentages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const config = ChartConfigService.getPieChartConfig(
      sortedData.map(([category]) => formatters.capitalizeFirstLetter(category)),
      sortedData.map(([, value]) => value),
      total
    );

    const image = await this.chartJSNodeCanvas.renderToBuffer(config);
    const fileName = `pie-chart-${Date.now()}.png`;
    const filePath = path.join(__dirname, '../temp', fileName);
    await fs.writeFile(filePath, image);
    return `temp/${fileName}`;
  }

  // Gerar gráfico de linha de evolução mensal
  async generateLineChart(expenses, budget) {
    const daysInMonth = moment().daysInMonth();
    const dailyExpenses = new Array(daysInMonth).fill(0);
    
    expenses.forEach(expense => {
      const day = moment(expense.date).date() - 1;
      dailyExpenses[day] += expense.value;
    });

    const cumulativeExpenses = dailyExpenses.map((_, i) => 
      dailyExpenses.slice(0, i + 1).reduce((a, b) => a + b, 0)
    );

    const config = ChartConfigService.getLineChartConfig(
      Array.from({length: daysInMonth}, (_, i) => i + 1),
      cumulativeExpenses,
      budget
    );

    const image = await this.chartJSNodeCanvas.renderToBuffer(config);
    const fileName = `line-chart-${Date.now()}.png`;
    const filePath = path.join(__dirname, '../temp', fileName);
    await fs.writeFile(filePath, image);
    return `temp/${fileName}`;
  }

  // Gerar gráfico de barras comparativo
  async generateBarChart(expensesByMonth) {
    const months = Object.keys(expensesByMonth);
    const categories = _.uniq(
      months.flatMap(month => 
        expensesByMonth[month].map(exp => exp.category)
      )
    );

    const datasets = categories.map(category => ({
      label: formatters.capitalizeFirstLetter(category),
      data: months.map(month => 
        _.sumBy(
          expensesByMonth[month].filter(exp => exp.category === category),
          'value'
        )
      )
    }));

    const config = ChartConfigService.getBarChartConfig(
      months.map(month => moment(month).format('MMM/YY')),
      datasets
    );

    const image = await this.chartJSNodeCanvas.renderToBuffer(config);
    const fileName = `bar-chart-${Date.now()}.png`;
    const filePath = path.join(__dirname, '../temp', fileName);
    await fs.writeFile(filePath, image);
    return `temp/${fileName}`;
  }

  // Gerar cor aleatória para gráficos
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Análise dos top 5 maiores gastos
  getTopExpenses(expenses, limit = 5) {
    return _.orderBy(expenses, ['value'], ['desc'])
      .slice(0, limit)
      .map(expense => ({
        description: expense.description,
        value: expense.value,
        date: moment(expense.date).format('DD/MM/YYYY'),
        category: expense.category
      }));
  }

  // Resumo por categoria
  getCategorySummary(expenses, budget) {
    const expensesByCategory = _.groupBy(expenses, 'category');
    const total = _.sumBy(expenses, 'value');

    return Object.entries(expensesByCategory).map(([category, categoryExpenses]) => {
      const value = _.sumBy(categoryExpenses, 'value');
      const percentage = (value / total) * 100;
      const budgetPercentage = (value / budget) * 100;

      return {
        category: formatters.capitalizeFirstLetter(category),
        value,
        percentage,
        budgetPercentage
      };
    }).sort((a, b) => b.value - a.value);
  }

  // Projeção mensal
  getMonthlyProjection(expenses, budget) {
    const today = moment();
    const daysInMonth = today.daysInMonth();
    const daysPassed = today.date();
    
    const totalSpent = _.sumBy(expenses, 'value');
    const dailyAverage = totalSpent / daysPassed;
    const projectedTotal = dailyAverage * daysInMonth;
    
    const trend = this.calculateTrend(expenses);
    
    return {
      totalSpent,
      dailyAverage,
      projectedTotal,
      trend,
      daysPassed,
      daysRemaining: daysInMonth - daysPassed,
      budgetRemaining: budget - totalSpent
    };
  }

  // Calcular tendência de gastos
  calculateTrend(expenses) {
    if (expenses.length < 2) return 'insuficiente';

    const dailyTotals = _.groupBy(expenses, exp => 
      moment(exp.date).format('YYYY-MM-DD')
    );

    const values = Object.values(dailyTotals).map(dayExpenses => 
      _.sumBy(dayExpenses, 'value')
    );

    const slope = math.slope(
      Array.from({length: values.length}, (_, i) => i),
      values
    );

    if (slope > 0.1) return 'aumentando';
    if (slope < -0.1) return 'diminuindo';
    return 'estável';
  }

  // Comparativo com período anterior
  async getPeriodComparison(currentExpenses, previousExpenses) {
    const currentByCategory = _.groupBy(currentExpenses, 'category');
    const previousByCategory = _.groupBy(previousExpenses, 'category');

    const categories = _.uniq([
      ...Object.keys(currentByCategory),
      ...Object.keys(previousByCategory)
    ]);

    const comparison = categories.map(category => {
      const current = _.sumBy(currentByCategory[category] || [], 'value');
      const previous = _.sumBy(previousByCategory[category] || [], 'value');
      const variation = previous ? ((current - previous) / previous) * 100 : 0;

      return {
        category: formatters.capitalizeFirstLetter(category),
        current,
        previous,
        variation
      };
    }).sort((a, b) => Math.abs(b.variation) - Math.abs(a.variation));

    return {
      totalCurrent: _.sumBy(currentExpenses, 'value'),
      totalPrevious: _.sumBy(previousExpenses, 'value'),
      categories: comparison
    };
  }
}

// Exportar a classe em vez da instância
module.exports = new AnalyticsService(); 