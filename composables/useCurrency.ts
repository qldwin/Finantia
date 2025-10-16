/**
 * Composable pour le formatage des devises
 * Centralise la logique de formatage monétaire pour éviter la duplication de code
 */
export const useCurrency = () => {
  /**
   * Formate un montant en euros (format français)
   * @param amount - Le montant à formater
   * @param locale - La locale à utiliser (défaut: 'fr-FR')
   * @param currency - La devise (défaut: 'EUR')
   * @returns Le montant formaté
   */
  const format = (
    amount: number | string,
    locale: string = 'fr-FR',
    currency: string = 'EUR'
  ): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      return '0,00 €';
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(numericAmount);
  };

  /**
   * Parse une string représentant une devise en nombre
   * @param currencyString - La string à parser (ex: "1 234,56 €")
   * @returns Le nombre parsé
   */
  const parse = (currencyString: string): number => {
    // Supprimer tous les espaces, symboles de devise et remplacer la virgule par un point
    const cleaned = currencyString
      .replace(/\s/g, '')
      .replace(/[€$£¥]/g, '')
      .replace(',', '.');

    return parseFloat(cleaned) || 0;
  };

  return {
    format,
    parse
  };
};
