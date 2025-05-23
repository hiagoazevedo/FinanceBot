# Guia de Solução de Problemas - Renderização de Gráficos

## Problema: Labels e valores dos gráficos aparecem bugados/ilegíveis

### Sintomas
- Labels aparecem como blocos cinzas
- Valores monetários não são exibidos corretamente
- Texto empilhado ou sobreposto nos gráficos
- Gráficos funcionam localmente mas falham em produção
- **Erro nos logs**: `Fontconfig error: Cannot load default config file`

### Causa Real ✅
O problema **NÃO é** com as versões do Chart.js, mas sim com a **ausência do pacote `fontconfig`** no ambiente Railway. O erro `Fontconfig error: Cannot load default config file` indica que o Railway não tem o fontconfig instalado, que é necessário para renderização de fontes customizadas.

### Soluções Implementadas ✅

#### 1. Configuração Específica para Railway ✅
- Criado arquivo `services/railway-fix.js` com configurações que não dependem do fontconfig
- Uso de fonte genérica `sans-serif` que sempre existe em qualquer sistema
- Remoção de tentativas de registro de fontes customizadas

#### 2. AnalyticsService Atualizado ✅
- Removido método `registerDefaultFont()` que causava problemas
- Implementada configuração específica para Railway
- Logs melhorados para identificar problemas

#### 3. ChartConfigService Simplificado ✅
- Configurações básicas usando apenas fontes genéricas
- Cores sólidas para melhor contraste
- Configurações que funcionam em qualquer ambiente

### Como Testar

#### Teste Local
Execute o teste para verificar se a configuração está funcionando:
```bash
node test-chart-simple.js
```

Se o teste gerar `test-chart-railway.png` sem erros de fontconfig, a solução está funcionando.

### Soluções de Emergência

#### Opção 1: Limpar Cache do Railway
Se ainda houver problemas, adicione esta variável de ambiente no Railway:
```
NIXPACKS_NO_CACHE=1
```

Faça um novo deploy e depois remova a variável.

#### Opção 2: Verificar Logs
Procure por estes indicadores nos logs:
- ✅ `ChartJS configurado para Railway (sem fontconfig)` - Configuração correta
- ❌ `Fontconfig error: Cannot load default config file` - Problema ainda presente

### Arquivos Modificados

1. **`services/railway-fix.js`** - Nova configuração específica para Railway
2. **`services/AnalyticsService.js`** - Atualizado para usar nova configuração
3. **`services/chartConfigService.js`** - Simplificado para fontes genéricas
4. **`test-chart-simple.js`** - Teste atualizado

### Limitações Conhecidas

1. **Fontes**: Limitado a fontes genéricas do sistema (`sans-serif`)
2. **Ambiente**: Solução específica para Railway e ambientes sem fontconfig
3. **Estilo**: Aparência mais básica, mas funcional

### Monitoramento

Para verificar se o problema foi resolvido:
1. Verificar logs de deploy - não deve haver erro de fontconfig
2. Gerar um gráfico via WhatsApp
3. Verificar se labels e valores estão legíveis
4. Testar diferentes tipos de gráfico (pizza, linha, barras)

### Próximos Passos

Quando migrar para uma hospedagem melhor (com fontconfig):
1. Reverter para configurações com fontes customizadas
2. Atualizar para Chart.js 4.x
3. Implementar cache de imagens
4. Adicionar mais tipos de gráfico

---

**Nota**: O problema era específico do ambiente Railway que não possui fontconfig instalado. As soluções implementadas resolvem definitivamente o problema usando apenas recursos disponíveis no Railway. 