const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

/**
 * Configuração específica para Railway que resolve o erro:
 * "Fontconfig error: Cannot load default config file"
 * 
 * Esta configuração usa apenas fontes genéricas que existem em qualquer sistema
 * e não tenta registrar fontes customizadas que causam problemas no Railway.
 */
const createRailwayChartCanvas = (width = 800, height = 600) => {
  return new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: 'white',
    chartCallback: (ChartJS) => {
      // Usar apenas fontes genéricas que existem em qualquer sistema
      ChartJS.defaults.font = {
        family: 'sans-serif', // Fonte genérica sempre disponível
        size: 12,
        weight: 'normal',
        style: 'normal'
      };
      ChartJS.defaults.color = '#000000'; // Cor sólida para melhor contraste
      
      // Configurações que não dependem de fontconfig
      ChartJS.defaults.animation = false;
      ChartJS.defaults.responsive = false;
      ChartJS.defaults.maintainAspectRatio = false;
      
      // Configurar título para usar fonte genérica
      ChartJS.defaults.plugins.title = {
        font: {
          family: 'sans-serif',
          size: 14,
          weight: 'bold'
        },
        color: '#000000'
      };
      
      // Configurar legenda para usar fonte genérica
      ChartJS.defaults.plugins.legend = {
        labels: {
          font: {
            family: 'sans-serif',
            size: 11,
            weight: 'normal'
          },
          color: '#000000',
          usePointStyle: false,
          boxWidth: 12,
          padding: 10
        }
      };
      
      // Configurar tooltips para usar fonte genérica
      ChartJS.defaults.plugins.tooltip = {
        backgroundColor: 'rgba(0,0,0,0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 4,
        titleFont: {
          family: 'sans-serif',
          size: 12,
          weight: 'bold'
        },
        bodyFont: {
          family: 'sans-serif',
          size: 11,
          weight: 'normal'
        }
      };
      
      // Configurar scales para gráficos de linha/barra
      ChartJS.defaults.scales = {
        x: {
          ticks: {
            font: {
              family: 'sans-serif',
              size: 10
            },
            color: '#000000'
          }
        },
        y: {
          ticks: {
            font: {
              family: 'sans-serif',
              size: 10
            },
            color: '#000000'
          }
        }
      };
      
      // Configurações para elementos visuais
      ChartJS.defaults.elements.arc.borderWidth = 1;
      ChartJS.defaults.elements.arc.borderColor = '#ffffff';
      ChartJS.defaults.elements.line.borderWidth = 3;
      ChartJS.defaults.elements.point.radius = 4;
      ChartJS.defaults.elements.point.hoverRadius = 6;
    },
    plugins: {
      modern: []
    }
  });
};

module.exports = { createRailwayChartCanvas }; 