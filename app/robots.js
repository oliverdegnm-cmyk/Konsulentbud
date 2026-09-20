export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/indstillinger", "/betalinger", "/mine", "/beskeder", "/inviter", "/profil"],
    },
    sitemap: "https://konsulentbud.dk/sitemap.xml",
  };
}
