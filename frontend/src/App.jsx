import { useRef, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function App() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("SEO");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const resultsRef = useRef(null);

  async function handleScan(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setData(null);
    try {
      const res = await axios.post(`${API_BASE}/api/scan`, { url });
      setData(res.data);
      setTab("SEO");
      setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
        50
      );
    } catch {
      setErr("Scan failed. Try another public URL.");
    } finally {
      setLoading(false);
    }
  }

  function exportJSON() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = "clearfind-result.json";
    a.click();
    URL.revokeObjectURL(href);
  }

  const findingsBy = (cat) => {
    if (!data) return [];
    if (cat === "SEO") return data.seo?.findings || [];
    if (cat === "AEO") return data.aeo?.findings || [];
    return [];
  };

  return (
    <div className="container">
      {/* HERO */}
      <section className="hero">
        <h1>ClearFind</h1>
        <p>
          Analyze a page for SEO and AEO signals. Clean results. Clear fixes.
        </p>

        <form
          onSubmit={handleScan}
          className="input-row"
          aria-label="Analyze a URL"
        >
          <label htmlFor="url" className="sr-only">
            URL
          </label>
          <input
            id="url"
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            inputMode="url"
            required
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Scanning…" : "Analyze"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setDemo(setData, setTab)}
          >
            Try demo
          </button>
        </form>
        {err && <p style={{ color: "var(--err)", marginTop: 10 }}>{err}</p>}
      </section>

      {/* RESULTS */}
      {data && (
        <section
          ref={resultsRef}
          className="section"
          aria-labelledby="results-heading"
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <h2 id="results-heading" style={{ margin: "0" }}>
              Analysis Results
            </h2>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <nav className="tabs" role="tablist" aria-label="Result tabs">
                <button
                  className="tab"
                  role="tab"
                  aria-selected={tab === "SEO"}
                  onClick={() => setTab("SEO")}
                >
                  SEO
                </button>
                <button
                  className="tab"
                  role="tab"
                  aria-selected={tab === "AEO"}
                  onClick={() => setTab("AEO")}
                >
                  AEO
                </button>
              </nav>
              <button
                className="tab"
                onClick={exportJSON}
                title="Download JSON"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className="summary">
            <span className="pill">URL: {data.url}</span>
            <span className="pill">
              Issues: <strong>{data.summary?.issues ?? 0}</strong>
            </span>
            <span className="pill">
              OK:{" "}
              <strong style={{ color: "var(--ok)" }}>
                {data.summary?.oks ?? 0}
              </strong>
            </span>
            <span className="pill">
              Info:{" "}
              <strong style={{ color: "var(--warn)" }}>
                {data.summary?.infos ?? 0}
              </strong>
            </span>
          </div>

          <div className="cards" style={{ marginTop: 16 }}>
            {findingsBy(tab).map((f, i) => (
              <article key={i} className="card" aria-live="polite">
                <h3>
                  <span aria-hidden>🔎</span> {f.label}
                  <span className={`badge ${f.status}`}>{f.status}</span>
                </h3>
                {f.details && <div className="sub">{f.details}</div>}
                {f.why && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Why</strong>: {f.why}
                  </div>
                )}
                {f.fix && (
                  <div style={{ marginTop: 6 }}>
                    <strong>Fix</strong>: {f.fix}
                  </div>
                )}
                {f.example && <pre>{f.example}</pre>}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* LEARN (always visible) */}
      <section className="learn" aria-labelledby="learn-heading">
        <h2 id="learn-heading" style={{ marginTop: 0 }}>
          Learn SEO &amp; AEO
        </h2>
        <p className="sub">
          Short, beginner-friendly notes — inspired by Lighthouse / PSI
          patterns.
        </p>
        <div className="accordion">
          <Topic title="SEO vs AEO">
            SEO helps rank pages; AEO structures knowledge so assistants and
            answer engines can extract it reliably.
          </Topic>
          <Topic title="Titles & Meta Descriptions">
            One concise title (~60 chars). Descriptions ~150–160 chars that
            summarize for humans.
          </Topic>
          <Topic title="Structured Data (JSON-LD)">
            Add Organization, Article, Product, or FAQPage JSON-LD. Validate
            with Rich Results Test. &nbsp;
            <a
              href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </a>
            .
          </Topic>
          <Topic title="Headings & Page Structure">
            One H1 per page. Use H2/H3 for sections. Chunk paragraphs for
            scannability.
          </Topic>
          <Topic title="Open Graph & Twitter Cards">
            Control link previews with og:title, og:description, og:image.{" "}
            <a href="https://ogp.me" target="_blank" rel="noreferrer">
              Open Graph
            </a>
            &nbsp;•&nbsp;
            <a
              href="https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup"
              target="_blank"
              rel="noreferrer"
            >
              Twitter Cards
            </a>
          </Topic>
          <Topic title="FAQ / Q&A">
            If you have common questions, consider FAQPage JSON-LD. Keep answers
            crisp and factual.
          </Topic>
          <Topic title="Entity Clarity & Trust">
            Add About and Contact. Include org/author info. Provenance helps
            both users and AI systems.
          </Topic>
          <Topic title="Accessibility helps AEO">
            Semantic HTML, labels, alt text, and contrast improve both
            accessibility and machine readability.
          </Topic>
        </div>

        <div style={{ marginTop: 12 }}>
          <h3 style={{ marginBottom: 6 }}>Resources</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              <a
                href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide"
                target="_blank"
                rel="noreferrer"
              >
                Google SEO Starter Guide
              </a>
            </li>
            <li>
              <a
                href="https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"
                target="_blank"
                rel="noreferrer"
              >
                Structured Data Intro
              </a>
            </li>
            <li>
              <a href="https://schema.org" target="_blank" rel="noreferrer">
                Schema.org
              </a>
            </li>
            <li>
              <a
                href="https://www.sitemaps.org"
                target="_blank"
                rel="noreferrer"
              >
                Sitemaps
              </a>
            </li>
            <li>
              <a
                href="https://developers.google.com/search/docs/crawling-indexing/robots/intro"
                target="_blank"
                rel="noreferrer"
              >
                Robots.txt basics
              </a>
            </li>
            <li>
              <a
                href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                target="_blank"
                rel="noreferrer"
              >
                WCAG overview
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="footer">
        <small>ClearFind — built for INFO 442</small>
      </div>
    </div>
  );
}

/* ---------- Tiny components ---------- */
function Topic({ title, children }) {
  return (
    <details>
      <summary>{title}</summary>
      <div style={{ paddingTop: 8 }}>{children}</div>
    </details>
  );
}

function setDemo(setData, setTab) {
  const demo = {
    url: "https://example.com/demo",
    summary: { issues: 2, oks: 4, infos: 3 },
    seo: {
      findings: [
        {
          label: "Title tag",
          status: "ok",
          details: "Found 52 characters.",
          why: "Good titles improve clarity.",
        },
        {
          label: "Meta description",
          status: "info",
          details: "174 characters.",
          fix: "Aim for 150–160.",
        },
        { label: "H1 structure", status: "ok", details: "Single H1 detected." },
        {
          label: "Canonical tag",
          status: "info",
          details: "Missing canonical.",
          fix: 'Add <link rel="canonical" href="..."/>',
        },
        {
          label: "Open Graph Tags",
          status: "ok",
          details: "og:title, og:description, og:image present.",
        },
        {
          label: "Robots Meta Tag",
          status: "ok",
          details: "Indexing allowed.",
        },
      ],
    },
    aeo: {
      findings: [
        {
          label: "Structured Data (JSON-LD)",
          status: "issue",
          details: "No JSON-LD found.",
          fix: "Add Organization / Article / Product / FAQPage JSON-LD.",
        },
        {
          label: "Structured Data types",
          status: "info",
          details: "None detected.",
        },
        {
          label: "FAQ/Q&A",
          status: "info",
          details: "FAQ pattern not detected.",
          fix: "Add FAQPage JSON-LD if relevant.",
        },
      ],
    },
    meta: { httpStatus: 200, fetchedAt: new Date().toISOString() },
  };
  setData(demo);
  setTab("SEO");
}
