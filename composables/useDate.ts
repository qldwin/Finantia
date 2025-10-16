/**
 * Composable pour le formatage et la manipulation des dates
 * Centralise la logique de gestion des dates pour éviter la duplication de code
 */
export const useDate = () => {
  /**
   * Formate une date au format français
   * @param dateString - La date à formater (string ISO ou Date)
   * @param options - Options de formatage Intl.DateTimeFormat
   * @returns La date formatée
   */
  const format = (
    dateString: string | Date,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    if (!dateString) return '';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return 'Date invalide';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };

    return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(date);
  };

  /**
   * Formate une date au format court (JJ/MM/AAAA)
   * @param dateString - La date à formater
   * @returns La date au format court
   */
  const formatShort = (dateString: string | Date): string => {
    return format(dateString, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  /**
   * Formate une date avec l'heure
   * @param dateString - La date à formater
   * @returns La date avec l'heure
   */
  const formatWithTime = (dateString: string | Date): string => {
    return format(dateString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Retourne une date relative (aujourd'hui, hier, il y a X jours)
   * @param dateString - La date à formater
   * @returns La date relative
   */
  const formatRelative = (dateString: string | Date): string => {
    if (!dateString) return '';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
  };

  /**
   * Parse une date string en objet Date
   * @param dateString - La string à parser
   * @returns L'objet Date
   */
  const parse = (dateString: string): Date => {
    return new Date(dateString);
  };

  /**
   * Vérifie si une date est valide
   * @param dateString - La date à vérifier
   * @returns true si la date est valide
   */
  const isValid = (dateString: string | Date): boolean => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return !isNaN(date.getTime());
  };

  return {
    format,
    formatShort,
    formatWithTime,
    formatRelative,
    parse,
    isValid
  };
};
