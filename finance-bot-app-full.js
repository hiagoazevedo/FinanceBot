const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const moment = require('moment');
const mongoose = require('mongoose');
const config = require('./config/config');
const userService = require('./services/userService');
const financeService = require('./services/financeService');
const whatsAppService = require('./services/whatsappService');
const analyticsService = require('./services/analyticsService');
const Expense = require('./models/expense');
const formatters = require('./utils/formatters');
const DateService = require('./services/dateService');
const ExpenseValidator = require('./validators/expenseValidator');
const HelpService = require('./services/helpService');
const ChartConfigService = require('./services/chartConfigService');
const twilioService = require('./services/twilioService');

// Conectar ao MongoDB
mongoose.connect(config.mongodb.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Conectado ao MongoDB');
  console.log('📊 Banco de dados:', config.mongodb.uri);
})
.catch(err => {
  console.error('❌ Erro ao conectar ao MongoDB:', err);
  process.exit(1);
});

// Criar aplicação Express
const app = express();

// Configurar middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));

// Middleware global de log
app.use((req, res, next) => {
  console.log(`Recebido ${req.method} em ${req.path}`);
  next();
});

// Função para processar mensagens recebidas
async function processMessage(user, message) {
  console.log('📨 Processando mensagem:', message);
  console.log('👤 Usuário:', user.phoneNumber);

  // Comandos de análise
  const { startDate, endDate } = DateService.getPeriodDates('mensal');

  // Comandos especiais
  if (message.toLowerCase().startsWith('/relatorio')) {
    const parts = message.toLowerCase().split(' ');
    const period = parts.length > 1 ? parts[1] : 'mensal';
    const report = await financeService.generateReport(user, period);
    return {
      message: report,
      chartPath: null
    };
  }

  if (message.toLowerCase().startsWith('/configurar')) {
    const configResult = await processConfigCommand(user, message);
    return {
      message: configResult,
      chartPath: null
    };
  }

  if (message.toLowerCase().startsWith('/editar')) {
    const editResult = await processEditCommand(user, message);
    return {
      message: editResult,
      chartPath: null
    };
  }

  if (message.toLowerCase().startsWith('/apagar')) {
    const deleteResult = await processDeleteCommand(user, message);
    return {
      message: deleteResult,
      chartPath: null
    };
  }

  if (message.toLowerCase().startsWith('/ultimas')) {
    const lastExpenses = await showLastExpenses(user);
    return {
      message: lastExpenses,
      chartPath: null
    };
  }

  if (message.toLowerCase().startsWith('/ajuda')) {
    return {
      message: HelpService.getHelpMessage(),
      chartPath: null
    };
  }

  // Processar comandos de gráficos
  if (message.toLowerCase().includes('gráfico pizza')) {
    const { startDate, endDate } = DateService.getPeriodDates('mensal');
    const expenses = await Expense.find({
      userId: user.phoneNumber,
      date: { $gte: startDate, $lte: endDate }
    });

    if (expenses.length === 0) {
      return {
        message: '❌ Não há despesas registradas para gerar o gráfico.',
        chartPath: null
      };
    }

    try {
      const chartPath = await analyticsService.generatePieChart(expenses);
      if (config.server.env === 'production') {
        await whatsAppService.sendImage(user.phoneNumber, chartPath);
      }
      return {
        message: '📊 Gráfico de pizza gerado com sucesso!',
        chartPath
      };
    } catch (error) {
      console.error('Erro ao gerar gráfico de pizza:', error);
      return {
        message: '❌ Desculpe, ocorreu um erro ao gerar o gráfico. Por favor, tente novamente mais tarde.',
        chartPath: null
      };
    }
  }

  if (message.toLowerCase().includes('gráfico mensal')) {
    const { startDate, endDate } = DateService.getPeriodDates('mensal');
    const expenses = await Expense.find({
      userId: user.phoneNumber,
      date: { $gte: startDate, $lte: endDate }
    });

    if (expenses.length === 0) {
      return {
        message: '❌ Não há despesas registradas para gerar o gráfico.',
        chartPath: null
      };
    }

    try {
      const chartPath = await analyticsService.generateLineChart(expenses, user.monthlyBudget);
      if (config.server.env === 'production') {
        await whatsAppService.sendImage(user.phoneNumber, chartPath);
      }
      return {
        message: '📊 Gráfico mensal gerado com sucesso!',
        chartPath
      };
    } catch (error) {
      console.error('Erro ao gerar gráfico mensal:', error);
      return {
        message: '❌ Desculpe, ocorreu um erro ao gerar o gráfico. Por favor, tente novamente mais tarde.',
        chartPath: null
      };
    }
  }

  if (message.toLowerCase().includes('comparar meses')) {
    const { startDate, endDate } = DateService.getLastThreeMonths();

    const lastThreeMonthsExpenses = await Expense.find({
      userId: user.phoneNumber,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    if (lastThreeMonthsExpenses.length === 0) {
      return {
        message: '❌ Não há despesas registradas nos últimos 3 meses para gerar o gráfico.',
        chartPath: null
      };
    }

    try {
      // Agrupar despesas por mês
      const expensesByMonth = {};
      lastThreeMonthsExpenses.forEach(expense => {
        const month = moment(expense.date).format('YYYY-MM');
        if (!expensesByMonth[month]) {
          expensesByMonth[month] = [];
        }
        expensesByMonth[month].push(expense);
      });

      const chartPath = await analyticsService.generateBarChart(expensesByMonth);
      if (config.server.env === 'production') {
        await whatsAppService.sendImage(user.phoneNumber, chartPath);
      }
      return {
        message: '📊 Gráfico comparativo dos últimos 3 meses gerado com sucesso!',
        chartPath
      };
    } catch (error) {
      console.error('Erro ao gerar gráfico comparativo:', error);
      return {
        message: '❌ Desculpe, ocorreu um erro ao gerar o gráfico. Por favor, tente novamente mais tarde.',
        chartPath: null
      };
    }
  }

  // Verificar se a mensagem segue o padrão de registro de despesa
  const expenseData = ExpenseValidator.validateExpensePattern(message);

  if (expenseData) {
    const { description, value, category } = expenseData;
    
    console.log('💰 Registrando despesa:', {
      description,
      value,
      category,
      userId: user.phoneNumber
    });

    try {
      const expense = await financeService.addExpense(user.phoneNumber, description, value, category);
      console.log('✅ Despesa registrada:', expense);
      
      const budgetAlert = await financeService.checkBudgetAlert(user);
      
      if (budgetAlert) {
        return {
          message: `Despesa registrada: ${description} - ${formatters.currency(value)}` +
                   `\nCategoria: ${formatters.capitalizeFirstLetter(category)}` +
                   `\n\n${budgetAlert}`,
          chartPath: null
        };
      }
      
      return {
        message: `✅ Despesa registrada: ${description} - ${formatters.currency(value)}` +
                 `\nCategoria: ${formatters.capitalizeFirstLetter(category)}`,
        chartPath: null
      };
    } catch (error) {
      console.error('❌ Erro ao registrar despesa:', error);
      return {
        message: '❌ Erro ao registrar despesa. Por favor, tente novamente.',
        chartPath: null
      };
    }
  }

  // Mensagem não reconhecida
  return {
    message: HelpService.getUnknownCommandMessage(),
    chartPath: null
  };
}

// Webhook para receber mensagens do WhatsApp
app.post('/webhook', async (req, res) => {
  console.log('Body recebido:', req.body);

  // Responder rapidamente com OK
  res.status(200).send('OK');

  try {
    // Extrair dados do Twilio
    const from = req.body.From; // Ex: whatsapp:+5521964068620
    const msgBody = req.body.Body; // Ex: /ajuda

    if (!from || !msgBody) {
      console.log('Dados insuficientes no body.');
      return;
    }

    // Buscar ou criar usuário
    let user = await userService.findOrCreateUser(from);

    // Processar a mensagem
    const response = await processMessage(user, msgBody);

    // Enviar resposta de volta ao WhatsApp
    await twilioService.sendMessage(from.replace('whatsapp:', ''), response.message);

    // Se houver um gráfico e estivermos em produção, enviá-lo
    if (response.chartPath && config.server.env === 'production') {
      await twilioService.sendImage(from.replace('whatsapp:', ''), response.chartPath);
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
  }
});

// Rota para a interface de teste
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Finance Bot - Interface de Teste</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .chat-container {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        .message-history {
          height: 400px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 10px;
          margin-bottom: 10px;
          background-color: #f9f9f9;
        }
        .message {
          margin-bottom: 10px;
          padding: 8px 12px;
          border-radius: 15px;
          max-width: 80%;
        }
        .user-message {
          background-color: #dcf8c6;
          margin-left: auto;
        }
        .bot-message {
          background-color: #e8e8e8;
        }
        .input-container {
          display: flex;
          gap: 10px;
        }
        input[type="text"] {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        button {
          padding: 10px 20px;
          background-color: #25D366;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background-color: #128C7E;
        }
        .examples {
          margin-top: 20px;
        }
        .example-section {
          background-color: white;
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .example-section h3 {
          margin-top: 0;
          color: #128C7E;
        }
        .example-item {
          margin: 5px 0;
          padding: 8px;
          background-color: #f5f5f5;
          border-radius: 5px;
          cursor: pointer;
        }
        .example-item:hover {
          background-color: #e8e8e8;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <h1>Finance Bot - Interface de Teste</h1>
      
      <div class="chat-container">
        <div class="message-history" id="messageHistory"></div>
        
        <div class="input-container">
          <input type="text" id="messageInput" placeholder="Digite sua mensagem..." onkeypress="handleKeyPress(event)">
          <button onclick="sendMessage()">Enviar</button>
        </div>
      </div>

      <div class="examples">
        <div class="example-section">
          <h3>📝 Registrar Despesas</h3>
          <div class="example-item" onclick="useExample('Café da manhã - R$ 15,50 #Alimentacao')">Café da manhã - R$ 15,50 #Alimentacao</div>
          <div class="example-item" onclick="useExample('Uber - R$ 25,00 #Transporte')">Uber - R$ 25,00 #Transporte</div>
          <div class="example-item" onclick="useExample('Netflix - R$ 39,90 #Lazer')">Netflix - R$ 39,90 #Lazer</div>
        </div>

        <div class="example-section">
          <h3>📊 Relatórios e Configurações</h3>
          <div class="example-item" onclick="useExample('/relatorio')">/relatorio</div>
          <div class="example-item" onclick="useExample('/configurar orcamento 2000')">/configurar orcamento 2000</div>
        </div>

        <div class="example-section">
          <h3>✏️ Gerenciar Despesas</h3>
          <div class="example-item" onclick="useExample('/editar 1 Almoço - R$ 30,00 #Alimentacao')">/editar 1 Almoço - R$ 30,00 #Alimentacao</div>
          <div class="example-item" onclick="useExample('/apagar 1')">/apagar 1</div>
          <div class="example-item" onclick="useExample('/ultimas')">/ultimas</div>
        </div>

        <div class="example-section">
          <h3>📈 Análises e Gráficos</h3>
          <div class="example-item" onclick="useExample('gráfico pizza')">gráfico pizza</div>
          <div class="example-item" onclick="useExample('gráfico mensal')">gráfico mensal</div>
          <div class="example-item" onclick="useExample('comparar meses')">comparar meses</div>
        </div>

        <div class="example-section">
          <h3>❓ Ajuda</h3>
          <div class="example-item" onclick="useExample('/ajuda')">/ajuda</div>
        </div>
      </div>

      <script>
        const messageHistory = document.getElementById('messageHistory');
        const messageInput = document.getElementById('messageInput');
        let userId = 'test-user-' + Math.random().toString(36).substr(2, 9);

        function addMessage(message, isUser = false) {
          const messageDiv = document.createElement('div');
          messageDiv.className = \`message \${isUser ? 'user-message' : 'bot-message'}\`;
          
          // Se a mensagem contém um caminho de imagem, adicionar a imagem
          if (message.chartPath) {
            const img = document.createElement('img');
            img.src = message.chartPath;
            messageDiv.appendChild(img);
          }
          
          // Adicionar o texto da mensagem
          const textDiv = document.createElement('div');
          textDiv.textContent = message.message || message;
          messageDiv.appendChild(textDiv);
          
          messageHistory.appendChild(messageDiv);
          messageHistory.scrollTop = messageHistory.scrollHeight;
        }

        async function sendMessage() {
          const message = messageInput.value.trim();
          if (!message) return;

          addMessage(message, true);
          messageInput.value = '';

          try {
            const response = await fetch('/process-message', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ message, userId })
            });

            const data = await response.json();
            addMessage(data);
          } catch (error) {
            console.error('Erro:', error);
            addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.');
          }
        }

        function handleKeyPress(event) {
          if (event.key === 'Enter') {
            sendMessage();
          }
        }

        function useExample(example) {
          messageInput.value = example;
          messageInput.focus();
        }

        // Adicionar mensagem inicial
        addMessage('Olá! Sou o Finance Bot. Como posso ajudar você hoje?');
      </script>
    </body>
    </html>
  `);
});

// Rota para processar mensagens
app.post('/process-message', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // Criar ou buscar usuário de teste
    let user = await userService.findOrCreateUser(userId);
    
    // Processar a mensagem
    const response = await processMessage(user, message);
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    res.status(500).json({
      message: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
      chartPath: null
    });
  }
});

// Funções auxiliares
function getHelpMessage() {
  return `🤖 *Comandos Disponíveis*\n\n` +
         `📝 *Registrar Despesa*\n` +
         `• Formato: "Descrição - R$ Valor #Categoria"\n` +
         `• Exemplo: "Café da manhã - R$ 15,50 #Alimentacao"\n\n` +
         
         `📊 *Relatórios*\n` +
         `• /relatorio - Relatório mensal\n` +
         `• /relatorio semanal - Relatório da última semana\n` +
         `• /relatorio anual - Relatório do ano atual\n\n` +
         
         `💰 *Orçamento*\n` +
         `• /configurar orcamento R$ 1000 - Define orçamento mensal\n\n` +
         
         `📈 *Gráficos*\n` +
         `• "gráfico pizza" - Distribuição por categoria\n` +
         `• "gráfico mensal" - Evolução mensal\n` +
         `• "comparar meses" - Comparativo dos últimos 3 meses\n\n` +
         
         `✏️ *Edição*\n` +
         `• /editar ID "Nova descrição" - Edita descrição\n` +
         `• /editar ID R$ 50,00 - Edita valor\n` +
         `• /editar ID #NovaCategoria - Edita categoria\n` +
         `• /editar ID 25/12/2023 - Edita data\n\n` +
         
         `🗑️ *Exclusão*\n` +
         `• /apagar ID - Remove uma despesa\n\n` +
         
         `📋 *Consultas*\n` +
         `• /ultimas - Mostra últimas 5 despesas\n` +
         `• /ajuda - Mostra esta mensagem de ajuda\n\n` +
         
         `💡 *Dicas*\n` +
         `• Use categorias para organizar suas despesas\n` +
         `• Configure um orçamento para receber alertas\n` +
         `• Consulte os gráficos para visualizar seus gastos\n` +
         `• Use /relatorio para análises detalhadas`;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function processConfigCommand(user, message) {
  const parts = message.toLowerCase().split(' ');
  if (parts.length < 3) {
    return '❌ *Formato inválido*\n\n' +
           'Use: /configurar orcamento VALOR\n\n' +
           'Exemplo: /configurar orcamento 2000';
  }

  const command = parts[1];
  const value = parseFloat(parts[2].replace(',', '.'));

  if (isNaN(value) || value <= 0) {
    return '❌ *Valor inválido*\n\n' +
           'Por favor, informe um número positivo.';
  }

  switch (command) {
    case 'orcamento':
      await userService.updateUserBudget(user.phoneNumber, value);
      return '✅ *Orçamento Configurado*\n\n' +
             `💰 Valor: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    default:
      return '❌ *Comando não reconhecido*\n\n' +
             'Use: /configurar orcamento VALOR\n\n' +
             'Exemplo: /configurar orcamento 2000';
  }
}

async function processEditCommand(user, message) {
  const parts = message.split(' ');
  if (parts.length < 3) {
    return '❌ *Formato inválido*\n\n' +
           'Use: /editar ID "Nova descrição - R$ Novo valor #Nova categoria"\n\n' +
           'Exemplo: /editar 1 "Almoço - R$ 30,00 #Alimentacao"';
  }

  const expenseId = parts[1];
  const newDescription = message.substring(message.indexOf('"') + 1, message.lastIndexOf('"'));

  if (!newDescription) {
    return '❌ *Formato inválido*\n\n' +
           'Use: /editar ID "Nova descrição - R$ Novo valor #Nova categoria"\n\n' +
           'Exemplo: /editar 1 "Almoço - R$ 30,00 #Alimentacao"';
  }

  const expensePattern = /^(.+?)\s*-\s*R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)(?:\s*#\s*(\w+))?$/i;
  const match = newDescription.match(expensePattern);

  if (!match) {
    return '❌ *Formato inválido*\n\n' +
           'Use: "Descrição - R$ Valor #Categoria"\n\n' +
           'Exemplo: "Almoço - R$ 30,00 #Alimentacao"';
  }

  const description = match[1].trim();
  const valueStr = match[2].replace(/\./g, '').replace(',', '.');
  const value = parseFloat(valueStr);
  const category = match[3] ? match[3].toLowerCase() : 'outros';

  try {
    // Verificar se a despesa existe e pertence ao usuário
    const existingExpense = await Expense.findOne({ _id: expenseId, userId: user.phoneNumber });
    if (!existingExpense) {
      return '❌ *Erro ao atualizar*\n\n' +
             'Despesa não encontrada ou não pertence a você.';
    }

    const updatedExpense = await financeService.editExpense(expenseId, user.phoneNumber, {
      description,
      value,
      category
    });

    return '✅ *Despesa Atualizada*\n\n' +
           `📝 Descrição: ${description}\n` +
           `💰 Valor: ${formatters.currency(value)}\n` +
           `📋 Categoria: ${formatters.capitalizeFirstLetter(category)}`;
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    return '❌ *Erro ao atualizar*\n\n' +
           'Verifique o ID e tente novamente.';
  }
}

async function processDeleteCommand(user, message) {
  const parts = message.split(' ');
  if (parts.length !== 2) {
    return '❌ *Formato inválido*\n\n' +
           'Use: /apagar ID\n\n' +
           'Exemplo: /apagar 1';
  }

  const expenseId = parts[1];

  try {
    await financeService.deleteExpense(expenseId, user.phoneNumber);
    return '✅ *Despesa Removida*\n\n' +
           'A despesa foi removida com sucesso.';
  } catch (error) {
    return '❌ *Erro ao remover*\n\n' +
           'Verifique o ID e tente novamente.';
  }
}

async function showLastExpenses(user) {
  try {
    const expenses = await financeService.getLastExpenses(user);
    
    if (expenses.length === 0) {
      return '📝 *Últimas Despesas*\n\nNenhuma despesa registrada.';
    }

    let message = '📝 *Últimas Despesas*\n\n';
    
    expenses.forEach((expense, index) => {
      message += `*${index + 1}. ${expense.description}*\n` +
                `  📅 ${moment(expense.date).format('DD/MM/YYYY')}\n` +
                `  💰 R$ ${expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
                `  📋 ${capitalizeFirstLetter(expense.category)}\n` +
                `  🆔 ${expense._id}\n\n`;
    });

    message += '💡 Use o ID para editar ou apagar uma despesa.';
    
    return message;
  } catch (error) {
    console.error('Erro ao buscar últimas despesas:', error);
    return '❌ Erro ao buscar últimas despesas.';
  }
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${config.server.env}`);
  console.log(`Interface de teste disponível em: http://localhost:${PORT}/test`);
});

app.get('/', (req, res) => {
  res.send('Finance Bot está rodando!');
});

app.all('*', (req, res) => {
  res.status(404).send(`Rota não encontrada: ${req.method} ${req.path}`);
}); 