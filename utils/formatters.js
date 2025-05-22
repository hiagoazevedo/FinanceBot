const formatters = {
  currency: (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  },
  
  percentage: (value) => {
    return `${value.toFixed(1)}%`;
  },
  
  capitalizeFirstLetter: (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  normalizeText: (text) => {
    const lowerCase = text.toLowerCase();
    const words = lowerCase.split(' ');
    const smallWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas'];
    
    const capitalized = words.map(word => {
      if (smallWords.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    
    return capitalized.join(' ');
  }
};

module.exports = formatters; 