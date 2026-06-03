import { getDictionary } from "../dictionaries";
import { LocalizedHome } from "../components/localized-home";

export default function SpanishHome() {
  return <LocalizedHome dictionary={getDictionary("es")} locale="es" />;
}
