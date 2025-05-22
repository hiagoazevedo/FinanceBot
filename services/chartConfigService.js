const formatters = require('../utils/formatters');

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
            text: title,
            font: { size: 16 }
          }
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
    const config = this.getBaseConfig('pie', 'Distribuição de Gastos por Categoria');
    
    config.data.labels = labels;
    config.data.datasets = [{
      data: data,
      backgroundColor: this.getColors()
    }];

    config.options.plugins.tooltip = {
      callbacks: {
        label: (context) => {
          const value = context.raw;
          const percentage = (value / total * 100).toFixed(1);
          return `${context.label}: ${formatters.currency(value)} (${percentage}%)`;
        }
      }
    };

    config.options.plugins.legend = {
      position: 'right'
    };

    return config;
  }

  static getLineChartConfig(labels, data, budget) {
    const config = this.getBaseConfig('line', 'Evolução dos Gastos no Mês');
    
    config.data.labels = labels;
    config.data.datasets = [
      {
        label: 'Gastos Acumulados',
        data: data,
        borderColor: '#36A2EB',
        tension: 0.1
      },
      {
        label: 'Orçamento',
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
          callback: value => formatters.currency(value)
        }
      }
    };

    return config;
  }

  static getBarChartConfig(labels, datasets) {
    const config = this.getBaseConfig('bar', 'Comparativo de Gastos por Categoria');
    
    config.data.labels = labels;
    config.data.datasets = datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: this.getColors()[index % this.getColors().length]
    }));

    config.options.scales = {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => formatters.currency(value)
        }
      }
    };

    return config;
  }
}

module.exports = ChartConfigService; 