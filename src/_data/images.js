// Resizes every photo named in the content files, so a full-size phone photo
// uploaded through the control panel still loads fast. Output goes to _site/img/.
import Image from "@11ty/eleventy-img";
import { readFile } from "node:fs/promises";

async function load(name) {
  return JSON.parse(await readFile(new URL(`./${name}.json`, import.meta.url), "utf8"));
}

// "/media/gallery/x.webp" (how the control panel stores it) -> "src/media/gallery/x.webp"
function source(p) {
  return "src/" + String(p).replace(/^\/+/, "");
}

async function resize(p, widths) {
  if (!p) return null;
  try {
    const meta = await Image(source(p), { widths, formats: ["webp"], sharpWebpOptions: { quality: 72 }, outputDir: "_site/img/", urlPath: "img/" });
    const list = meta.webp;
    return { small: list[0], large: list[list.length - 1] };
  } catch (e) {
    console.warn(`[images] Skipping ${p}: ${e.message}`);
    return null;
  }
}

export default async function () {
  const [home, gallery, visit, schedule] = await Promise.all([load("home"), load("gallery"), load("visit"), load("schedule")]);
  const out = {
    hero: await resize(home.hero_image, [1600]),
    map: await resize(visit.map_image, [1400]),
    schedule: await resize(schedule.photo, [1000]),
    gallery: [],
  };
  for (const photo of gallery.photos || []) {
    const img = await resize(photo.image, [640, 1600]);
    if (img) out.gallery.push({ ...photo, img });
  }
  return out;
}
