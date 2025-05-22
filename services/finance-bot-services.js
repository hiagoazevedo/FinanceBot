// services/whatsappService.js
const axios = require('axios');

class WhatsAppService {
  constructor() {
    // Você pode configurar estes valores através de variáveis de ambiente
    this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1/messages';
    this.apiToken = process.env.WHATSAPP_API_TOKEN || 'seu-token-aqui';
  }
  
  async sendMessage(to, text) {
    try {
      // Integração com a API do WhatsApp Business
      // Nota: Esta é uma implementação simplificada, você precisará ajustar de acordo com a API real
      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",
          text: { body: text }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`Mensagem enviada para ${to}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem via WhatsApp:', error.message);
      throw error;
    }
  }
}

module.exports = WhatsAppService;