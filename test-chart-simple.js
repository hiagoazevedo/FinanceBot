const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

// Configuração simples e robusta
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 800,
  height: 600,
  backgroundColour: 'white',
  chartCallback: (ChartJS) => {
    // Configurações básicas para produção
    ChartJS.defaults.font.family = 'Arial, sans-serif';
    ChartJS.defaults.font.size = 12;
    ChartJS.defaults.color = '#333333';
    ChartJS.defaults.animation = false;
    ChartJS.defaults.responsive = false;
    ChartJS.defaults.maintainAspectRatio = false;
  }
});

async function testChart() {
  console.log('🧪 Testando renderização de gráfico simples...');
  
  const config = {
    type: 'pie',
    data: {
      labels: ['Alimentacao', 'Transporte', 'Lazer', 'Saude'],
      datasets: [{
        data: [300, 150, 100, 80],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: 'Teste de Grafico',
          font: {
            family: 'Arial, sans-serif',
            size: 14,
            weight: 'bold'
          },
          color: '#333333'
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              family: 'Arial, sans-serif',
              size: 11
            },
            color: '#333333'
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          titleFont: {
            family: 'Arial, sans-serif',
            size: 12,
            weight: 'bold'
          },
          bodyFont: {
            family: 'Arial, sans-serif',
            size: 11
          },
          callbacks: {
            label: (context) => {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = (value / total * 100).toFixed(1);
              return `${context.label}: R$ ${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  try {
    const image = await chartJSNodeCanvas.renderToBuffer(config);
    fs.writeFileSync('test-chart-output.png', image);
    console.log('✅ Gráfico de teste gerado com sucesso: test-chart-output.png');
    console.log('📊 Verifique o arquivo para confirmar se labels e valores estão visíveis');
  } catch (error) {
    console.error('❌ Erro ao gerar gráfico de teste:', error.message);
  }
}

testChart(); 