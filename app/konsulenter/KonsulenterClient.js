"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, ShieldCheck, User } from "lucide-react";
import { CATS } from "@/lib/categories";
import { CatIcon } from "@/lib/icons";
import Stars from "@/components/Stars";
import { truncateText } from "@/lib/status";
import { shortDisplayName } from "@/lib/displayName";

function initials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ConsultantCard({ c }) {
  return (
    <Link
      href={`/bruger/${encodeURIComponent(c.name)}`}
      style={{
        display: "block",
        background: "#fff",
        border: "1.5px solid #E4E8F0",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        {c.avatarUrl ? (
          <Image
            src={c.avatarUrl}
            alt={c.name}
            width={46}
            height={46}
            style={{ borderRadius: "50%", objectFit: "cover", flex: "0 0 auto" }}
          />
        ) : (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "#EEF2FF",
              color: "#1B3AA6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 15,
              flex: "0 0 auto",
            }}
          >
            {initials(c.name)}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            {shortDisplayName(c.name)}
            {c.verified && <ShieldCheck size={14} color="#1AA37A" />}
          </div>
          <div style={{ fontSize: 12.5, color: "#5B6478" }}>
            {c.reviewCount > 0 ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Stars value={c.avgRating} size={11} /> ({c.reviewCount})
              </span>
            ) : (
              "Ingen anmeldelser endnu"
            )}
          </div>
        </div>
      </div>

      {c.bio && (
        <p style={{ fontSize: 13, color: "#3C4457", lineHeight: 1.55, marginBottom: 12 }}>{truncateText(c.bio, 140)}</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {c.categories.slice(0, 3).map((cat) => (
          <span
            key={cat}
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: 999,
              background: "#F5F7FB",
              color: "#5B6478",
            }}
          >
            {cat}
          </span>
        ))}
        {c.categories.length > 3 && (
          <span style={{ fontSize: 11.5, color: "#9AA2B1", padding: "5px 2px" }}>+{c.categories.length - 3} mere</span>
        )}
      </div>
    </Link>
  );
}

function KonsulenterInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [consultants, setConsultants] = useState(null);
  const [error, setError] = useState("");
  const [catFilter, setCatFilter] = useState(() => searchParams.get("category") || "all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/consultants")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setConsultants(data.consultants);
      })
      .catch(() => setError("Kunne ikke hente konsulenter. Tjek din forbindelse."));
  }, []);

  if (error) return <div style={{ padding: "60px 0", textAlign: "center", color: "#C0392B" }}>{error}</div>;
  if (!consultants) return <div style={{ padding: "60px 0", textAlign: "center", color: "#5B6478" }}>Henter konsulenter…</div>;

  const q = query.trim().toLowerCase();
  const list = consultants
    .filter((c) => catFilter === "all" || c.categories.includes(catFilter))
    .filter((c) => !q || c.name.toLowerCase().includes(q) || (c.bio || "").toLowerCase().includes(q) || (c.skills || "").toLowerCase().includes(q));

  return (
    <div style={{ marginTop: 24, marginBottom: 60 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Find en konsulent</h1>
      <p style={{ fontSize: 13.5, color: "#5B6478", marginBottom: 20 }}>
        {consultants.length} konsulenter har udfyldt en profil {catFilter === "all" ? "" : `inden for ${catFilter}`}. Foretrækker du at få bud i stedet,{" "}
        <Link href="/opret" style={{ color: "#2A55E5", fontWeight: 600 }}>
          opret en opgave
        </Link>{" "}
        i stedet for at vælge selv.
      </p>

      <div style={{ position: "relative", marginBottom: 16, maxWidth: 420 }}>
        <Search size={15} color="#9AA2B1" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søg på navn eller kompetence…"
          style={{
            width: "100%",
            padding: "11px 14px 11px 38px",
            borderRadius: 999,
            border: "1.5px solid #E4E8F0",
            fontSize: 13.5,
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <button
          onClick={() => setCatFilter("all")}
          style={{
            padding: "7px 14px",
            borderRadius: 999,
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            border: catFilter === "all" ? "1.5px solid #2A55E5" : "1.5px solid #E4E8F0",
            background: catFilter === "all" ? "#EEF2FF" : "#fff",
            color: catFilter === "all" ? "#1B3AA6" : "#5B6478",
          }}
        >
          Alle kategorier
        </button>
        {CATS.filter((c) => c.slug !== "andet").map((c) => (
          <button
            key={c.slug}
            onClick={() => setCatFilter(c.name)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              border: catFilter === c.name ? "1.5px solid #2A55E5" : "1.5px solid #E4E8F0",
              background: catFilter === c.name ? "#EEF2FF" : "#fff",
              color: catFilter === c.name ? "#1B3AA6" : "#5B6478",
            }}
          >
            <CatIcon name={c.icon} size={13} />
            {c.name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#F5F7FB",
            borderRadius: 16,
            color: "#5B6478",
          }}
        >
          <User size={28} style={{ marginBottom: 10 }} />
          <p style={{ fontSize: 14, marginBottom: 4 }}>Ingen konsulenter matcher endnu.</p>
          <p style={{ fontSize: 13 }}>
            Er du konsulent?{" "}
            <Link href="/profil" style={{ color: "#2A55E5", fontWeight: 600 }}>
              Udfyld din profil
            </Link>{" "}
            og bliv den første i denne kategori.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {list.map((c) => (
            <ConsultantCard key={c.name} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function KonsulenterPage() {
  return (
    <Suspense fallback={null}>
      <KonsulenterInner />
    </Suspense>
  );
}
