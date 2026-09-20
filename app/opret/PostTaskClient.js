"use client";

import RequireAuth from "@/components/RequireAuth";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATS, matchCategoryFromText } from "@/lib/categories";
import { EXPERIENCE_LEVELS, ENGAGEMENT_TYPES } from "@/lib/consultantCriteria";
import { useName } from "@/lib/NameContext";
import FileUploader from "@/components/FileUploader";

function PostTaskPage() {
  const router = useRouter();
  const { name } = useName();

  const searchParams = useSearchParams();
  const [title, setTitle] = useState(searchParams.get("title") || "");
  const categoryFromUrl = searchParams.get("category");
  const [category, setCategory] = useState(CATS.some((c) => c.name === categoryFromUrl) ? categoryFromUrl : CATS[0].name);
  const [categoryTouched, setCategoryTouched] = useState(!!categoryFromUrl);
  const [categorySuggested, setCategorySuggested] = useState(false);
  const aiTimeout = useRef(null);

  function handleTitleChange(value) {
    setTitle(value);
    if (categoryTouched) return;

    const localMatch = matchCategoryFromText(value);
    if (localMatch) {
      setCategory(localMatch.name);
      setCategorySuggested(true);
      return;
    }

    // Ordlisten fandt intet - spørger AI'en efter en kort pause i skrivningen,
    // i stedet for ved hvert eneste tastetryk.
    clearTimeout(aiTimeout.current);
    if (value.trim().length < 6) return;
    aiTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/match-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: value }),
        });
        const data = await res.json();
        if (data.category && !categoryTouched) {
          setCategory(data.category);
          setCategorySuggested(true);
        }
      } catch (err) {
        // stille fejl - brugeren kan stadig vælge kategori selv
      }
    }, 900);
  }

  function handleCategoryChange(value) {
    setCategory(value);
    setCategoryTouched(true);
    setCategorySuggested(false);
  }

  const [budget, setBudget] = useState("");
  const [deadlineType, setDeadlineType] = useState("date"); // "date" | "flexible"
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [area, setArea] = useState("");
  const [locationType, setLocationType] = useState("remote"); // "remote" | "in_person"
  const [address, setAddress] = useState("");
  const [posterType, setPosterType] = useState("private");
  const [typeChosen, setTypeChosen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [cvrNumber, setCvrNumber] = useState("");
  const [cvrStatus, setCvrStatus] = useState(null); // null | "loading" | "found" | "error"
  const [cvrError, setCvrError] = useState("");
  const [description, setDescription] = useState(searchParams.get("description") || "");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [engagementType, setEngagementType] = useState("");
  const [scope, setScope] = useState("");
  const [industryKnowledge, setIndustryKnowledge] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const [okId, setOkId] = useState("");

  async function lookupCvr(value) {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length !== 8) {
      setCvrStatus(null);
      return;
    }
    setCvrStatus("loading");
    setCvrError("");
    try {
      const res = await fetch(`/api/cvr-lookup?cvr=${digitsOnly}`);
      const data = await res.json();
      if (data.error) {
        setCvrStatus("error");
        setCvrError(data.error);
        return;
      }
      setCvrStatus("found");
      if (!companyName.trim()) setCompanyName(data.name);
    } catch (err) {
      setCvrStatus("error");
      setCvrError("Kunne ikke slå CVR-nummeret op. Prøv igen.");
    }
  }

  async function submit() {
    if (!title.trim() || !description.trim()) {
      setError("Udfyld mindst titel og beskrivelse, før du opretter opgaven.");
      return;
    }
    setError("");
    const isFlexible = deadlineType === "flexible";
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          budget,
          deadline: isFlexible ? "Fleksibel" : null,
          deadlineDate: isFlexible ? null : deadlineDate,
          description,
          postedBy: name,
          area: locationType === "in_person" ? area : "",
          locationType,
          address: locationType === "in_person" ? address : "",
          attachments,
          posterType,
          companyName,
          cvrNumber,
          experienceLevel,
          engagementType,
          scope,
          industryKnowledge,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setOkId(data.task.caseNo);
      setTimeout(() => router.push("/"), 1000);
    } catch (e) {
      setError("Kunne ikke oprette opgaven. Prøv igen.");
    }
  }

  if (!typeChosen) {
    return (
      <div>
        <h2 style={{ fontSize: 24, marginTop: 24, marginBottom: 6 }}>Find en konsulent</h2>
        <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>
          Fortæl os, hvad du har brug for hjælp til, og hvem du søger på vegne af, så matcher vi dig med de rette konsulenter. Det er gratis.
        </p>
        <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 30, maxWidth: 660 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 14 }}>Du søger som</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setPosterType("private");
                setTypeChosen(true);
              }}
              style={{
                flex: "1 1 220px",
                textAlign: "left",
                padding: "20px 18px",
                borderRadius: 14,
                border: "1.5px solid #E4E8F0",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: "#241C35", marginBottom: 6 }}>Privatperson</div>
              <div style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.5 }}>Du søger hjælp til en privat opgave eller et personligt projekt.</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setPosterType("business");
                setTypeChosen(true);
              }}
              style={{
                flex: "1 1 220px",
                textAlign: "left",
                padding: "20px 18px",
                borderRadius: 14,
                border: "1.5px solid #E4E8F0",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: "#241C35", marginBottom: 6 }}>Virksomhed</div>
              <div style={{ fontSize: 12.5, color: "#5B6478", lineHeight: 1.5 }}>Du søger konsulentbistand på vegne af en virksomhed.</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, marginTop: 24, marginBottom: 6 }}>Find en konsulent</h2>
      <p style={{ color: "#5B6478", fontSize: 14, marginBottom: 24 }}>
        Beskriv opgaven klart, så konsulenterne ved præcis, hvad de skal give forslag på. Det er gratis at oprette.
      </p>
      <div style={{ background: "#fff", border: "1.5px solid #E4E8F0", borderRadius: 20, padding: 30, maxWidth: 660 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: posterType === "business" ? 10 : 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#5B6478" }}>
              Du søger som <span style={{ color: "#5B21B6" }}>{posterType === "business" ? "virksomhed" : "privatperson"}</span>
            </div>
            <button
              type="button"
              onClick={() => setTypeChosen(false)}
              style={{ fontSize: 12.5, fontWeight: 700, color: "#7C3AED", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Skift
            </button>
          </div>
          {posterType === "business" && (
            <div style={{ marginTop: 10 }}>
              <div style={{ position: "relative" }}>
                <input
                  value={cvrNumber}
                  onChange={(e) => {
                    setCvrNumber(e.target.value);
                    lookupCvr(e.target.value);
                  }}
                  placeholder="CVR-nummer (8 cifre)"
                  maxLength={8}
                  style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
                />
                {cvrStatus === "loading" && (
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11.5, color: "#9AA2B1" }}>Slår op…</span>
                )}
              </div>
              {cvrStatus === "found" && (
                <div style={{ fontSize: 12, color: "#1AA37A", marginTop: 6, fontWeight: 600 }}>✓ Fundet: {companyName}</div>
              )}
              {cvrStatus === "error" && <div style={{ fontSize: 12, color: "#C0392B", marginTop: 6 }}>{cvrError}</div>}

              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Virksomhedens navn"
                style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginTop: 10 }}
              />
            </div>
          )}
        </div>
        <div className="kb-grid-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Titel</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="f.eks. Erfaren ledelseskonsulent søges til 3 ugers strategiprojekt"
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>
              Kategori {categorySuggested && <span style={{ color: "#1AA37A", fontWeight: 700 }}>· foreslået ud fra titlen</span>}
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            >
              {CATS.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Budget</label>
            <input
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="f.eks. 1.500 kr"
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Frist for udarbejdelse</label>
            <div style={{ display: "flex", gap: 8, marginBottom: deadlineType === "date" ? 8 : 0 }}>
              <button
                type="button"
                onClick={() => setDeadlineType("date")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: deadlineType === "date" ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                  background: deadlineType === "date" ? "#F3EEFC" : "#fff",
                  color: deadlineType === "date" ? "#5B21B6" : "#5B6478",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Vælg dato
              </button>
              <button
                type="button"
                onClick={() => setDeadlineType("flexible")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: deadlineType === "flexible" ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                  background: deadlineType === "flexible" ? "#F3EEFC" : "#fff",
                  color: deadlineType === "flexible" ? "#5B21B6" : "#5B6478",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Fleksibel
              </button>
            </div>
            {deadlineType === "date" && (
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
              />
            )}
            {deadlineType === "flexible" && (
              <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 10 }}>Ingen fast deadline - I aftaler tidsplanen indbyrdes.</div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Område</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setLocationType("remote")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: locationType === "remote" ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                  background: locationType === "remote" ? "#F3EEFC" : "#fff",
                  color: locationType === "remote" ? "#5B21B6" : "#5B6478",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Eksternt
              </button>
              <button
                type="button"
                onClick={() => setLocationType("in_person")}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: locationType === "in_person" ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                  background: locationType === "in_person" ? "#F3EEFC" : "#fff",
                  color: locationType === "in_person" ? "#5B21B6" : "#5B6478",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Personligt fremmøde
              </button>
            </div>
            {locationType === "remote" && (
              <div style={{ fontSize: 11.5, color: "#9AA2B1" }}>Opgaven kan løses uden fysisk fremmøde.</div>
            )}
            {locationType === "in_person" && (
              <>
                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="By/område, f.eks. Aarhus"
                  style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", marginBottom: 8 }}
                />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Præcis adresse, f.eks. Frodesvej 12, 8000 Aarhus"
                  style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
                />
                <div style={{ fontSize: 11.5, color: "#9AA2B1", marginTop: 6 }}>
                  Den præcise adresse vises kun til den konsulent, hvis forslag du vælger - ikke offentligt.
                </div>
              </>
            )}
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Beskrivelse</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beskriv opgaven, omfang og eventuelle systemer eller filer konsulenten skal kende til."
              style={{ width: "100%", minHeight: 110, fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB", resize: "vertical" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Vedhæftninger (valgfrit)</label>
            <FileUploader files={attachments} setFiles={setAttachments} />
          </div>

          <div style={{ gridColumn: "1 / -1", marginTop: 6, paddingTop: 20, borderTop: "1px solid #E4E8F0" }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3 }}>Hvilken slags konsulent søger du?</div>
            <div style={{ fontSize: 12, color: "#9AA2B1", marginBottom: 14 }}>Valgfrit - gør det nemmere for konsulenter at vurdere, om de er et match.</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 8 }}>Erfaringsniveau (valgfrit)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {EXPERIENCE_LEVELS.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setExperienceLevel(experienceLevel === e.value ? "" : e.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: experienceLevel === e.value ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                    background: experienceLevel === e.value ? "#F3EEFC" : "#fff",
                    color: experienceLevel === e.value ? "#5B21B6" : "#5B6478",
                    cursor: "pointer",
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 8 }}>Engagementstype (valgfrit)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ENGAGEMENT_TYPES.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setEngagementType(engagementType === e.value ? "" : e.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 700,
                    border: engagementType === e.value ? "1.5px solid #7C3AED" : "1.5px solid #E4E8F0",
                    background: engagementType === e.value ? "#F3EEFC" : "#fff",
                    color: engagementType === e.value ? "#5B21B6" : "#5B6478",
                    cursor: "pointer",
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Omfang (valgfrit)</label>
            <input
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="f.eks. 10 timer/uge"
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#5B6478", marginBottom: 6 }}>Branchekendskab (valgfrit)</label>
            <input
              value={industryKnowledge}
              onChange={(e) => setIndustryKnowledge(e.target.value)}
              placeholder="f.eks. kendskab til e-handel er et plus"
              style={{ width: "100%", fontSize: 14, padding: "12px 14px", border: "1.5px solid #E4E8F0", borderRadius: 10, background: "#F5F7FB" }}
            />
          </div>
        </div>
        <button
          onClick={submit}
          style={{ marginTop: 20, fontSize: 14.5, fontWeight: 700, padding: "12px 22px", borderRadius: 12, border: "none", background: "#7C3AED", color: "#fff", cursor: "pointer" }}
        >
          Opret opgave gratis
        </button>
        {error && (
          <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#FDECEC", color: "#C0392B" }}>
            {error}
          </div>
        )}
        {okId && (
          <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, background: "#E9F9F1", color: "#1AA37A" }}>
            ✓ Opgave oprettet som {okId} og synlig for alle konsulenter.
          </div>
        )}
      </div>
    </div>
  );
}


export default function PostTaskClient() {
  return (
    <RequireAuth title="Log ind for at finde en konsulent" subtitle="Du skal være logget ind, før du kan oprette en opgave og finde en konsulent.">
      <PostTaskPage />
    </RequireAuth>
  );
}
