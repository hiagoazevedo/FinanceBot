const twilio = require('twilio');
const config = require('../config/twilio');

const client = twilio(config.accountSid, config.authToken);

class TwilioService {
  static async sendMessage(to, message) {
    try {
      const response = await client.messages.create({
        body: message,
        from: `whatsapp:${config.whatsappNumber}`,
        to: `whatsapp:${to}`
      });
      
      console.log('✅ Mensagem enviada via Twilio:', response.sid);
      return response;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem via Twilio:', error);
      throw error;
    }
  }

  static async sendImage(to, imageUrl) {
    try {
      const response = await client.messages.create({
        mediaUrl: [imageUrl],
        from: `whatsapp:${config.whatsappNumber}`,
        to: `whatsapp:${to}`
      });
      
      console.log('✅ Imagem enviada via Twilio:', response.sid);
      return response;
    } catch (error) {
      console.error('❌ Erro ao enviar imagem via Twilio:', error);
      throw error;
    }
  }
}

module.exports = TwilioService; 