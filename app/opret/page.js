import PostTaskClient from "./PostTaskClient";

export const metadata = {
  title: "Find en konsulent - Konsulentbud",
  description: "Fortæl os, hvad du har brug for hjælp til, som privatperson eller virksomhed, og modtag forslag fra kvalificerede konsulenter. Gratis at oprette.",
  alternates: { canonical: "https://konsulentbud.dk/opret" },
};

export default function Page() {
  return <PostTaskClient />;
}
