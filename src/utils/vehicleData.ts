/**
 * Vehicle Data
 * Contains common vehicle makes and models for suggestion autocomplete
 */

export const vehicleDatabase: Record<string, string[]> = {
  Toyota: [
    "Altis",
    "Corolla",
    "Camry",
    "Avanza",
    "Rush",
    "Vios",
    "Innova",
    "Fortuner",
    "Land Cruiser",
    "Highlander",
    "RAV4",
    "Yaris",
    "Hiace",
  ],
  Honda: [
    "Click 125i",
    "Click 150i",
    "Click 160",
    "Beat",
    "PCX 160",
    "ADV 160",
    "TMX 125 Alpha",
    "TMX Supremo",
    "Wave RSX",
    "XRM 125 DS",
    "Supra GTR 150",
    "CBR150R",
    "CRF150L",
    "Civic",
    "CR-V",
    "Accord",
    "City",
    "Brio",
    "HR-V",
    "BRV",
    "Jazz",
    "Pilot",
    "Odyssey",
  ],
  Yamaha: [
    "Sniper 155",
    "Sniper 150",
    "Mio i 125",
    "Mio Sporty",
    "Mio Soul i 125",
    "Mio Gravis",
    "Mio Gear",
    "Mio Fazzio",
    "Aerox 155",
    "NMAX 155",
    "XMAX 300",
    "YZF-R15",
    "MT-15",
    "TFX 150",
    "Vega Force i",
    "Sight",
    "Fazzio",
    "Gravis",
  ],
  Kawasaki: [
    "Barako II",
    "Rouser NS125",
    "Rouser NS160",
    "Rouser NS200",
    "Rouser RS200",
    "Dominar 400",
    "Ninja 400",
    "Ninja ZX-25R",
    "Ninja ZX-6R",
    "W175",
    "Eliminator",
    "Vulcan S",
    "Z400",
    "Z900",
    "Fury 125",
  ],
  Nissan: [
    "Navara",
    "Terra",
    "Almera",
    "Urvan",
    "Patrol",
    "Altima",
    "Sentra",
    "Kicks",
    "Juke",
  ],
  Mitsubishi: [
    "Montero Sport",
    "L300",
    "Mirage G4",
    "Xpander",
    "Triton",
    "Strada",
    "Pajero",
    "Outlander",
    "Lancer",
  ],
  Hyundai: [
    "Staria",
    "Stargazer",
    "Creta",
    "Tucson",
    "Santa Fe",
    "Ioniq 5",
    "Ioniq 6",
    "Elantra",
    "Accent",
    "Eon",
  ],
  Kia: [
    "Stonic",
    "Seltos",
    "Sportage",
    "Sorento",
    "Carnival",
    "Soluto",
    "Picanto",
    "Rio",
    "K2500",
  ],
  Ford: [
    "Ranger Raptor",
    "Next-Gen Ranger",
    "Next-Gen Everest",
    "Territory",
    "Explorer",
    "Mustang",
    "F-150",
    "EcoSport",
    "Fiesta",
  ],
  Mazda: [
    "Mazda2",
    "Mazda3",
    "Mazda6",
    "CX-3",
    "CX-30",
    "CX-5",
    "CX-60",
    "CX-8",
    "CX-9",
    "MX-5",
  ],
  BMW: [
    "3 Series",
    "5 Series",
    "7 Series",
    "X1",
    "X3",
    "X5",
    "X7",
    "Z4",
    "M3",
    "M5",
  ],
  Mercedes: [
    "A-Class",
    "C-Class",
    "E-Class",
    "S-Class",
    "GLA",
    "GLB",
    "GLC",
    "GLE",
    "GLS",
    "G-Class",
  ],
  Audi: ["A1", "A3", "A4", "A6", "Q2", "Q3", "Q5", "Q7", "Q8", "e-tron"],
  Volkswagen: ["Santana", "Lavida", "Lamando", "T-Cross", "Multivan"],
  Chevrolet: ["Suburban", "Tahoe", "Traverse", "Camaro", "Corvette", "Tracker"],
  Suzuki: [
    "Raider R150 Fi",
    "Raider R150 Carb",
    "Smash 115",
    "Burgman Street",
    "Skydrive Sport",
    "S-Presso",
    "Ertiga",
    "Jimny",
    "Dzire",
    "Swift",
    "Celerio",
    "Carry",
    "Vitara",
  ],
  isuzu: ["D-Max", "MU-X", "Traviz", "N-Series", "F-Series"],
  Datsun: ["GO", "GO+", "Redi-GO"],
  BYD: ["Atto 3", "Dolphin", "Han", "Tang"],
  Geely: ["Coolray", "Emgrand", "Okavango", "Azkarra", "Tugella"],
  Changan: ["Alsvin", "CS35 Plus", "CS55 Plus", "Uni-T", "Uni-K"],
  JAC: ["JS2", "JS4", "JS6", "JS8", "T8"],
  KTM: ["Duke 200", "Duke 390", "RC 200", "RC 390", "Adventure 390"],
  Vespa: ["Primavera", "Sprint", "GTS 300", "S 125"],
};

/**
 * Get all vehicle makes (sorted)
 */
export const getVehicleMakes = (): string[] => {
  return Object.keys(vehicleDatabase).sort();
};

/**
 * Get models for a specific make
 */
export const getVehicleModels = (make: string): string[] => {
  return vehicleDatabase[make] || [];
};

/**
 * Filter makes based on search input
 */
export const filterMakes = (input: string): string[] => {
  if (!input.trim()) return getVehicleMakes();

  const searchTerm = input.toLowerCase();
  return getVehicleMakes().filter((make) =>
    make.toLowerCase().includes(searchTerm),
  );
};

/**
 * Filter models based on search input and selected make
 */
export const filterModels = (make: string, input: string): string[] => {
  if (!make) return [];

  const models = getVehicleModels(make);
  if (!input.trim()) return models;

  const searchTerm = input.toLowerCase();
  return models.filter((model) => model.toLowerCase().includes(searchTerm));
};
