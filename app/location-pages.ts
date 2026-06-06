import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";
import type { Locale } from "./dictionaries";
import { getLocationPath, toLocationSlug } from "./location-paths";

export type LocationPageKind = "city" | "san-diego-area";

export type LocationPageRecord = {
  kind: LocationPageKind;
  name: string;
  slug: string;
  groupTitle: string;
  groupIndex: number;
  groupAreas: string[];
};

export type LocationSection = {
  title: string;
  body: string[];
  bullets?: string[];
};

export type LocationPageContent = {
  badge: string;
  title: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  routeNote: string;
  proofPoints: string[];
  sections: LocationSection[];
  faq: {
    question: string;
    answer: string;
  }[];
  nearbyTitle: string;
  nearbyBody: string;
  nearbyLinks: {
    label: string;
    href: string;
  }[];
};

const cityGroups = en.serviceAreas.items.map((group, index) => ({
  kind: "city" as const,
  group,
  index,
}));

const sanDiegoAreaGroups = en.sanDiegoAreas.groups.map((group, index) => ({
  kind: "san-diego-area" as const,
  group,
  index,
}));

export const locationPages: LocationPageRecord[] = [
  ...cityGroups.flatMap(({ group, index, kind }) =>
    group.areas.map((name) => ({
      kind,
      name,
      slug: toLocationSlug(name),
      groupTitle: group.title,
      groupIndex: index,
      groupAreas: group.areas,
    })),
  ),
  ...sanDiegoAreaGroups.flatMap(({ group, index, kind }) =>
    group.areas.map((name) => ({
      kind,
      name,
      slug: toLocationSlug(name),
      groupTitle: group.title,
      groupIndex: index,
      groupAreas: group.areas,
    })),
  ),
];

export function getLocationPages() {
  return locationPages;
}

export function getLocationPageBySlug(slug: string) {
  return locationPages.find((page) => page.slug === slug);
}

function getLocalizedGroupTitle(page: LocationPageRecord, locale: Locale) {
  const dictionary = locale === "es" ? es : en;
  return page.kind === "city"
    ? dictionary.serviceAreas.items[page.groupIndex]?.title ?? page.groupTitle
    : dictionary.sanDiegoAreas.groups[page.groupIndex]?.title ?? page.groupTitle;
}

function nearbyLinks(page: LocationPageRecord, locale: Locale) {
  return page.groupAreas
    .filter((name) => name !== page.name)
    .slice(0, 5)
    .map((name) => ({
      label: name,
      href: getLocationPath(locale, name),
    }));
}

function englishCityContent(page: LocationPageRecord): LocationPageContent {
  const nearby = nearbyLinks(page, "en");

  return {
    badge: `${page.groupTitle} service area`,
    title: `Cash for cars in ${page.name}.`,
    intro: `Sell your used, junk, damaged, or non-running car in ${page.name} with a local San Diego County offer. Start with your VIN, share the condition, and we can review pickup or standard towing if we buy it.`,
    metaTitle: `Cash for Cars in ${page.name} | Local San Diego County Offers`,
    metaDescription: `Sell your car for cash in ${page.name}. We review used, junk, damaged, and non-running vehicles with local pickup or standard towing included when we buy.`,
    routeNote: `${page.name} is part of our ${page.groupTitle} service area. Vehicle condition, paperwork, and access details help us plan the next step.`,
    proofPoints: [
      `${page.name} local cash offers`,
      "VIN lookup to start",
      "Junk, damaged, and non-running cars reviewed",
      "Pickup or standard towing included when we buy",
    ],
    sections: [
      {
        title: `Selling a car in ${page.name} should be straightforward.`,
        body: [
          `${page.name} sellers often contact us when a private sale is taking too long, the car has repair needs, or the vehicle is sitting unused. We keep the process focused on the details that affect the offer: year, make, model, mileage, condition, title status, and pickup location.`,
          "The first step is simple. Use the VIN lookup, then continue with condition and paperwork details so the offer and pickup plan match the actual car.",
        ],
        bullets: [
          "Used cars and older daily drivers",
          "Junk cars or failed-smog vehicles",
          "Damaged or accident vehicles",
          "Cars that do not start or need towing",
        ],
      },
      {
        title: `Pickup planning in ${page.name}.`,
        body: [
          `If we buy the vehicle, standard pickup or towing is included for eligible cars in ${page.name}. Access details matter, especially for apartment lots, gated communities, repair shops, tow yards, street parking, or tight driveways.`,
          "Tell us early if the vehicle has flat tires, missing keys, locked steering, no wheels, blocked access, or release requirements. Those details help prevent delays.",
        ],
        bullets: [
          "Home, apartment, shop, or workplace pickup",
          "Street parking and gated access reviewed",
          "Tow-yard release details can be discussed",
          "No separate tow truck needed when standard pickup applies",
        ],
      },
      {
        title: `Why ${page.name} sellers use a local buyer.`,
        body: [
          "A national estimate does not always understand local pickup logistics or cars with real issues. A local review can account for San Diego County demand, condition, missing parts, paperwork, and where the vehicle is parked.",
          `Whether the car is clean, high-mileage, damaged, or not running, ${page.name} sellers can start online and call 619-830-7005 if they want help before continuing.`,
        ],
      },
    ],
    faq: [
      {
        question: `Do you buy cars in ${page.name}?`,
        answer: `Yes. ${page.name} is in the San Diego County service area we can review for local cash offers.`,
      },
      {
        question: `Can you pick up a non-running car in ${page.name}?`,
        answer:
          "Non-running vehicles can be reviewed. Share whether it rolls, steers, has keys, and can be reached by a tow truck.",
      },
      {
        question: `What details help with a ${page.name} offer?`,
        answer:
          "VIN, mileage, title status, condition, ZIP code, and pickup access details all help us review the vehicle more clearly.",
      },
    ],
    nearbyTitle: `Nearby ${page.groupTitle} areas`,
    nearbyBody: `Looking outside ${page.name}? These nearby service pages stay in the same local route group.`,
    nearbyLinks: nearby,
  };
}

function englishSanDiegoAreaContent(
  page: LocationPageRecord,
): LocationPageContent {
  const nearby = nearbyLinks(page, "en");

  return {
    badge: `City of San Diego area`,
    title: `Cash for cars in ${page.name}, San Diego.`,
    intro: `Sell your used, junk, damaged, or non-running car in ${page.name}. Start with your VIN, then share condition, title, and access details so we can review a local San Diego pickup plan.`,
    metaTitle: `Cash for Cars in ${page.name}, San Diego | Local Offers`,
    metaDescription: `Sell your car for cash in ${page.name}, San Diego. We review junk, damaged, used, and non-running vehicles with local pickup planning.`,
    routeNote: `${page.name} is a City of San Diego area where parking, garages, street access, and timing can matter for pickup.`,
    proofPoints: [
      `${page.name} local offer review`,
      "Start with VIN",
      "Title and condition details reviewed",
      "Pickup or standard towing included when we buy",
    ],
    sections: [
      {
        title: `Selling a car in ${page.name}.`,
        body: [
          `${page.name} sellers may be dealing with street parking, apartments, repair shops, work lots, or a car that has been sitting longer than planned. We start with the vehicle details, then review what affects the offer and pickup.`,
          "VIN, mileage, title status, condition, keys, tires, and access details help us understand whether the next step should be an offer, a phone call, or more information.",
        ],
        bullets: [
          "Used and high-mileage vehicles",
          "Damaged cars and repair estimates",
          "Junk cars or failed-smog vehicles",
          "Cars that do not run",
        ],
      },
      {
        title: `Pickup details that matter in ${page.name}.`,
        body: [
          `City of San Diego pickups can be simple, but ${page.name} access details still matter. Tell us if the vehicle is in a garage, alley, gated lot, apartment complex, repair shop, tow yard, or narrow street spot.`,
          "If we buy the car, standard pickup or towing is included for eligible vehicles. Accurate access details help keep the handoff clear.",
        ],
        bullets: [
          "Street, apartment, and garage access reviewed",
          "Flat tires or missing keys should be mentioned early",
          "Shop and tow-yard pickups may need release details",
          "Pickup timing can be planned around the location",
        ],
      },
      {
        title: `A local option for ${page.name} sellers.`,
        body: [
          "Private buyers can ask for test drives, discounts, and repeated photos without committing. A local cash-offer process helps you compare your options without starting with repairs, towing, or weeks of messages.",
          `Start online for a ${page.name} vehicle or call 619-830-7005 if the VIN is not nearby or the car has unusual pickup details.`,
        ],
      },
    ],
    faq: [
      {
        question: `Do you review cars in ${page.name}?`,
        answer: `Yes. ${page.name} is one of the City of San Diego areas we can review for local cash offers and pickup planning.`,
      },
      {
        question: `Can you pick up from apartments or street parking in ${page.name}?`,
        answer:
          "Often yes. Share parking rules, gate access, garage height, street location, and whether the car rolls before scheduling.",
      },
      {
        question: `What if my car in ${page.name} does not start?`,
        answer:
          "Cars that do not start can be reviewed. Tell us if it rolls, steers, has keys, and can be reached by a tow truck.",
      },
    ],
    nearbyTitle: `Nearby ${page.groupTitle} areas`,
    nearbyBody: `These nearby City of San Diego area pages are grouped with ${page.name}.`,
    nearbyLinks: nearby,
  };
}

function spanishCityContent(page: LocationPageRecord): LocationPageContent {
  const groupTitle = getLocalizedGroupTitle(page, "es");
  const nearby = nearbyLinks(page, "es");

  return {
    badge: `Área de servicio: ${groupTitle}`,
    title: `Compramos carros en ${page.name}.`,
    intro: `Vende tu carro usado, chocado, para yonke o que no prende en ${page.name}. Empieza con el VIN, dinos la condición y revisamos el plan para pasar por el carro o mandar grúa estándar si lo compramos.`,
    metaTitle: `Compramos carros en ${page.name} | Ofertas locales`,
    metaDescription: `Vende tu carro por efectivo en ${page.name}. Revisamos carros usados, chocados, para yonke o que no prenden, con pickup o grúa estándar incluida si lo compramos.`,
    routeNote: `${page.name} está dentro de nuestra área ${groupTitle}. Condición, papeleo y acceso ayudan a preparar el siguiente paso.`,
    proofPoints: [
      `Ofertas locales en ${page.name}`,
      "Empieza con el VIN",
      "Revisamos carros chocados, para yonke o que no prenden",
      "Pickup o grúa estándar incluida si lo compramos",
    ],
    sections: [
      {
        title: `Vender un carro en ${page.name} puede ser más simple.`,
        body: [
          `Vendedores en ${page.name} nos contactan cuando vender por su cuenta toma demasiado tiempo, el carro necesita reparación o el vehículo lleva tiempo parado. Nos enfocamos en los detalles que afectan la oferta: año, marca, modelo, millas, condición, título y ubicación.`,
          "El primer paso es claro. Usa el VIN, después continúa con detalles de condición y papeleo para que la oferta y el plan de pickup tengan sentido.",
        ],
        bullets: [
          "Carros usados o con muchas millas",
          "Carros para yonke o con smog fallido",
          "Carros chocados o dañados",
          "Carros que no prenden o necesitan grúa",
        ],
      },
      {
        title: `Pickup en ${page.name}.`,
        body: [
          `Si compramos el vehículo, pickup o grúa estándar va incluido para carros elegibles en ${page.name}. El acceso importa, especialmente en apartamentos, rejas, talleres, yardas, calle o driveways angostos.`,
          "Dinos temprano si tiene llantas ponchadas, no hay llaves, dirección bloqueada, le faltan ruedas, está encerrado o necesita autorización de salida.",
        ],
        bullets: [
          "Pickup en casa, apartamento, taller o trabajo",
          "Acceso por calle, reja o lote se revisa",
          "Yardas o talleres pueden requerir autorización",
          "No tienes que buscar grúa aparte si aplica pickup estándar",
        ],
      },
      {
        title: `Una opción local para vendedores en ${page.name}.`,
        body: [
          "Un estimado nacional no siempre entiende la logística local ni carros con problemas reales. Una revisión local puede considerar demanda en San Diego County, condición, partes faltantes, papeleo y dónde está estacionado el carro.",
          `Si el carro está limpio, chocado, con muchas millas o no prende, puedes empezar en línea desde ${page.name} o llamar al 619-830-7005 si quieres ayuda.`,
        ],
      },
    ],
    faq: [
      {
        question: `¿Compran carros en ${page.name}?`,
        answer: `Sí. ${page.name} está dentro del área de San Diego County que podemos revisar para ofertas locales.`,
      },
      {
        question: `¿Pueden pasar por un carro que no prende en ${page.name}?`,
        answer:
          "Se puede revisar. Dinos si rueda, gira, tiene llaves y si una grúa puede llegar.",
      },
      {
        question: `¿Qué ayuda para una oferta en ${page.name}?`,
        answer:
          "VIN, millas, título, condición, ZIP y detalles de acceso ayudan a revisar mejor el carro.",
      },
    ],
    nearbyTitle: `Áreas cercanas en ${groupTitle}`,
    nearbyBody: `¿Buscas fuera de ${page.name}? Estas páginas están dentro del mismo grupo local.`,
    nearbyLinks: nearby,
  };
}

function spanishSanDiegoAreaContent(
  page: LocationPageRecord,
): LocationPageContent {
  const groupTitle = getLocalizedGroupTitle(page, "es");
  const nearby = nearbyLinks(page, "es");

  return {
    badge: "Área dentro de San Diego",
    title: `Compramos carros en ${page.name}, San Diego.`,
    intro: `Vende tu carro usado, chocado, para yonke o que no prende en ${page.name}. Empieza con el VIN y comparte condición, título y acceso para revisar un plan local de pickup.`,
    metaTitle: `Compramos carros en ${page.name}, San Diego | Oferta local`,
    metaDescription: `Vende tu carro por efectivo en ${page.name}, San Diego. Revisamos carros usados, chocados, para yonke y que no prenden con planeación local de pickup.`,
    routeNote: `${page.name} es un área dentro de San Diego donde estacionamiento, garages, calle y horario pueden importar para el pickup.`,
    proofPoints: [
      `Oferta local en ${page.name}`,
      "Empieza con VIN",
      "Revisamos condición y papeleo",
      "Pickup o grúa estándar incluida si lo compramos",
    ],
    sections: [
      {
        title: `Vender un carro en ${page.name}.`,
        body: [
          `En ${page.name}, el carro puede estar en calle, apartamento, taller, estacionamiento de trabajo o parado más tiempo del planeado. Empezamos con los datos del carro y después revisamos qué afecta la oferta y el pickup.`,
          "VIN, millas, título, condición, llaves, llantas y acceso ayudan a decidir si el siguiente paso es una oferta, una llamada o más información.",
        ],
        bullets: [
          "Carros usados o con muchas millas",
          "Carros chocados o con estimado de reparación",
          "Carros para yonke o con smog fallido",
          "Carros que no prenden",
        ],
      },
      {
        title: `Detalles de pickup en ${page.name}.`,
        body: [
          `Los pickups dentro de San Diego pueden ser sencillos, pero en ${page.name} los detalles de acceso importan. Dinos si el carro está en garage, alley, lote con reja, apartamento, taller, yarda o calle angosta.`,
          "Si compramos el carro, pickup o grúa estándar va incluido para vehículos elegibles. Buenos detalles de acceso ayudan a que la entrega sea clara.",
        ],
        bullets: [
          "Calle, apartamento y garage se revisan",
          "Llantas ponchadas o falta de llaves deben mencionarse",
          "Talleres y yardas pueden pedir autorización",
          "El horario se puede planear según la ubicación",
        ],
      },
      {
        title: `Una opción local para ${page.name}.`,
        body: [
          "Compradores privados pueden pedir test drive, descuentos y más fotos sin comprometerse. Un proceso de oferta local te ayuda a comparar opciones sin empezar pagando reparaciones o grúa.",
          `Empieza en línea para un carro en ${page.name} o llama al 619-830-7005 si no tienes el VIN a la mano o si el pickup tiene detalles especiales.`,
        ],
      },
    ],
    faq: [
      {
        question: `¿Revisan carros en ${page.name}?`,
        answer: `Sí. ${page.name} es una de las áreas dentro de San Diego que podemos revisar para ofertas locales y planeación de pickup.`,
      },
      {
        question: `¿Pueden pasar por apartamentos o calle en ${page.name}?`,
        answer:
          "Muchas veces sí. Comparte reglas de estacionamiento, acceso por reja, altura de garage, ubicación en calle y si el carro rueda.",
      },
      {
        question: `¿Qué pasa si el carro en ${page.name} no prende?`,
        answer:
          "Carros que no prenden se pueden revisar. Dinos si rueda, gira, tiene llaves y si una grúa puede llegar.",
      },
    ],
    nearbyTitle: `Áreas cercanas en ${groupTitle}`,
    nearbyBody: `Estas páginas están agrupadas con ${page.name} dentro de la ciudad de San Diego.`,
    nearbyLinks: nearby,
  };
}

export function getLocationPageContent(
  page: LocationPageRecord,
  locale: Locale,
): LocationPageContent {
  if (locale === "es") {
    return page.kind === "city"
      ? spanishCityContent(page)
      : spanishSanDiegoAreaContent(page);
  }

  return page.kind === "city"
    ? englishCityContent(page)
    : englishSanDiegoAreaContent(page);
}
