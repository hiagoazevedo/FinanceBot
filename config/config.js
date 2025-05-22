module.exports = {
  server: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000
  },
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0',
    apiKey: process.env.WHATSAPP_API_KEY || 'seu_token_aqui'
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-bot'
  }
}; 