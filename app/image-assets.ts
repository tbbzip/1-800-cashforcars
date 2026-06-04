import type { Locale } from "./dictionaries";
import type { InternalPageKey } from "./internal-pages";

type LocalizedText = Record<Locale, string>;

export type SiteImageAsset = {
  alt: LocalizedText;
  description: LocalizedText;
  fit?: "contain" | "cover";
  height: number;
  kind: "mascot" | "scene";
  position?: string;
  src: string;
  title: LocalizedText;
  width: number;
};

function scene(
  src: string,
  title: LocalizedText,
  description: LocalizedText,
  alt: LocalizedText,
  position = "center",
): SiteImageAsset {
  return {
    alt,
    description,
    fit: "cover",
    height: 2500,
    kind: "scene",
    position,
    src,
    title,
    width: 2917,
  };
}

function mascot(
  src: string,
  title: LocalizedText,
  description: LocalizedText,
  alt: LocalizedText,
  width = 2900,
  height = 4267,
): SiteImageAsset {
  return {
    alt,
    description,
    fit: "contain",
    height,
    kind: "mascot",
    src,
    title,
    width,
  };
}

export const mascotImages = {
  cashCrash: mascot(
    "/mascot/raccoon-mascot-cash-red-crashed-car.webp",
    {
      en: "Mascot with a cash offer and damaged car",
      es: "Mascota con oferta en efectivo y carro dañado",
    },
    {
      en: "Use this mascot where the page explains damaged-car offers without making the tone feel too heavy.",
      es: "Usa esta mascota donde la página explica ofertas por carros dañados sin que el tono se sienta pesado.",
    },
    {
      en: "Cash For Cars raccoon mascot holding cash near a damaged red car",
      es: "Mascota de Cash For Cars con efectivo junto a un carro rojo dañado",
    },
    3338,
    2250,
  ),
  cashStack: mascot(
    "/mascot/raccoon-mascot-holding-cash-stack.webp",
    {
      en: "Mascot holding a stack of cash",
      es: "Mascota sosteniendo dinero",
    },
    {
      en: "Use this mascot around offer, payment, and call-to-action sections.",
      es: "Usa esta mascota en secciones de oferta, pago y llamadas a la acción.",
    },
    {
      en: "Cash For Cars raccoon mascot holding a stack of cash",
      es: "Mascota de Cash For Cars sosteniendo efectivo",
    },
  ),
  clipboardCar: mascot(
    "/mascot/raccoon-mascot-clipboard-yellow-classic-car.webp",
    {
      en: "Mascot checking vehicle details",
      es: "Mascota revisando datos del carro",
    },
    {
      en: "This fits pages about VIN lookup, first-step details, paperwork, and offer review.",
      es: "Funciona para páginas sobre VIN, primeros datos, papeleo y revisión de oferta.",
    },
    {
      en: "Cash For Cars raccoon mascot with clipboard beside a yellow car",
      es: "Mascota de Cash For Cars con clipboard junto a un carro amarillo",
    },
    3338,
    2250,
  ),
  homeHero: mascot(
    "/mascot/raccoon-mascot-cash-red-crashed-car.webp",
    {
      en: "Cash offer mascot with a crashed car",
      es: "Mascota con oferta en efectivo y carro chocado",
    },
    {
      en: "Use this as the homepage hero mascot when the page needs to immediately connect cash offers with damaged or unwanted cars.",
      es: "Usa esta como la mascota principal cuando la página debe conectar rápido las ofertas en efectivo con carros chocados o no deseados.",
    },
    {
      en: "Cash For Cars raccoon mascot holding cash next to a crashed red car",
      es: "Mascota de Cash For Cars sosteniendo efectivo junto a un carro rojo chocado",
    },
    3338,
    2250,
  ),
  locationGuide: mascot(
    "/mascot/raccoon-mascot-holding-raised-blank-sign.webp",
    {
      en: "Mascot holding a service-area sign",
      es: "Mascota sosteniendo letrero de área de servicio",
    },
    {
      en: "Use this mascot near San Diego County, locations, and service-area content.",
      es: "Usa esta mascota cerca de contenido de San Diego County, ubicaciones y áreas de servicio.",
    },
    {
      en: "Cash For Cars raccoon mascot holding a blank service-area sign",
      es: "Mascota de Cash For Cars sosteniendo un letrero de área de servicio",
    },
    2900,
    3606,
  ),
  mechanic: mascot(
    "/mascot/raccoon-mechanic-mascot-hardhat-wrench.webp",
    {
      en: "Mechanic mascot with wrench",
      es: "Mascota mecánica con llave",
    },
    {
      en: "Use this mascot where the page explains mechanical issues, repair problems, or why a car stopped running.",
      es: "Usa esta mascota donde la página explica problemas mecánicos, reparaciones o por qué un carro no prende.",
    },
    {
      en: "Raccoon mechanic mascot holding a wrench",
      es: "Mascota mecánica de mapache sosteniendo una llave",
    },
  ),
  offroadJeep: mascot(
    "/mascot/raccoon-mascot-with-offroad-jeep.webp",
    {
      en: "Mascot with an SUV",
      es: "Mascota con una SUV",
    },
    {
      en: "Use this mascot for truck, SUV, off-road, and larger-vehicle content.",
      es: "Usa esta mascota para contenido de trocas, SUVs, off-road y vehículos grandes.",
    },
    {
      en: "Cash For Cars raccoon mascot beside an off-road SUV",
      es: "Mascota de Cash For Cars junto a una SUV off-road",
    },
    3338,
    2250,
  ),
  pointingCash: mascot(
    "/mascot/raccoon-mascot-pointing-with-cash.webp",
    {
      en: "Mascot pointing to the offer",
      es: "Mascota señalando la oferta",
    },
    {
      en: "Use this mascot in CTA sections to point attention back to the offer form.",
      es: "Usa esta mascota en CTAs para dirigir la atención al formulario de oferta.",
    },
    {
      en: "Cash For Cars raccoon mascot pointing while holding cash",
      es: "Mascota de Cash For Cars señalando mientras sostiene efectivo",
    },
  ),
  thinking: mascot(
    "/mascot/raccoon-mascot-hand-on-chin-thinking.webp",
    {
      en: "Mascot thinking through questions",
      es: "Mascota pensando en preguntas",
    },
    {
      en: "Use this mascot around FAQ, title questions, or places where sellers may be unsure.",
      es: "Usa esta mascota cerca de preguntas frecuentes, dudas de título o puntos donde el vendedor no está seguro.",
    },
    {
      en: "Cash For Cars raccoon mascot thinking with hand on chin",
      es: "Mascota de Cash For Cars pensando con la mano en la barbilla",
    },
  ),
  wavingTool: mascot(
    "/mascot/raccoon-mascot-waving-with-tool.webp",
    {
      en: "Mascot waving with a tool",
      es: "Mascota saludando con herramienta",
    },
    {
      en: "Use this friendly mascot for pickup, help, and simple next-step moments.",
      es: "Usa esta mascota amigable para pickup, ayuda y momentos de siguiente paso.",
    },
    {
      en: "Cash For Cars raccoon mascot waving with a tool",
      es: "Mascota de Cash For Cars saludando con una herramienta",
    },
  ),
} satisfies Record<string, SiteImageAsset>;

export const sceneImages = {
  aerialSalvage: scene(
    "/scenes/aerial-view-salvage-yard-cars.webp",
    {
      en: "Aerial view of a salvage yard",
      es: "Vista aérea de una yarda de carros",
    },
    {
      en: "This works well for broad service, junk car, and local market pages because it shows many vehicles at once.",
      es: "Funciona para páginas de servicio general, carros para yonke y mercado local porque muestra muchos vehículos.",
    },
    {
      en: "Aerial view of cars in a salvage yard",
      es: "Vista aérea de carros en una yarda",
    },
  ),
  blueVanDent: scene(
    "/scenes/blue-van-rear-dent-damage.webp",
    {
      en: "Blue van with rear body damage",
      es: "Van azul con daño trasero",
    },
    {
      en: "Use this for realistic damaged vehicle, van, SUV, or work-vehicle sections.",
      es: "Usa esta imagen para secciones de carros dañados, vans, SUVs o vehículos de trabajo.",
    },
    {
      en: "Blue van with rear dent damage",
      es: "Van azul con golpe en la parte trasera",
    },
    "center",
  ),
  damagedYard: scene(
    "/scenes/damaged-cars-in-salvage-yard.webp",
    {
      en: "Damaged cars in a salvage yard",
      es: "Carros dañados en una yarda",
    },
    {
      en: "This supports pages about difficult vehicles, junk cars, damaged cars, and cars private buyers avoid.",
      es: "Apoya páginas sobre vehículos difíciles, carros para yonke, carros dañados y carros que compradores privados evitan.",
    },
    {
      en: "Damaged cars parked in a salvage yard",
      es: "Carros dañados estacionados en una yarda",
    },
  ),
  junkMissingWheel: scene(
    "/scenes/junk-car-missing-front-wheel.webp",
    {
      en: "Junk car missing a front wheel",
      es: "Carro para yonke sin una rueda delantera",
    },
    {
      en: "Use this for junk car, non-running, missing-parts, and pickup access content.",
      es: "Usa esta imagen para contenido de carros para yonke, carros que no prenden, partes faltantes y acceso para pickup.",
    },
    {
      en: "Junk car missing a front wheel",
      es: "Carro para yonke sin una rueda delantera",
    },
  ),
  muddyParkedCars: scene(
    "/scenes/muddy-parked-cars-closeup.webp",
    {
      en: "Parked cars in rough condition",
      es: "Carros estacionados en condición usada",
    },
    {
      en: "Use this for general used-car, older-car, and local parked-vehicle sections.",
      es: "Usa esta imagen para secciones generales de carros usados, carros viejos y vehículos estacionados.",
    },
    {
      en: "Muddy parked cars in rough condition",
      es: "Carros estacionados con lodo y uso visible",
    },
  ),
  muddyTailLight: scene(
    "/scenes/muddy-car-tail-light-closeup.webp",
    {
      en: "Close-up of an older car tail light",
      es: "Detalle de calavera de un carro usado",
    },
    {
      en: "Use this for close-up condition details when the page talks about wear, registration, or vehicle condition.",
      es: "Usa esta imagen para detalles de condición cuando la página habla de desgaste, registro o estado del carro.",
    },
    {
      en: "Close-up of a muddy car tail light",
      es: "Detalle de la calavera de un carro con lodo",
    },
  ),
  rearEndCollision: scene(
    "/scenes/rear-end-collision-smoking-cars.webp",
    {
      en: "Rear-end accident scene",
      es: "Choque por alcance",
    },
    {
      en: "Use sparingly for accident-related pages because it is more dramatic than the rest of the set.",
      es: "Úsala con cuidado en páginas de accidentes porque es más dramática que el resto de las imágenes.",
    },
    {
      en: "Rear-end collision with damaged cars",
      es: "Choque por alcance con carros dañados",
    },
  ),
  scrapedBumper: scene(
    "/scenes/scraped-front-bumper-damage-closeup.webp",
    {
      en: "Scraped front bumper close-up",
      es: "Detalle de defensa raspada",
    },
    {
      en: "Use this for repair-versus-sell content because it shows damage without feeling too severe.",
      es: "Usa esta imagen para contenido de reparar o vender porque muestra daño sin verse demasiado fuerte.",
    },
    {
      en: "Scraped front bumper damage close-up",
      es: "Detalle de daño en defensa delantera",
    },
  ),
  towSuv: scene(
    "/scenes/rear-damaged-suv-on-tow-truck.webp",
    {
      en: "Damaged SUV on a tow truck",
      es: "SUV dañada en una grúa",
    },
    {
      en: "Use this for pickup, towing, non-running, and vehicle handoff sections.",
      es: "Usa esta imagen para secciones de pickup, grúa, carros que no prenden y entrega del vehículo.",
    },
    {
      en: "Rear-damaged SUV loaded on a tow truck",
      es: "SUV con daño trasero subida a una grúa",
    },
  ),
  whiteVanCollision: scene(
    "/scenes/white-van-front-end-collision-damage.webp",
    {
      en: "White van with front-end collision damage",
      es: "Van blanca con daño frontal",
    },
    {
      en: "Use this for vans, work vehicles, collision damage, and repair estimate sections.",
      es: "Usa esta imagen para vans, vehículos de trabajo, choques y estimados de reparación.",
    },
    {
      en: "White van with front-end collision damage",
      es: "Van blanca con daño frontal por choque",
    },
    "center",
  ),
} satisfies Record<string, SiteImageAsset>;

export const homeCarsWeBuyImages = [
  sceneImages.junkMissingWheel,
  sceneImages.blueVanDent,
  sceneImages.towSuv,
  sceneImages.whiteVanCollision,
] satisfies SiteImageAsset[];

export const homeProcessMascots = [
  mascotImages.clipboardCar,
  mascotImages.cashStack,
  mascotImages.wavingTool,
] satisfies SiteImageAsset[];

type InternalPageImageSet = {
  hero: SiteImageAsset;
  sections: Partial<Record<string, SiteImageAsset>>;
};

export const internalPageImages: Record<InternalPageKey, InternalPageImageSet> = {
  howItWorks: {
    hero: sceneImages.towSuv,
    sections: {
      "vehicle-details": mascotImages.clipboardCar,
      "local-offer": mascotImages.cashStack,
      "pickup-payment": sceneImages.towSuv,
    },
  },
  carsWeBuy: {
    hero: sceneImages.aerialSalvage,
    sections: {
      "used-cars": sceneImages.muddyParkedCars,
      "problem-cars": sceneImages.damagedYard,
      "vehicle-types": sceneImages.whiteVanCollision,
    },
  },
  junkCars: {
    hero: sceneImages.junkMissingWheel,
    sections: {
      "what-counts": sceneImages.junkMissingWheel,
      "value-factors": sceneImages.muddyTailLight,
      pickup: sceneImages.towSuv,
    },
  },
  damagedCars: {
    hero: sceneImages.blueVanDent,
    sections: {
      "damage-types": sceneImages.rearEndCollision,
      "repair-vs-sell": sceneImages.scrapedBumper,
      "pickup-details": sceneImages.whiteVanCollision,
    },
  },
  nonRunningCars: {
    hero: sceneImages.towSuv,
    sections: {
      "why-it-does-not-run": mascotImages.mechanic,
      access: sceneImages.junkMissingWheel,
      paperwork: mascotImages.thinking,
    },
  },
  trucksSuvs: {
    hero: mascotImages.offroadJeep,
    sections: {
      "truck-value": mascotImages.offroadJeep,
      "work-vehicles": sceneImages.whiteVanCollision,
      "pickup-size": sceneImages.towSuv,
    },
  },
  titleHelp: {
    hero: mascotImages.clipboardCar,
    sections: {
      "lost-title": mascotImages.clipboardCar,
      "registration-issues": mascotImages.locationGuide,
      "loan-lien": mascotImages.thinking,
    },
  },
  sanDiegoCounty: {
    hero: sceneImages.aerialSalvage,
    sections: {
      "central-south": sceneImages.muddyParkedCars,
      "east-county": sceneImages.aerialSalvage,
      "north-county": sceneImages.blueVanDent,
    },
  },
  freeTowing: {
    hero: sceneImages.towSuv,
    sections: {
      "what-included": sceneImages.towSuv,
      "access-check": sceneImages.towSuv,
      "non-running": sceneImages.junkMissingWheel,
    },
  },
  faq: {
    hero: mascotImages.thinking,
    sections: {
      "before-offer": mascotImages.thinking,
      "after-offer": mascotImages.pointingCash,
    },
  },
};

export const missingSceneRecommendations = [
  "A clean VIN plate or odometer close-up for the lookup step.",
  "Car title, DMV registration, keys, and phone on a table with no personal data.",
  "A normal San Diego driveway, curb, or apartment-lot pickup scene.",
  "A clear pickup truck or SUV photo that is not illustrated and not crash-focused.",
  "A bilingual seller on a phone call or texting vehicle details for FAQ/help sections.",
  "A branded tow handoff scene with your actual logo or local San Diego background.",
];
