// Vice City Cover Maker — the entry program for gta6-cover-art-01 (Node 22,
// standard library only). The app itself is plain static files under app/:
// index.html plus its ES modules, a bundled Anton font and two sample
// photos, nothing fetched over the network. This program hands the entry
// in: it copies app/ and screenshots/ from beside this file into the
// output directory and writes /output/dossier.json with the vendored
// make.fun library, so the judge can read the source and the screenshots.
//
// Local test run (outside the grader, MAKEFUN_OUTPUT_DIR stands in for
// /output):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The repository root: the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file can never leak in.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// The app first, then the screenshots beside it.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
} else {
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps (see the kit's RULES.txt): the text cap shapes the
// dossier's bytes; the others refuse an entry the scorer would refuse —
// more than 4 screenshots or one over 256 KiB, more than 993 files in app/
// or 48 MiB of app files in all, or a path under app/ over 1000 bytes.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
