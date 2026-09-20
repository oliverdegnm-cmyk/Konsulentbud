export default function manifest() {
  return {
    name: "Konsulentbud - Byd ind på konsulentopgaver",
    short_name: "Konsulentbud",
    description: "Danmarks platform for konsulentopgaver. Opret opgaver, byd, og find den rette konsulent til opgaven.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2A55E5",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
