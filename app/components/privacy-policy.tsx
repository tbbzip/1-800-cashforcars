import type { Dictionary, Locale } from "../dictionaries";
import { serviceAreaPhone, serviceAreaPhoneHref } from "../service-area";
import { SiteFooter } from "./site-footer";
import { SiteNavigation } from "./site-navigation";

export const privacyPolicyUpdated = { en: "September 29, 2026", es: "29 de septiembre de 2026" };

type Section = { title: string; paragraphs?: string[]; items?: string[] };

// Describes what this website actually does. Business practices outside the site
// (retention, sharing) should be confirmed by the owner before publishing changes.
const content: Record<Locale, { title: string; updated: string; intro: string; sections: Section[]; contactTitle: string; contactBody: string }> = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated",
    intro: "1-800 Cash for Cars (“we,” “us”) is owned by Quick Auto Wrecking and buys whole vehicles in San Diego County. This policy explains what information we collect through www.1-800-cashforcars.com, how we use it, and the choices you have.",
    sections: [
      {
        title: "Information you give us",
        items: [
          "When you request an offer: your name, phone number, ZIP code, and vehicle details such as year, make, model, VIN, mileage, condition, and ownership or title status.",
          "If you choose to add them: the pickup address, notes, and (on the detailed offer form) your email address.",
          "When you call, text, or chat with us: the information you share in that conversation.",
        ],
      },
      {
        title: "Information collected automatically",
        paragraphs: [
          "Like most websites, we and the services listed below use cookies and similar technologies to collect information such as your browser and device type, pages visited, the site that referred you, approximate location based on your IP address, and how you interact with pages (for example clicks and scrolling).",
          "If you arrive by clicking one of our Google ads, the ad click identifier (gclid, gbraid, or wbraid) is stored in your browser for up to 90 days and sent with your offer request. This lets us tell Google Ads whether an ad led to a request or a vehicle purchase.",
          "Third-party services on this site may collect information about your online activities over time and across different websites.",
        ],
      },
      {
        title: "How we use information",
        items: [
          "To review your vehicle, prepare an offer, and call or text you about your request.",
          "To schedule pickup or towing and help with title and DMV paperwork.",
          "To protect our forms from spam and abuse.",
          "To measure and improve our website and advertising, including reporting ad results to Google Ads.",
          "To meet legal and record-keeping obligations.",
        ],
      },
      {
        title: "Service providers we use",
        paragraphs: ["We share information with companies that help us run this website and handle your request:"],
        items: [
          "Vercel, which hosts this website.",
          "Resend, which delivers your offer request to our team by email.",
          "Cloudflare Turnstile, which checks that form submissions come from people.",
          "Google (Google Analytics, Google Ads, and Google Tag Manager), for site analytics, ad measurement, and advertising, including showing our ads to people who visited this site.",
          "Microsoft Clarity, which records how visitors use our pages (such as clicks, scrolling, and page layout) so we can improve them.",
          "LiveChat, which provides website chat.",
        ],
      },
      {
        title: "Your choices",
        items: [
          "You can block or delete cookies in your browser settings.",
          "You can limit personalized Google ads at adssettings.google.com and opt out of Google Analytics with the browser add-on at tools.google.com/dlpage/gaoptout.",
          "To review, correct, or delete the information you sent us, or to stop calls and texts about your request, call us or write to the address below.",
        ],
      },
      {
        title: "Do Not Track",
        paragraphs: ["Our website does not currently respond to browser Do Not Track signals."],
      },
      {
        title: "How long we keep information",
        paragraphs: ["We keep request information for as long as we need it to respond to you, complete a purchase, and meet legal, tax, and DMV record-keeping requirements."],
      },
      {
        title: "Children",
        paragraphs: ["This website is for vehicle owners and is not directed to children under 13. We do not knowingly collect information from children."],
      },
      {
        title: "Changes to this policy",
        paragraphs: ["If we change this policy, we will post the new version on this page and update the date above."],
      },
    ],
    contactTitle: "Contact us",
    contactBody: "1-800 Cash for Cars, 552 Alta Rd #4, San Diego, CA 92154.",
  },
  es: {
    title: "Política de privacidad",
    updated: "Última actualización",
    intro: "1-800 Cash for Cars (“nosotros”) pertenece a Quick Auto Wrecking y compra vehículos completos en San Diego County. Esta política explica qué información recopilamos en www.1-800-cashforcars.com, cómo la usamos y qué opciones tienes.",
    sections: [
      {
        title: "Información que nos das",
        items: [
          "Cuando pides una oferta: tu nombre, teléfono, código ZIP y los datos del vehículo, como año, marca, modelo, VIN, millaje, condición y situación de propiedad o título.",
          "Si decides agregarlos: la dirección de recogida, notas y (en el formulario de oferta detallado) tu correo electrónico.",
          "Cuando nos llamas, nos escribes o chateas con nosotros: la información que compartes en esa conversación.",
        ],
      },
      {
        title: "Información que se recopila automáticamente",
        paragraphs: [
          "Como la mayoría de los sitios web, nosotros y los servicios que aparecen abajo usamos cookies y tecnologías similares para recopilar información como tu navegador y tipo de dispositivo, las páginas que visitas, el sitio que te trajo, tu ubicación aproximada según tu dirección IP y cómo interactúas con las páginas (por ejemplo, clics y desplazamiento).",
          "Si llegas al hacer clic en uno de nuestros anuncios de Google, el identificador del clic (gclid, gbraid o wbraid) se guarda en tu navegador hasta por 90 días y se envía con tu solicitud de oferta. Así podemos informar a Google Ads si un anuncio llevó a una solicitud o a la compra de un vehículo.",
          "Los servicios de terceros en este sitio pueden recopilar información sobre tu actividad en línea a lo largo del tiempo y en distintos sitios web.",
        ],
      },
      {
        title: "Cómo usamos la información",
        items: [
          "Para revisar tu vehículo, preparar una oferta y llamarte o escribirte sobre tu solicitud.",
          "Para programar la recogida o la grúa y ayudarte con el título y los trámites del DMV.",
          "Para proteger nuestros formularios contra spam y abuso.",
          "Para medir y mejorar nuestro sitio y nuestra publicidad, incluido el reporte de resultados a Google Ads.",
          "Para cumplir obligaciones legales y de registro.",
        ],
      },
      {
        title: "Proveedores de servicios que usamos",
        paragraphs: ["Compartimos información con empresas que nos ayudan a operar este sitio y atender tu solicitud:"],
        items: [
          "Vercel, que aloja este sitio web.",
          "Resend, que entrega tu solicitud de oferta a nuestro equipo por correo electrónico.",
          "Cloudflare Turnstile, que verifica que los formularios los envíen personas.",
          "Google (Google Analytics, Google Ads y Google Tag Manager), para análisis del sitio, medición de anuncios y publicidad, incluido mostrar nuestros anuncios a personas que visitaron este sitio.",
          "Microsoft Clarity, que registra cómo se usan nuestras páginas (como clics, desplazamiento y diseño de la página) para mejorarlas.",
          "LiveChat, que ofrece el chat del sitio.",
        ],
      },
      {
        title: "Tus opciones",
        items: [
          "Puedes bloquear o borrar cookies en la configuración de tu navegador.",
          "Puedes limitar los anuncios personalizados de Google en adssettings.google.com y desactivar Google Analytics con el complemento del navegador en tools.google.com/dlpage/gaoptout.",
          "Para revisar, corregir o borrar la información que nos enviaste, o para dejar de recibir llamadas y mensajes sobre tu solicitud, llámanos o escríbenos a la dirección de abajo.",
        ],
      },
      {
        title: "Señales de No rastrear (Do Not Track)",
        paragraphs: ["Por ahora, nuestro sitio no responde a las señales de No rastrear de los navegadores."],
      },
      {
        title: "Cuánto tiempo guardamos la información",
        paragraphs: ["Guardamos la información de tu solicitud el tiempo necesario para responderte, completar una compra y cumplir requisitos legales, fiscales y de registro del DMV."],
      },
      {
        title: "Menores de edad",
        paragraphs: ["Este sitio es para dueños de vehículos y no está dirigido a menores de 13 años. No recopilamos a sabiendas información de menores."],
      },
      {
        title: "Cambios a esta política",
        paragraphs: ["Si cambiamos esta política, publicaremos la nueva versión en esta página y actualizaremos la fecha de arriba."],
      },
    ],
    contactTitle: "Contáctanos",
    contactBody: "1-800 Cash for Cars, 552 Alta Rd #4, San Diego, CA 92154.",
  },
};

export function PrivacyPolicy({ dictionary, locale }: { dictionary: Dictionary; locale: Locale }) {
  const page = content[locale];

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <SiteNavigation dictionary={dictionary} locale={locale} />
      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{page.title}</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          {page.updated}: {privacyPolicyUpdated[locale]}
        </p>
        <p className="mt-6 text-base leading-7 text-slate-700">{page.intro}</p>
        {page.sections.map((section) => (
          <section key={section.title} className="mt-8">
            <h2 className="text-xl font-black">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-base leading-7 text-slate-700">{paragraph}</p>
            ))}
            {section.items ? (
              <ul className="mt-3 grid list-disc gap-2 pl-5 text-base leading-7 text-slate-700">
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
          </section>
        ))}
        <section className="mt-8">
          <h2 className="text-xl font-black">{page.contactTitle}</h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            {page.contactBody}{" "}
            <a href={serviceAreaPhoneHref} className="font-bold text-[#146c30] underline underline-offset-4">{serviceAreaPhone}</a>
          </p>
        </section>
      </article>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
