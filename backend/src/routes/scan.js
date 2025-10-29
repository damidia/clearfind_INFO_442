import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = express.Router();

function add(findings, obj) { findings.push(obj); }
function countSummary(seo, aeo) {
  const all = [...seo.findings, ...aeo.findings];
  return {
    issues: all.filter(f => f.status === "issue").length,
    oks: all.filter(f => f.status === "ok").length,
    infos: all.filter(f => f.status === "info").length
  };
}

router.post("/", async (req, res) => {
  try {
    const { url } = req.body || {};
    if (!url || !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: "Provide a valid http(s) URL" });
    }

    // Fetch page HTML
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { "User-Agent": "ClearFind/0.1 (+student project)" },
      validateStatus: () => true
    });

    const html = typeof response.data === "string" ? response.data : "";
    const httpStatus = response.status;
    const fetchedAt = new Date();

    // handle non-HTML pages or blocked content
    if (!html || !/<!doctype html>|<html/i.test(html)) {
      return res.status(200).json({
        url,
        summary: { issues: 1, oks: 0, infos: 0 },
        seo: { findings: [{
          id: "seo.html",
          label: "HTML content",
          status: "issue",
          details: "This URL did not return readable HTML.",
          why: "Some sites require login or block bots.",
          fix: "Try a public page. Pages behind auth will not scan."
        }]},
        aeo: { findings: [] },
        meta: { httpStatus, fetchedAt }
      });
    }

    const $ = cheerio.load(html);

    // SEO checks
    const seo = { findings: [] };

    const title = $("title").first().text().trim();
    if (!title) {
      add(seo.findings, {
        id: "seo.title", label: "Title tag", status: "issue",
        details: "Missing <title>.",
        why: "Titles help users and ranking systems understand the page.",
        fix: "Add a concise <title> under ~60 characters.",
        example: "<title>How to Replace a Bike Chain</title>"
      });
    } else {
      add(seo.findings, {
        id: "seo.title", label: "Title tag", status: "ok",
        details: `Found title (${title.length} characters).`,
        why: "Good titles improve clarity.",
        fix: "Keep it descriptive and concise."
      });
    }

    const desc = $('meta[name="description"]').attr("content")?.trim();
    if (!desc) {
      add(seo.findings, {
        id: "seo.meta.description", label: "Meta description", status: "issue",
        details: "Missing meta description.",
        why: "Improves click-through by summarizing the page.",
        fix: "Add 150–160 char summary.",
        example: '<meta name="description" content="Short helpful summary..." />'
      });
    } else if (desc.length > 180) {
      add(seo.findings, {
        id: "seo.meta.description", label: "Meta description", status: "info",
        details: `Meta description is ${desc.length} characters.`,
        why: "Long descriptions may be truncated.",
        fix: "Aim for ~150–160 characters."
      });
    } else {
      add(seo.findings, {
        id: "seo.meta.description", label: "Meta description", status: "ok",
        details: "Meta description present."
      });
    }

    const h1s = $("h1");
    if (h1s.length === 0) {
      add(seo.findings, {
        id: "seo.h1", label: "H1 structure", status: "issue",
        details: "No H1 on the page.",
        why: "Signals the main topic.",
        fix: "Add one H1 and use H2/H3 for sections."
      });
    } else if (h1s.length > 1) {
      add(seo.findings, {
        id: "seo.h1", label: "H1 structure", status: "info",
        details: "Multiple H1 tags detected.",
        fix: "Use only one H1 per page."
      });
    } else {
      add(seo.findings, {
        id: "seo.h1", label: "H1 structure", status: "ok",
        details: "Single H1 detected."
      });
    }

    const canonical = $('link[rel="canonical"]').attr("href");
    if (!canonical) {
      add(seo.findings, {
        id: "seo.canonical", label: "Canonical tag", status: "info",
        details: "Canonical not found.",
        why: "Helps with duplicate URLs.",
        fix: 'Add: <link rel="canonical" href="https://example.com/page" />'
      });
    } else {
      add(seo.findings, {
        id: "seo.canonical", label: "Canonical tag", status: "ok",
        details: `Canonical set to ${canonical}`
      });
    }

    const ogTitle = $('meta[property="og:title"]').attr("content");
    const ogDesc  = $('meta[property="og:description"]').attr("content");
    const ogImage = $('meta[property="og:image"]').attr("content");
    if (!ogTitle || !ogDesc || !ogImage) {
      add(seo.findings, {
        id: "seo.og", label: "Open Graph Tags", status: "info",
        details: "Missing some OG tags.",
        why: "Controls social and preview snippets.",
        fix: "Add og:title, og:description, and og:image."
      });
    } else {
      add(seo.findings, {
        id: "seo.og", label: "Open Graph Tags", status: "ok",
        details: "OG tags present."
      });
    }

    const robotsMeta = $('meta[name="robots"]').attr("content")?.toLowerCase() || "";
    if (robotsMeta.includes("noindex")) {
      add(seo.findings, {
        id: "seo.robots", label: "Robots Meta Tag", status: "issue",
        details: "robots meta set to noindex.",
        why: "Prevents indexing.",
        fix: "Remove noindex if you want this page indexed."
      });
    } else {
      add(seo.findings, {
        id: "seo.robots", label: "Robots Meta Tag", status: "ok",
        details: "robots meta allows indexing or is not present."
      });
    }

    // AEO checks
    const aeo = { findings: [] };

    const jsonLd = $('script[type="application/ld+json"]').map((_, el) => {
      try { return JSON.parse($(el).text()); } catch { return null; }
    }).get().filter(Boolean);

    if (jsonLd.length === 0) {
      add(aeo.findings, {
        id: "aeo.jsonld.present", label: "Structured Data (JSON-LD)", status: "issue",
        details: "No JSON-LD found.",
        why: "Helps answer systems understand entities.",
        fix: "Add Organization/Article/Product/FAQPage JSON-LD as relevant."
      });
    } else {
      const types = new Set();
      jsonLd.forEach(b => {
        const t = b["@type"];
        if (Array.isArray(t)) t.forEach(x => x && types.add(x));
        else if (t) types.add(t);
      });
      add(aeo.findings, {
        id: "aeo.jsonld.types", label: "Structured Data types", status: "ok",
        details: `Found ${jsonLd.length} JSON-LD block(s), types: ${[...types].join(", ") || "unknown"}`
      });
    }

    const hasFAQHeading = $("h2,h3").filter((_, el) => /faq|questions/i.test($(el).text())).length > 0;
    const hasDetails = $("details summary").length > 0;
    if (hasFAQHeading || hasDetails) {
      add(aeo.findings, {
        id: "aeo.faq", label: "FAQ/Q&A", status: "info",
        details: "FAQ pattern detected but not marked up.",
        fix: "Add FAQPage JSON-LD for common questions."
      });
    }

    const hasAbout = $('a[href*="about"]').length > 0;
    const hasContact = $('a[href*="contact"]').length > 0;
    if (!hasAbout || !hasContact) {
      add(aeo.findings, {
        id: "aeo.entity.trust", label: "Entity clarity", status: "info",
        details: "Add About and Contact links.",
        why: "Provenance helps AI and users trust content.",
        fix: "Add About/Contact in header or footer."
      });
    }

    const summary = countSummary(seo, aeo);
    return res.json({
      url,
      summary,
      seo,
      aeo,
      meta: { httpStatus, fetchedAt }
    });
  } catch (err) {
    console.error("scan error:", err.message);
    res.status(500).json({ error: "Scan failed. Try a different URL." });
  }
});

export default router;
