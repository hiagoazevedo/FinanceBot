// config/config.js
require('dotenv').config();

const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  
  // Configurações do banco de dados
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-bot',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // Configurações da API do WhatsApp
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1/messages',
    apiToken: process.env.WHATSAPP_API_TOKEN || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'finance-bot-verify',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || ''
  }
};

module.exports = config;