import { CurrencyCode } from '../types';

export function formatCurrency(amount: number, currency: CurrencyCode = 'Ar'): string {
  // Format with space as thousand separator
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));
  const formattedNumber = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const sign = isNegative ? '-' : '';

  switch (currency) {
    case 'Ar':
      return `${sign}${formattedNumber} Ar`;
    case 'EUR':
      return `${sign}${formattedNumber} €`;
    case 'USD':
      return `${sign}$${formattedNumber}`;
    case 'FCFA':
      return `${sign}${formattedNumber} FCFA`;
    case 'GBP':
      return `${sign}£${formattedNumber}`;
    default:
      return `${sign}${formattedNumber} ${currency}`;
  }
}
