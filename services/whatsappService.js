const axios = require('axios');
const config = require('../config/config');
const fs = require('fs');

class WhatsAppService {
  constructor() {
    this.apiUrl = config.whatsapp.apiUrl;
    this.apiKey = config.whatsapp.apiKey;
  }

  async sendMessage(phoneNumber, message) {
    try {
      // Em ambiente de desenvolvimento, apenas logamos a mensagem
      if (config.server.env === 'development') {
        console.log(`[WHATSAPP SIMULADO] Para: ${phoneNumber}`);
        console.log(`Mensagem: ${message}`);
        return true;
      }

      // Em produção, enviaríamos para a API do WhatsApp
      const response = await axios.post(
        `${this.apiUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async sendImage(phoneNumber, imagePath) {
    try {
      // Em ambiente de desenvolvimento, apenas logamos a imagem
      if (config.server.env === 'development') {
        console.log(`[WHATSAPP SIMULADO] Para: ${phoneNumber}`);
        console.log(`Enviando imagem: ${imagePath}`);
        return true;
      }

      const formData = new FormData();
      formData.append('messaging_product', 'whatsapp');
      formData.append('to', phoneNumber);
      formData.append('type', 'image');
      formData.append('image', fs.createReadStream(imagePath));

      const response = await axios.post(
        `${this.apiUrl}/messages`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders()
          }
        }
      );

      // Limpar o arquivo temporário após o envio
      try {
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.error('Erro ao deletar arquivo temporário:', error);
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      throw error;
    }
  }
}

module.exports = WhatsAppService; 