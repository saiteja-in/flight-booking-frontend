export enum Airline {
  AIR_INDIA = 'AIR_INDIA',
  EMIRATES = 'EMIRATES',
  INDIGO = 'INDIGO',
  SPICEJET = 'SPICEJET',
  VISTARA = 'VISTARA'
}

export enum Airport {
  DEL = 'DEL', // Delhi
  HYD = 'HYD', // Hyderabad
  BLR = 'BLR', // Bengaluru
  BOM = 'BOM', // Mumbai
  MAA = 'MAA', // Chennai
  CCU = 'CCU', // Kolkata
  GOI = 'GOI', // Goa
  AMD = 'AMD', // Ahmedabad
  PNQ = 'PNQ', // Pune
  COK = 'COK'  // Kochi
}

export const AIRLINE_OPTIONS = Object.values(Airline);
export const AIRPORT_OPTIONS = Object.values(Airport);

export const AIRPORT_NAMES: Record<Airport, string> = {
  [Airport.DEL]: 'Delhi',
  [Airport.HYD]: 'Hyderabad',
  [Airport.BLR]: 'Bengaluru',
  [Airport.BOM]: 'Mumbai',
  [Airport.MAA]: 'Chennai',
  [Airport.CCU]: 'Kolkata',
  [Airport.GOI]: 'Goa',
  [Airport.AMD]: 'Ahmedabad',
  [Airport.PNQ]: 'Pune',
  [Airport.COK]: 'Kochi'
};



