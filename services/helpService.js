class HelpService {
  static getHelpMessage() {
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

  static getUnknownCommandMessage() {
    return 'Não entendi sua mensagem. Para registrar uma despesa, use o formato "Descrição - R$ Valor #Categoria".\n' +
           'Exemplo: "Café da manhã - R$ 15,50 #Alimentacao"\n' +
           'A categoria é opcional. Se não informada, será "Outros".\n' +
           'Para obter ajuda, digite /ajuda.';
  }
}

module.exports = HelpService; 