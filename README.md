# FinanceBot

Um chatbot de finanças pessoais integrado ao WhatsApp, desenvolvido em Node.js, Express e MongoDB, com deploy no Railway e integração via Twilio Sandbox.

## Funcionalidades
- Registro de despesas por mensagem no WhatsApp
- Relatórios e gráficos (pizza, linha, barras) dos gastos
- Configuração de orçamento mensal
- Edição e remoção de despesas
- Alertas de orçamento
- Interface de teste web local

## Tecnologias Utilizadas
- Node.js + Express
- MongoDB (Atlas)
- Twilio WhatsApp Sandbox
- Railway (deploy cloud)
- Chart.js + chartjs-node-canvas (geração de gráficos)

## Como rodar/testar

### 1. Clonar o projeto e instalar dependências
```bash
git clone <repo-url>
cd finance-bot
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` com:
```
MONGODB_URI=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
TWILIO_WHATSAPP_NUMBER=...
PUBLIC_URL=https://<seu-app>.up.railway.app
PORT=8080
```

### 3. Deploy no Railway
- Suba o projeto para o GitHub
- Conecte o repositório no Railway
- Configure as variáveis de ambiente
- O Railway irá buildar e rodar automaticamente

### 4. Configurar o Twilio Sandbox
- Acesse https://www.twilio.com/console/sms/whatsapp/sandbox
- Envie a mensagem de convite para o número do Sandbox
- Configure o webhook para: `https://<seu-app>.up.railway.app/webhook` (método POST)

### 5. Testar no WhatsApp
- Envie comandos como:
  - `Almoço - R$ 15,50 #Alimentação`
  - `/configurar orçamento 2000`
  - `gráfico pizza`
  - `/ultimas`
  - `/ajuda`

## O que já foi feito
- Integração completa com Twilio Sandbox e Railway
- Registro, edição e remoção de despesas flexível (aceita acentos, cedilha, variações de comando)
- Geração de gráficos e envio automático da imagem pelo WhatsApp
- Normalização de categorias e comandos para facilitar o uso
- Middleware de logs para debug
- Correção de problemas de deploy e variáveis de ambiente

## Problemas conhecidos / próximos passos
- **Problema nas labels dos gráficos:** As legendas e textos dos gráficos ainda aparecem bugados (com caracteres estranhos ou ilegíveis). Precisa de ajuste fino na normalização e configuração de fontes do Chart.js para ambiente cloud.
- Limite de mensagens do Twilio Sandbox pode impedir testes intensivos (aguardar reset diário ou usar outro número).
- Melhorar a experiência de edição de despesas e comandos avançados.
- (Opcional) Integrar com serviço externo de imagens (S3, Cloudinary) para maior robustez.

## Observações
- A pasta `/temp` não deve ser versionada (está no `.gitignore`), mas é criada automaticamente no Railway para armazenar os gráficos temporários.
- O projeto está pronto para ser retomado a qualquer momento: basta fazer push/pull e o Railway reativa o serviço.

---

**Bons estudos e até a próxima sessão de código!** 🚀 