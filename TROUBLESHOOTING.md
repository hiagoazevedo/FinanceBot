# Guia de Solução de Problemas - Renderização de Gráficos

## Problema: Labels e valores dos gráficos aparecem bugados/ilegíveis

### Sintomas
- Labels aparecem como blocos cinzas
- Valores monetários não são exibidos corretamente
- Texto empilhado ou sobreposto nos gráficos
- Gráficos funcionam localmente mas falham em produção

### Causa
Este é um problema conhecido com Chart.js 3.9.1 + chartjs-node-canvas 4.1.6 em ambientes cloud, especialmente Railway/Windows. O problema está relacionado à renderização de fontes em ambientes de produção.

### Soluções Implementadas

#### 1. Configuração de Fonte Robusta ✅
- Configuração explícita de Arial como fonte padrão
- Remoção de dependências de arquivos de configuração externos
- Configurações simplificadas para ambiente cloud

#### 2. Normalização de Texto ✅
- Função `normalizeLabel()` que remove acentos e caracteres especiais
- Limitação de tamanho de labels para evitar overflow
- Conversão para ASCII para compatibilidade máxima

#### 3. Configurações de Performance ✅
- Animações desabilitadas (não funcionam em servidor)
- Responsive desabilitado para renderização consistente
- Configurações de fonte explícitas em todos os elementos

### Soluções de Emergência

#### Opção 1: Limpar Cache do Railway
Se o problema persistir, adicione esta variável de ambiente no Railway:
```
NIXPACKS_NO_CACHE=1
```

Faça um novo deploy e depois remova a variável.

#### Opção 2: Teste Local
Execute o teste simples para verificar se o problema é local ou apenas em produção:
```bash
node test-chart-simple.js
```

#### Opção 3: Versões Alternativas (Futuro)
Para uma hospedagem melhor, considere atualizar para:
- Chart.js 4.x + chartjs-node-canvas 5.x (requer Node.js 18+)
- Ou migrar para uma hospedagem Linux (Heroku, DigitalOcean, etc.)

### Limitações Conhecidas

1. **Versão do Chart.js**: Estamos limitados ao Chart.js 3.9.1 devido à compatibilidade com chartjs-node-canvas 4.1.6
2. **Ambiente Windows**: Railway usa ambiente Windows que tem problemas conhecidos com renderização de canvas
3. **Fontes**: Dependemos de fontes do sistema, que podem variar entre ambientes

### Monitoramento

Para verificar se o problema foi resolvido:
1. Gere um gráfico via WhatsApp
2. Verifique se labels e valores estão legíveis
3. Teste diferentes tipos de gráfico (pizza, linha, barras)
4. Monitore logs para erros de renderização

### Próximos Passos

Quando migrar para uma hospedagem melhor:
1. Atualizar para Chart.js 4.x
2. Usar ambiente Linux
3. Implementar cache de imagens
4. Adicionar mais tipos de gráfico

---

**Nota**: Este é um problema temporário relacionado ao ambiente de hospedagem atual. As soluções implementadas devem resolver a maioria dos casos, mas para uma solução definitiva, recomenda-se migrar para uma hospedagem Linux com Chart.js 4.x. 