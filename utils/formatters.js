const formatters = {
  currency: (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    
    try {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch (error) {
      // Fallback para formatação manual se toLocaleString falhar
      const formatted = value.toFixed(2).replace('.', ',');
      return `R$ ${formatted}`;
    }
  },
  
  // Versão simplificada para gráficos (sem símbolos especiais)
  currencySimple: (value) => {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    
    const formatted = value.toFixed(2).replace('.', ',');
    // Adicionar separadores de milhares
    const parts = formatted.split(',');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `R$ ${parts.join(',')}`;
  },
  
  percentage: (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '0,0%';
    return `${value.toFixed(1).replace('.', ',')}%`;
  },
  
  capitalizeFirstLetter: (string) => {
    if (!string || typeof string !== 'string') return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  normalizeText: (text) => {
    if (!text || typeof text !== 'string') return '';
    
    const lowerCase = text.toLowerCase();
    const words = lowerCase.split(' ');
    const smallWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas'];
    
    const capitalized = words.map(word => {
      if (smallWords.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    
    return capitalized.join(' ');
  },

  // Função para remover caracteres especiais que podem causar problemas
  sanitizeForChart: (text) => {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[çÇ]/g, 'c')
      .replace(/[ñÑ]/g, 'n')
      .replace(/[^\x00-\x7F]/g, '') // Remove caracteres não ASCII
      .trim();
  }
};

module.exports = formatters; 