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
    "Civic",
    "CR-V",
    "Accord",
    "Odyssey",
    "Pilot",
    "Ridgeline",
    "Jazz",
    "Fit",
    "BRV",
    "HR-V",
    "City",
    "Brio",
  ],
  Nissan: [
    "Altima",
    "Maxima",
    "Sentra",
    "Versa",
    "Murano",
    "Rogue",
    "Pathfinder",
    "Frontier",
    "Titan",
    "Kicks",
    "Juke",
  ],
  Mitsubishi: [
    "Lancer",
    "Outlander",
    "Pajero",
    "Triton",
    "Mirage",
    "Attrage",
    "Xpander",
    "Eclipse",
    "Grandis",
  ],
  Hyundai: [
    "Elantra",
    "i10",
    "i20",
    "Sonata",
    "Tucson",
    "Santa Fe",
    "Kona",
    "Venue",
    "Creta",
    "Ioniq",
  ],
  Kia: [
    "Cerato",
    "Forte",
    "Sportage",
    "Sorento",
    "Seltos",
    "Picanto",
    "Morning",
    "Niro",
    "Telluride",
  ],
  Ford: [
    "Fiesta",
    "Focus",
    "Fusion",
    "Mustang",
    "Explorer",
    "Edge",
    "Escape",
    "EcoSport",
    "Ranger",
    "F-150",
  ],
  Mazda: [
    "Mazda2",
    "Mazda3",
    "Mazda6",
    "CX-3",
    "CX-5",
    "CX-9",
    "MX-5",
    "Axela",
    "Atenza",
  ],
  BMW: [
    "3 Series",
    "5 Series",
    "7 Series",
    "X3",
    "X5",
    "X7",
    "1 Series",
    "2 Series",
    "M340i",
  ],
  Mercedes: [
    "C-Class",
    "E-Class",
    "S-Class",
    "A-Class",
    "GLC",
    "GLE",
    "GLA",
    "AMG C63",
    "AMG E63",
  ],
  Audi: ["A3", "A4", "A6", "A8", "Q3", "Q5", "Q7", "TT", "RS4"],
  Volkswagen: [
    "Golf",
    "Passat",
    "Jetta",
    "Tiguan",
    "Touareg",
    "Beetle",
    "Polo",
    "Amarok",
  ],
  Chevrolet: [
    "Cruze",
    "Trailblazer",
    "Traverse",
    "Equinox",
    "Malibu",
    "Spark",
    "Optra",
    "Aveo",
  ],
  Suzuki: [
    "Swift",
    "Vitara",
    "Ertiga",
    "Celerio",
    "Jimny",
    "Alto",
    "Baleno",
    "S-Cross",
  ],
  isuzu: ["D-Max", "MU-X", "Trooper", "Rodeo", "Axiom", "i-Mark"],
  Datsun: ["GO", "GO+", "Redi-GO", "mi-DO"],
  BYD: ["Qin", "Song", "Seagull", "Yuan Plus", "Atto 3", "F3"],
  Geely: ["Emgrand", "Binrui", "Boyue", "GX11", "Azkarra"],
  Changan: ["CS35", "CS55", "CS75", "Alsvin", "Raize"],
  JAC: ["S3", "S4", "T6", "T8", "iEV"],
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
