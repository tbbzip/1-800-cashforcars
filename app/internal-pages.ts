import type { Locale } from "./dictionaries";

export type InternalPageKey =
  | "howItWorks"
  | "carsWeBuy"
  | "junkCars"
  | "damagedCars"
  | "nonRunningCars"
  | "trucksSuvs"
  | "titleHelp"
  | "sanDiegoCounty"
  | "incorporatedCities"
  | "freeTowing"
  | "faq";

export type PageImage = {
  title: string;
  description: string;
  alt: string;
};

export type InternalPageSection = {
  id: string;
  eyebrow?: string;
  title: string;
  body: string[];
  bullets?: string[];
  image?: PageImage;
};

export type InternalPageContent = {
  key: InternalPageKey;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  heroImage: PageImage;
  quickFacts: string[];
  sections: InternalPageSection[];
  faqs: {
    question: string;
    answer: string;
  }[];
  related: InternalPageKey[];
};

const englishPages: Record<InternalPageKey, InternalPageContent> = {
  howItWorks: {
    key: "howItWorks",
    slug: "how-it-works",
    metaTitle: "How Cash for Cars Works in San Diego | Fast Local Offers",
    metaDescription:
      "Learn how to sell your car for cash in San Diego County, from VIN lookup and local offer to paperwork, pickup or towing, and payment.",
    eyebrow: "Simple local process",
    title: "How selling your car for cash works in San Diego County.",
    intro:
      "Selling a car should not turn into weeks of private messages, no-shows, tow quotes, and paperwork confusion. Our process is built for San Diego County sellers who want a clear local offer, practical title guidance, and a simple handoff when the vehicle is ready.",
    heroImage: {
      title: "Local pickup handoff",
      description:
        "A local pickup moment for a San Diego County seller ready to move on from an unwanted vehicle.",
      alt: "Local cash for cars pickup handoff in San Diego County",
    },
    quickFacts: [
      "Start with VIN, plate, or basic vehicle details",
      "Offers can consider junk, damaged, running, and non-running cars",
      "Pickup or standard towing is included when we buy",
      "Call 619-830-7005 if you want help before filling out the form",
    ],
    sections: [
      {
        id: "vehicle-details",
        eyebrow: "Step 1",
        title: "Tell us what you are selling.",
        body: [
          "The first step is giving us enough vehicle information to understand what you have. A VIN is the cleanest starting point because it helps confirm year, make, model, trim, engine, and body style. If you do not have the VIN nearby, you can still start with the basics and continue manually.",
          "Helpful details include mileage, whether the car starts, whether it can be driven safely, title status, location ZIP code, and any major damage. These details matter because a clean commuter car, a high-mileage truck, a failed-smog sedan, and a non-running SUV all need different pricing and pickup planning.",
        ],
        bullets: [
          "VIN or license plate when available",
          "Mileage and running condition",
          "Body damage, missing parts, or mechanical issues",
          "Title, registration, lien, or payoff details",
        ],
        image: {
          title: "Vehicle details review",
          description:
            "Checking the VIN, mileage, condition, and location before reviewing a cash offer.",
          alt: "Seller entering VIN and vehicle details for a San Diego cash offer",
        },
      },
      {
        id: "local-offer",
        eyebrow: "Step 2",
        title: "Receive a local cash offer.",
        body: [
          "Your offer is based on the vehicle and the local market, not just a generic national estimate. San Diego County demand, condition, mileage, title situation, parts value, and pickup logistics can all influence the final number.",
          "The goal is to give you a practical offer that makes sense for your situation. If the car is ready to sell, you can move forward. If you have title questions or are not sure what documents you have, we can help you identify what should be reviewed before scheduling pickup.",
        ],
        bullets: [
          "Local San Diego County market context",
          "Condition and mileage review",
          "Paperwork and title considerations",
          "Pickup or towing planning",
        ],
      },
      {
        id: "pickup-payment",
        eyebrow: "Step 3",
        title: "Schedule pickup, finish paperwork, and get paid.",
        body: [
          "Once the offer and paperwork are confirmed, the next step is the handoff. If we buy the vehicle, standard pickup or towing is included, so you do not need to arrange a separate tow truck for a car that does not run.",
          "At pickup, the vehicle, keys, title or available paperwork, and seller information are confirmed. The process is designed to be straightforward whether the car is at home, a workplace, a repair shop, a tow yard, an apartment lot, or street parking.",
        ],
        image: {
          title: "Pickup and payment",
          description:
            "A simple vehicle handoff with pickup or standard towing included when we buy.",
          alt: "Vehicle pickup and payment for a cash car sale in San Diego",
        },
      },
    ],
    faqs: [
      {
        question: "Can I start without a VIN?",
        answer:
          "Yes. A VIN helps, but you can begin with year, make, model, mileage, condition, and location details.",
      },
      {
        question: "Do I have to accept the offer?",
        answer:
          "No. You can review the offer first. The goal is to make the next step clear, not pressure you.",
      },
      {
        question: "What if the car is at a shop or tow yard?",
        answer:
          "Tell us where it is located. Pickup planning can be different for repair shops, gated lots, apartments, and tow yards.",
      },
    ],
    related: ["carsWeBuy", "freeTowing", "titleHelp"],
  },
  carsWeBuy: {
    key: "carsWeBuy",
    slug: "cars-we-buy",
    metaTitle: "Cars We Buy in San Diego | Used, Junk & Damaged Cars",
    metaDescription:
      "See the cars we buy in San Diego County, including used cars, junk cars, damaged vehicles, non-running cars, trucks, SUVs, vans, and high-mileage cars.",
    eyebrow: "Cars we buy",
    title: "Used, junk, damaged, and non-running cars we buy in San Diego.",
    intro:
      "Not every car fits the clean online marketplace model. Some cars have accident damage, mechanical problems, failed smog, title questions, missing parts, or simply too many miles to sell easily to a private buyer. This page explains the types of vehicles we can review for a local San Diego County cash offer.",
    heroImage: {
      title: "Vehicles we review",
      description:
        "Sedans, trucks, SUVs, vans, damaged vehicles, and non-running cars can all be reviewed for a local offer.",
      alt: "Types of used junk damaged and non-running cars bought in San Diego",
    },
    quickFacts: [
      "Used cars, high-mileage cars, and older daily drivers",
      "Junk cars, failed-smog vehicles, and cars sitting unused",
      "Accident-damaged, mechanically damaged, and non-running vehicles",
      "Trucks, SUVs, vans, commuters, and family cars",
    ],
    sections: [
      {
        id: "used-cars",
        title: "Used cars that are still running.",
        body: [
          "A running used car can still be difficult to sell privately if it has high mileage, cosmetic issues, old registration, warning lights, or a long list of upcoming repairs. We can review vehicles that still drive but no longer fit your budget, schedule, or household needs.",
          "The more detail you provide, the easier it is to understand what kind of buyer the car would attract locally. Mileage, trim, maintenance history, smog status, and title status all help shape the offer.",
        ],
        image: {
          title: "Used car offer",
          description:
            "A used vehicle that still runs but may be easier to sell through a local cash offer.",
          alt: "Used car ready for cash offer in San Diego County",
        },
      },
      {
        id: "problem-cars",
        title: "Problem cars private buyers avoid.",
        body: [
          "Many sellers contact us because their car is not easy to list online. It may not start, it may need a transmission, the body may be damaged, or the repair estimate may be higher than the car is worth.",
          "Those details do not automatically mean the car has no value. Parts, metal, local demand, condition, and pickup logistics can still support an offer. The key is being clear about what works, what does not, and where the vehicle is located.",
        ],
        bullets: [
          "Engine, transmission, suspension, or electrical problems",
          "Accident damage or missing exterior parts",
          "Failed smog or expired registration",
          "Vehicles sitting at a home, shop, tow yard, or street spot",
        ],
      },
      {
        id: "vehicle-types",
        title: "Sedans, trucks, SUVs, vans, and work vehicles.",
        body: [
          "We can review more than small commuter cars. Trucks, SUVs, vans, family vehicles, work vehicles, and older fleet-style vehicles may all qualify for an offer depending on condition and paperwork.",
          "If you are unsure whether your vehicle fits, start with the VIN lookup or call 619-830-7005. A short conversation can clarify whether the next step should be an offer, a title review, or more vehicle details.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you only buy junk cars?",
        answer:
          "No. We can review used cars, damaged cars, non-running vehicles, trucks, SUVs, vans, and high-mileage vehicles.",
      },
      {
        question: "Can I sell a car with missing parts?",
        answer:
          "Yes, missing parts can be reviewed. Tell us what is missing so the offer and pickup plan are realistic.",
      },
      {
        question: "Do you buy cars with failed smog?",
        answer:
          "Failed-smog vehicles can be considered, especially if the repair cost is more than you want to spend.",
      },
    ],
    related: ["junkCars", "damagedCars", "nonRunningCars"],
  },
  junkCars: {
    key: "junkCars",
    slug: "junk-cars",
    metaTitle: "Sell My Junk Car San Diego | Cash for Junk Cars",
    metaDescription:
      "Sell your junk car in San Diego County. We consider failed-smog cars, vehicles sitting unused, missing-part cars, salvage vehicles, and cars that cost too much to repair.",
    eyebrow: "Junk car buyers",
    title: "Sell your junk car for cash in San Diego County.",
    intro:
      "A junk car does not always mean the same thing to every seller. For some people it is a car that will not pass smog. For others it is a vehicle sitting in the driveway, a salvage car, a car missing parts, or an older vehicle that costs more to fix than it is worth. This page explains what matters when requesting a junk car offer in San Diego.",
    heroImage: {
      title: "Junk car cash offer",
      description:
        "An older or unwanted vehicle that may still qualify for a cash offer and included pickup.",
      alt: "Junk car sitting in San Diego ready to sell for cash",
    },
    quickFacts: [
      "Failed smog and old registration can be reviewed",
      "Missing parts or salvage history can still qualify",
      "Pickup or towing is included when we buy",
      "Useful for cars sitting at homes, shops, or street parking",
    ],
    sections: [
      {
        id: "what-counts",
        title: "What counts as a junk car?",
        body: [
          "A junk car is usually a vehicle that is no longer practical to keep, repair, insure, or sell privately. It might still start, or it might not move at all. The key is that the vehicle has become a problem instead of useful transportation.",
          "Common examples include cars with expired registration, failed smog, major mechanical repairs, blown engines, transmission issues, missing catalytic converters, damaged interiors, or years of sitting unused.",
        ],
        image: {
          title: "Junk car condition",
          description:
            "Condition details like missing parts, old tags, flat tires, or years of sitting unused can affect the offer.",
          alt: "Older junk car details before cash offer review",
        },
      },
      {
        id: "value-factors",
        title: "What affects a junk car offer?",
        body: [
          "A junk car offer can depend on year, make, model, weight, parts demand, completeness, title status, and pickup location. A complete SUV may be evaluated differently than a stripped compact car. A vehicle at a tow yard may require different planning than one parked at home.",
          "Being honest about condition helps avoid surprises. If the catalytic converter is missing, the tires are flat, the keys are gone, or the car is blocked in, say so early so the pickup plan is realistic.",
        ],
        bullets: [
          "Is the car complete or missing parts?",
          "Does it roll, steer, and have tires?",
          "Do you have keys, title, or registration?",
          "Where is it located in San Diego County?",
        ],
      },
      {
        id: "pickup",
        title: "Removing the car without arranging your own tow.",
        body: [
          "If we buy the junk car, standard pickup or towing is included. That can be the most important part of the process for sellers who simply need the vehicle gone from a driveway, apartment lot, repair shop, or street space.",
          "Before scheduling, we review access details such as whether the vehicle is behind a gate, in a narrow driveway, in a parking garage, or at a tow yard with release requirements.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I sell a junk car without current registration?",
        answer:
          "Expired registration can be reviewed. Tell us what paperwork you do have so we can help identify the next step.",
      },
      {
        question: "Can you buy a junk car with no keys?",
        answer:
          "Possibly. No-key vehicles need extra pickup details, especially if the car does not roll or is parked in a tight space.",
      },
      {
        question: "Do you pay for junk cars?",
        answer:
          "Yes, eligible junk cars can receive a cash offer based on condition, vehicle type, parts value, paperwork, and location.",
      },
    ],
    related: ["freeTowing", "titleHelp", "nonRunningCars"],
  },
  damagedCars: {
    key: "damagedCars",
    slug: "damaged-cars",
    metaTitle: "Sell a Damaged Car in San Diego | Accident & Body Damage",
    metaDescription:
      "Sell a damaged car in San Diego County. We review accident damage, body damage, mechanical problems, deployed airbags, missing parts, and repair estimates.",
    eyebrow: "Damaged car buyers",
    title: "Sell a damaged car in San Diego without fixing it first.",
    intro:
      "A damaged car can be hard to price and even harder to sell privately. Buyers ask for discounts, repair estimates can grow, and the vehicle may not be safe or legal to drive. We review damaged vehicles as they are, so you can decide whether a local cash offer makes more sense than paying for repairs.",
    heroImage: {
      title: "Damaged car offer",
      description:
        "A damaged vehicle can be reviewed as-is, without paying for repairs before requesting an offer.",
      alt: "Damaged car in San Diego being reviewed for a cash offer",
    },
    quickFacts: [
      "Accident damage and body damage can be reviewed",
      "Mechanical problems and repair estimates matter",
      "Airbag deployment or missing parts should be disclosed",
      "Pickup can be planned if the vehicle is unsafe to drive",
    ],
    sections: [
      {
        id: "damage-types",
        title: "Damage we can review.",
        body: [
          "Damage can be cosmetic, structural, mechanical, or a mix of all three. A car with scraped paint is not the same as a car with frame damage, deployed airbags, missing wheels, or a major engine problem.",
          "When requesting an offer, describe the damage as clearly as possible. Photos can help later, but the first step is explaining what happened, what still works, and whether the vehicle can be moved safely.",
        ],
        bullets: [
          "Front-end, rear-end, side, or hail damage",
          "Mechanical issues after an accident",
          "Deployed airbags or warning lights",
          "Missing bumper, lights, mirrors, wheels, or catalytic converter",
        ],
      },
      {
        id: "repair-vs-sell",
        title: "When selling may beat repairing.",
        body: [
          "Repairing a damaged car can make sense if the vehicle is newer, insured, and worth more than the repair bill. But many older or high-mileage cars become expensive quickly once body work, paint, sensors, suspension, rental cars, and storage are included.",
          "A cash offer gives you another option. Instead of spending more money to chase a private sale, you can compare the offer with the repair estimate and decide what makes the most practical sense.",
        ],
        image: {
          title: "Repair or sell decision",
          description:
            "Compare the cost of repairs with a local cash offer before spending more money on the car.",
          alt: "Damaged car repair estimate before selling for cash",
        },
      },
      {
        id: "pickup-details",
        title: "Pickup planning for damaged vehicles.",
        body: [
          "If a damaged car cannot be driven safely, tell us before scheduling. Flat tires, bent wheels, locked steering, blocked access, missing keys, or a low-clearance parking garage can affect pickup planning.",
          "The goal is to prevent surprises. Accurate access details help determine whether standard towing is enough and what information should be ready at handoff.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you buy cars after an accident?",
        answer:
          "Yes. Accident damage can be reviewed, including vehicles with body damage, deployed airbags, or mechanical issues.",
      },
      {
        question: "Should I repair the car before selling?",
        answer:
          "Not always. Compare the repair estimate with the offer before spending money on repairs you may not recover.",
      },
      {
        question: "Can I sell a car with a salvage title?",
        answer:
          "Salvage title vehicles can be considered. Share the title status early so the offer is accurate.",
      },
    ],
    related: ["carsWeBuy", "freeTowing", "titleHelp"],
  },
  nonRunningCars: {
    key: "nonRunningCars",
    slug: "non-running-cars",
    metaTitle: "Sell a Non-Running Car San Diego | Cars That Do Not Start",
    metaDescription:
      "Sell a non-running car in San Diego County. We review cars that do not start, cannot drive safely, have flat tires, engine issues, or need towing.",
    eyebrow: "Non-running car buyers",
    title: "Sell a car that does not run in San Diego County.",
    intro:
      "A non-running car creates a different problem than a normal used car sale. You cannot easily meet buyers, test drives are impossible, and towing can cost money before you even know if the buyer is serious. We help sellers start with the vehicle details first, then plan pickup if we buy the car.",
    heroImage: {
      title: "Non-running car pickup",
      description:
        "A car that does not start can still be reviewed for a local offer and pickup plan.",
      alt: "Non-running car pickup in San Diego County",
    },
    quickFacts: [
      "Cars that do not start can still be reviewed",
      "Tell us whether it rolls, steers, and has inflated tires",
      "No test drive is required for an initial review",
      "Pickup or standard towing is included when we buy",
    ],
    sections: [
      {
        id: "why-it-does-not-run",
        title: "Why the car stopped running matters.",
        body: [
          "A car may not run because of a dead battery, bad starter, blown engine, transmission failure, electrical problem, fuel issue, or accident damage. The reason matters because some vehicles still have strong parts value while others require more complex removal.",
          "Even if you do not know the exact problem, describe what happened last. Did it overheat? Did it stop after an accident? Does it click but not start? Does it start but stall? Small details can help build a better offer picture.",
        ],
        bullets: [
          "Does it start at all?",
          "Can it shift into neutral?",
          "Are all wheels attached and tires inflated?",
          "Is it parked where a tow truck can reach it?",
        ],
      },
      {
        id: "access",
        title: "Pickup access is part of the offer process.",
        body: [
          "Non-running vehicles need good access information. A car in a driveway is different from a car in a parking garage, behind a locked gate, at a mechanic, or at a tow yard with release paperwork.",
          "If the car is blocked in, has flat tires, missing keys, or cannot roll, say so early. That does not automatically stop the process, but it affects planning.",
        ],
        image: {
          title: "Pickup access review",
          description:
            "Location details help plan pickup for a car parked in a driveway, apartment lot, garage, or tight space.",
          alt: "Non-running car access details for pickup planning",
        },
      },
      {
        id: "paperwork",
        title: "Paperwork for a car that does not run.",
        body: [
          "A non-running car still needs seller information and available paperwork. Title, registration, lien release, payoff details, bill of sale, or duplicate-title paperwork may be relevant depending on your situation.",
          "If paperwork is missing or confusing, start with what you have. We can help identify what should be reviewed before pickup is scheduled.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I sell a car that does not start?",
        answer:
          "Yes. Cars that do not start can be reviewed. Include what you know about the problem and where the vehicle is parked.",
      },
      {
        question: "Does the car need to roll?",
        answer:
          "It helps, but it may not be required. Tell us whether the wheels are attached, tires are inflated, and the vehicle can shift into neutral.",
      },
      {
        question: "Can you pick it up from a repair shop?",
        answer:
          "Yes, shop pickups can be reviewed. The shop may need release approval or specific pickup instructions.",
      },
    ],
    related: ["freeTowing", "junkCars", "titleHelp"],
  },
  trucksSuvs: {
    key: "trucksSuvs",
    slug: "trucks-suvs",
    metaTitle: "Sell My Truck or SUV San Diego | Cash Offers",
    metaDescription:
      "Sell your truck, SUV, van, work vehicle, or family car in San Diego County. Running, damaged, high-mileage, and non-running vehicles can be reviewed.",
    eyebrow: "Truck and SUV buyers",
    title: "Sell your truck, SUV, van, or work vehicle in San Diego.",
    intro:
      "Trucks and SUVs can hold value even when they are old, damaged, high-mileage, or expensive to repair. Whether you have a commuter SUV, a work truck, a van, or a family vehicle that no longer fits your needs, we can review the details for a local offer.",
    heroImage: {
      title: "Truck and SUV offer",
      description:
        "Larger vehicles like trucks, SUVs, vans, and work vehicles can be reviewed for a local cash offer.",
      alt: "Truck or SUV being sold for cash in San Diego County",
    },
    quickFacts: [
      "Pickups, SUVs, vans, and family vehicles",
      "High-mileage, damaged, and non-running vehicles can be reviewed",
      "Work vehicles and older fleet-style vehicles may qualify",
      "Pickup planning depends on size, condition, and access",
    ],
    sections: [
      {
        id: "truck-value",
        title: "Why trucks and SUVs are evaluated differently.",
        body: [
          "Trucks, SUVs, and vans often have stronger parts demand, larger bodies, higher scrap weight, and different local buyer demand than compact cars. Four-wheel drive, engine size, trim, drivetrain, and body condition can all influence the offer.",
          "A high-mileage truck with mechanical problems may still be worth reviewing, especially if key parts are complete and the title situation is clear.",
        ],
      },
      {
        id: "work-vehicles",
        title: "Work vehicles, vans, and high-mileage family SUVs.",
        body: [
          "Many sellers use trucks, vans, and SUVs until repairs become too expensive. Transmission issues, suspension problems, blown head gaskets, failed smog, and body damage can make private selling difficult.",
          "Tell us whether the vehicle was used for work, commuting, family transportation, towing, or fleet service. That context can help explain mileage, wear, and condition.",
        ],
        image: {
          title: "Work vehicle review",
          description:
            "Work trucks and vans can still have value even with mileage, damage, or repair needs.",
          alt: "Used work truck or van in San Diego ready for a cash offer",
        },
      },
      {
        id: "pickup-size",
        title: "Pickup planning for larger vehicles.",
        body: [
          "Larger vehicles may need more space for pickup or towing. Tell us if the vehicle is in a narrow alley, parking garage, tight apartment lot, sloped driveway, or behind another vehicle.",
          "Accurate access details help avoid delays and make the handoff easier when you are ready to sell.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you buy high-mileage trucks?",
        answer:
          "High-mileage trucks can be reviewed. Mileage matters, but condition, parts demand, title, and pickup details also matter.",
      },
      {
        question: "Can I sell a work van?",
        answer:
          "Yes, vans and work vehicles can be reviewed, including older or damaged vehicles.",
      },
      {
        question: "Do you buy SUVs that do not run?",
        answer:
          "Yes. Non-running SUVs can be considered if pickup access and paperwork can be reviewed.",
      },
    ],
    related: ["carsWeBuy", "damagedCars", "nonRunningCars"],
  },
  titleHelp: {
    key: "titleHelp",
    slug: "title-help",
    metaTitle: "Car Title Help San Diego | Sell With DMV Paperwork Questions",
    metaDescription:
      "Need title help before selling a car in San Diego? Learn what to review for lost titles, registration issues, liens, payoff details, DMV forms, and handoff paperwork.",
    eyebrow: "Title and paperwork help",
    title: "Car title and DMV paperwork help before you sell.",
    intro:
      "Paperwork questions stop many sellers before they even request an offer. Maybe the title is missing, registration is expired, there may be a lien, or the car belonged to a family member. We cannot give legal advice, but we can help you understand what information may need review before pickup.",
    heroImage: {
      title: "Title and paperwork review",
      description:
        "Title, registration, lien, and seller details can be reviewed before planning the handoff.",
      alt: "Car title and DMV paperwork for selling a car in San Diego",
    },
    quickFacts: [
      "Lost title and duplicate-title questions",
      "Registration, unpaid fees, and DMV paperwork",
      "Lien, payoff, and release letter considerations",
      "Seller handoff details before pickup",
    ],
    sections: [
      {
        id: "lost-title",
        title: "Lost title or missing paperwork.",
        body: [
          "A missing title does not always mean you are stuck, but it does mean the paperwork should be reviewed before planning pickup. Depending on the situation, registration, duplicate-title paperwork, bill of sale, or other seller information may be relevant.",
          "Start with what you have. The goal is to identify the cleanest next step before you waste time with private buyers who may not understand DMV requirements.",
        ],
      },
      {
        id: "registration-issues",
        title: "Registration, fees, and DMV questions.",
        body: [
          "Expired registration, old tags, unpaid fees, or failed smog can make a private sale harder. These issues do not automatically prevent an offer, but they can affect the handoff and paperwork plan.",
          "Tell us what you know about the registration status. If you are not sure, we can still start with the vehicle and seller details you have available.",
        ],
        image: {
          title: "Registration details",
          description:
            "Registration status, old tags, and DMV paperwork can affect the sale plan.",
          alt: "Vehicle registration paperwork for a San Diego car sale",
        },
      },
      {
        id: "loan-lien",
        title: "Loan, lien, payoff, or release questions.",
        body: [
          "If the vehicle may have a lien or loan, the payoff and release information needs to be understood before sale plans are final. A lien release letter, payoff details, or lender information may be part of the review.",
          "The earlier you mention a loan or lien, the easier it is to avoid surprises later in the process.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I sell a car without a title?",
        answer:
          "It depends on the paperwork you do have and the vehicle situation. Start with registration, ID, and any DMV or duplicate-title documents available.",
      },
      {
        question: "Can I sell a car with expired registration?",
        answer:
          "Expired registration can be reviewed. It may affect paperwork, but it does not automatically stop the offer process.",
      },
      {
        question: "Do you handle DMV forms for me?",
        answer:
          "We can help explain common seller handoff details, but official DMV requirements should be confirmed for your exact situation.",
      },
    ],
    related: ["howItWorks", "junkCars", "damagedCars"],
  },
  sanDiegoCounty: {
    key: "sanDiegoCounty",
    slug: "san-diego-county",
    metaTitle: "Cash for Cars San Diego County | Local Service Areas",
    metaDescription:
      "Cash for cars across the San Diego County areas we serve, from Camp Pendleton and Oceanside south, and from Alpine west toward the coast.",
    eyebrow: "Service areas",
    title: "Cash for cars across San Diego County.",
    intro:
      "San Diego County is large, so we keep the service area simple for sellers. Our regular pickup area runs from Camp Pendleton and Oceanside south, and from Alpine west toward the coast. Mountain and desert routes farther east may need a call first.",
    heroImage: {
      title: "San Diego County service area",
      description:
        "A clear local service-area view for sellers across San Diego County.",
      alt: "San Diego County cash for cars service area map",
    },
    quickFacts: [
      "San Diego, Chula Vista, National City, and South Bay",
      "El Cajon, La Mesa, Santee, Poway, and Alpine-area routes",
      "Oceanside, Escondido, Carlsbad, Encinitas, and North County",
      "Call first for Borrego Springs, Julian, Campo, Pine Valley, Descanso, or far-east backcountry routes",
    ],
    sections: [
      {
        id: "central-south",
        title: "Central San Diego and South Bay.",
        body: [
          "We can review vehicles in San Diego, Chula Vista, National City, Imperial Beach, Otay Mesa, and nearby communities. These areas often include apartment lots, street parking, repair shops, and tight residential access, so location details matter.",
          "If the car is parked in a shared lot, behind a gate, or on the street, tell us before pickup is scheduled.",
        ],
        image: {
          title: "South Bay pickup area",
          description:
            "South Bay and central San Diego sellers can start online with vehicle details and pickup location.",
          alt: "Cash for cars service in San Diego and South Bay",
        },
      },
      {
        id: "east-county",
        title: "East County and inland communities.",
        body: [
          "El Cajon, La Mesa, Santee, Poway, and Alpine-area routes can be reviewed. Routes farther east, including Borrego Springs, Julian, Campo, Pine Valley, Descanso, and similar mountain or desert areas, should be confirmed by phone first.",
          "If the vehicle does not run, include whether it rolls, has tires, and can be accessed by a tow truck. Location details matter more as routes move inland.",
        ],
      },
      {
        id: "north-county",
        title: "North County and coastal areas.",
        body: [
          "Oceanside, Camp Pendleton-area routes, Escondido, Carlsbad, Encinitas, and surrounding North County communities are part of the local service area. Sellers can start online with a VIN lookup and continue with the same offer process.",
          "Vehicle location, title status, and pickup timing can all be reviewed before scheduling.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you buy cars outside the city of San Diego?",
        answer:
          "Yes. We review vehicles across the practical San Diego County service area, not only inside the city limits.",
      },
      {
        question: "What San Diego County areas should I call to confirm?",
        answer:
          "Call first for Borrego Springs, Julian, Campo, Pine Valley, Descanso, or far-east backcountry areas so we can review the route before you count on pickup.",
      },
      {
        question: "Does location affect the offer?",
        answer:
          "Location and pickup access can affect planning. Vehicle condition, title, mileage, and local demand also matter.",
      },
      {
        question: "Can you pick up from an apartment or gated lot?",
        answer:
          "Often yes, but gate access, parking rules, and tow access should be discussed before pickup.",
      },
    ],
    related: ["incorporatedCities", "howItWorks", "freeTowing"],
  },
  incorporatedCities: {
    key: "incorporatedCities",
    slug: "incorporated-cities",
    metaTitle: "Cash for Cars in San Diego County Cities | Local Offers",
    metaDescription:
      "See the incorporated San Diego County cities we serve, grouped by North County, Central San Diego, East County, and South Bay.",
    eyebrow: "Incorporated cities",
    title: "Cash for cars in San Diego County’s incorporated cities.",
    intro:
      "We keep the city list organized by region so sellers can quickly see where we usually work. The practical boundary is Camp Pendleton and Oceanside south, and Alpine west toward the coast.",
    heroImage: {
      title: "San Diego County city service area image",
      description:
        "A clean local service-area view for city-to-city coverage across San Diego County.",
      alt: "Cash for cars service area for incorporated cities in San Diego County",
    },
    quickFacts: [
      "All 18 incorporated cities are included",
      "Coverage runs from Oceanside and Camp Pendleton south",
      "Alpine is a practical eastern reference point before longer inland routes",
      "Call first for Borrego Springs, Julian, Campo, Pine Valley, Descanso, and far-east areas",
    ],
    sections: [
      {
        id: "north-county-coastal",
        eyebrow: "North County coastal",
        title: "Oceanside, Carlsbad, Encinitas, Solana Beach, and Del Mar.",
        body: [
          "North County coastal sellers can start with a VIN, condition details, and pickup location. These cities are inside the normal local coverage area from Camp Pendleton and Oceanside south.",
          "Coastal pickups can include apartment lots, driveway parking, repair shops, street parking, and vehicles stored near work or school.",
        ],
        bullets: ["Oceanside", "Carlsbad", "Encinitas", "Solana Beach", "Del Mar"],
      },
      {
        id: "north-county-inland",
        eyebrow: "North County inland",
        title: "Vista, San Marcos, Escondido, and Poway.",
        body: [
          "North County inland cities are part of the regular service area. Pickup planning depends on whether the vehicle runs, rolls, has keys, and can be accessed by a tow truck if needed.",
          "This group keeps larger inland cities together without mixing them into the coastal list.",
        ],
        bullets: ["Vista", "San Marcos", "Escondido", "Poway"],
      },
      {
        id: "central-metro",
        eyebrow: "Central and metro",
        title: "San Diego, La Mesa, Lemon Grove, and Coronado.",
        body: [
          "Central and metro cities often have tighter pickup details: street parking, gated lots, apartment rules, repair shops, or business parking. Sharing location details early helps avoid delays.",
          "San Diego neighborhoods are handled separately on the homepage so this page stays focused on incorporated cities.",
        ],
        bullets: ["San Diego", "La Mesa", "Lemon Grove", "Coronado"],
      },
      {
        id: "east-south-county",
        eyebrow: "East and South County",
        title: "El Cajon, Santee, Chula Vista, National City, and Imperial Beach.",
        body: [
          "East and South County cities are included, with Alpine treated as the practical eastern reference point for regular service. Routes farther into mountain or desert areas should be confirmed by phone first.",
          "South Bay sellers can start online or call if the vehicle is damaged, non-running, parked in a tight location, or needs pickup planning.",
        ],
        bullets: [
          "El Cajon",
          "Santee",
          "Chula Vista",
          "National City",
          "Imperial Beach",
        ],
      },
    ],
    faqs: [
      {
        question: "Do you serve all incorporated cities in San Diego County?",
        answer:
          "Yes. The incorporated city list is included, with service planning based on vehicle location, access, condition, and timing.",
      },
      {
        question: "Which areas should I call to confirm?",
        answer:
          "Call first for Borrego Springs, Julian, Campo, Pine Valley, Descanso, or far-east backcountry routes so the pickup route can be reviewed.",
      },
      {
        question: "What is the easiest way to check a city?",
        answer:
          "Start with the VIN and ZIP code, or call 619-830-7005 if you want to confirm the route before filling out the form.",
      },
    ],
    related: ["sanDiegoCounty", "freeTowing", "howItWorks"],
  },
  freeTowing: {
    key: "freeTowing",
    slug: "free-towing",
    metaTitle: "Free Towing for Cars We Buy in San Diego | Pickup Included",
    metaDescription:
      "If we buy your vehicle in San Diego County, standard pickup or towing is included. Learn what affects pickup for junk, damaged, and non-running cars.",
    eyebrow: "Pickup and towing",
    title: "Pickup or standard towing is included when we buy your car.",
    intro:
      "For many sellers, removing the vehicle is the hardest part of selling it. A car that does not run, has flat tires, is at a shop, or is parked in a tight location can be expensive to move. If we buy your vehicle, standard pickup or towing is included for eligible San Diego County vehicles.",
    heroImage: {
      title: "Pickup or towing included",
      description:
        "Standard pickup or towing is included when we buy an eligible San Diego County vehicle.",
      alt: "Free towing included for a car bought in San Diego County",
    },
    quickFacts: [
      "Pickup or standard towing included when we buy",
      "Useful for junk, damaged, and non-running cars",
      "Access details should be shared before scheduling",
      "Tow yards, shops, apartments, and gated lots may need extra planning",
    ],
    sections: [
      {
        id: "what-included",
        title: "What pickup or towing included means.",
        body: [
          "Included pickup means you do not need to hire your own tow truck just to complete the sale when we buy the vehicle. Standard towing can cover many normal pickup situations, but access and vehicle condition still matter.",
          "A car that rolls in a driveway is different from a car with no wheels, no keys, locked steering, or blocked access. Clear details help confirm whether standard pickup is enough.",
        ],
      },
      {
        id: "access-check",
        title: "Pickup access details to share early.",
        body: [
          "Before pickup, tell us where the vehicle is parked and whether a tow truck can reach it. Apartments, underground garages, tight alleys, gated communities, and tow yards can all require different instructions.",
          "If the car is at a business, shop, or tow yard, there may be release requirements. Sharing that early prevents delays.",
        ],
        image: {
          title: "Towing access",
          description:
            "Driveways, apartments, garages, shops, and tow yards can all require different pickup details.",
          alt: "Vehicle access details for towing pickup in San Diego",
        },
      },
      {
        id: "non-running",
        title: "Why towing matters for cars that do not run.",
        body: [
          "A non-running car can sit for months because every option feels expensive. Included pickup helps sellers move forward without paying towing costs before they know whether a sale makes sense.",
          "Start with the vehicle details and location. We can review whether the car starts, rolls, steers, has keys, and has inflated tires before scheduling.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is towing always free?",
        answer:
          "If we buy your eligible San Diego County vehicle, standard pickup or towing is included. Unusual access or missing parts should be discussed early.",
      },
      {
        question: "Can you tow from a repair shop?",
        answer:
          "Repair shop pickups can be reviewed. The shop may need release approval or a pickup window.",
      },
      {
        question: "Can you tow from a tow yard?",
        answer:
          "Tow yard pickups may be possible, but release rules, storage fees, and paperwork need to be reviewed.",
      },
    ],
    related: ["nonRunningCars", "junkCars", "howItWorks"],
  },
  faq: {
    key: "faq",
    slug: "faq",
    metaTitle: "Cash for Cars FAQ San Diego | Offers, Titles, Pickup & Payment",
    metaDescription:
      "Answers to common questions about selling a car for cash in San Diego County, including offers, title paperwork, free pickup or towing, payment, and vehicle condition.",
    eyebrow: "Seller questions",
    title: "Cash for cars questions San Diego sellers ask first.",
    intro:
      "Before requesting an offer, most sellers want to know what documents they need, whether damaged cars qualify, if towing is included, and how payment works. This FAQ brings the main answers together so you can decide the next step with less back-and-forth.",
    heroImage: {
      title: "Seller questions",
      description:
        "Answers to common seller questions about offers, title details, pickup, towing, and payment.",
      alt: "Seller questions about cash for cars in San Diego",
    },
    quickFacts: [
      "Offers depend on vehicle details and local market demand",
      "Junk, damaged, and non-running vehicles can be reviewed",
      "Title and registration questions should be shared early",
      "Call 619-830-7005 for help before starting",
    ],
    sections: [
      {
        id: "before-offer",
        title: "What to know before requesting an offer.",
        body: [
          "You do not need every answer before starting. The best first step is sharing what you know: VIN or basic details, mileage, condition, title status, and location.",
          "If something is uncertain, say so. It is better to mark a title, lien, mileage, or pickup detail as unknown than to guess.",
        ],
      },
      {
        id: "after-offer",
        title: "What happens after the offer.",
        body: [
          "After the offer, the next steps are confirming paperwork, planning pickup or towing if we buy, and preparing the handoff. The exact details depend on the car, the documents, and where it is parked.",
          "The process is meant to reduce uncertainty, especially for sellers dealing with older cars, repair bills, failed smog, title questions, or vehicles that no longer run.",
        ],
      },
    ],
    faqs: [
      {
        question: "What documents do I need?",
        answer:
          "Start with your title or registration, photo ID, and any lien or payoff information if it applies.",
      },
      {
        question: "When do I get paid?",
        answer:
          "Payment is handled when the vehicle and paperwork are confirmed during the sale process.",
      },
      {
        question: "Do you buy cars that do not run?",
        answer:
          "Yes. Non-running vehicles can be reviewed. Share whether it rolls, steers, has keys, and can be reached for pickup.",
      },
      {
        question: "Is pickup or towing included?",
        answer:
          "If we buy your eligible San Diego County vehicle, standard pickup or towing is included.",
      },
      {
        question: "Can I call instead of filling out the form?",
        answer:
          "Yes. Call 619-830-7005 if you want help reviewing the vehicle details before starting online.",
      },
    ],
    related: ["howItWorks", "titleHelp", "freeTowing"],
  },
};

const spanishPages: Record<InternalPageKey, InternalPageContent> = {
  howItWorks: {
    ...englishPages.howItWorks,
    slug: "como-funciona",
    metaTitle: "Cómo funciona Cash for Cars en San Diego | Oferta local",
    metaDescription:
      "Aprende cómo vender tu carro por efectivo en San Diego County: datos del carro, oferta local, papeleo, pickup o grúa, y pago.",
    eyebrow: "Proceso local y simple",
    title: "Cómo funciona vender tu carro por efectivo en San Diego County.",
    intro:
      "Vender un carro no debería convertirse en semanas de mensajes, personas que no llegan, costos de grúa y dudas de papeleo. Nuestro proceso está hecho para vendedores de San Diego County que quieren una oferta clara, orientación práctica y una entrega sencilla.",
    heroImage: {
      title: "Pickup local del carro",
      description:
        "Un pickup local y sencillo para vendedores de San Diego County que quieren avanzar sin complicarse.",
      alt: "Entrega local de un carro vendido por efectivo en San Diego County",
    },
    quickFacts: [
      "Empieza con VIN, placas o datos básicos del carro",
      "Podemos revisar carros para yonke, chocados o que no prenden",
      "Pasar por el carro o mandar grúa estándar va incluido si lo compramos",
      "Llama al 619-830-7005 si quieres ayuda antes de llenar el formulario",
    ],
    sections: [
      {
        ...englishPages.howItWorks.sections[0],
        eyebrow: "Paso 1",
        title: "Cuéntanos qué carro quieres vender.",
        body: [
          "El primer paso es darnos suficiente información para entender qué tienes. El VIN ayuda mucho porque confirma año, marca, modelo, versión, motor y carrocería. Si no tienes el VIN a la mano, puedes empezar con datos básicos y continuar manualmente.",
          "Detalles útiles incluyen millas, si el carro prende, si se puede manejar con seguridad, título, ZIP donde está ubicado y cualquier daño importante. No se evalúa igual un carro limpio de uso diario que una troca con muchas millas, un carro que falló smog o un SUV que no prende.",
        ],
        bullets: [
          "VIN o placas cuando las tengas",
          "Millas y si el carro prende o maneja",
          "Daños, partes faltantes o problemas mecánicos",
          "Título, registro, lien o detalles de préstamo",
        ],
        image: {
          title: "Revisión de datos del carro",
          description:
            "VIN, millas, condición y ubicación ayudan a revisar una oferta más clara.",
          alt: "Vendedor ingresando VIN y datos del carro para una oferta en San Diego",
        },
      },
      {
        ...englishPages.howItWorks.sections[1],
        eyebrow: "Paso 2",
        title: "Recibe una oferta local.",
        body: [
          "La oferta toma en cuenta el carro y el mercado local, no solo un estimado genérico. Demanda en San Diego County, condición, millas, título, valor de partes y detalles para pasar por el carro pueden influir.",
          "La idea es darte una opción práctica. Si el carro está listo para vender, puedes avanzar. Si tienes dudas de título o documentos, podemos ayudarte a identificar qué revisar antes de agendar.",
        ],
        bullets: [
          "Mercado local de San Diego County",
          "Condición y millas",
          "Título y papeleo disponible",
          "Detalles para pasar por el carro o mandar grúa",
        ],
      },
      {
        ...englishPages.howItWorks.sections[2],
        eyebrow: "Paso 3",
        title: "Pasamos por el carro, revisamos papeleo y te pagamos.",
        body: [
          "Cuando se confirma la oferta y el papeleo, sigue la entrega. Si compramos el carro, pasar por él o mandar grúa estándar va incluido, así no tienes que contratar una grúa por tu cuenta.",
          "En la entrega se revisa el carro, llaves, título o documentos disponibles e información del vendedor. El proceso busca ser claro aunque el carro esté en casa, trabajo, taller, yarda, apartamento o estacionado en la calle.",
        ],
        image: {
          title: "Pickup y pago",
          description:
            "Si compramos el carro, pasar por él o mandar grúa estándar va incluido.",
          alt: "Pickup de carro y pago por una venta en San Diego",
        },
      },
    ],
    faqs: [
      {
        question: "¿Puedo empezar sin VIN?",
        answer:
          "Sí. El VIN ayuda, pero puedes empezar con año, marca, modelo, millas, condición y ubicación.",
      },
      {
        question: "¿Tengo que aceptar la oferta?",
        answer:
          "No. Puedes revisar la oferta primero. La idea es que tengas claridad, no presión.",
      },
      {
        question: "¿Qué pasa si el carro está en un taller o yarda?",
        answer:
          "Dinos dónde está. Un taller, yarda, apartamento o estacionamiento cerrado puede requerir instrucciones especiales.",
      },
    ],
  },
  carsWeBuy: {
    ...englishPages.carsWeBuy,
    slug: "carros-que-compramos",
    metaTitle: "Carros que compramos en San Diego | Yonke, chocados y usados",
    metaDescription:
      "Compramos carros usados, para yonke, chocados, que no prenden, trocas, SUVs, vans y carros con muchas millas en San Diego County.",
    eyebrow: "Carros que compramos",
    title: "Carros usados, para yonke, chocados y que no prenden.",
    intro:
      "No todos los carros encajan en una venta privada normal. Algunos tienen daños, problemas mecánicos, smog fallido, dudas de título, partes faltantes o demasiadas millas. Esta página explica qué tipos de carros podemos revisar para una oferta local en San Diego County.",
    heroImage: {
      title: "Carros que revisamos",
      description:
        "Podemos revisar sedanes, trocas, SUVs, vans, carros chocados y carros que no prenden.",
      alt: "Carros usados para yonke chocados y que no prenden en San Diego",
    },
    quickFacts: [
      "Carros usados, viejos o con muchas millas",
      "Carros para yonke, con smog fallido o parados",
      "Carros chocados, dañados o que no prenden",
      "Trocas, SUVs, vans y carros familiares",
    ],
    sections: [
      {
        ...englishPages.carsWeBuy.sections[0],
        title: "Carros usados que todavía corren.",
        body: [
          "Un carro usado puede ser difícil de vender aunque todavía maneje. Tal vez tiene muchas millas, detalles por fuera, registro vencido, luces prendidas o reparaciones que vienen pronto.",
          "Mientras más claro seas con millas, versión, mantenimiento, smog y título, más fácil es revisar una oferta local realista.",
        ],
        image: {
          title: "Oferta por carro usado",
          description:
            "Un carro usado que todavía corre puede ser más fácil de vender con una oferta local.",
          alt: "Carro usado listo para oferta en efectivo en San Diego",
        },
      },
      {
        ...englishPages.carsWeBuy.sections[1],
        title: "Carros problema que compradores privados evitan.",
        body: [
          "Muchos vendedores nos contactan porque su carro no es fácil de publicar. No prende, necesita transmisión, está golpeado o el estimado de reparación sale más caro que el carro.",
          "Eso no significa que no tenga valor. Partes, metal, demanda local, condición y acceso pueden apoyar una oferta.",
        ],
        bullets: [
          "Problemas de motor, transmisión, suspensión o electricidad",
          "Daño por choque o partes faltantes",
          "Smog fallido o registro vencido",
          "Carros en casa, taller, yarda o estacionados en la calle",
        ],
      },
      {
        ...englishPages.carsWeBuy.sections[2],
        title: "Sedanes, trocas, SUVs, vans y carros de trabajo.",
        body: [
          "Podemos revisar más que carros pequeños. Trocas, SUVs, vans, carros familiares y vehículos de trabajo pueden calificar según condición y documentos.",
          "Si no estás seguro, empieza con el VIN o llama al 619-830-7005 para revisar el caso.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Solo compran carros para yonke?",
        answer:
          "No. Podemos revisar carros usados, chocados, que no prenden, trocas, SUVs, vans y carros con muchas millas.",
      },
      {
        question: "¿Compran carros con partes faltantes?",
        answer:
          "Sí, se pueden revisar. Dinos qué partes faltan para preparar una oferta realista.",
      },
      {
        question: "¿Compran carros que fallaron smog?",
        answer:
          "Sí, especialmente si la reparación cuesta más de lo que quieres invertir.",
      },
    ],
  },
  junkCars: {
    ...englishPages.junkCars,
    slug: "carros-para-yonke",
    metaTitle: "Vendo carro para yonke San Diego | Oferta en efectivo",
    metaDescription:
      "Vende tu carro para yonke en San Diego County. Revisamos carros con smog fallido, parados, salvage, partes faltantes o reparaciones caras.",
    eyebrow: "Carros para yonke",
    title: "Vende tu carro para yonke por efectivo en San Diego County.",
    intro:
      "Un carro para yonke puede ser un carro que no pasa smog, está parado, tiene salvage, le faltan partes o cuesta más arreglarlo que venderlo. Aquí explicamos qué revisamos cuando pides una oferta por un carro para yonke en San Diego.",
    heroImage: {
      title: "Oferta por carro para yonke",
      description:
        "Un carro viejo, parado o incompleto todavía puede calificar para una oferta.",
      alt: "Carro para yonke en San Diego listo para vender por efectivo",
    },
    quickFacts: [
      "Smog fallido y registro viejo se pueden revisar",
      "Partes faltantes o salvage pueden calificar",
      "Pasar por el carro va incluido si lo compramos",
      "Útil para carros en casa, taller o calle",
    ],
    sections: [
      {
        ...englishPages.junkCars.sections[0],
        title: "¿Qué cuenta como carro para yonke?",
        body: [
          "Normalmente es un carro que ya no conviene reparar, asegurar, mantener o vender a un comprador privado. Puede prender todavía o puede no moverse nada.",
          "Ejemplos comunes incluyen registro vencido, smog fallido, motor dañado, transmisión mala, catalizador faltante, interior dañado o años parado.",
        ],
        image: {
          title: "Condición del carro para yonke",
          description:
            "Partes faltantes, llantas, registro, llaves y acceso pueden afectar la oferta.",
          alt: "Detalles de carro para yonke antes de una oferta",
        },
      },
      {
        ...englishPages.junkCars.sections[1],
        title: "Qué afecta la oferta por un carro para yonke.",
        body: [
          "La oferta puede depender de año, marca, modelo, peso, demanda de partes, qué tan completo está, documentos y ubicación. Un SUV completo no se evalúa igual que un compacto sin partes.",
          "Ser claro con la condición ayuda. Si falta el catalizador, no tiene llantas, no hay llaves o está bloqueado, dilo desde el inicio.",
        ],
        bullets: [
          "¿Está completo o le faltan partes?",
          "¿Rueda, gira y tiene llantas?",
          "¿Tienes llaves, título o registro?",
          "¿Dónde está en San Diego County?",
        ],
      },
      {
        ...englishPages.junkCars.sections[2],
        title: "Sacarlo sin contratar tu propia grúa.",
        body: [
          "Si compramos el carro, pasar por él o mandar grúa estándar va incluido. Para muchos vendedores, eso es lo más importante: quitar el carro de la entrada, taller, apartamento o calle.",
          "Antes de agendar, revisamos acceso: reja, driveway angosto, garage, yarda o requisitos de salida.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Puedo vender un carro para yonke sin registro vigente?",
        answer:
          "Se puede revisar. Dinos qué documentos sí tienes para identificar el siguiente paso.",
      },
      {
        question: "¿Compran carros sin llaves?",
        answer:
          "Puede ser. Un carro sin llaves necesita más detalles de acceso, especialmente si no rueda.",
      },
      {
        question: "¿Pagan por carros para yonke?",
        answer:
          "Sí, carros elegibles pueden recibir una oferta según condición, tipo de vehículo, partes, papeleo y ubicación.",
      },
    ],
  },
  damagedCars: {
    ...englishPages.damagedCars,
    slug: "carros-danados",
    metaTitle: "Vender carro chocado San Diego | Daños y accidentes",
    metaDescription:
      "Vende un carro chocado o dañado en San Diego County. Revisamos daños por accidente, problemas mecánicos, bolsas de aire, partes faltantes y estimados de reparación.",
    eyebrow: "Carros chocados",
    title: "Vende tu carro chocado en San Diego sin arreglarlo primero.",
    intro:
      "Un carro chocado puede ser difícil de vender. Los compradores piden descuento, los estimados suben y tal vez el carro no es seguro para manejar. Revisamos carros dañados como están, para que compares si una oferta local tiene más sentido que pagar reparaciones.",
    heroImage: {
      title: "Oferta por carro chocado",
      description:
        "Un carro chocado puede revisarse como está, sin arreglarlo antes de pedir una oferta.",
      alt: "Carro chocado en San Diego revisado para oferta en efectivo",
    },
    quickFacts: [
      "Choques y daños de carrocería se pueden revisar",
      "Problemas mecánicos y estimados de reparación importan",
      "Bolsas de aire o partes faltantes deben mencionarse",
      "Si no es seguro manejarlo, se puede planear pickup",
    ],
    sections: [
      {
        ...englishPages.damagedCars.sections[0],
        title: "Daños que podemos revisar.",
        body: [
          "El daño puede ser por fuera, estructural, mecánico o una mezcla. No es igual un rayón que un carro con frame damage, bolsas de aire activadas, ruedas dañadas o problema fuerte de motor.",
          "Describe qué pasó, qué funciona todavía y si el carro se puede mover con seguridad.",
        ],
        bullets: [
          "Daño frontal, trasero, lateral o por granizo",
          "Problemas mecánicos después del choque",
          "Bolsas de aire activadas o luces prendidas",
          "Defensa, luces, espejos, ruedas o catalizador faltante",
        ],
      },
      {
        ...englishPages.damagedCars.sections[1],
        title: "Cuándo vender puede ser mejor que reparar.",
        body: [
          "Reparar puede convenir si el carro es nuevo, está asegurado y vale más que la reparación. Pero en carros viejos o con muchas millas, body work, pintura, sensores, suspensión y almacenamiento suben rápido.",
          "Una oferta en efectivo te da otra opción antes de gastar más dinero en reparaciones.",
        ],
        image: {
          title: "Reparar o vender",
          description:
            "Compara el costo de reparación con una oferta local antes de invertir más dinero.",
          alt: "Estimado de reparación antes de vender un carro chocado",
        },
      },
      {
        ...englishPages.damagedCars.sections[2],
        title: "Pickup para carros dañados.",
        body: [
          "Si el carro no se puede manejar con seguridad, dilo antes de agendar. Llantas ponchadas, ruedas dobladas, dirección bloqueada, falta de llaves o acceso limitado pueden cambiar el plan.",
          "La meta es evitar sorpresas y hacer la entrega más sencilla.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Compran carros después de un accidente?",
        answer:
          "Sí. Podemos revisar carros chocados, con daños, bolsas de aire activadas o problemas mecánicos.",
      },
      {
        question: "¿Debo arreglar el carro antes de venderlo?",
        answer:
          "No siempre. Compara el estimado de reparación con la oferta antes de gastar dinero.",
      },
      {
        question: "¿Compran carros con título salvage?",
        answer:
          "Se pueden considerar. Comparte el estado del título desde el inicio.",
      },
    ],
  },
  nonRunningCars: {
    ...englishPages.nonRunningCars,
    slug: "carros-que-no-prenden",
    metaTitle: "Vender carro que no prende San Diego | Pickup incluido",
    metaDescription:
      "Vende un carro que no prende en San Diego County. Revisamos carros sin arranque, con llantas ponchadas, problemas de motor o que necesitan grúa.",
    eyebrow: "Carros que no prenden",
    title: "Vende un carro que no prende en San Diego County.",
    intro:
      "Un carro que no prende es más difícil de vender. No hay test drive, moverlo cuesta dinero y muchos compradores no son serios. Nosotros empezamos con los datos del carro y después revisamos cómo pasar por él si lo compramos.",
    heroImage: {
      title: "Pickup para carro que no prende",
      description:
        "Un carro que no prende todavía puede revisarse para una oferta y un plan de pickup.",
      alt: "Pickup de carro que no prende en San Diego County",
    },
    quickFacts: [
      "Carros que no prenden se pueden revisar",
      "Dinos si rueda, gira y tiene llantas con aire",
      "No necesitas test drive para empezar",
      "Grúa estándar va incluida si lo compramos",
    ],
    sections: [
      {
        ...englishPages.nonRunningCars.sections[0],
        title: "Por qué no prende sí importa.",
        body: [
          "Un carro puede no prender por batería, starter, motor, transmisión, electricidad, combustible o accidente. La razón importa porque algunos carros todavía tienen buen valor en partes y otros requieren más planeación para moverlos.",
          "Si no sabes exactamente qué pasó, cuenta lo último que recuerdas: se calentó, dio click, se apagó, prende y se apaga o dejó de funcionar después de un choque.",
        ],
        bullets: [
          "¿Prende algo o nada?",
          "¿Puede ponerse en neutral?",
          "¿Tiene ruedas y llantas con aire?",
          "¿La grúa puede llegar hasta el carro?",
        ],
      },
      {
        ...englishPages.nonRunningCars.sections[1],
        title: "El acceso es parte del proceso.",
        body: [
          "Un carro que no prende necesita buena información de acceso. No es lo mismo estar en driveway, parking garage, reja cerrada, taller o yarda.",
          "Si está bloqueado, tiene llantas ponchadas, no hay llaves o no rueda, dilo desde el inicio.",
        ],
        image: {
          title: "Revisión de acceso",
          description:
            "El acceso importa cuando el carro está en driveway, apartamento, garage, taller o yarda.",
          alt: "Detalles de acceso para pickup de carro que no prende",
        },
      },
      {
        ...englishPages.nonRunningCars.sections[2],
        title: "Papeleo para un carro que no prende.",
        body: [
          "Aunque no prenda, el carro necesita información del vendedor y documentos disponibles. Título, registro, lien release, payoff, bill of sale o duplicado de título pueden importar.",
          "Si te falta algo, empieza con lo que tienes. Te ayudamos a identificar qué revisar antes de agendar.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Puedo vender un carro que no arranca?",
        answer:
          "Sí. Dinos qué sabes del problema y dónde está estacionado.",
      },
      {
        question: "¿Tiene que rodar?",
        answer:
          "Ayuda, pero no siempre es obligatorio. Dinos si tiene ruedas, llantas con aire y si puede ponerse en neutral.",
      },
      {
        question: "¿Pueden pasar por un taller?",
        answer:
          "Sí, se puede revisar. El taller puede necesitar autorización o instrucciones de salida.",
      },
    ],
  },
  trucksSuvs: {
    ...englishPages.trucksSuvs,
    slug: "trocas-y-suvs",
    metaTitle: "Vender troca o SUV San Diego | Oferta en efectivo",
    metaDescription:
      "Vende tu troca, SUV, van, carro de trabajo o carro familiar en San Diego County. Revisamos vehículos usados, chocados, con muchas millas o que no prenden.",
    eyebrow: "Trocas y SUVs",
    title: "Vende tu troca, SUV, van o carro de trabajo en San Diego.",
    intro:
      "Trocas y SUVs pueden tener valor aunque estén viejas, dañadas, con muchas millas o caras de reparar. Si tienes una SUV familiar, work truck, van o troca que ya no necesitas, podemos revisar los datos para una oferta local.",
    heroImage: {
      title: "Oferta por troca o SUV",
      description:
        "Trocas, SUVs, vans y vehículos de trabajo pueden revisarse para una oferta local.",
      alt: "Troca o SUV vendida por efectivo en San Diego County",
    },
    quickFacts: [
      "Pickups, SUVs, vans y carros familiares",
      "Muchas millas, daño o no prender se puede revisar",
      "Vehículos de trabajo pueden calificar",
      "Pickup depende de tamaño, condición y acceso",
    ],
    sections: [
      {
        ...englishPages.trucksSuvs.sections[0],
        title: "Por qué trocas y SUVs se revisan diferente.",
        body: [
          "Trocas, SUVs y vans pueden tener más demanda en partes, más peso y diferente valor local que carros pequeños. Tracción, motor, versión, drivetrain y condición influyen.",
          "Una troca con muchas millas y problemas mecánicos puede valer la pena revisar si está completa y el título está claro.",
        ],
      },
      {
        ...englishPages.trucksSuvs.sections[1],
        title: "Work vehicles, vans y SUVs familiares.",
        body: [
          "Muchos vendedores usan estos vehículos hasta que las reparaciones ya no convienen. Transmisión, suspensión, head gasket, smog fallido o daño por fuera pueden complicar la venta privada.",
          "Dinos si era de trabajo, familia, towing, commuting o fleet para entender mejor el desgaste.",
        ],
        image: {
          title: "Revisión de vehículo de trabajo",
          description:
            "Trocas y vans de trabajo pueden tener valor aunque tengan millas, desgaste o daños.",
          alt: "Troca o van de trabajo usada lista para oferta en San Diego",
        },
      },
      {
        ...englishPages.trucksSuvs.sections[2],
        title: "Pickup para vehículos grandes.",
        body: [
          "Vehículos grandes pueden necesitar más espacio para grúa. Dinos si está en calle angosta, garage, apartamento, driveway inclinado o bloqueado por otro carro.",
          "Buenos detalles de acceso evitan retrasos el día de la entrega.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Compran trocas con muchas millas?",
        answer:
          "Sí, se pueden revisar. Las millas importan, pero también condición, partes, título y acceso.",
      },
      {
        question: "¿Puedo vender una van de trabajo?",
        answer:
          "Sí. Vans y vehículos de trabajo se pueden revisar, aunque estén viejos o dañados.",
      },
      {
        question: "¿Compran SUVs que no prenden?",
        answer:
          "Sí. SUVs que no prenden pueden considerarse si se revisa acceso y papeleo.",
      },
    ],
  },
  titleHelp: {
    ...englishPages.titleHelp,
    slug: "ayuda-con-titulo",
    metaTitle: "Ayuda con título de carro San Diego | DMV y papeleo",
    metaDescription:
      "Ayuda para vender tu carro con dudas de título en San Diego: título perdido, registro vencido, lien, payoff, release letter y formularios del DMV.",
    eyebrow: "Título y papeleo",
    title: "Ayuda con título y papeleo del DMV antes de vender.",
    intro:
      "Las dudas de papeleo detienen a muchos vendedores. Tal vez no encuentras el título, el registro está vencido, hay un lien o el carro era de un familiar. No damos asesoría legal, pero sí podemos ayudarte a entender qué información puede necesitar revisión antes del pickup.",
    heroImage: {
      title: "Revisión de título y papeleo",
      description:
        "Título, registro, lien y datos del vendedor pueden revisarse antes de planear la entrega.",
      alt: "Título y papeleo del DMV para vender un carro en San Diego",
    },
    quickFacts: [
      "Título perdido o duplicado de título",
      "Registro, fees y dudas del DMV",
      "Lien, payoff o release letter",
      "Detalles de entrega antes del pickup",
    ],
    sections: [
      {
        ...englishPages.titleHelp.sections[0],
        title: "Título perdido o documentos faltantes.",
        body: [
          "No encontrar el título no siempre significa que no puedes avanzar, pero sí significa que el papeleo debe revisarse antes de agendar. Registro, duplicado de título, bill of sale u otros documentos pueden importar.",
          "Empieza con lo que tienes para identificar el siguiente paso sin perder tiempo con compradores privados.",
        ],
      },
      {
        ...englishPages.titleHelp.sections[1],
        title: "Registro, fees y dudas del DMV.",
        body: [
          "Registro vencido, tags viejos, fees pendientes o smog fallido pueden complicar una venta privada. No siempre impiden una oferta, pero sí pueden afectar el plan de entrega.",
          "Dinos qué sabes del registro. Si no estás seguro, podemos empezar con los datos del carro y vendedor.",
        ],
        image: {
          title: "Detalles de registro",
          description:
            "Registro vencido, tags viejos, fees o smog pueden afectar el plan de entrega.",
          alt: "Papeleo de registro para vender un carro en San Diego",
        },
      },
      {
        ...englishPages.titleHelp.sections[2],
        title: "Préstamo, lien, payoff o release.",
        body: [
          "Si el carro tiene préstamo o puede tener un lien, hay que entender payoff o release antes de cerrar planes. Una carta de liberación o información del lender puede ser parte de la revisión.",
          "Mencionar esto desde el inicio evita sorpresas después.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Puedo vender un carro sin título?",
        answer:
          "Depende de qué documentos sí tienes y del caso del carro. Empieza con registro, ID y cualquier documento del DMV.",
      },
      {
        question: "¿Puedo vender un carro con registro vencido?",
        answer:
          "Se puede revisar. Puede afectar papeleo, pero no siempre detiene el proceso.",
      },
      {
        question: "¿Ustedes hacen los formularios del DMV?",
        answer:
          "Podemos explicar detalles comunes de entrega, pero requisitos oficiales deben confirmarse para tu caso.",
      },
    ],
  },
  sanDiegoCounty: {
    ...englishPages.sanDiegoCounty,
    slug: "san-diego-county",
    metaTitle: "Compramos carros en San Diego County | Áreas de servicio",
    metaDescription:
      "Compramos carros en las áreas de San Diego County que atendemos, desde Camp Pendleton y Oceanside hacia el sur, y desde Alpine hacia la costa.",
    eyebrow: "Áreas de servicio",
    title: "Compramos carros en todo San Diego County.",
    intro:
      "San Diego County es grande, por eso mantenemos el área de servicio clara. Nuestra ruta regular va desde Camp Pendleton y Oceanside hacia el sur, y desde Alpine hacia la costa. Para rutas más al este, en montaña o desierto, conviene llamar primero.",
    heroImage: {
      title: "Área de servicio en San Diego County",
      description:
        "Una vista clara del área local donde revisamos carros en San Diego County.",
      alt: "Mapa de áreas de servicio para comprar carros en San Diego County",
    },
    quickFacts: [
      "San Diego, Chula Vista, National City y South Bay",
      "El Cajon, La Mesa, Santee, Poway y rutas cercanas a Alpine",
      "Oceanside, Escondido, Carlsbad, Encinitas y North County",
      "Llama primero para Borrego Springs, Julian, Campo, Pine Valley, Descanso o rutas muy al este",
    ],
    sections: [
      {
        ...englishPages.sanDiegoCounty.sections[0],
        title: "Central San Diego y South Bay.",
        body: [
          "Podemos revisar carros en San Diego, Chula Vista, National City, Imperial Beach, Otay Mesa y comunidades cercanas. En estas áreas hay apartamentos, calle, talleres y accesos angostos, así que los detalles importan.",
          "Si el carro está en lote compartido, detrás de reja o estacionado en la calle, dilo antes de agendar.",
        ],
        image: {
          title: "Área de pickup en South Bay",
          description:
            "Vendedores en South Bay y San Diego pueden empezar con datos del carro y ubicación.",
          alt: "Servicio cash for cars en San Diego y South Bay",
        },
      },
      {
        ...englishPages.sanDiegoCounty.sections[1],
        title: "East County y comunidades inland.",
        body: [
          "El Cajon, La Mesa, Santee, Poway y rutas cercanas a Alpine se pueden revisar. Para rutas más al este, incluyendo Borrego Springs, Julian, Campo, Pine Valley, Descanso y zonas similares de montaña o desierto, llama primero para confirmar.",
          "Si el carro no prende, dinos si rueda, tiene llantas y si una grúa puede llegar. Mientras más inland esté, más importan los detalles de ubicación.",
        ],
      },
      {
        ...englishPages.sanDiegoCounty.sections[2],
        title: "North County y la costa.",
        body: [
          "Oceanside, rutas cerca de Camp Pendleton, Escondido, Carlsbad, Encinitas y comunidades cercanas también son parte del área local. Puedes empezar con VIN en línea y seguir el mismo proceso.",
          "Ubicación, título y horario se revisan antes de agendar.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Compran carros fuera de la ciudad de San Diego?",
        answer:
          "Sí. Revisamos carros dentro del área práctica de San Diego County, no solo dentro de la ciudad.",
      },
      {
        question: "¿Qué áreas conviene confirmar por teléfono?",
        answer:
          "Llama primero para Borrego Springs, Julian, Campo, Pine Valley, Descanso o rutas muy al este, así podemos revisar la ruta antes de que cuentes con el pickup.",
      },
      {
        question: "¿La ubicación afecta la oferta?",
        answer:
          "Ubicación y acceso pueden afectar el plan. También importan condición, título, millas y demanda local.",
      },
      {
        question: "¿Pueden pasar por apartamentos o lotes con reja?",
        answer:
          "Muchas veces sí, pero acceso, reglas de estacionamiento y espacio para grúa deben revisarse antes.",
      },
    ],
  },
  incorporatedCities: {
    ...englishPages.incorporatedCities,
    slug: "ciudades-incorporadas",
    metaTitle: "Compramos carros en ciudades de San Diego County",
    metaDescription:
      "Consulta las ciudades incorporadas de San Diego County que atendemos, organizadas por North County, zona central, East County y South Bay.",
    eyebrow: "Ciudades incorporadas",
    title: "Compramos carros en las ciudades incorporadas de San Diego County.",
    intro:
      "Organizamos las ciudades por región para que sea fácil confirmar dónde trabajamos normalmente. La cobertura práctica es desde Camp Pendleton y Oceanside hacia el sur, y desde Alpine hacia la costa.",
    heroImage: {
      title: "Imagen de área de servicio por ciudades",
      description:
        "Una vista clara del área local por ciudades, sin convertir la página en una lista pesada.",
      alt: "Área de servicio para comprar carros en ciudades de San Diego County",
    },
    quickFacts: [
      "Incluimos las 18 ciudades incorporadas",
      "Cobertura desde Oceanside y Camp Pendleton hacia el sur",
      "Alpine es el límite este práctico antes de rutas más lejanas",
      "Llama primero para Borrego Springs, Julian, Campo, Pine Valley, Descanso y zonas muy al este",
    ],
    sections: [
      {
        ...englishPages.incorporatedCities.sections[0],
        eyebrow: "North County costa",
        title: "Oceanside, Carlsbad, Encinitas, Solana Beach y Del Mar.",
        body: [
          "Vendedores en la costa de North County pueden empezar con VIN, condición del carro y ubicación. Estas ciudades entran dentro del área normal desde Camp Pendleton y Oceanside hacia el sur.",
          "El pickup puede ser en apartamentos, driveway, taller, calle o cerca del trabajo.",
        ],
      },
      {
        ...englishPages.incorporatedCities.sections[1],
        eyebrow: "North County inland",
        title: "Vista, San Marcos, Escondido y Poway.",
        body: [
          "Estas ciudades inland de North County son parte del área regular. El plan depende de si el carro prende, rueda, tiene llaves y si una grúa puede llegar.",
          "Este grupo mantiene las ciudades inland separadas de la costa para que la lista sea más fácil de leer.",
        ],
      },
      {
        ...englishPages.incorporatedCities.sections[2],
        eyebrow: "Central y metro",
        title: "San Diego, La Mesa, Lemon Grove y Coronado.",
        body: [
          "Las ciudades centrales suelen tener detalles de acceso: calle, rejas, reglas de apartamento, talleres o estacionamientos de negocios. Compartir la ubicación desde el principio ayuda a evitar retrasos.",
          "Las áreas dentro de la ciudad de San Diego van en una sección separada en la página principal para no mezclar ciudades con vecindarios.",
        ],
      },
      {
        ...englishPages.incorporatedCities.sections[3],
        eyebrow: "East y South County",
        title: "El Cajon, Santee, Chula Vista, National City e Imperial Beach.",
        body: [
          "East y South County están incluidos, usando Alpine como referencia práctica hacia el este. Para zonas más lejos en montaña o desierto, conviene llamar primero y confirmar la ruta.",
          "En South Bay puedes empezar en línea o llamar si el carro está chocado, no prende, está en un lugar complicado o necesita planeación de pickup.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Atienden todas las ciudades incorporadas de San Diego County?",
        answer:
          "Sí. La lista de ciudades incorporadas está incluida, y el plan depende de ubicación, acceso, condición y horario.",
      },
      {
        question: "¿Qué áreas conviene confirmar por teléfono?",
        answer:
          "Llama primero para Borrego Springs, Julian, Campo, Pine Valley, Descanso o rutas muy al este, para revisar si el pickup se puede coordinar.",
      },
      {
        question: "¿Cuál es la forma más fácil de confirmar una ciudad?",
        answer:
          "Empieza con VIN y ZIP, o llama al 619-830-7005 si quieres confirmar la ruta antes de llenar el formulario.",
      },
    ],
    related: ["sanDiegoCounty", "freeTowing", "howItWorks"],
  },
  freeTowing: {
    ...englishPages.freeTowing,
    slug: "grua-sin-costo",
    metaTitle: "Grúa sin costo si compramos tu carro | San Diego",
    metaDescription:
      "Si compramos tu carro en San Diego County, pasar por él o mandar grúa estándar va incluido. Revisa detalles para carros para yonke, chocados o que no prenden.",
    eyebrow: "Pickup y grúa",
    title: "Pasar por tu carro o mandar grúa estándar va incluido si lo compramos.",
    intro:
      "Para muchos vendedores, mover el carro es lo más difícil. Un carro que no prende, tiene llantas ponchadas, está en taller o está estacionado en un lugar complicado puede costar moverlo. Si compramos tu carro, pickup o grúa estándar va incluido para vehículos elegibles en San Diego County.",
    heroImage: {
      title: "Pickup o grúa incluida",
      description:
        "Si compramos un carro elegible en San Diego County, pickup o grúa estándar va incluido.",
      alt: "Grúa incluida para carro comprado en San Diego County",
    },
    quickFacts: [
      "Pickup o grúa estándar va incluido si lo compramos",
      "Útil para carros para yonke, chocados o que no prenden",
      "Detalles de acceso deben compartirse antes",
      "Talleres, yardas, apartamentos y rejas pueden necesitar planeación",
    ],
    sections: [
      {
        ...englishPages.freeTowing.sections[0],
        title: "Qué significa que el pickup va incluido.",
        body: [
          "Significa que no tienes que contratar tu propia grúa para completar la venta cuando compramos el carro. La grúa estándar cubre muchas situaciones normales, pero acceso y condición importan.",
          "Un carro que rueda en driveway no es igual que uno sin ruedas, sin llaves o bloqueado. Los detalles ayudan a confirmar el plan.",
        ],
      },
      {
        ...englishPages.freeTowing.sections[1],
        title: "Detalles de acceso que debes compartir.",
        body: [
          "Antes del pickup, dinos dónde está el carro y si una grúa puede llegar. Apartamentos, garages, calles angostas, rejas y yardas pueden requerir instrucciones diferentes.",
          "Si el carro está en taller o yarda, puede necesitar autorización de salida.",
        ],
        image: {
          title: "Acceso para grúa",
          description:
            "Apartamentos, garages, calles angostas, rejas y yardas pueden necesitar instrucciones diferentes.",
          alt: "Detalles de acceso para grúa en San Diego",
        },
      },
      {
        ...englishPages.freeTowing.sections[2],
        title: "Por qué la grúa importa para carros que no prenden.",
        body: [
          "Un carro que no prende puede quedarse meses parado porque moverlo cuesta. Que el pickup vaya incluido ayuda a avanzar sin pagar grúa antes de saber si la venta conviene.",
          "Empieza con datos del carro y ubicación. Revisamos si prende, rueda, gira, tiene llaves y tiene llantas.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿La grúa siempre es sin costo?",
        answer:
          "Si compramos tu carro elegible en San Diego County, pasar por él o mandar grúa estándar va incluido. Accesos difíciles o partes faltantes deben revisarse.",
      },
      {
        question: "¿Pueden pasar por un taller?",
        answer:
          "Se puede revisar. El taller puede pedir autorización o una ventana de pickup.",
      },
      {
        question: "¿Pueden recoger de una yarda?",
        answer:
          "Puede ser posible, pero reglas de salida, storage fees y papeleo se deben revisar.",
      },
    ],
  },
  faq: {
    ...englishPages.faq,
    slug: "preguntas",
    metaTitle: "Preguntas Cash for Cars San Diego | Ofertas, título y grúa",
    metaDescription:
      "Respuestas sobre vender tu carro por efectivo en San Diego County: ofertas, título, papeleo, pickup, grúa, pago y condición del carro.",
    eyebrow: "Preguntas de vendedores",
    title: "Preguntas que hacen vendedores en San Diego antes de pedir una oferta.",
    intro:
      "Antes de pedir una oferta, la mayoría quiere saber qué documentos necesita, si aceptamos carros chocados, si la grúa va incluida y cómo funciona el pago. Esta página junta las respuestas principales para que avances con más claridad.",
    heroImage: {
      title: "Preguntas de vendedores",
      description:
        "Respuestas rápidas sobre ofertas, título, pickup, grúa, pago y condición del carro.",
      alt: "Preguntas sobre vender un carro por efectivo en San Diego",
    },
    quickFacts: [
      "Las ofertas dependen del carro y mercado local",
      "Carros para yonke, chocados y que no prenden se pueden revisar",
      "Dudas de título y registro deben compartirse temprano",
      "Llama al 619-830-7005 si quieres ayuda",
    ],
    sections: [
      {
        ...englishPages.faq.sections[0],
        title: "Qué saber antes de pedir una oferta.",
        body: [
          "No necesitas tener todas las respuestas para empezar. Lo más útil es compartir VIN o datos básicos, millas, condición, título y ubicación.",
          "Si algo no sabes, dilo. Es mejor marcar título, lien, millas o acceso como no seguro que adivinar.",
        ],
      },
      {
        ...englishPages.faq.sections[1],
        title: "Qué pasa después de la oferta.",
        body: [
          "Después de la oferta, siguen confirmar papeleo, planear pickup o grúa si compramos el carro, y preparar la entrega.",
          "El proceso busca reducir dudas, especialmente con carros viejos, reparaciones caras, smog fallido, título complicado o carros que no prenden.",
        ],
      },
    ],
    faqs: [
      {
        question: "¿Qué documentos necesito?",
        answer:
          "Empieza con título o registro, identificación y detalles de préstamo o lien si aplica.",
      },
      {
        question: "¿Cuándo me pagan?",
        answer:
          "El pago se maneja cuando se confirma el carro y el papeleo durante el proceso de venta.",
      },
      {
        question: "¿Compran carros que no prenden?",
        answer:
          "Sí. Dinos si rueda, gira, tiene llaves y si una grúa puede llegar.",
      },
      {
        question: "¿El pickup o grúa va incluido?",
        answer:
          "Si compramos tu carro elegible en San Diego County, pickup o grúa estándar va incluido.",
      },
      {
        question: "¿Puedo llamar en vez de llenar el formulario?",
        answer:
          "Sí. Llama al 619-830-7005 si quieres ayuda antes de empezar en línea.",
      },
    ],
  },
};

const pagesByLocale: Record<Locale, Record<InternalPageKey, InternalPageContent>> = {
  en: englishPages,
  es: spanishPages,
};

export function getInternalPages(locale: Locale) {
  return Object.values(pagesByLocale[locale]);
}

export function getInternalPageBySlug(locale: Locale, slug: string) {
  return getInternalPages(locale).find((page) => page.slug === slug);
}

export function getInternalPage(locale: Locale, key: InternalPageKey) {
  return pagesByLocale[locale][key];
}

export function getInternalPath(locale: Locale, key: InternalPageKey) {
  const page = getInternalPage(locale, key);
  return locale === "en" ? `/${page.slug}` : `/es/${page.slug}`;
}
