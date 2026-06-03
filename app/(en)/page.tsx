import { getDictionary } from "../dictionaries";
import { LocalizedHome } from "../components/localized-home";

export default function Home() {
  return <LocalizedHome dictionary={getDictionary("en")} locale="en" />;
}
