const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const _ = require('lodash');
const math = require('mathjs');
const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');
const formatters = require('../utils/formatters');
const ChartConfigService = require('./chartConfigService');
const DateService = require('./dateService');
const chartConfig = require('../config/chartConfig');

class AnalyticsService {
  constructor() {
    // Configuração robusta do Chart.js para ambiente de produção
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({
      width: chartConfig.rendering.width,
      height: chartConfig.rendering.height,
      backgroundColour: chartConfig.rendering.backgroundColour,
      chartCallback: (ChartJS) => {
        // Configurações globais para melhor renderização
        ChartJS.defaults.font.family = chartConfig.fonts.primary;
        ChartJS.defaults.font.size = chartConfig.fonts.sizes.legend;
        ChartJS.defaults.color = chartConfig.colors.text;
        
        // Configurar plugins globais
        ChartJS.defaults.plugins.legend.labels.usePointStyle = false;
        ChartJS.defaults.plugins.legend.labels.boxWidth = 12;
        ChartJS.defaults.plugins.legend.labels.padding = 10;
        
        // Configurações para melhor renderização de texto
        ChartJS.defaults.elements.arc.borderWidth = 2;
        ChartJS.defaults.elements.arc.borderColor = chartConfig.colors.border;
        
        // Configurar tooltips globalmente
        ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(0,0,0,0.8)';
        ChartJS.defaults.plugins.tooltip.titleColor = '#ffffff';
        ChartJS.defaults.plugins.tooltip.bodyColor = '#ffffff';
        ChartJS.defaults.plugins.tooltip.borderColor = '#ffffff';
        ChartJS.defaults.plugins.tooltip.borderWidth = 1;
        
        // Aplicar configurações de performance
        if (chartConfig.production.disableAnimations) {
          ChartJS.defaults.animation = false;
        }
        if (chartConfig.production.disableResponsive) {
          ChartJS.defaults.responsive = false;
          ChartJS.defaults.maintainAspectRatio = false;
        }
      },
      plugins: {
        modern: []
      }
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
      await fs.mkdir(tempDir, { recursive: true });
    }
  }

  // Função auxiliar para renderizar gráfico com retry e tratamento de erro
  async renderChartWithRetry(config, fileName, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📊 Tentativa ${attempt} de renderização do gráfico: ${fileName}`);
        
        // Validar configuração antes de renderizar
        this.validateChartConfig(config);
        
        const image = await this.chartJSNodeCanvas.renderToBuffer(config);
        const filePath = path.join(__dirname, '../temp', fileName);
        await fs.writeFile(filePath, image);
        
        console.log(`✅ Gráfico renderizado com sucesso: ${fileName}`);
        return `temp/${fileName}`;
        
      } catch (error) {
        lastError = error;
        console.error(`❌ Erro na tentativa ${attempt} de renderização:`, error.message);
        
        if (attempt < maxRetries) {
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    // Se todas as tentativas falharam, lançar o último erro
    console.error(`❌ Falha em todas as ${maxRetries} tentativas de renderização`);
    throw new Error(`Falha na renderização do gráfico após ${maxRetries} tentativas: ${lastError.message}`);
  }

  // Função para validar configuração do gráfico
  validateChartConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuração do gráfico inválida');
    }
    
    if (!config.type) {
      throw new Error('Tipo de gráfico não especificado');
    }
    
    if (!config.data || !config.data.labels || !config.data.datasets) {
      throw new Error('Dados do gráfico incompletos');
    }
    
    // Validar se há dados suficientes
    if (config.data.labels.length === 0) {
      throw new Error('Nenhum dado disponível para o gráfico');
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

    return await this.renderChartWithRetry(config, `pie-chart-${Date.now()}.png`);
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

    return await this.renderChartWithRetry(config, `line-chart-${Date.now()}.png`);
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

    return await this.renderChartWithRetry(config, `bar-chart-${Date.now()}.png`);
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