// Configurações específicas para renderização de gráficos em ambiente de produção
const chartConfig = {
  // Configurações de renderização
  rendering: {
    width: 800,
    height: 600,
    backgroundColour: 'white',
    quality: 1,
    type: 'png'
  },

  // Configurações de fonte robustas
  fonts: {
    primary: 'Arial, Helvetica, sans-serif',
    fallback: 'sans-serif',
    sizes: {
      title: 18,
      legend: 12,
      axis: 11,
      tooltip: 12
    }
  },

  // Cores padrão para gráficos
  colors: {
    primary: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    background: '#ffffff',
    border: '#ffffff',
    text: '#333333',
    grid: 'rgba(0,0,0,0.1)'
  },

  // Configurações de performance
  performance: {
    animation: false,
    responsive: false,
    maintainAspectRatio: false,
    maxRetries: 3,
    retryDelay: 1000
  },

  // Configurações específicas para ambiente de produção
  production: {
    // Desabilitar recursos que podem causar problemas
    disableAnimations: true,
    disableResponsive: true,
    
    // Configurações de timeout
    renderTimeout: 30000,
    
    // Configurações de memória
    maxConcurrentRenders: 1,
    
    // Configurações de erro
    enableErrorLogging: true,
    enableRetry: true
  }
};

module.exports = chartConfig; 