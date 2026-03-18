// QuickLegal.jsx v2.0 — Modern UI with cyber theme
import React, { useState, useRef } from "react";
import {
  Shield, AlertTriangle, CheckCircle, Loader2,
  RotateCcw, ChevronDown, ChevronUp, Copy,
  FileText, Zap, Lock, TrendingDown, Info, Star
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Score config ──────────────────────────────────────────────────────────────
function getScoreConfig(score) {
  if (score <= 2) return { color: "#ef4444", label: "Dangerous",      bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)"   };
  if (score <= 4) return { color: "#f97316", label: "Poor",           bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.3)"  };
  if (score <= 6) return { color: "#eab308", label: "Average",        bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.3)"   };
  if (score <= 8) return { color: "#00f5d4", label: "Good",           bg: "rgba(0,245,212,0.1)",   border: "rgba(0,245,212,0.3)"   };
  return             { color: "#22c55e", label: "Excellent",       bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)"   };
}

const VERDICT_CONFIG = {
  "AVOID":            { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", border: "rgba(239,68,68,0.4)"   },
  "USE WITH CAUTION": { bg: "rgba(249,115,22,0.15)",  color: "#f97316", border: "rgba(249,115,22,0.4)"  },
  "GENERALLY SAFE":   { bg: "rgba(234,179,8,0.15)",   color: "#eab308", border: "rgba(234,179,8,0.4)"   },
  "TRUSTWORTHY":      { bg: "rgba(0,245,212,0.15)",   color: "#00f5d4", border: "rgba(0,245,212,0.4)"   },
};

const SEVERITY_CONFIG = {
  high:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)"  },
  medium: { color: "#f97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)" },
  low:    { color: "#eab308", bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.25)"  },
};

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const cfg = getScoreConfig(score);
  const r = 52, circ = 2 * Math.PI * r;
  const offset = circ - (score / 10) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1a1a2e" strokeWidth="8"/>
          <circle cx="60" cy="60" r={r} fill="none"
            stroke={cfg.color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 36, color: cfg.color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#4a4a6a", marginTop: 2 }}>/10</span>
        </div>
      </div>
      <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

// ── Red Flag Card ─────────────────────────────────────────────────────────────
function RedFlagCard({ flag, index }) {
  const [open, setOpen] = useState(false);
  const cfg = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.medium;
  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${cfg.border}`,
      background: "rgba(13,13,26,0.8)", overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      <div onClick={() => setOpen(!open)}
        style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Severity indicator */}
        <div style={{
          width: 6, minHeight: 36, borderRadius: 3,
          background: cfg.color, marginTop: 2, flexShrink: 0
        }}/>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: "#fff" }}>{flag.title}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{
                fontFamily: "monospace", fontSize: 10, padding: "2px 8px", borderRadius: 20,
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                textTransform: "uppercase", letterSpacing: "0.05em"
              }}>{flag.severity}</span>
              {open ? <ChevronUp size={14} color="#4a4a6a"/> : <ChevronDown size={14} color="#4a4a6a"/>}
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div style={{ padding: "0 16px 14px 34px", borderTop: "1px solid #1a1a2e" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#c0c0d0", lineHeight: 1.7, margin: "12px 0 0" }}>
            {flag.explanation}
          </p>
          {flag.quote && (
            <blockquote style={{
              margin: "10px 0 0", padding: "8px 12px",
              borderLeft: `2px solid ${cfg.color}`,
              background: cfg.bg, borderRadius: "0 6px 6px 0",
              fontFamily: "monospace", fontSize: 11, color: cfg.color,
              fontStyle: "italic", lineHeight: 1.6
            }}>
              "{flag.quote}"
            </blockquote>
          )}
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div style={{
      flex: 1, padding: "16px", borderRadius: 12,
      background: "rgba(13,13,26,0.8)", border: "1px solid #1a1a2e",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      minWidth: 80
    }}>
      <Icon size={18} color={color}/>
      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 22, color }}>{value}</span>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: "#4a4a6a", textAlign: "center" }}>{label}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function QuickLegal() {
  const [text, setText]       = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [copied, setCopied]   = useState(false);
  const textareaRef           = useRef(null);

  async function analyze() {
    if (!text.trim() || text.length < 100) {
      setError("Kam se kam 100 characters ka T&C text paste karo.");
      return;
    }
    setLoading(true); setError(null); setResult(null);

    // ── Step 1: Backend wake-up ping ──────────────────────────────────────
    // Render free tier 15 min baad so jaata hai — pehle ping karke jagaate hain
    try {
      await fetch(`${API_URL}/`, { method: "GET" });
    } catch (_) {
      // Ping fail bhi ho toh chalta hai — main request try karenge
    }

    // ── Step 2: Auto-retry (max 3 attempts) ──────────────────────────────
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 3000; // 3 seconds between retries

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Loading message update karo attempt ke hisaab se
        if (attempt === 1) setError(null);
        if (attempt === 2) setError("Backend warm ho raha hai... (attempt 2/3)");
        if (attempt === 3) setError("Last try kar rahe hain... (attempt 3/3)");

        const res = await fetch(`${API_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: AbortSignal.timeout(60000), // 60 second timeout
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Server error. Dobara try karo.");
        }

        const data = await res.json();
        setError(null);
        setResult(data);
        setLoading(false);
        return; // Success! Loop band karo

      } catch (e) {
        // Agar last attempt bhi fail toh error dikhao
        if (attempt === MAX_RETRIES) {
          setError(e.message?.includes("timeout") || e.name === "TimeoutError"
            ? "Backend respond nahi kar raha. Thodi der baad try karo."
            : e.message || "Network error. Backend chal raha hai?"
          );
          setLoading(false);
          return;
        }
        // Retry se pehle wait karo
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      }
    }
    setLoading(false);
  }

  function reset() { setText(""); setResult(null); setError(null); }

  function copyResult() {
    if (!result) return;
    const txt = `Quick-Legal Analysis\n\nScore: ${result.privacy_score}/10 (${result.score_label})\nVerdict: ${result.verdict}\nSummary: ${result.one_line_summary}\n\nRed Flags (${result.red_flags.length}):\n${result.red_flags.map(f => `• [${f.severity.toUpperCase()}] ${f.title}: ${f.explanation}`).join("\n")}\n\nPositives:\n${result.positives.map(p => `• ${p}`).join("\n")}`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const scoreConfig = result ? getScoreConfig(result.privacy_score) : null;
  const verdictCfg  = result ? (VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG["USE WITH CAUTION"]) : null;

  // ── Shared styles ─────────────────────────────────────────────────────────
  const S = {
    page:    { minHeight: "100vh", background: "#08080f", backgroundImage: "linear-gradient(rgba(0,245,212,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,212,0.025) 1px,transparent 1px)", backgroundSize: "48px 48px", padding: "80px 16px 60px", fontFamily: "system-ui, sans-serif" },
    wrap:    { maxWidth: 720, margin: "0 auto" },
    card:    { background: "rgba(13,13,26,0.9)", border: "1px solid #1a1a2e", borderRadius: 16, padding: 24, backdropFilter: "blur(10px)" },
    label:   { fontFamily: "monospace", fontSize: 11, color: "#00f5d4", textTransform: "uppercase", letterSpacing: "0.15em" },
    section: { fontFamily: "monospace", fontSize: 12, color: "#00f5d4", textTransform: "uppercase", letterSpacing: "0.1em", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 99, border: "1px solid rgba(0,245,212,0.25)", background: "rgba(0,245,212,0.05)", marginBottom: 20 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00f5d4", boxShadow: "0 0 8px #00f5d4" }}/>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "#00f5d4", letterSpacing: "0.1em" }}>AI LEGAL AUDITOR v2.0</span>
          </div>
          {/* Title */}
          <h1 style={{ fontFamily: "'Syne', system-ui, sans-serif", fontWeight: 800, fontSize: "clamp(36px,6vw,52px)", color: "#fff", margin: "0 0 12px", lineHeight: 1.1 }}>
            Quick<span style={{ color: "#00f5d4" }}>Legal</span>
          </h1>
          <p style={{ color: "#4a4a6a", fontSize: 14, margin: 0, maxWidth: 400, marginInline: "auto", lineHeight: 1.6 }}>
            Terms & Conditions ka asli matlab — 3 second mein. Koi lawyer nahi chahiye.
          </p>
          {/* Features row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { icon: Zap,         label: "Instant Analysis" },
              { icon: Shield,      label: "Red Flag Detection" },
              { icon: TrendingDown,label: "Privacy Score" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon size={13} color="#00f5d4"/>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#4a4a6a" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Input Section ───────────────────────────────────────────────── */}
        {!result && (
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ ...S.section }}>
              <FileText size={14}/>
              Paste karo T&C / Privacy Policy
            </div>

            {/* Textarea */}
            <div style={{ position: "relative" }}>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => { setText(e.target.value); setError(null); }}
                placeholder="Yahan T&C ya Privacy Policy text paste karo...&#10;&#10;Tip: Kisi bhi website ke Terms of Service ya Privacy Policy page se poora text copy karo aur yahan paste karo."
                rows={12}
                style={{
                  width: "100%", background: "rgba(8,8,15,0.8)",
                  border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "#1a1a2e"}`,
                  borderRadius: 12, padding: "14px 14px 36px",
                  fontFamily: "monospace", fontSize: 12.5, color: "#c0c0d0",
                  lineHeight: 1.7, resize: "vertical", outline: "none",
                  transition: "border-color 0.2s", boxSizing: "border-box",
                  minHeight: 200,
                }}
                onFocus={e => e.target.style.borderColor = "rgba(0,245,212,0.4)"}
                onBlur={e => e.target.style.borderColor = error ? "rgba(239,68,68,0.5)" : "#1a1a2e"}
              />
              {/* Char count */}
              <div style={{ position: "absolute", bottom: 10, right: 12, display: "flex", alignItems: "center", gap: 8 }}>
                {text.length > 100000 && (
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#eab308" }}>100k tak analyze hoga</span>
                )}
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "#4a4a6a" }}>
                  {text.length.toLocaleString()} chars
                </span>
              </div>
            </div>

            {/* Error / Retry status */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderRadius: 8, marginTop: 12,
                background: error.includes("attempt") || error.includes("warm")
                  ? "rgba(234,179,8,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${error.includes("attempt") || error.includes("warm")
                  ? "rgba(234,179,8,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}>
                <AlertTriangle size={13} color={error.includes("attempt") || error.includes("warm") ? "#eab308" : "#ef4444"}/>
                <span style={{
                  fontFamily: "monospace", fontSize: 12,
                  color: error.includes("attempt") || error.includes("warm") ? "#eab308" : "#ef4444"
                }}>{error}</span>
              </div>
            )}

            {/* Analyze button */}
            <button onClick={analyze} disabled={loading || text.length < 100}
              style={{
                width: "100%", marginTop: 14, padding: "14px",
                borderRadius: 12, border: "none", cursor: loading || text.length < 100 ? "not-allowed" : "pointer",
                background: loading || text.length < 100 ? "#1a1a2e" : "#00f5d4",
                color: loading || text.length < 100 ? "#4a4a6a" : "#08080f",
                fontFamily: "monospace", fontWeight: 700, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }}/> AI analyze kar raha hai... (60s tak lag sakte hain)</>
              ) : (
                <><Shield size={16}/> Analyze Karo</>
              )}
            </button>

            {/* Tip */}
            <p style={{ textAlign: "center", fontFamily: "monospace", fontSize: 11, color: "#4a4a6a", margin: "12px 0 0" }}>
              Powered by Google Gemini AI — 100% free to use
            </p>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Truncation warning */}
            {result.truncated && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)" }}>
                <Info size={13} color="#eab308"/>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#eab308" }}>Document bahut bada tha — pehle 100,000 characters analyze kiye gaye.</span>
              </div>
            )}

            {/* Main score card */}
            <div style={{ ...S.card, border: `1px solid ${scoreConfig.border}`, background: `linear-gradient(135deg, rgba(13,13,26,0.95), rgba(13,13,26,0.8))` }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

                {/* Score ring */}
                <ScoreRing score={result.privacy_score}/>

                {/* Verdict badge */}
                <div style={{
                  padding: "8px 24px", borderRadius: 99,
                  background: verdictCfg.bg, border: `1px solid ${verdictCfg.border}`,
                  fontFamily: "monospace", fontWeight: 700, fontSize: 13,
                  color: verdictCfg.color, letterSpacing: "0.1em"
                }}>
                  {result.verdict}
                </div>

                {/* Summary */}
                <p style={{ fontFamily: "sans-serif", fontSize: 15, color: "#fff", textAlign: "center", lineHeight: 1.6, margin: 0, fontWeight: 500, maxWidth: 500 }}>
                  {result.one_line_summary}
                </p>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 10, width: "100%" }}>
                  <StatCard icon={AlertTriangle} value={result.red_flags.length} label="Red Flags" color="#ef4444"/>
                  <StatCard icon={CheckCircle}   value={result.positives.length} label="Positives"  color="#00f5d4"/>
                  <StatCard icon={Star}          value={`${result.privacy_score}/10`} label="Privacy Score" color={scoreConfig.color}/>
                </div>

                {/* Model used */}
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "#4a4a6a" }}>
                  Analyzed by: {result.model_used || "Gemini AI"}
                </span>
              </div>
            </div>

            {/* Red Flags */}
            {result.red_flags.length > 0 && (
              <div style={S.card}>
                <div style={S.section}>
                  <AlertTriangle size={14} color="#ef4444"/>
                  <span style={{ color: "#ef4444" }}>Red Flags ({result.red_flags.length})</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.red_flags.map((flag, i) => <RedFlagCard key={i} flag={flag} index={i}/>)}
                </div>
              </div>
            )}

            {/* Positives */}
            {result.positives.length > 0 && (
              <div style={S.card}>
                <div style={S.section}>
                  <CheckCircle size={14} color="#00f5d4"/>
                  <span>Achhi Baatein ({result.positives.length})</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.positives.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5d4", marginTop: 7, flexShrink: 0 }}/>
                      <p style={{ margin: 0, fontFamily: "sans-serif", fontSize: 13, color: "#c0c0d0", lineHeight: 1.7 }}>{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reset} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                border: "1px solid #1a1a2e", background: "transparent",
                color: "#4a4a6a", fontFamily: "monospace", fontSize: 13,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.target.style.borderColor = "rgba(0,245,212,0.4)"; e.target.style.color = "#fff"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#1a1a2e"; e.target.style.color = "#4a4a6a"; }}
              >
                <RotateCcw size={14}/> Naya Document
              </button>
              <button onClick={copyResult} style={{
                flex: 1, padding: "12px", borderRadius: 12,
                border: "1px solid rgba(0,245,212,0.3)", background: "rgba(0,245,212,0.05)",
                color: "#00f5d4", fontFamily: "monospace", fontSize: 13,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}>
                <Copy size={14}/> {copied ? "Copied!" : "Result Copy Karo"}
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}