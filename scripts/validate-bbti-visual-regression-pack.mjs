#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const errors = [];
const EXPECTED_MANIFEST_VERSION = "bbti-visual-qa-manifest-v1";
const EXPECTED_PACK_VERSION = "bbti-visual-regression-pack-v1";
const EXPECTED_VIEWPORTS = [
  { height: 844, name: "mobile", width: 390 },
  { height: 900, name: "desktop", width: 1280 },
];
const EXPECTED_AUDIT_PACKS = {
  "mobile-core": [
    "result-action-stack",
    "result-scouting-refresh",
    "result-scouting-copy-kit",
    "next-play-long-copy-stress",
    "add-files-suggestion-panel",
    "film-room-remix-bench",
  ],
  "return-loop": [
    "arena-event-bracket",
    "featured-daily-return-arena-context",
    "return-bench-streaks",
    "entry-return-stack-with-last-result",
    "return-streaks-long-copy-stress",
  ],
  "challenge-case": [
    "challenge-replay-seeds",
    "challenge-pick-replay-kit",
    "challenge-lane-scoreboard",
    "case-postgame-film-room",
    "case-postgame-result",
    "case-postgame-arena-event",
    "case-battle-mobile-polish",
    "replay-center-coach-challenge",
    "battle-replay-lens-case",
    "case-trail-film-room",
    "case-trail-result",
    "case-trail-arena-event",
  ],
  "share-duo": [
    "share-card-poster",
    "share-kit-locker-room",
    "share-route-scoreboard",
    "share-return-lane-check",
    "duo-chemistry",
    "compare-report-program",
    "compare-report-clash",
    "duo-rematch-prompts",
  ],
  "shared-challenge": [
    "deep-link-film-room",
    "deep-link-arena-event",
    "deep-link-result",
    "deep-link-invalid-clip",
    "deep-link-collapsed",
  ],
};
const REQUIRED_RISKS = [
  "mobile-wrap",
  "mobile-compact",
  "long-copy",
  "sticky-dock",
  "poster-surface",
  "source-boundary",
  "case-source",
  "return-state",
  "card-density",
  "copy-controls",
];

function addError(message) {
  errors.push(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertEqual(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    addError(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(label, values, expected) {
  if (!values.includes(expected)) {
    addError(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function sceneById(manifest, sceneId) {
  return manifest.scenes.find((scene) => scene.id === sceneId) ?? null;
}

function assertSceneRisk(manifest, sceneId, risk) {
  const scene = sceneById(manifest, sceneId);
  if (!scene) {
    addError(`scene ${sceneId}: missing from manifest`);
    return;
  }
  assertIncludes(`scene ${sceneId} risks`, scene.risks ?? [], risk);
}

function validateManifest(manifest) {
  assertEqual("manifest version", manifest.manifestVersion, EXPECTED_MANIFEST_VERSION);
  assertEqual("pack version", manifest.visualRegressionPack?.version, EXPECTED_PACK_VERSION);
  assertEqual("viewport matrix", manifest.visualRegressionPack?.viewportMatrix, EXPECTED_VIEWPORTS);

  if (!Array.isArray(manifest.scenes) || manifest.scenes.length < 30) {
    addError(`scenes: expected at least 30 scenes, got ${manifest.scenes?.length ?? 0}`);
    return;
  }

  const sceneIds = manifest.scenes.map((scene) => scene.id);
  if (new Set(sceneIds).size !== sceneIds.length) {
    addError(`scenes: duplicate ids ${sceneIds.join(",")}`);
  }
  if (manifest.visualRegressionPack?.sceneCount !== manifest.scenes.length) {
    addError(`sceneCount: expected ${manifest.scenes.length}, got ${manifest.visualRegressionPack?.sceneCount}`);
  }
  if (manifest.visualRegressionPack?.viewportCount !== EXPECTED_VIEWPORTS.length) {
    addError(`viewportCount: expected ${EXPECTED_VIEWPORTS.length}, got ${manifest.visualRegressionPack?.viewportCount}`);
  }

  for (const scene of manifest.scenes) {
    if (!scene.group) addError(`scene ${scene.id}: missing group`);
    if (!Array.isArray(scene.risks) || scene.risks.length === 0) addError(`scene ${scene.id}: missing risks`);
    if (!Array.isArray(scene.auditSelectors) || scene.auditSelectors.length === 0) addError(`scene ${scene.id}: missing audit selectors`);
    if (!Array.isArray(scene.mobileChecklist) || scene.mobileChecklist.length === 0) addError(`scene ${scene.id}: missing mobile checklist`);
    assertEqual(`scene ${scene.id} viewports`, scene.viewports, EXPECTED_VIEWPORTS);
    for (const selector of scene.auditSelectors ?? []) {
      if (!/^\[[a-zA-Z0-9_:-]+="[^"]+"\]$/.test(selector)) {
        addError(`scene ${scene.id}: audit selector must stay attribute-only, got ${selector}`);
      }
    }
  }

  for (const [packId, expectedSceneIds] of Object.entries(EXPECTED_AUDIT_PACKS)) {
    const actualSceneIds = manifest.visualRegressionPack?.auditPacks?.[packId] ?? [];
    assertEqual(`audit pack ${packId}`, actualSceneIds, expectedSceneIds);
    for (const sceneId of expectedSceneIds) {
      if (!sceneIds.includes(sceneId)) addError(`audit pack ${packId}: missing scene ${sceneId}`);
    }
  }

  for (const risk of REQUIRED_RISKS) {
    const sceneIdsForRisk = manifest.visualRegressionPack?.riskPacks?.[risk] ?? [];
    if (sceneIdsForRisk.length === 0) addError(`risk pack ${risk}: expected at least one scene`);
    if ((manifest.visualRegressionPack?.riskCounts?.[risk] ?? 0) !== sceneIdsForRisk.length) {
      addError(`risk count ${risk}: expected ${sceneIdsForRisk.length}, got ${manifest.visualRegressionPack?.riskCounts?.[risk]}`);
    }
  }

  assertSceneRisk(manifest, "result-action-stack", "sticky-dock");
  assertSceneRisk(manifest, "result-action-stack", "mobile-compact");
  assertSceneRisk(manifest, "result-scouting-refresh", "source-boundary");
  assertSceneRisk(manifest, "result-scouting-refresh", "card-density");
  assertSceneRisk(manifest, "result-scouting-refresh", "long-copy");
  assertSceneRisk(manifest, "result-scouting-copy-kit", "source-boundary");
  assertSceneRisk(manifest, "result-scouting-copy-kit", "card-density");
  assertSceneRisk(manifest, "result-scouting-copy-kit", "long-copy");
  assertSceneRisk(manifest, "result-scouting-copy-kit", "copy-controls");
  assertSceneRisk(manifest, "next-play-long-copy-stress", "long-copy");
  assertSceneRisk(manifest, "return-streaks-long-copy-stress", "long-copy");
  assertSceneRisk(manifest, "share-card-poster", "poster-surface");
  assertSceneRisk(manifest, "share-kit-locker-room", "source-boundary");
  assertSceneRisk(manifest, "share-kit-locker-room", "card-density");
  assertSceneRisk(manifest, "share-kit-locker-room", "copy-controls");
  assertSceneRisk(manifest, "share-route-scoreboard", "source-boundary");
  assertSceneRisk(manifest, "share-route-scoreboard", "copy-controls");
  assertSceneRisk(manifest, "share-return-lane-check", "source-boundary");
  assertSceneRisk(manifest, "share-return-lane-check", "card-density");
  assertSceneRisk(manifest, "share-return-lane-check", "copy-controls");
  assertSceneRisk(manifest, "film-room-remix-bench", "source-boundary");
  assertSceneRisk(manifest, "film-room-remix-bench", "long-copy");
  assertSceneRisk(manifest, "film-room-remix-bench", "copy-controls");
  assertSceneRisk(manifest, "challenge-replay-seeds", "source-boundary");
  assertSceneRisk(manifest, "challenge-replay-seeds", "long-copy");
  assertSceneRisk(manifest, "challenge-replay-seeds", "copy-controls");
  assertSceneRisk(manifest, "challenge-lane-scoreboard", "source-boundary");
  assertSceneRisk(manifest, "challenge-lane-scoreboard", "card-density");
  assertSceneRisk(manifest, "challenge-lane-scoreboard", "copy-controls");
  assertSceneRisk(manifest, "challenge-pick-replay-kit", "source-boundary");
  assertSceneRisk(manifest, "duo-rematch-prompts", "source-boundary");
  assertSceneRisk(manifest, "duo-rematch-prompts", "long-copy");
  assertSceneRisk(manifest, "duo-rematch-prompts", "copy-controls");
  assertSceneRisk(manifest, "add-files-suggestion-panel", "copy-controls");
  assertSceneRisk(manifest, "arena-event-bracket", "return-state");
  assertSceneRisk(manifest, "arena-event-bracket", "source-boundary");
  assertSceneRisk(manifest, "battle-replay-lens-case", "case-source");
  assertSceneRisk(manifest, "case-battle-mobile-polish", "case-source");
  assertSceneRisk(manifest, "case-battle-mobile-polish", "card-density");
  for (const sceneId of [
    "case-postgame-film-room",
    "case-postgame-result",
    "case-postgame-arena-event",
  ]) {
    assertSceneRisk(manifest, sceneId, "source-boundary");
    assertSceneRisk(manifest, sceneId, "case-source");
  }
}

const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "bbti-visual-regression-pack-"));
try {
  const result = spawnSync(process.execPath, [
    path.join(ROOT, "scripts/render-bbti-visual-qa-fixtures.mjs"),
    "--out-dir",
    outDir,
  ], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    addError(`renderer exited with status ${result.status}`);
  } else {
    const manifestPath = path.join(outDir, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
      addError(`manifest: missing at ${manifestPath}`);
    } else {
      validateManifest(readJson(manifestPath));
    }
  }
} finally {
  fs.rmSync(outDir, { force: true, recursive: true });
}

if (errors.length) {
  console.error("BBTI visual regression pack validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI visual regression pack validation");
console.log(`- manifest version: ${EXPECTED_MANIFEST_VERSION}`);
console.log(`- pack version: ${EXPECTED_PACK_VERSION}`);
console.log(`- audit packs: ${Object.keys(EXPECTED_AUDIT_PACKS).length}`);
console.log(`- required risks: ${REQUIRED_RISKS.length}`);
console.log("OK: visual regression pack manifest is deterministic and selector-backed.");
