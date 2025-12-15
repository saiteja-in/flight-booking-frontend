export interface AirportOption {
  code: string;
  label: string;
}

export const AIRPORTS: AirportOption[] = [
  { code: 'DEL', label: 'Delhi (DEL)' },
  { code: 'HYD', label: 'Hyderabad (HYD)' },
  { code: 'BLR', label: 'Bengaluru (BLR)' },
  { code: 'BOM', label: 'Mumbai (BOM)' },
  { code: 'MAA', label: 'Chennai (MAA)' },
  { code: 'CCU', label: 'Kolkata (CCU)' },
  { code: 'GOI', label: 'Goa (GOI)' },
  { code: 'AMD', label: 'Ahmedabad (AMD)' },
  { code: 'PNQ', label: 'Pune (PNQ)' },
  { code: 'COK', label: 'Kochi (COK)' },
];
