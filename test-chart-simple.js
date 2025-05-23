const { createRailwayChartCanvas } = require('./services/railway-fix');
const fs = require('fs');

// Usar configuração específica para Railway
const chartJSNodeCanvas = createRailwayChartCanvas(800, 600);

async function testChart() {
  console.log('🧪 Testando renderização de gráfico com configuração Railway...');
  
  const config = {
    type: 'pie',
    data: {
      labels: ['Alimentacao', 'Transporte', 'Lazer', 'Saude'],
      datasets: [{
        data: [300, 150, 100, 80],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: 'Teste de Grafico Railway',
          font: {
            family: 'sans-serif',
            size: 14,
            weight: 'bold'
          },
          color: '#000000'
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              family: 'sans-serif',
              size: 11
            },
            color: '#000000'
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0,0,0,0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          titleFont: {
            family: 'sans-serif',
            size: 12,
            weight: 'bold'
          },
          bodyFont: {
            family: 'sans-serif',
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
    fs.writeFileSync('test-chart-railway.png', image);
    console.log('✅ Gráfico de teste Railway gerado com sucesso: test-chart-railway.png');
    console.log('📊 Verifique o arquivo para confirmar se labels e valores estão visíveis');
    console.log('🚀 Se este teste funcionar, o problema no Railway deve estar resolvido!');
  } catch (error) {
    console.error('❌ Erro ao gerar gráfico de teste Railway:', error.message);
    if (error.message.includes('Fontconfig')) {
      console.log('⚠️ Ainda há problema com fontconfig. Verifique a configuração.');
    }
  }
}

testChart(); 