const formatters = require('../utils/formatters');
const chartConfig = require('../config/chartConfig');

// Função robusta para normalizar labels e evitar problemas de renderização
function normalizeLabel(str) {
  if (!str || typeof str !== 'string') return '';
  
  // Converter para string se necessário e remover espaços extras
  let normalized = String(str).trim();
  
  // Normalizar caracteres Unicode (NFD = Canonical Decomposition)
  normalized = normalized.normalize('NFD');
  
  // Remover diacríticos (acentos)
  normalized = normalized.replace(/[\u0300-\u036f]/g, '');
  
  // Substituir caracteres especiais específicos do português
  normalized = normalized
    .replace(/[çÇ]/g, 'c')
    .replace(/[ñÑ]/g, 'n')
    .replace(/[ß]/g, 'ss');
  
  // Remover caracteres não ASCII que podem causar problemas
  normalized = normalized.replace(/[^\x00-\x7F]/g, '');
  
  // Limitar tamanho para evitar labels muito longas
  if (normalized.length > 20) {
    normalized = normalized.substring(0, 17) + '...';
  }
  
  return normalized;
}

// Função para normalizar valores monetários para exibição
function normalizeMoneyValue(value) {
  return formatters.currencySimple(value);
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
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          title: {
            display: true,
            text: normalizeLabel(title),
            font: { 
              size: 14, 
              family: 'Arial, sans-serif',
              weight: 'bold'
            },
            color: '#333333',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { 
                family: 'Arial, sans-serif',
                size: 11,
                weight: 'normal'
              },
              color: '#333333',
              padding: 15,
              usePointStyle: false,
              boxWidth: 12
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: true,
            titleFont: {
              family: 'Arial, sans-serif',
              size: 12,
              weight: 'bold'
            },
            bodyFont: {
              family: 'Arial, sans-serif',
              size: 11,
              weight: 'normal'
            }
          }
        },
        layout: {
          padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }
        },
        elements: {
          arc: {
            borderWidth: 2,
            borderColor: '#ffffff'
          },
          line: {
            borderWidth: 3
          },
          point: {
            radius: 4,
            hoverRadius: 6
          }
        }
      }
    };
  }

  static getColors() {
    return [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
  }

  static getPieChartConfig(labels, data, total) {
    const config = this.getBaseConfig('pie', 'Distribuicao de Gastos por Categoria');
    
    // Normalizar labels e garantir que são strings válidas
    config.data.labels = labels.map(label => normalizeLabel(String(label)));
    
    config.data.datasets = [{
      data: data,
      backgroundColor: this.getColors(),
      borderColor: '#ffffff',
      borderWidth: 2,
      hoverBorderWidth: 3
    }];
    
    // Configurar tooltips específicos para gráfico de pizza
    config.options.plugins.tooltip.callbacks = {
      label: (context) => {
        const value = context.raw;
        const percentage = (value / total * 100).toFixed(1);
        const normalizedLabel = normalizeLabel(String(context.label));
        const formattedValue = normalizeMoneyValue(value);
        return `${normalizedLabel}: ${formattedValue} (${percentage}%)`;
      },
      title: (context) => {
        return normalizeLabel(String(context[0].label));
      }
    };
    
    // Configurar legenda específica para gráfico de pizza
    config.options.plugins.legend.position = 'right';
    config.options.plugins.legend.labels.generateLabels = (chart) => {
      const data = chart.data;
      if (data.labels.length && data.datasets.length) {
        return data.labels.map((label, i) => {
          const value = data.datasets[0].data[i];
          const percentage = (value / total * 100).toFixed(1);
          const normalizedLabel = normalizeLabel(String(label));
          return {
            text: `${normalizedLabel} (${percentage}%)`,
            fillStyle: data.datasets[0].backgroundColor[i],
            strokeStyle: data.datasets[0].borderColor,
            lineWidth: data.datasets[0].borderWidth,
            hidden: false,
            index: i
          };
        });
      }
      return [];
    };
    
    return config;
  }

  static getLineChartConfig(labels, data, budget) {
    const config = this.getBaseConfig('line', 'Evolucao dos Gastos no Mes');
    
    // Garantir que labels são strings válidas
    config.data.labels = labels.map(label => String(label));
    
    config.data.datasets = [
      {
        label: 'Gastos Acumulados',
        data: data,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.1,
        fill: true,
        pointBackgroundColor: '#36A2EB',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Orcamento',
        data: Array(labels.length).fill(budget),
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderDash: [5, 5],
        fill: false,
        pointBackgroundColor: '#FF6384',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ];
    
    // Configuração de scales para Chart.js 3.x
    config.options.scales = {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
          lineWidth: 1
        },
        ticks: {
          callback: value => normalizeMoneyValue(value),
          font: { 
            family: 'Arial, Helvetica, sans-serif',
            size: 11
          },
          color: '#333333',
          maxTicksLimit: 8
        },
        title: {
          display: true,
          text: 'Valor (R$)',
          font: {
            family: 'Arial, Helvetica, sans-serif',
            size: 12,
            weight: 'bold'
          },
          color: '#333333'
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)',
          lineWidth: 1
        },
        ticks: {
          font: { 
            family: 'Arial, Helvetica, sans-serif',
            size: 11
          },
          color: '#333333',
          maxTicksLimit: 15
        },
        title: {
          display: true,
          text: 'Dia do Mes',
          font: {
            family: 'Arial, Helvetica, sans-serif',
            size: 12,
            weight: 'bold'
          },
          color: '#333333'
        }
      }
    };
    
    // Configurar tooltip específico para gráfico de linha
    config.options.plugins.tooltip.callbacks = {
      title: (context) => {
        return `Dia ${context[0].label}`;
      },
      label: (context) => {
        const value = context.raw;
        const formattedValue = normalizeMoneyValue(value);
        return `${context.dataset.label}: ${formattedValue}`;
      }
    };
    
    return config;
  }

  static getBarChartConfig(labels, datasets) {
    const config = this.getBaseConfig('bar', 'Comparativo de Gastos por Categoria');
    
    // Normalizar labels e garantir que são strings válidas
    config.data.labels = labels.map(label => normalizeLabel(String(label)));
    
    config.data.datasets = datasets.map((dataset, index) => ({
      ...dataset,
      label: normalizeLabel(String(dataset.label)),
      backgroundColor: this.getColors()[index % this.getColors().length],
      borderColor: '#ffffff',
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false
    }));
    
    // Configuração de scales para Chart.js 3.x
    config.options.scales = {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
          lineWidth: 1
        },
        ticks: {
          callback: value => normalizeMoneyValue(value),
          font: { 
            family: 'Arial, Helvetica, sans-serif',
            size: 11
          },
          color: '#333333',
          maxTicksLimit: 8
        },
        title: {
          display: true,
          text: 'Valor (R$)',
          font: {
            family: 'Arial, Helvetica, sans-serif',
            size: 12,
            weight: 'bold'
          },
          color: '#333333'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { 
            family: 'Arial, Helvetica, sans-serif',
            size: 11
          },
          color: '#333333',
          maxRotation: 45,
          minRotation: 0
        },
        title: {
          display: true,
          text: 'Categorias',
          font: {
            family: 'Arial, Helvetica, sans-serif',
            size: 12,
            weight: 'bold'
          },
          color: '#333333'
        }
      }
    };
    
    // Configurar tooltip específico para gráfico de barras
    config.options.plugins.tooltip.callbacks = {
      title: (context) => {
        return normalizeLabel(String(context[0].label));
      },
      label: (context) => {
        const value = context.raw;
        const formattedValue = normalizeMoneyValue(value);
        const normalizedLabel = normalizeLabel(String(context.dataset.label));
        return `${normalizedLabel}: ${formattedValue}`;
      }
    };
    
    return config;
  }
}

module.exports = ChartConfigService; 