import { Suspense } from "react";
import KonsulenterPage from "./KonsulenterClient";

export const metadata = {
  title: "Find en konsulent - Konsulentbud",
  description: "Gennemse konsulenter på Konsulentbud, filtrér efter fagområde, og kontakt dem direkte - eller opret en opgave, og lad konsulenterne byde på den.",
  alternates: { canonical: "https://konsulentbud.dk/konsulenter" },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <KonsulenterPage />
    </Suspense>
  );
}
