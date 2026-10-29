// Builds the site from src/ into _site/. Page content lives in src/_data/*.json,
// which the control panel (Pages CMS, see .pages.yml) edits.

function escape(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Plain text with two small extras: **bold**, and [text in brackets] shown as a
// yellow "fill this in" highlight so placeholders are easy to spot on the page.
function rich(s) {
  return escape(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]/g, '<em class="ph">$1</em>');
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets", "src/favicon.svg": "favicon.svg", "src/robots.txt": "robots.txt" });
  eleventyConfig.addWatchTarget("src/_includes/");

  eleventyConfig.addFilter("rich", rich);
  eleventyConfig.addFilter("paras", (s) =>
    String(s ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${rich(p)}</p>`).join("\n"));
  eleventyConfig.addFilter("isWhole", (s) => /^\d+$/.test(String(s ?? "").trim()));
  eleventyConfig.addFilter("tel", (s) => {
    const d = String(s).replace(/\D/g, "");
    return "+" + (d.length === 10 ? "1" + d : d);
  });
  eleventyConfig.addFilter("shortDate", (s) => {
    const d = new Date(String(s).slice(0, 10) + "T12:00:00Z");
    return isNaN(d) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  });
  eleventyConfig.addFilter("mapsQuery", (site) =>
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${site.street} ${site.city} ${site.state}`));

  return {
    dir: { input: "src", output: "_site" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
