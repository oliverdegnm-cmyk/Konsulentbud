import LoginClient from "./LoginClient";

export const metadata = {
  title: "Log ind - Konsulentbud",
  description: "Log ind på Konsulentbud, eller opret en gratis konto.",
  alternates: { canonical: "https://konsulentbud.dk/login" },
};

export default function Page() {
  return <LoginClient />;
}
