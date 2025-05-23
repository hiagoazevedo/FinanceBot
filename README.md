# Finance Bot - WhatsApp

Bot de finanças pessoais para WhatsApp que permite registrar despesas, gerar relatórios e visualizar gráficos de gastos.

## Funcionalidades

- 📝 **Registro de Despesas**: Registre gastos com descrição, valor e categoria
- 📊 **Relatórios Detalhados**: Relatórios mensais, semanais e anuais
- 📈 **Gráficos Visuais**: Gráficos de pizza, linha e barras para visualização de dados
- 💰 **Controle de Orçamento**: Defina orçamentos mensais e receba alertas
- ✏️ **Edição de Despesas**: Edite descrição, valor, categoria e data
- 🗑️ **Exclusão de Despesas**: Remova despesas registradas
- 📋 **Consultas Rápidas**: Visualize últimas despesas e resumos

## Melhorias Recentes - Gráficos Otimizados

### Problemas Resolvidos
- **✅ Labels e números bugados**: Implementada normalização robusta de texto
- **✅ Caracteres especiais**: Remoção automática de acentos e caracteres problemáticos
- **✅ Fontes não renderizadas**: Configuração de fontes padrão e fallbacks
- **✅ Erros de renderização**: Sistema de retry com tratamento de erros
- **✅ Performance melhorada**: Desabilitação de animações e configurações otimizadas

### Novas Funcionalidades dos Gráficos
- **🔄 Sistema de Retry**: Até 3 tentativas de renderização em caso de falha
- **🎨 Normalização de Labels**: Remoção automática de caracteres especiais
- **💰 Formatação Monetária Robusta**: Valores sempre exibidos corretamente
- **⚙️ Configurações Centralizadas**: Arquivo de configuração para gráficos
- **📊 Validação de Dados**: Verificação de dados antes da renderização
- **🚀 Performance Otimizada**: Configurações específicas para ambiente de produção

## Comandos Disponíveis

### Registrar Despesa
```
Café da manhã - R$ 15,50 #Alimentacao
Uber - R$ 25,00 #Transporte
Supermercado - R$ 120,00 #Alimentacao
```

### Relatórios
- `/relatorio` - Relatório mensal
- `/relatorio semanal` - Relatório da última semana
- `/relatorio anual` - Relatório do ano atual

### Gráficos
- `gráfico pizza` - Distribuição por categoria
- `gráfico mensal` - Evolução mensal dos gastos
- `comparar meses` - Comparativo dos últimos 3 meses

### Orçamento
- `/configurar orcamento R$ 1000` - Define orçamento mensal

### Edição
- `/editar ID "Nova descrição"` - Edita descrição
- `/editar ID R$ 50,00` - Edita valor
- `/editar ID #NovaCategoria` - Edita categoria
- `/editar ID 25/12/2023` - Edita data

### Outras Consultas
- `/ultimas` - Mostra últimas 5 despesas
- `/ajuda` - Mostra mensagem de ajuda
- `/apagar ID` - Remove uma despesa

## Tecnologias Utilizadas

- **Node.js 20.x** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados
- **Twilio** - API do WhatsApp
- **Chart.js 3.9.1** - Geração de gráficos
- **chartjs-node-canvas** - Renderização server-side
- **Moment.js** - Manipulação de datas
- **Lodash** - Utilitários JavaScript

## Configuração

### Variáveis de Ambiente
```env
MONGODB_URI=mongodb://localhost:27017/finance-bot
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
PORT=3000
PUBLIC_URL=https://your-app.railway.app
```

### Instalação
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Executar em produção
npm start
```

## Estrutura do Projeto

```
finance-bot/
├── config/
│   ├── database.js          # Configuração do MongoDB
│   └── chartConfig.js       # Configurações dos gráficos
├── models/
│   ├── User.js             # Modelo do usuário
│   └── Expense.js          # Modelo da despesa
├── services/
│   ├── analyticsService.js  # Geração de gráficos e análises
│   ├── chartConfigService.js # Configuração de gráficos
│   ├── financeService.js    # Lógica de finanças
│   ├── twilioService.js     # Integração com Twilio
│   ├── dateService.js       # Manipulação de datas
│   └── helpService.js       # Mensagens de ajuda
├── utils/
│   └── formatters.js        # Formatação de dados
├── validators/
│   └── expenseValidator.js  # Validação de despesas
├── temp/                    # Gráficos temporários
└── finance-bot-app-full.js # Aplicação principal
```

## Configurações de Gráficos

### Arquivo de Configuração (`config/chartConfig.js`)
```javascript
const chartConfig = {
  rendering: {
    width: 800,
    height: 600,
    backgroundColour: 'white'
  },
  fonts: {
    primary: 'Arial, Helvetica, sans-serif',
    sizes: {
      title: 18,
      legend: 12,
      axis: 11,
      tooltip: 12
    }
  },
  performance: {
    animation: false,
    responsive: false,
    maxRetries: 3
  }
};
```

### Normalização de Texto
- Remove acentos e caracteres especiais
- Converte para ASCII seguro
- Limita tamanho de labels
- Formatação monetária robusta

## Deploy

### Railway
O projeto está configurado para deploy automático no Railway:

1. Conecte o repositório ao Railway
2. Configure as variáveis de ambiente
3. O deploy acontece automaticamente a cada push

### Configurações de Produção
- Gráficos otimizados para ambiente serverless
- Sistema de retry para renderização
- Logs detalhados para debugging
- Configurações de performance aplicadas

## Problemas conhecidos / próximos passos

- ✅ **Problema nas labels dos gráficos**: RESOLVIDO - Implementada normalização robusta e configurações otimizadas
- Limite de mensagens do Twilio Sandbox pode impedir testes intensivos
- Melhorar a experiência de edição de despesas e comandos avançados
- (Opcional) Integrar com serviço externo de imagens (S3, Cloudinary)

## Compatibilidade e Versões

### Chart.js 3.9.1
O projeto utiliza Chart.js 3.9.1 devido à compatibilidade com `chartjs-node-canvas@4.1.6` no ambiente Railway com Node.js 20.x. Esta versão garante:

- ✅ Compatibilidade total com Railway
- ✅ Renderização estável de gráficos
- ✅ Suporte completo a todas as funcionalidades implementadas

### Dependências Principais
```json
{
  "chart.js": "^3.9.1",
  "chartjs-node-canvas": "^4.1.6",
  "canvas": "^2.11.2",
  "node": "20.x"
}
```

### Teste das Configurações
Para testar se os gráficos estão funcionando corretamente:
```bash
node test-chart.js
```

## Observações

- A pasta `/temp` não deve ser versionada (está no `.gitignore`), mas é criada automaticamente no Railway
- Os gráficos são gerados com sistema de retry para maior confiabilidade
- Configurações específicas para ambiente de produção aplicadas automaticamente
- Normalização de texto implementada para evitar problemas de renderização
- **Importante**: Versão do Chart.js fixada em 3.9.1 para compatibilidade com Railway

---

**Projeto otimizado e pronto para produção!** 🚀 