import { useState, useEffect } from "react";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const words = [
  { word: "Sophistry", definition: "Clever but flawed reasoning designed to deceive", category: "Arguments & Reasoning" },
  { word: "Syllogism", definition: "A logical argument where a conclusion follows from two premises", category: "Arguments & Reasoning" },
  { word: "Tautology", definition: "Saying the same thing twice in different words; needlessly circular", category: "Arguments & Reasoning" },
  { word: "Axiom", definition: "A self-evident truth taken as a starting point", category: "Arguments & Reasoning" },
  { word: "Non Sequitur", definition: "A conclusion that doesn't follow from the evidence", category: "Arguments & Reasoning" },
  { word: "Specious", definition: "Looks valid on the surface, but isn't", category: "Ideas & Claims" },
  { word: "Reductive", definition: "Oversimplifying something complex", category: "Ideas & Claims" },
  { word: "Germane", definition: "Relevant and appropriate to the topic", category: "Ideas & Claims" },
  { word: "Apocryphal", definition: "Of doubtful authenticity; probably not true", category: "Ideas & Claims" },
  { word: "Cogent", definition: "Clear, logical, and convincing", category: "Ideas & Claims" },
  { word: "Tendentious", definition: "Slanted toward a particular viewpoint", category: "Bias & Perspective" },
  { word: "Solipsistic", definition: "Unable to consider any perspective beyond one's own", category: "Bias & Perspective" },
  { word: "Parochial", definition: "Narrow in scope; limited to a local or small-minded view", category: "Bias & Perspective" },
  { word: "Epistemic", definition: "Relating to knowledge or the degree of its validation", category: "Bias & Perspective" },
  { word: "Equivocal", definition: "Open to multiple interpretations; ambiguous", category: "Nuance & Complexity" },
  { word: "Heterodox", definition: "Contrary to established or accepted beliefs", category: "Nuance & Complexity" },
  { word: "Dialectical", definition: "Relating to the tension between opposing forces or ideas", category: "Nuance & Complexity" },
  { word: "Liminal", definition: "In between two states; on the threshold of something", category: "Nuance & Complexity" },
  { word: "Ad Hominem", definition: "Attacking the person making an argument rather than the argument itself", category: "Arguments & Reasoning" },
  { word: "Confirmation Bias", definition: "The tendency to favor information that confirms one's existing beliefs", category: "Bias & Perspective" },
  { word: "Ambivalent", definition: "Having simultaneous conflicting feelings or attitudes about something", category: "Nuance & Complexity" },
  { word: "Exegesis", definition: "Critical interpretation and explanation of a text or idea", category: "Critical Thinking" },
  { word: "Euphemism", definition: "A mild or indirect word used in place of something blunt or unpleasant", category: "Language & Rhetoric" },
];

const categoryColors = {
  "Arguments & Reasoning": { bg: "#1a1a2e", accent: "#e94560", label: "#e94560" },
  "Ideas & Claims": { bg: "#0f2027", accent: "#00b4d8", label: "#00b4d8" },
  "Bias & Perspective": { bg: "#1a0a2e", accent: "#c77dff", label: "#c77dff" },
  "Nuance & Complexity": { bg: "#0a1f1a", accent: "#52b788", label: "#52b788" },
  "Critical Thinking": { bg: "#1f1a0a", accent: "#f4a261", label: "#f4a261" },
  "Language & Rhetoric": { bg: "#0a1a1f", accent: "#48cae4", label: "#48cae4" },
};

export default function Flashcards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState("All");
  const [mastered, setMastered] = useState(() => {
    try {
      const saved = localStorage.getItem("flashcard-mastered");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [direction, setDirection] = useState(null);

  // Build today's practice set: 15 unmastered + 3 mastered for review, cached by date
  const [dailyWords] = useState(() => {
    const todayKey = getTodayKey();
    try {
      const cached = localStorage.getItem(`flashcard-daily-${todayKey}`);
      if (cached) return JSON.parse(cached);
    } catch {}
    const nonMastered = shuffle(words.filter(w => !mastered.has(w.word)));
    const masteredArr = shuffle(words.filter(w => mastered.has(w.word)));
    const todaySet = [
      ...nonMastered.slice(0, 15),
      ...masteredArr.slice(0, 3).map(w => ({ ...w, isReview: true })),
    ];
    try {
      localStorage.setItem(`flashcard-daily-${todayKey}`, JSON.stringify(todaySet));
    } catch {}
    return todaySet;
  });

  useEffect(() => {
    try {
      localStorage.setItem("flashcard-mastered", JSON.stringify([...mastered]));
    } catch {}
  }, [mastered]);

  const categories = ["All", ...Object.keys(categoryColors).filter(cat => dailyWords.some(w => w.category === cat))];
  const filtered = filter === "All" ? dailyWords : dailyWords.filter(w => w.category === filter);
  const card = filtered[index] ?? filtered[0];
  const colors = categoryColors[card?.category] ?? categoryColors["Arguments & Reasoning"];

  function go(dir) {
    setDirection(dir);
    setFlipped(false);
    setTimeout(() => {
      setIndex(i => {
        if (dir === "next") return (i + 1) % filtered.length;
        return (i - 1 + filtered.length) % filtered.length;
      });
      setDirection(null);
    }, 200);
  }

  function toggleMastered() {
    setMastered(prev => {
      const next = new Set(prev);
      if (next.has(card.word)) next.delete(card.word);
      else next.add(card.word);
      return next;
    });
  }

  const isMastered = mastered.has(card?.word);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d0d",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .card-wrap { perspective: 1200px; }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          cursor: pointer;
        }
        .card-back { transform: rotateY(180deg); }
        .slide-left { animation: slideLeft 0.2s ease forwards; }
        .slide-right { animation: slideRight 0.2s ease forwards; }
        @keyframes slideLeft { to { opacity: 0; transform: translateX(-30px); } }
        @keyframes slideRight { to { opacity: 0; transform: translateX(30px); } }
        .nav-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          transition: background 0.2s, border 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.28); }
        .cat-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.55);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          letter-spacing: 0.08em;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .cat-btn.active {
          color: #fff;
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.12);
        }
        .master-btn {
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 12px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: all 0.2s;
        }
      `}</style>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 13,
          letterSpacing: "0.25em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          marginBottom: 6,
        }}>Analysis Vocabulary</div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 900,
          color: "#fff",
          letterSpacing: "-0.01em",
        }}>Today's Practice</div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.1em",
          marginTop: 6,
        }}>
          {dailyWords.filter(w => !w.isReview).length} new &nbsp;·&nbsp; {dailyWords.filter(w => w.isReview).length} review
        </div>
      </div>

      {/* Category Filter */}
      <div style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        marginBottom: 28,
        maxWidth: 560,
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`cat-btn${filter === cat ? " active" : ""}`}
            onClick={() => { setFilter(cat); setIndex(0); setFlipped(false); }}
          >
            {cat === "All" ? "All" : cat.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className={`card-wrap${direction ? ` slide-${direction === "next" ? "left" : "right"}` : ""}`}
        style={{ width: "min(480px, 100%)", height: 280 }}
      >
        <div className={`card-inner${flipped ? " flipped" : ""}`}>
          {/* Front */}
          <div
            className="card-face"
            style={{ background: colors.bg, border: `1px solid ${colors.accent}30` }}
            onClick={() => setFlipped(true)}
          >
            <div style={{
              position: "absolute",
              top: 18,
              left: 22,
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.18em",
              color: colors.accent,
              textTransform: "uppercase",
            }}>{card?.category}</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 38,
              fontWeight: 700,
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.1,
              marginBottom: 16,
            }}>{card?.word}</div>
            <div style={{
              fontSize: 11,
              fontFamily: "'DM Mono', monospace",
              color: "rgba(255,255,255,0.28)",
              letterSpacing: "0.12em",
            }}>tap to reveal</div>
            <div style={{ position: "absolute", top: 16, right: 18, display: "flex", gap: 6, alignItems: "center" }}>
              {card?.isReview && (
                <div style={{
                  fontSize: 9,
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.15em",
                  color: colors.accent,
                  textTransform: "uppercase",
                  border: `1px solid ${colors.accent}70`,
                  padding: "2px 7px",
                  borderRadius: 10,
                }}>review</div>
              )}
              {isMastered && <div style={{ fontSize: 15 }}>✓</div>}
            </div>
          </div>

          {/* Back */}
          <div
            className="card-face card-back"
            style={{ background: colors.bg, border: `1px solid ${colors.accent}50` }}
            onClick={() => setFlipped(false)}
          >
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 15,
              fontWeight: 400,
              color: "rgba(255,255,255,0.45)",
              textAlign: "center",
              marginBottom: 16,
              fontStyle: "italic",
            }}>{card?.word}</div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: 360,
            }}>{card?.definition}</div>
            <div style={{ marginTop: 28 }}>
              <button
                className="master-btn"
                style={{
                  background: isMastered ? colors.accent : "transparent",
                  color: isMastered ? "#000" : colors.accent,
                  border: `1px solid ${colors.accent}`,
                }}
                onClick={e => { e.stopPropagation(); toggleMastered(); }}
              >
                {isMastered ? "✓ Mastered" : "Mark as Mastered"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        marginTop: 28,
      }}>
        <button className="nav-btn" onClick={() => go("prev")}>←</button>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
          minWidth: 70,
          textAlign: "center",
        }}>
          {(index % filtered.length) + 1} / {filtered.length}
        </div>
        <button className="nav-btn" onClick={() => go("next")}>→</button>
      </div>

      {/* Stats */}
      <div style={{
        marginTop: 20,
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.25)",
        textAlign: "center",
      }}>
        {mastered.size} mastered &nbsp;·&nbsp; {words.length} in bank
      </div>
    </div>
  );
}
