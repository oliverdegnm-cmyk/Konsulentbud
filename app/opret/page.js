import PostTaskClient from "./PostTaskClient";

export const metadata = {
  title: "Opret opgave - Konsulentbud",
  description: "Beskriv din konsulentopgave, sæt et budget, og modtag bud fra kvalificerede konsulenter. Gratis at oprette.",
  alternates: { canonical: "https://konsulentbud.dk/opret" },
};

export default function Page() {
  return <PostTaskClient />;
}
