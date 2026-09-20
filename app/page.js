import HomeClient from "./HomeClient";

export const metadata = {
  title: "Konsulentbud - Danmarks platform for konsulentopgaver",
  description: "Få bud på dine konsulentopgaver - strategi, IT, økonomi, HR, marketing og meget mere. Betaling holdes sikkert, indtil du er tilfreds.",
  alternates: { canonical: "https://konsulentbud.dk/" },
  openGraph: {
    title: "Konsulentbud - Danmarks platform for konsulentopgaver",
    description: "Få bud på dine konsulentopgaver fra dygtige danske konsulenter. Gratis at oprette, betaling holdes sikkert.",
    url: "https://konsulentbud.dk/",
    siteName: "Konsulentbud",
    locale: "da_DK",
    type: "website",
  },
};

export default function Page() {
  return <HomeClient />;
}
