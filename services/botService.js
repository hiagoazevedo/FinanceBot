class BotService {
  getHelp() {
    return `🤖 *Comandos disponíveis*\n\n` +
           `📝 *Gerenciamento de Despesas*\n` +
           `• /adicionar [valor] [descrição] [categoria]\n` +
           `  Exemplo: /adicionar 50.90 almoço alimentação\n\n` +
           `• /remover [ID]\n` +
           `  Exemplo: /remover 123456\n\n` +
           `• /ultimas [número]\n` +
           `  Exemplo: /ultimas 5\n\n` +
           `📊 *Relatórios*\n` +
           `• /relatorio [período]\n` +
           `  Períodos: mensal, semanal, anual\n` +
           `  Exemplo: /relatorio mensal\n\n` +
           `💰 *Orçamento*\n` +
           `• /orcamento [valor]\n` +
           `  Exemplo: /orcamento 1000\n\n` +
           `⚙️ *Configurações*\n` +
           `• /categorias\n` +
           `  Lista todas as categorias disponíveis\n\n` +
           `• /ajuda\n` +
           `  Mostra esta mensagem de ajuda\n\n` +
           `💡 *Dicas*\n` +
           `• Use /categorias para ver as categorias disponíveis\n` +
           `• O ID da despesa pode ser encontrado no relatório\n` +
           `• Você pode definir um orçamento mensal para controle\n` +
           `• Use /ultimas para ver suas despesas recentes`;
  }
}

module.exports = new BotService(); 