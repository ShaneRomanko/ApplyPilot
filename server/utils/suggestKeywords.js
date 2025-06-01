// utils/suggestKeywords.js
export function suggestKeywords(input) {
  const baseKeywords = input.toLowerCase().split(/\\s|,/).filter(Boolean);
  const suggestions = new Set();

  for (const word of baseKeywords) {
    if (word === 'marketing') {
      suggestions.add('digital marketing');
      suggestions.add('email marketing');
      suggestions.add('seo');
      suggestions.add('content strategist');
    } else if (word === 'sales') {
      suggestions.add('account executive');
      suggestions.add('business development');
      suggestions.add('inside sales');
    } else {
      suggestions.add(`${word} specialist`);
      suggestions.add(`${word} coordinator`);
    }
  }

  return [...suggestions];
}