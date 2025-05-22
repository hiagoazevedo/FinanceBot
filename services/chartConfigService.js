const formatters = require('../utils/formatters');

function normalizeLabel(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[çÇ]/g, 'c');
}

class ChartConfigService {
  static getBaseConfig(type, title) {
    return {
      type,
      data: {
        labels: [],
        datasets: []
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: normalizeLabel(title),
            font: { size: 16, family: 'Arial, sans-serif' }
          },
          legend: {
            labels: {
              font: { family: 'Arial, sans-serif' }
            }
          }
        },
        layout: {
          padding: 20
        },
        font: {
          family: 'Arial, sans-serif'
        }
      }
    };
  }

  static getColors() {
    return [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF'
    ];
  }

  static getPieChartConfig(labels, data, total) {
    const config = this.getBaseConfig('pie', 'Distribuicao de Gastos por Categoria');
    config.data.labels = labels.map(normalizeLabel);
    config.data.datasets = [{
      data: data,
      backgroundColor: this.getColors()
    }];
    config.options.plugins.tooltip = {
      callbacks: {
        label: (context) => {
          const value = context.raw;
          const percentage = (value / total * 100).toFixed(1);
          return `${normalizeLabel(context.label)}: ${formatters.currency(value)} (${percentage}%)`;
        }
      }
    };
    config.options.plugins.legend = {
      position: 'right',
      labels: {
        font: { family: 'Arial, sans-serif' }
      }
    };
    return config;
  }

  static getLineChartConfig(labels, data, budget) {
    const config = this.getBaseConfig('line', 'Evolucao dos Gastos no Mes');
    config.data.labels = labels.map(String);
    config.data.datasets = [
      {
        label: 'Gastos Acumulados',
        data: data,
        borderColor: '#36A2EB',
        tension: 0.1
      },
      {
        label: 'Orcamento',
        data: Array(labels.length).fill(budget),
        borderColor: '#FF6384',
        borderDash: [5, 5],
        fill: false
      }
    ];
    config.options.scales = {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => formatters.currency(value),
          font: { family: 'Arial, sans-serif' }
        }
      },
      x: {
        ticks: {
          font: { family: 'Arial, sans-serif' }
        }
      }
    };
    return config;
  }

  static getBarChartConfig(labels, datasets) {
    const config = this.getBaseConfig('bar', 'Comparativo de Gastos por Categoria');
    config.data.labels = labels.map(normalizeLabel);
    config.data.datasets = datasets.map((dataset, index) => ({
      ...dataset,
      label: normalizeLabel(dataset.label),
      backgroundColor: this.getColors()[index % this.getColors().length]
    }));
    config.options.scales = {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => formatters.currency(value),
          font: { family: 'Arial, sans-serif' }
        }
      },
      x: {
        ticks: {
          font: { family: 'Arial, sans-serif' }
        }
      }
    };
    return config;
  }
}

module.exports = ChartConfigService; 