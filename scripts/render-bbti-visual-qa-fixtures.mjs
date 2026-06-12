#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(path.join(ROOT, "package.json"));
const React = nodeRequire("react");
const ReactDOMServer = nodeRequire("react-dom/server");
const runtimeModuleCache = new Map();
const errors = [];
const BBTI_VISUAL_QA_MANIFEST_VERSION = "bbti-visual-qa-manifest-v1";
const BBTI_VISUAL_REGRESSION_PACK_VERSION = "bbti-visual-regression-pack-v1";
const VISUAL_QA_VIEWPORTS = [
  { height: 844, name: "mobile", width: 390 },
  { height: 900, name: "desktop", width: 1280 },
];
const VISUAL_QA_AUDIT_PACKS = {
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

function resolveOutDir() {
  const index = process.argv.indexOf("--out-dir");
  if (index >= 0 && process.argv[index + 1]) {
    return path.resolve(process.argv[index + 1]);
  }

  return process.env.BBTI_VISUAL_QA_OUT_DIR
    ? path.resolve(process.env.BBTI_VISUAL_QA_OUT_DIR)
    : path.join(ROOT, "out/bbti-visual-qa");
}

function resolveWithExt(basePath) {
  const candidates = [
    basePath,
    `${basePath}.tsx`,
    `${basePath}.ts`,
    `${basePath}.jsx`,
    `${basePath}.js`,
    path.join(basePath, "index.tsx"),
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.js"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

function resolveRuntimeModule(fromPath, request) {
  if (request.endsWith(".css")) return null;
  if (request.startsWith("@/")) {
    return resolveWithExt(path.join(ROOT, "src", request.slice(2)));
  }

  if (request.startsWith(".")) {
    return resolveWithExt(path.resolve(path.dirname(fromPath), request));
  }

  return null;
}

function loadRuntimeTsModule(filePath) {
  const absolutePath = path.resolve(filePath);
  const cached = runtimeModuleCache.get(absolutePath);
  if (cached) return cached.exports;

  const runtimeModule = { exports: {} };
  runtimeModuleCache.set(absolutePath, runtimeModule);

  const sourceText = fs.readFileSync(absolutePath, "utf8");
  const compiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      target: ts.ScriptTarget.ES2020,
      verbatimModuleSyntax: false,
    },
    fileName: absolutePath,
  });

  const localRequire = (request) => {
    if (request.endsWith(".css")) return {};
    const runtimePath = resolveRuntimeModule(absolutePath, request);
    return runtimePath ? loadRuntimeTsModule(runtimePath) : nodeRequire(request);
  };

  const wrapper = new Function("require", "module", "exports", "__filename", "__dirname", compiled.outputText);
  wrapper(localRequire, runtimeModule, runtimeModule.exports, absolutePath, path.dirname(absolutePath));
  return runtimeModule.exports;
}

function loadCssBundle() {
  const directories = [
    path.join(ROOT, ".next/static/css"),
    path.join(ROOT, ".next/dev/static/chunks"),
  ];
  const cssFiles = directories.flatMap((directory) => {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory)
      .filter((name) => name.endsWith(".css"))
      .map((name) => path.join(directory, name));
  }).sort();

  return {
    css: cssFiles.map((filePath) => fs.readFileSync(filePath, "utf8")).join("\n"),
    files: cssFiles.map((filePath) => path.relative(ROOT, filePath)),
  };
}

function addError(message) {
  errors.push(message);
}

function assertIncludes(label, value, expected) {
  if (!value.includes(expected)) {
    addError(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

function assertNotIncludes(label, value, forbidden) {
  if (value.includes(forbidden)) {
    addError(`${label}: must not include ${JSON.stringify(forbidden)}`);
  }
}

function countOccurrences(value, pattern) {
  return value.match(new RegExp(pattern, "g"))?.length ?? 0;
}

function attributeValues(value, attributeName) {
  return Array.from(value.matchAll(new RegExp(`${attributeName}="([^"]+)"`, "g")))
    .map((match) => match[1]);
}

function decodeAttributeValue(value) {
  return String(value ?? "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'");
}

function sceneHtmlFor(value, sceneId) {
  const marker = `data-qa-scene="${sceneId}"`;
  const markerIndex = value.indexOf(marker);
  if (markerIndex < 0) return "";
  const start = value.lastIndexOf("<section", markerIndex);
  const next = value.indexOf('<section class="qa-block" data-qa-scene=', markerIndex + marker.length);
  const end = next >= 0 ? next : value.indexOf("</main>", markerIndex);
  return value.slice(start, end);
}

function unique(values) {
  return Array.from(new Set(values));
}

function visualRegressionGroupFor(sceneId) {
  if (sceneId.startsWith("deep-link-")) return "shared-challenge";
  if (
    sceneId.startsWith("next-play-")
    || sceneId === "result-action-stack"
    || sceneId === "result-scouting-refresh"
    || sceneId === "result-scouting-copy-kit"
  ) return "result-actions";
  if (sceneId === "add-files-suggestion-panel") return "coach-queue";
  if (sceneId === "arena-event-bracket") return "arena-events";
  if (sceneId === "answer-poll-trend-result") return "result";
  if (
    sceneId.startsWith("featured-daily-return-")
    || sceneId.startsWith("return-bench-")
    || sceneId.startsWith("entry-return-")
    || sceneId.startsWith("return-streaks-")
  ) return "return-loop";
  if (sceneId.startsWith("film-room-")) return "film-room";
  if (sceneId.startsWith("challenge-")) return "challenge";
  if (sceneId.startsWith("share-")) return "share";
  if (sceneId === "duo-chemistry" || sceneId === "duo-rematch-prompts" || sceneId.startsWith("compare-report-")) return "duo";
  if (
    sceneId.startsWith("case-postgame-")
    || sceneId.startsWith("case-battle-mobile-")
    || sceneId.startsWith("case-trail-")
    || sceneId.startsWith("replay-center-")
    || sceneId.startsWith("battle-replay-lens-")
  ) return "case-battle";
  return "misc";
}

function visualRegressionRisksFor(sceneId) {
  const risks = ["mobile-wrap"];

  if (sceneId.startsWith("deep-link-") || sceneId === "answer-poll-trend-result" || sceneId.startsWith("film-room-")) {
    risks.push("source-boundary");
  }
  if (sceneId.startsWith("next-play-")) risks.push("mobile-compact");
  if (sceneId.includes("long-copy") || sceneId === "result-action-stack") risks.push("long-copy");
  if (sceneId === "result-action-stack") risks.push("sticky-dock", "mobile-compact");
  if (sceneId === "result-scouting-refresh") risks.push("source-boundary", "card-density", "long-copy");
  if (sceneId === "result-scouting-copy-kit") risks.push("source-boundary", "card-density", "long-copy", "copy-controls");
  if (sceneId === "add-files-suggestion-panel") risks.push("card-density", "copy-controls");
  if (sceneId === "arena-event-bracket") risks.push("return-state", "source-boundary", "card-density", "copy-controls");
  if (sceneId.startsWith("featured-daily-return-") || sceneId.startsWith("return-bench-") || sceneId.startsWith("entry-return-")) {
    risks.push("return-state", "card-density");
  }
  if (sceneId.startsWith("return-streaks-")) risks.push("return-state", "card-density");
  if (sceneId.startsWith("challenge-")) risks.push("card-density", "copy-controls");
  if (sceneId === "challenge-pick-replay-kit") risks.push("source-boundary");
  if (sceneId === "challenge-replay-seeds") risks.push("source-boundary", "long-copy");
  if (sceneId === "challenge-lane-scoreboard") risks.push("source-boundary");
  if (sceneId === "film-room-remix-bench") {
    risks.push("long-copy", "card-density", "copy-controls");
  }
  if (sceneId === "share-route-scoreboard" || sceneId === "share-kit-locker-room" || sceneId === "share-return-lane-check") {
    risks.push("source-boundary", "card-density", "copy-controls");
  } else if (sceneId.startsWith("share-")) {
    risks.push("poster-surface", "copy-controls");
  }
  if (sceneId === "duo-rematch-prompts") {
    risks.push("source-boundary", "long-copy", "card-density", "copy-controls");
  } else if (sceneId === "duo-chemistry" || sceneId.startsWith("compare-report-")) {
    risks.push("card-density", "copy-controls");
  }
  if (
    sceneId.startsWith("case-postgame-")
    || sceneId.startsWith("case-battle-mobile-")
    || sceneId.startsWith("case-trail-")
    || sceneId.startsWith("battle-replay-lens-")
  ) {
    risks.push("case-source", "source-boundary", "card-density");
  }
  if (sceneId.startsWith("replay-center-")) risks.push("case-source", "source-boundary");
  if (sceneId.endsWith("invalid-clip") || sceneId.endsWith("collapsed")) risks.push("fallback-state");

  return unique(risks);
}

function visualRegressionPriorityFor(sceneId) {
  if (
    sceneId === "result-action-stack"
    || sceneId === "result-scouting-refresh"
    || sceneId === "result-scouting-copy-kit"
    || sceneId === "next-play-long-copy-stress"
    || sceneId === "add-files-suggestion-panel"
    || sceneId === "share-card-poster"
    || sceneId === "share-kit-locker-room"
    || sceneId === "share-route-scoreboard"
    || sceneId === "share-return-lane-check"
    || sceneId === "duo-rematch-prompts"
    || sceneId === "film-room-remix-bench"
    || sceneId === "challenge-replay-seeds"
    || sceneId === "challenge-pick-replay-kit"
    || sceneId === "challenge-lane-scoreboard"
    || sceneId.startsWith("case-postgame-")
    || sceneId.startsWith("case-battle-mobile-")
    || sceneId === "battle-replay-lens-case"
  ) return "p0";
  if (
    sceneId.startsWith("deep-link-")
    || sceneId.startsWith("return-")
    || sceneId.startsWith("entry-return-")
    || sceneId.startsWith("compare-report-")
    || sceneId.startsWith("case-trail-")
  ) return "p1";
  return "p2";
}

function visualRegressionAuditSelectorsFor(sceneId) {
  if (sceneId.startsWith("deep-link-")) {
    const selectors = ['[data-testid="bbti-deep-link-notice"]'];
    if (sceneId === "deep-link-invalid-clip") selectors.push('[data-bbti-clip-fallback="true"]');
    if (sceneId === "deep-link-collapsed") selectors.push('[data-bbti-notice-state="collapsed"]');
    return selectors;
  }
  if (sceneId.startsWith("next-play-")) {
    const selectors = [
      '[data-testid="bbti-next-play-panel"]',
      '[data-next-play-mobile-layout="primary"]',
    ];
    if ((nextPlayScenes[sceneId]?.length ?? 0) > 1) selectors.push('[data-next-play-mobile-layout="compact"]');
    return selectors;
  }
  if (sceneId === "add-files-suggestion-panel") {
    return [
      '[data-testid="bbti-add-files-suggestion-card"]',
      '[data-bbti-add-files-stage="next"]',
      '[data-testid="bbti-add-files-suggestion-cta"]',
    ];
  }
  if (sceneId === "arena-event-bracket") {
    return [
      '[data-testid="bbti-arena-event-card"]',
      '[data-testid="bbti-arena-event-bracket"]',
      '[data-testid="bbti-arena-event-bracket-route"]',
      '[data-testid="bbti-arena-event-bracket-action"]',
      '[data-testid="bbti-arena-event-bracket-boundary"]',
    ];
  }
  if (sceneId === "answer-poll-trend-result") {
    return [
      '[data-testid="bbti-answer-poll-trend"]',
      '[data-bbti-answer-poll-trend-source="local-simulation"]',
    ];
  }
  if (sceneId.startsWith("featured-daily-return-")) {
    return [
      '[data-testid="bbti-featured-daily-return"]',
      '[data-testid="bbti-daily-return-remix"]',
      '[data-testid="bbti-return-streak-step"]',
    ];
  }
  if (sceneId.startsWith("return-bench-") || sceneId.startsWith("return-streaks-")) {
    return [
      '[data-testid="bbti-return-bench"]',
      '[data-testid="bbti-return-streak-step"]',
      '[data-testid="bbti-return-bench-action"]',
    ];
  }
  if (sceneId.startsWith("entry-return-")) {
    return [
      '[data-testid="bbti-entry-return-stack"]',
      '[data-testid="bbti-featured-daily-return"]',
      '[data-testid="bbti-return-bench"]',
    ];
  }
  if (sceneId === "film-room-remix-bench") {
    return [
      '[data-testid="bbti-film-room-remix-bench"]',
      '[data-testid="bbti-film-room-remix-row"]',
      '[data-bbti-film-room-remix-action="copy-bench"]',
      '[data-testid="bbti-film-room-remix-boundary"]',
    ];
  }
  if (sceneId.startsWith("film-room-")) {
    return [
      '[data-testid="bbti-film-room-drill"]',
      '[data-testid="bbti-film-room-drill-step"]',
    ];
  }
  if (sceneId === "challenge-replay-seeds") {
    return [
      '[data-testid="bbti-challenge-replay-seeds"]',
      '[data-testid="bbti-challenge-replay-seed-row"]',
      '[data-bbti-challenge-replay-seeds-action="copy-seeds"]',
      '[data-testid="bbti-challenge-replay-seeds-boundary"]',
    ];
  }
  if (sceneId === "challenge-lane-scoreboard") {
    return [
      '[data-testid="bbti-challenge-lane-scoreboard"]',
      '[data-testid="bbti-challenge-lane-scoreboard-row"]',
      '[data-bbti-challenge-lane-scoreboard-action="copy-scoreboard"]',
      '[data-testid="bbti-challenge-lane-scoreboard-boundary"]',
    ];
  }
  if (sceneId === "challenge-pick-replay-kit") {
    return [
      '[data-testid="bbti-challenge-pick-replay-kit"]',
      '[data-testid="bbti-challenge-pick-replay-kit-item"]',
      '[data-bbti-challenge-pick-replay-kit-action="copy-kit"]',
      '[data-bbti-challenge-pick-replay-kit-action="copy"]',
      '[data-testid="bbti-challenge-pick-replay-kit-boundary"]',
    ];
  }
  if (sceneId.startsWith("challenge-")) {
    return [
      '[data-testid="bbti-challenge-receipt-board"]',
      '[data-testid="bbti-challenge-rivalry-script"]',
    ];
  }
  if (sceneId === "share-route-scoreboard") {
    return [
      '[data-testid="bbti-share-route-scoreboard"]',
      '[data-testid="bbti-share-route-scoreboard-row"]',
      '[data-testid="bbti-share-route-scoreboard-action"]',
      '[data-testid="bbti-share-route-scoreboard-boundary"]',
      '[data-testid="bbti-share-target-picker"]',
    ];
  }
  if (sceneId === "share-kit-locker-room") {
    return [
      '[data-testid="bbti-share-locker-room"]',
      '[data-testid="bbti-share-locker-room-row"]',
      '[data-bbti-share-locker-room-action="copy-locker-room"]',
      '[data-testid="bbti-share-locker-room-boundary"]',
    ];
  }
  if (sceneId === "share-return-lane-check") {
    return [
      '[data-testid="bbti-share-return-lane-check"]',
      '[data-testid="bbti-share-return-lane-check-row"]',
      '[data-bbti-share-return-lane-check-action="copy-check"]',
      '[data-testid="bbti-share-return-lane-check-boundary"]',
      '[data-testid="bbti-share-target-picker"]',
    ];
  }
  if (sceneId.startsWith("share-")) {
    return [
      '[data-testid="bbti-share-card"]',
      '[data-bbti-share-card-surface="visual"]',
      '[data-testid="bbti-share-card-controls"]',
      '[data-testid="bbti-share-target-picker"]',
    ];
  }
  if (sceneId === "duo-chemistry") {
    return [
      '[data-testid="bbti-lineup-chemistry"]',
      '[data-testid="bbti-lineup-chemistry-card"]',
    ];
  }
  if (sceneId === "duo-rematch-prompts") {
    return [
      '[data-testid="bbti-duo-rematch-prompts"]',
      '[data-testid="bbti-duo-rematch-prompt"]',
      '[data-bbti-duo-rematch-action="copy-prompts"]',
      '[data-testid="bbti-duo-rematch-boundary"]',
    ];
  }
  if (sceneId.startsWith("compare-report-")) {
    return [
      '[data-testid="bbti-compare-report"]',
      '[data-testid="bbti-compare-report-program"]',
      '[data-testid="bbti-compare-rematch-plan"]',
    ];
  }
  if (sceneId === "result-action-stack") {
    return [
      '[data-testid="bbti-result-action-dock"]',
      '[data-bbti-action-dock-sticky="true"]',
      '[data-testid="bbti-next-play-panel"]',
      '[data-next-play-mobile-layout="primary"]',
      '[data-next-play-mobile-layout="compact"]',
    ];
  }
  if (sceneId === "result-scouting-refresh") {
    return [
      '[data-testid="bbti-result-scouting-report"]',
      '[data-testid="bbti-result-scouting-lane"]',
      '[data-testid="bbti-result-scouting-evidence"]',
      '[data-testid="bbti-result-scouting-boundary"]',
      '[data-testid="bbti-myteam-scouting-card"]',
    ];
  }
  if (sceneId === "result-scouting-copy-kit") {
    return [
      '[data-testid="bbti-result-scouting-copy-kit"]',
      '[data-testid="bbti-result-scouting-copy-kit-item"]',
      '[data-bbti-result-scouting-copy-kit-action="copy-kit"]',
      '[data-bbti-result-scouting-copy-kit-action="copy"]',
      '[data-testid="bbti-result-scouting-copy-kit-boundary"]',
    ];
  }
  if (sceneId.startsWith("case-postgame-")) {
    return [
      '[data-testid="bbti-case-postgame"]',
      '[data-testid="bbti-case-postgame-replay-index"]',
      '[data-testid="bbti-case-postgame-boundary"]',
    ];
  }
  if (sceneId.startsWith("case-battle-mobile-")) {
    return [
      '[data-testid="bbti-case-battle-mobile-stack"]',
      '[data-testid="bbti-case-battle-mobile-rhythm"]',
      '[data-testid="bbti-case-battle-mobile-step"]',
      '[data-testid="bbti-case-battle-mobile-controls"]',
      '[data-testid="bbti-battle-replay-lens"]',
      '[data-testid="bbti-case-trail"]',
    ];
  }
  if (sceneId.startsWith("replay-center-")) {
    return [
      '[data-testid="bbti-replay-center"]',
      '[data-testid="bbti-replay-center-source"]',
    ];
  }
  if (sceneId.startsWith("battle-replay-lens-")) {
    return [
      '[data-testid="bbti-battle-replay-lens"]',
      '[data-testid="bbti-battle-replay-lens-step"]',
      '[data-testid="bbti-battle-replay-copy-kit"]',
      '[data-testid="bbti-battle-replay-copy-kit-item"]',
      '[data-testid="bbti-battle-replay-lens-boundary"]',
    ];
  }
  if (sceneId.startsWith("case-trail-")) {
    return ['[data-testid="bbti-case-trail"]'];
  }
  return [];
}

function visualRegressionChecklistFor(sceneId) {
  const risks = visualRegressionRisksFor(sceneId);
  const checklist = [];

  if (risks.includes("mobile-wrap")) checklist.push("390px viewport keeps headings, cards, and CTA text readable without overlap.");
  if (risks.includes("mobile-compact")) checklist.push("Primary action remains prominent and compact rows still show eyebrow, title, and CTA.");
  if (risks.includes("sticky-dock")) checklist.push("Sticky dock stays separate from the non-sticky recommendation router below it.");
  if (risks.includes("long-copy")) checklist.push("Long matchup, return, and compare labels wrap inside their containers.");
  if (risks.includes("poster-surface")) checklist.push("Poster surface has no buttons; copy controls stay outside the visual card.");
  if (risks.includes("source-boundary")) checklist.push("Source labels read as local entry paths, not official or external fact sources.");
  if (risks.includes("case-source")) checklist.push("Case source, session result, and replay rows stay visually distinct.");
  if (risks.includes("return-state")) checklist.push("Return state reads as local last result plus deterministic daily event.");
  if (risks.includes("card-density")) checklist.push("Repeated cards keep stable spacing and ordered positions.");
  if (risks.includes("copy-controls")) checklist.push("Copy/open controls are grouped without crowding the content surface.");
  if (risks.includes("fallback-state")) checklist.push("Fallback or collapsed state remains visibly recoverable.");

  return unique(checklist);
}

function visualRegressionMetaFor(scene) {
  return {
    auditSelectors: visualRegressionAuditSelectorsFor(scene.id),
    group: visualRegressionGroupFor(scene.id),
    mobileChecklist: visualRegressionChecklistFor(scene.id),
    priority: visualRegressionPriorityFor(scene.id),
    risks: visualRegressionRisksFor(scene.id),
  };
}

function selectorFragments(selector) {
  return Array.from(selector.matchAll(/\[([a-zA-Z0-9_:-]+)="([^"]+)"\]/g))
    .map(([, attributeName, attributeValue]) => `${attributeName}="${attributeValue}"`);
}

function validateAuditSelector(sceneId, sceneHtml, selector) {
  const fragments = selectorFragments(selector);
  if (!fragments.length) {
    addError(`Visual regression pack scene ${sceneId}: selector ${selector} must use attribute selectors`);
    return;
  }

  for (const fragment of fragments) {
    if (!sceneHtml.includes(fragment)) {
      addError(`Visual regression pack scene ${sceneId}: audit selector ${selector} missing fragment ${fragment}`);
    }
  }
}

function buildVisualRegressionManifestEntries(sceneList, htmlValue) {
  const sceneIds = new Set(sceneList.map((scene) => scene.id));
  const entries = sceneList.map((scene) => {
    const sceneHtml = sceneHtmlFor(htmlValue, scene.id);
    const meta = visualRegressionMetaFor(scene);

    if (!sceneHtml) addError(`Visual regression pack scene ${scene.id}: missing scene HTML`);
    if (!meta.group) addError(`Visual regression pack scene ${scene.id}: missing group`);
    if (!meta.risks.length) addError(`Visual regression pack scene ${scene.id}: missing risk tags`);
    if (!meta.auditSelectors.length) addError(`Visual regression pack scene ${scene.id}: missing audit selectors`);
    for (const selector of meta.auditSelectors) validateAuditSelector(scene.id, sceneHtml, selector);

    return {
      id: scene.id,
      selector: scene.selector,
      title: scene.title,
      ...meta,
      viewports: VISUAL_QA_VIEWPORTS,
    };
  });

  for (const [packId, packSceneIds] of Object.entries(VISUAL_QA_AUDIT_PACKS)) {
    for (const sceneId of packSceneIds) {
      if (!sceneIds.has(sceneId)) {
        addError(`Visual regression audit pack ${packId}: missing scene ${sceneId}`);
      }
    }
  }

  for (const sceneId of Object.keys(nextPlayScenes)) {
    const entry = entries.find((item) => item.id === sceneId);
    if (!entry?.risks.includes("mobile-compact")) {
      addError(`Visual regression pack scene ${sceneId}: next-play scenes must carry mobile-compact risk`);
    }
  }
  for (const sceneId of ["next-play-long-copy-stress", "return-streaks-long-copy-stress", "result-action-stack", "duo-rematch-prompts", "film-room-remix-bench"]) {
    const entry = entries.find((item) => item.id === sceneId);
    if (!entry?.risks.includes("long-copy")) {
      addError(`Visual regression pack scene ${sceneId}: must carry long-copy risk`);
    }
  }
  for (const [sceneId, risk] of [
    ["result-action-stack", "sticky-dock"],
    ["result-scouting-refresh", "source-boundary"],
    ["result-scouting-copy-kit", "copy-controls"],
    ["share-card-poster", "poster-surface"],
    ["share-kit-locker-room", "source-boundary"],
    ["share-route-scoreboard", "source-boundary"],
    ["share-return-lane-check", "source-boundary"],
    ["duo-rematch-prompts", "source-boundary"],
    ["film-room-remix-bench", "source-boundary"],
    ["challenge-lane-scoreboard", "source-boundary"],
    ["add-files-suggestion-panel", "card-density"],
    ["battle-replay-lens-case", "case-source"],
    ["case-battle-mobile-polish", "case-source"],
  ]) {
    const entry = entries.find((item) => item.id === sceneId);
    if (!entry?.risks.includes(risk)) {
      addError(`Visual regression pack scene ${sceneId}: must carry ${risk} risk`);
    }
  }

  return entries;
}

function groupSceneIds(entries, propertyName) {
  return entries.reduce((acc, entry) => {
    const values = Array.isArray(entry[propertyName]) ? entry[propertyName] : [entry[propertyName]];
    for (const value of values) {
      acc[value] = acc[value] ?? [];
      acc[value].push(entry.id);
    }
    return acc;
  }, {});
}

const {
  BbtiDeepLinkNoticeCard,
} = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiDeepLinkNotice.tsx"));
const BbtiAddFilesSuggestionPanel = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiAddFilesSuggestionPanel.tsx")).default;
const BbtiChallengeReceiptBoard = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiChallengeReceiptBoard.tsx")).default;
const BbtiChallengeReplaySeeds = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiChallengeReplaySeeds.tsx")).default;
const BbtiFilmRoomDrillCard = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiFilmRoomDrillCard.tsx")).default;
const BbtiNextPlayPanel = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiNextPlayPanel.tsx")).default;
const BbtiResultActionDock = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiResultActionDock.tsx")).default;
const {
  BbtiResultScoutingReport,
} = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiResult.tsx"));
const MyTeamResultCard = loadRuntimeTsModule(path.join(ROOT, "src/components/MyTeamResultCard.tsx")).default;
const BbtiBattleReplayLens = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiBattleReplayLens.tsx")).default;
const {
  default: BbtiCaseBattleMobileStack,
  BbtiCaseBattleMobileControls,
} = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiCaseBattleMobileStack.tsx"));
const BbtiChallengeCaseTrail = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiChallengeCaseTrail.tsx")).default;
const BbtiCasePostgame = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiCasePostgame.tsx")).default;
const ReplayCenter = loadRuntimeTsModule(path.join(ROOT, "src/components/ReplayCenter.tsx")).default;
const CourtSideAdvisor = loadRuntimeTsModule(path.join(ROOT, "src/components/CourtSideAdvisor.tsx")).default;
const BbtiShareCard = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiShareCard.tsx")).default;
const BbtiShareKits = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiShareKits.tsx")).default;
const BbtiLineupChemistry = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiLineupChemistry.tsx")).default;
const BbtiAnswerPollTrend = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiAnswerPollTrend.tsx")).default;
const BbtiFilmRoomRemixBench = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiFilmRoomRemixBench.tsx")).default;
const BbtiArenaEvents = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiArenaEvents.tsx")).default;
const BbtiFeaturedDailyReturn = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiFeaturedDailyReturn.tsx")).default;
const BbtiReturnBench = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiReturnBench.tsx")).default;
const {
  BbtiCompareProgramPanel,
  BbtiDuoRematchPromptsPanel,
} = loadRuntimeTsModule(path.join(ROOT, "src/components/BbtiCompare.tsx"));
const {
  getBbtiCompareReport,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-rivalries.ts"));
const {
  resolveBbtiNextPlayActions,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-next-play.ts"));
const {
  resolveBbtiShareReturnPrompt,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-share-return-prompts.ts"));
const {
  bbtiQuestions,
  getBbtiType,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti.ts"));
const {
  hydrateBbtiSharedChallenge,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-shared-challenge-hydration.ts"));
const {
  resolveBbtiChallengeReplaySeeds,
  resolveBbtiChallengePickReplayKit,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-challenge-replay-seeds.ts"));
const {
  getDebatesForMatchup,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/debate-loader.ts"));
const {
  getBbtiArenaEvents,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-arena-events.ts"));
const {
  resolveBbtiChallengeLaneScoreboard,
  getBbtiChallengeMatchups,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-challenges.ts"));
const {
  getBbtiShareKits,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-share-kits.ts"));
const {
  getMatchupById,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/matchups.ts"));
const {
  getStatBombsForMatchup,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/stat-bombs.ts"));
const {
  buildSharedFilmRoomClipFromKey,
  getBbtiFilmRoomDimensionLabel,
  getBbtiPlaybook,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-playbook.ts"));
const {
  getBbtiFilmRoomCrossExam,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-film-room-cross-exams.ts"));
const {
  resolveBbtiFilmRoomDrill,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-film-room-drills.ts"));

function ids(prefix) {
  return {
    clipFallbackId: `${prefix}-clip-fallback`,
    collapsedHeadingId: `${prefix}-collapsed-title`,
    descriptionId: `${prefix}-description`,
    headingId: `${prefix}-title`,
    pressureId: `${prefix}-pressure`,
    previewId: `${prefix}-preview`,
  };
}

function describedByFor(notice, prompt, idSet) {
  return [
    idSet.descriptionId,
    notice.pressureLine ? idSet.pressureId : null,
    notice.clipFallbackLine ? idSet.clipFallbackId : null,
    prompt.previewLines.length > 0 ? idSet.previewId : null,
  ].filter(Boolean).join(" ");
}

function noticeFor({
  clipFallbackLine = null,
  code,
  eventId = null,
  label,
  challengeMatchupId,
  clipKey = null,
}) {
  const hydrated = hydrateBbtiSharedChallenge({
    code,
    challengeMatchupId,
    eventId,
    clipKey,
  });
  const matchup = getMatchupById(challengeMatchupId);
  if (!matchup) {
    throw new Error(`Missing matchup for visual QA fixture: ${challengeMatchupId}`);
  }

  return {
    clipFallbackLine,
    eventTitle: hydrated.event?.title ?? null,
    sourceLabel: hydrated.sourceLabel,
    pressureLine: hydrated.pressureLine,
    matchup,
    caseContext: hydrated.caseContext,
    replaySeeds: hydrated.challengeReplaySeeds,
    canonicalKey: label,
  };
}

function NoticeFixture({ id, isDismissed = false, notice }) {
  const idSet = ids(id);
  const prompt = resolveBbtiShareReturnPrompt(notice.caseContext, notice.eventTitle);
  return React.createElement(BbtiDeepLinkNoticeCard, {
    describedBy: describedByFor(notice, prompt, idSet),
    ids: idSet,
    isDismissed,
    notice,
    onChallengeMatchup: () => {},
    onDismissNotice: () => {},
    onRestoreNotice: () => {},
    prefersReducedMotion: true,
    prompt,
  });
}

function Block({ children, id, title }) {
  return React.createElement("section", {
    className: "qa-block",
    "data-qa-scene": id,
  }, [
    React.createElement("h1", { className: "qa-title", key: `${id}-title` }, title),
    React.createElement("div", { className: "qa-surface", key: `${id}-surface` }, children),
  ]);
}

const code = "OAIL";
const scoutingFixtureAnswers = bbtiQuestions.map((question) => {
  if (question.type === "binary") return { questionId: question.id, selected: "A" };
  if (question.type === "multi") return { questionId: question.id, selectedIndices: [0] };
  return { questionId: question.id, text: "我会先看回合质量，再看情绪价值。" };
});
const challenges = getBbtiChallengeMatchups(code);
const events = getBbtiArenaEvents(code);
const arenaEvent = events.find((event) => event.id === "game-7") ?? events[0];
const filmRoomMatchupId = challenges.find((challenge) => challenge.matchupId === "kobe-vs-jordan")?.matchupId
  ?? challenges[0]?.matchupId;
const resultMatchupId = filmRoomMatchupId;
const arenaMatchupId = challenges.find((challenge) => challenge.category === arenaEvent?.recommendedCategory)?.matchupId
  ?? challenges.find((challenge) => challenge.matchupId === "lebron-vs-jordan")?.matchupId
  ?? challenges[0]?.matchupId;

if (!filmRoomMatchupId || !resultMatchupId || !arenaMatchupId || !arenaEvent) {
  throw new Error("BBTI visual QA fixtures require OAIL challenges and at least one Arena Event.");
}

const filmNotice = noticeFor({
  code,
  label: "film-room",
  challengeMatchupId: filmRoomMatchupId,
  clipKey: "q12-m0",
});
const arenaNotice = noticeFor({
  code,
  label: "arena-event",
  challengeMatchupId: arenaMatchupId,
  eventId: arenaEvent.id,
});
const resultNotice = noticeFor({
  code,
  label: "result",
  challengeMatchupId: resultMatchupId,
});
const fallbackNotice = noticeFor({
  clipFallbackLine: "这条录像室链接缺少具体选择，只能先按当前加赛来源接入。",
  code,
  label: "clip-fallback",
  challengeMatchupId: resultMatchupId,
});

const topics = [
  { id: "shot-quality", title: "关键球到底要不要接受包夹后的高难度出手" },
  { id: "defensive-load", title: "防守资源该押给外线持球点还是禁区协防" },
  { id: "late-clock", title: "最后 8 秒是相信单点爆破还是重新组织" },
  { id: "legacy-standard", title: "评价历史地位时先看峰值还是看稳定兑现" },
];
const votes = [
  { topicId: "shot-quality", winner: "kobe" },
  { topicId: "defensive-load", winner: "lebron" },
];
const returnResult = {
  challenge: resultNotice.matchup.title,
  code,
  emoji: "BBTI",
  mode: "quick",
  name: "空间捕食者",
  savedAt: "2026-05-30T12:00:00.000Z",
};
const longReturnResult = {
  ...returnResult,
  challenge: "超长回访挑战标题：最后一攻、交易截止日、总决赛调整和主场身份同时上桌",
  name: "空间捕食者 With A Very Long Locker Room Nickname",
};

function PanelFixture({ actions }) {
  return React.createElement(BbtiNextPlayPanel, {
    actions,
    onAction: () => {},
    onSecondaryAction: () => {},
  });
}

function AddFilesSuggestionFixture() {
  return React.createElement(BbtiAddFilesSuggestionPanel, {
    code,
    hasFilmRoomClips: true,
    hasPendingCompare: true,
    primaryChallengeTitle: actionStackChallengeTitle,
    typeName: "空间捕食者",
  });
}

function ResultScoutingRefreshFixture() {
  const type = getBbtiType(code);
  const playbook = getBbtiPlaybook(code, scoutingFixtureAnswers);
  const report = playbook.scoutingReport;
  const attributes = report.lanes.map((lane) => ({
    key: lane.axisKey,
    label: lane.chosenLabel,
    value: lane.score,
  }));
  const overall = Math.round(
    attributes.reduce((sum, item) => sum + item.value, 0) / Math.max(attributes.length, 1),
  );

  return React.createElement("div", {
    className: "grid w-full justify-items-center gap-4",
    "data-testid": "bbti-result-scouting-fixture",
  }, [
    React.createElement(MyTeamResultCard, {
      attributes,
      badges: type.strengths.slice(0, 3).map((label, index) => ({
        label,
        tone: ["gold", "purple", "blue"][index] ?? "gold",
      })),
      code,
      edition: "BBTI SEASON 01",
      emoji: type.emoji,
      footerLeft: `灵魂球员 ${type.spiritPlayer}`,
      footerRight: `宿敌 ${type.nemesis}`,
      key: "card",
      overall,
      qaContext: "bbti-result",
      qaTestId: "bbti-myteam-scouting-card",
      qaVersion: "bbti-myteam-result-card-v1",
      sideLabel: "Basketball Brain Type Indicator",
      signature: playbook.debateWeapon,
      subtitle: type.tagline,
      tier: overall >= 90 ? "darkMatter" : overall >= 82 ? "galaxyOpal" : "pinkDiamond",
      title: type.name,
    }),
    React.createElement(BbtiResultScoutingReport, {
      key: "scouting",
      report,
    }),
  ]);
}

function ResultScoutingCopyKitFixture() {
  const playbook = getBbtiPlaybook(code, scoutingFixtureAnswers);

  return React.createElement(BbtiResultScoutingReport, {
    report: playbook.scoutingReport,
  });
}

function FilmRoomDrillFixture() {
  const clip = buildSharedFilmRoomClipFromKey("q12-m0");
  if (!clip) {
    throw new Error("Film Room drill visual QA fixture requires q12-m0 shared clip.");
  }
  const crossExam = getBbtiFilmRoomCrossExam(clip);
  return React.createElement(BbtiFilmRoomDrillCard, {
    clip,
    code,
    crossExam,
    dimensionLabel: getBbtiFilmRoomDimensionLabel(clip.dimension),
    typeName: "空间捕食者",
  });
}

function FilmRoomRemixBenchFixture() {
  const clip = buildSharedFilmRoomClipFromKey("q12-m0");
  if (!clip) {
    throw new Error("Film Room remix bench visual QA fixture requires q12-m0 shared clip.");
  }
  const crossExam = getBbtiFilmRoomCrossExam(clip);
  const dimensionLabel = getBbtiFilmRoomDimensionLabel(clip.dimension);
  const drill = resolveBbtiFilmRoomDrill({ clip, crossExam, dimensionLabel });

  return React.createElement(BbtiFilmRoomRemixBench, {
    activeClipNo: 1,
    clip,
    clipCount: 3,
    code,
    dimensionLabel,
    drill,
    trend: {
      average: 63,
      label: "顺风主场",
      readCount: 8,
      strongestQuestionId: 12,
      tone: "模拟顺风",
      toughestQuestionId: 22,
    },
  });
}

function ChallengeReceiptFixture() {
  return React.createElement(BbtiChallengeReceiptBoard, {
    challengeMatchups: challenges,
    code,
    emoji: "BBTI",
    onChallengeMatchup: () => {},
    onCustomChallenge: () => {},
    typeName: "空间捕食者",
  });
}

function ChallengeLaneScoreboardFixture() {
  return React.createElement(ChallengeReceiptFixture);
}

function ChallengeReplaySeedsFixture() {
  return React.createElement(BbtiChallengeReplaySeeds, {
    seeds: resolveBbtiChallengeReplaySeeds({
      caseContext: resultNotice.caseContext,
      challengeCategory: resultNotice.caseContext?.challengeCategory,
      challengeLabel: resultNotice.caseContext?.challengeLabel,
      challengeMatchupId: resultNotice.matchup.id,
      challengeTitle: resultNotice.matchup.title,
      code,
      pressureLine: resultNotice.pressureLine,
      returnHref: "https://bbti.test/?bbti=OAIL&challenge=kobe-vs-jordan",
      source: "shared-return",
    }),
  });
}

function ChallengePickReplayKitFixture() {
  const laneScoreboard = resolveBbtiChallengeLaneScoreboard({
    challengeMatchups: challenges,
    code,
  });
  const pickReplayKit = resolveBbtiChallengePickReplayKit(laneScoreboard);

  return React.createElement("section", {
    "data-testid": "bbti-challenge-pick-replay-kit",
    "data-bbti-challenge-pick-replay-kit-version": pickReplayKit.version,
    "data-bbti-challenge-pick-replay-kit-code": pickReplayKit.code,
    "data-bbti-challenge-pick-replay-kit-count": String(pickReplayKit.itemCount),
    className: "w-full max-w-2xl rounded-2xl border border-white/10 bg-black/20 p-4",
  }, [
    React.createElement("div", {
      className: "mb-3 flex flex-wrap items-center justify-between gap-2",
      key: "header",
    }, [
      React.createElement("div", { key: "title" }, [
        React.createElement("p", {
          className: "text-[10px] font-black uppercase tracking-widest text-kobe-gold/70",
          key: "eyebrow",
        }, "选边回看卡"),
        React.createElement("h3", {
          className: "mt-0.5 text-base font-black text-white",
          key: "heading",
        }, "赛前回看清单"),
      ]),
      React.createElement("span", {
        className: "rounded-full border border-kobe-gold/20 px-2 py-1 text-[10px] font-black text-kobe-gold/72",
        key: "count",
      }, `共 ${pickReplayKit.itemCount} 条`),
    ]),
    React.createElement("div", {
      className: "grid grid-cols-1 gap-2 sm:grid-cols-3",
      key: "items",
    }, pickReplayKit.items.map((item, index) => React.createElement("article", {
      key: item.id,
      className: "rounded-lg border border-white/10 bg-black/18 px-3 py-2",
      "data-testid": "bbti-challenge-pick-replay-kit-item",
      "data-bbti-challenge-pick-replay-kit-item": item.id,
      "data-bbti-challenge-pick-replay-kit-target": item.target,
      "data-bbti-challenge-pick-replay-kit-position": String(index + 1),
      "data-bbti-challenge-pick-replay-kit-source-lane": item.sourceLaneId,
      "data-bbti-challenge-pick-replay-kit-matchup": item.sourceMatchupId,
      "data-bbti-challenge-pick-replay-kit-action": "copy",
    }, [
      React.createElement("p", {
        className: "text-[10px] font-black text-kobe-gold/70",
        key: "label",
      }, item.label),
      React.createElement("p", {
        className: "mt-1 text-xs font-black text-white",
        key: "title",
      }, item.title),
      React.createElement("p", {
        className: "mt-1 text-[11px] leading-relaxed text-white/72",
        key: "body",
      }, item.body),
      React.createElement("p", {
        className: "mt-2 text-[10px] font-black text-white/56",
        key: "action",
      }, "复制话术"),
    ]))),
    React.createElement("div", {
      className: "mt-3 flex flex-wrap gap-2",
      key: "actions",
    }, [
      React.createElement("button", {
        key: "copy-kit",
        type: "button",
        className: "rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-black text-white/58",
        "data-bbti-challenge-pick-replay-kit-action": "copy-kit",
      }, "复制赛前回看清单"),
    ]),
    React.createElement("p", {
      key: "boundary",
      className: "mt-2 text-[10px] font-bold leading-relaxed text-white/34",
      "data-testid": "bbti-challenge-pick-replay-kit-boundary",
    }, pickReplayKit.boundary),
  ]);
}

function ShareCardFixture() {
  return React.createElement(BbtiShareCard, {
    axes: [
      { key: "style", label: "单挑解法", value: 86 },
      { key: "evidence", label: "证据洁癖", value: 79 },
      { key: "role", label: "第一选择", value: 72 },
      { key: "ambition", label: "忠诚路线", value: 91 },
    ],
    badges: [
      { label: "关键球审判", tone: "gold" },
      { label: "证据链", tone: "purple" },
      { label: "主场执念", tone: "blue" },
    ],
    code,
    debateWeapon: "把最后两分钟回合拆成出手质量、协防选择和冠军窗口。",
    emoji: "🟣",
    overall: 82,
    primaryChallengeTitle: resultNotice.matchup.title,
    spiritPlayer: "Kobe Bryant",
    tagline: "你会先把高阶表摊开，再告诉别人这不是偏爱，是证据。",
    typeName: "空间捕食者",
  });
}

function ShareCardExportFixture() {
  const challenge = resultNotice.matchup;
  const challengeId = challenge.matchupId ?? challenge.id;
  return React.createElement(BbtiShareKits, {
    code,
    kits: getBbtiShareKits({
      challengeCopy: challenge.shareCopy ?? challenge.reason,
      challengeMatchupId: challengeId,
      challengeMatchupTitle: challenge.title,
      challengeTitle: challenge.title,
      code,
      compatibility: "DATR",
      debateWeapon: "把最后两分钟回合拆成出手质量、协防选择和冠军窗口。",
      emoji: "BBTI",
      nemesis: "OEIR",
      spiritPlayer: "Kobe Bryant",
      tagline: "你会先把高阶表摊开，再告诉别人这不是偏爱，是证据。",
      typeName: "空间捕食者",
    }),
    preview: React.createElement(ShareCardFixture),
    sectionId: "bbti-share",
  });
}

function ShareLockerRoomFixture() {
  const challenge = resultNotice.matchup;
  const challengeId = challenge.matchupId ?? challenge.id;
  return React.createElement(BbtiShareKits, {
    code,
    kits: getBbtiShareKits({
      challengeCopy: challenge.shareCopy ?? challenge.reason,
      challengeMatchupId: challengeId,
      challengeMatchupTitle: challenge.title,
      challengeTitle: challenge.title,
      code,
      compatibility: "DATR",
      debateWeapon: "把最后两分钟回合拆成出手质量、协防选择和冠军窗口。",
      emoji: "BBTI",
      nemesis: "OEIR",
      spiritPlayer: "Kobe Bryant",
      tagline: "你会先把高阶表摊开，再告诉别人这不是偏爱，是证据。",
      typeName: "空间捕食者",
    }),
    sectionId: "bbti-share",
  });
}

function ShareRouteScoreboardFixture() {
  const challenge = challenges.find((item) => item.matchupId === arenaMatchupId) ?? challenges[0];
  const resultChallengeId = resultNotice.matchup.matchupId ?? resultNotice.matchup.id;
  return React.createElement(BbtiShareKits, {
    code,
    kits: getBbtiShareKits({
      challengeCopy: resultNotice.matchup.shareCopy ?? resultNotice.matchup.reason,
      challengeMatchupId: resultChallengeId,
      challengeMatchupTitle: resultNotice.matchup.title,
      challengeTitle: resultNotice.matchup.title,
      code,
      compatibility: "DATR",
      debateWeapon: "把最后两分钟回合拆成出手质量、协防选择和冠军窗口。",
      emoji: "BBTI",
      eventChallengeCopy: challenge.shareCopy ?? challenge.reason,
      eventChallengeMatchupId: challenge.matchupId,
      eventChallengeMatchupTitle: challenge.title,
      eventCourt: arenaEvent.court,
      eventGroupChatPrompt: arenaEvent.groupChatPrompt,
      eventId: arenaEvent.id,
      eventScenario: arenaEvent.scenario,
      eventStakes: arenaEvent.stakes,
      eventTag: arenaEvent.tag,
      eventTitle: arenaEvent.title,
      nemesis: "OEIR",
      spiritPlayer: "Kobe Bryant",
      tagline: "你会先把高阶表摊开，再告诉别人这不是偏爱，是证据。",
      typeName: "空间捕食者",
    }),
    sectionId: "bbti-share",
  });
}

function ShareReturnLaneCheckFixture() {
  return React.createElement(ShareRouteScoreboardFixture);
}

function LineupChemistryFixture() {
  return React.createElement(BbtiLineupChemistry, {
    code,
    onCompare: () => {},
  });
}

function AnswerPollTrendFixture() {
  return React.createElement(BbtiAnswerPollTrend, {
    answers: [
      { questionId: 1, selected: "A" },
      { questionId: 2, selectedIndices: [0] },
      { questionId: 5, selected: "B" },
      { questionId: 13, selected: "A" },
      { questionId: 14, selectedIndices: [1] },
      { questionId: 22, selected: "B" },
      { questionId: 26, selected: "A" },
      { questionId: 29, selectedIndices: [3] },
    ],
    code,
    emoji: "BBTI",
    typeName: "空间捕食者",
  });
}

function ArenaEventBracketFixture() {
  return React.createElement(BbtiArenaEvents, {
    challengeMatchups: challenges,
    code,
    emoji: "BBTI",
    initialEventId: arenaEvent.id,
    onActiveShareEvent: () => {},
    onChallengeMatchup: () => {},
    typeName: "空间捕食者",
  });
}

function FeaturedDailyReturnFixture({ result = returnResult }) {
  return React.createElement(BbtiFeaturedDailyReturn, {
    onChallengeMatchup: () => {},
    onOpenResult: () => {},
    result,
  });
}

function ReturnBenchFixture({ result = returnResult }) {
  return React.createElement(BbtiReturnBench, {
    onChallengeMatchup: () => {},
    onOpenResult: () => {},
    result,
  });
}

function EntryReturnStackFixture({ result = returnResult }) {
  return React.createElement("section", {
    className: "contents",
    "data-bbti-entry-return-code": result.code,
    "data-bbti-entry-return-stack": "last-result",
    "data-testid": "bbti-entry-return-stack",
  }, [
    React.createElement(FeaturedDailyReturnFixture, { key: "featured", result }),
    React.createElement(ReturnBenchFixture, { key: "bench", result }),
  ]);
}

function CompareProgramFixture({ codeA, codeB }) {
  const report = getBbtiCompareReport(codeA, codeB);
  return React.createElement("div", {
    className: "w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6",
    "data-testid": "bbti-compare-report",
    "data-bbti-compare-report-version": report.version,
    "data-bbti-compare-report-code-a": report.codeA,
    "data-bbti-compare-report-code-b": report.codeB,
    "data-bbti-compare-report-score": report.score,
  }, [
    React.createElement("div", {
      className: "mb-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-center",
      key: "verdict",
    }, [
      React.createElement("p", { className: "mb-1 text-xs text-white/35", key: "tier" }, `本地 BBTI 化学反应分 · ${report.tier}`),
      React.createElement("p", { className: "mb-2 text-5xl font-black text-white", key: "score" }, `${report.score}%`),
      React.createElement("h2", { className: "mb-2 text-xl font-black text-kobe-gold", key: "title" }, report.title),
      React.createElement("p", { className: "text-sm leading-relaxed text-white/65", key: "body" }, report.courtChemistry),
    ]),
    React.createElement(BbtiCompareProgramPanel, { key: "program", report }),
  ]);
}

function DuoRematchPromptsFixture() {
  const report = getBbtiCompareReport("OAIL", "DETR");
  return React.createElement("div", {
    className: "w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6",
    "data-testid": "bbti-compare-report",
    "data-bbti-compare-report-version": report.version,
    "data-bbti-compare-report-code-a": report.codeA,
    "data-bbti-compare-report-code-b": report.codeB,
    "data-bbti-compare-report-score": report.score,
  }, React.createElement(BbtiDuoRematchPromptsPanel, { copyState: "idle", report }));
}

function ActionStackFixture({ actions }) {
  return React.createElement("div", {
    className: "w-full max-w-lg",
    "data-testid": "bbti-result-action-stack",
    "data-bbti-result-action-stack": "dock-next-play",
  }, [
    React.createElement(BbtiResultActionDock, {
      compareLabel: "生成对比",
      key: "action-dock",
      onCompare: () => {},
      onCustomChallenge: () => {},
      onPrimaryChallenge: () => {},
      primaryChallengeTitle: actionStackChallengeTitle,
    }),
    React.createElement(BbtiNextPlayPanel, {
      actions,
      key: "next-play",
      onAction: () => {},
      onSecondaryAction: () => {},
    }),
  ]);
}

function TrailFixture({ context, currentRound, nameA = "Kobe", nameB = "Jordan", trailVotes = votes }) {
  return React.createElement(BbtiChallengeCaseTrail, {
    context,
    currentRound,
    nameA,
    nameB,
    topics,
    votes: trailVotes,
  });
}

function CasePostgameFixture({ context, playerAName = "Kobe", playerBName = "LeBron" }) {
  return React.createElement(BbtiCasePostgame, {
    context,
    kobeScore: 2,
    lebronScore: 1,
    onOpenBbtiResult: () => {},
    playerAName,
    playerBName,
    replayUrl: "https://bbti.test/replay?matchup=case-postgame",
    selectedSideName: playerAName,
    winnerName: `${playerAName} 胜出`,
  });
}

function ReplayCenterFixture() {
  return React.createElement(ReplayCenter, {
    bomb: {
      side: "lebron",
      source: "Local Replay Fixture",
      stat: "本地复盘素材：这一回合用来反打刚才的站队。",
    },
    matchupId: filmRoomMatchupId,
    nameA: "Kobe",
    nameB: "Jordan",
    roundNumber: 2,
    topicId: "shot-quality",
  });
}

function BattleReplayLensFixture() {
  const replayTopics = getDebatesForMatchup(filmRoomMatchupId).main;
  const topic = replayTopics[0];
  const nextTopic = replayTopics[1] ?? null;

  return React.createElement(BbtiBattleReplayLens, {
    caseContext: filmNotice.caseContext,
    matchupId: filmRoomMatchupId,
    nameA: "Kobe",
    nameB: "Jordan",
    nextTopic,
    roundNumber: 1,
    statBomb: getStatBombsForMatchup(filmRoomMatchupId, topic.id)[0],
    topic,
    votedFor: "kobe",
  });
}

function CaseBattleMobileStackFixture() {
  const replayTopics = getDebatesForMatchup(filmRoomMatchupId).main;
  const topic = replayTopics[0];
  const nextTopic = replayTopics[1] ?? null;
  const statBomb = getStatBombsForMatchup(filmRoomMatchupId, topic.id)[0];

  return React.createElement(BbtiCaseBattleMobileStack, {
    autoAdvanceState: "paused",
    caseContext: filmNotice.caseContext,
    roundNumber: 2,
    votedFor: "kobe",
  }, [
    React.createElement("div", {
      className: "order-1",
      "data-bbti-case-battle-mobile-slot": "replay",
      key: "replay",
    }, React.createElement(ReplayCenter, {
      bomb: statBomb,
      matchupId: filmRoomMatchupId,
      nameA: "Kobe",
      nameB: "Jordan",
      roundNumber: 2,
      topicId: topic.id,
    })),
    React.createElement("div", {
      className: "order-2",
      "data-bbti-case-battle-mobile-slot": "advisor",
      key: "advisor",
    }, React.createElement(CourtSideAdvisor, {
      caseContext: filmNotice.caseContext,
      nameA: "Kobe",
      nameB: "Jordan",
      statBomb,
      topic,
      votedFor: "kobe",
    })),
    React.createElement("div", {
      className: "order-4 sm:order-3",
      "data-bbti-case-battle-mobile-slot": "lens",
      key: "lens",
    }, React.createElement(BbtiBattleReplayLens, {
      caseContext: filmNotice.caseContext,
      matchupId: filmRoomMatchupId,
      nameA: "Kobe",
      nameB: "Jordan",
      nextTopic,
      roundNumber: 2,
      statBomb,
      topic,
      votedFor: "kobe",
    })),
    React.createElement("div", {
      className: "order-5 sm:order-4",
      "data-bbti-case-battle-mobile-slot": "trail",
      key: "trail",
    }, React.createElement(BbtiChallengeCaseTrail, {
      context: filmNotice.caseContext,
      currentRound: 2,
      nameA: "Kobe",
      nameB: "Jordan",
      topics,
      votes,
    })),
    React.createElement("div", {
      className: "order-3 sm:order-6",
      "data-bbti-case-battle-mobile-slot": "controls",
      key: "controls",
    }, React.createElement(BbtiCaseBattleMobileControls, {
      autoAdvance: false,
      countdown: null,
      onExtendReview: () => {},
      onNextRound: () => {},
      onPauseAutoAdvance: () => {},
      readMode: true,
    })),
  ]);
}

const nextPlayScenes = {
  "next-play-pending-film": resolveBbtiNextPlayActions({
    hasFilmRoomClips: true,
    incomingReturn: { source: "film-room", title: "Q12 包夹读秒选择" },
    pendingCompare: { code: "DATR", name: "Drive Artist" },
    primaryChallengeTitle: filmNotice.matchup.title,
  }),
  "next-play-film-return": resolveBbtiNextPlayActions({
    hasFilmRoomClips: true,
    incomingReturn: { source: "film-room", title: "Q12 包夹读秒选择" },
    primaryChallengeTitle: filmNotice.matchup.title,
  }),
  "next-play-arena-return": resolveBbtiNextPlayActions({
    dailyEvent: { tag: arenaEvent.tag, title: arenaEvent.title },
    hasFilmRoomClips: true,
    incomingReturn: { source: "arena-event", title: arenaEvent.title },
    primaryChallengeTitle: arenaNotice.matchup.title,
  }),
  "next-play-result-return": resolveBbtiNextPlayActions({
    hasFilmRoomClips: false,
    incomingReturn: { source: "result", title: resultNotice.matchup.title },
    primaryChallengeTitle: resultNotice.matchup.title,
  }),
  "next-play-normal-result": resolveBbtiNextPlayActions({
    dailyEvent: { tag: arenaEvent.tag, title: arenaEvent.title },
    hasFilmRoomClips: true,
    primaryChallengeTitle: resultNotice.matchup.title,
  }),
  "next-play-lightweight": resolveBbtiNextPlayActions({
    hasFilmRoomClips: false,
  }),
  "next-play-long-copy-stress": resolveBbtiNextPlayActions({
    hasFilmRoomClips: true,
    incomingReturn: {
      source: "arena-event",
      title: "超长标题情境回流：最后一攻、提前夹击、弱侧空位和历史叙事同时上桌",
    },
    pendingCompare: {
      code: "DATR",
      name: "Drive Artist With A Very Long Locker Room Nickname",
    },
    primaryChallengeTitle: "LeBron vs Jordan：全能解法审判加长标题压力测试",
  }),
};

const actionStackChallengeTitle = "LeBron vs Jordan：全能解法审判加长标题压力测试";
const actionStackActions = resolveBbtiNextPlayActions({
  hasFilmRoomClips: true,
  incomingReturn: { source: "film-room", title: "Q12 包夹读秒选择" },
  pendingCompare: { code: "DATR", name: "Drive Artist" },
  primaryChallengeTitle: actionStackChallengeTitle,
});

const scenes = [
  {
    id: "deep-link-film-room",
    title: "Shared Challenge / Film Room",
    selector: '[data-qa-scene="deep-link-film-room"] [data-testid="bbti-deep-link-notice"]',
    element: React.createElement(NoticeFixture, { id: "film", notice: filmNotice }),
  },
  {
    id: "deep-link-arena-event",
    title: "Shared Challenge / Arena Event",
    selector: '[data-qa-scene="deep-link-arena-event"] [data-testid="bbti-deep-link-notice"]',
    element: React.createElement(NoticeFixture, { id: "arena", notice: arenaNotice }),
  },
  {
    id: "deep-link-result",
    title: "Shared Challenge / Result",
    selector: '[data-qa-scene="deep-link-result"] [data-testid="bbti-deep-link-notice"]',
    element: React.createElement(NoticeFixture, { id: "result", notice: resultNotice }),
  },
  {
    id: "deep-link-invalid-clip",
    title: "Shared Challenge / Invalid Clip Fallback",
    selector: '[data-qa-scene="deep-link-invalid-clip"] [data-bbti-clip-fallback="true"]',
    element: React.createElement(NoticeFixture, { id: "invalid-clip", notice: fallbackNotice }),
  },
  {
    id: "deep-link-collapsed",
    title: "Shared Challenge / Collapsed Restore",
    selector: '[data-qa-scene="deep-link-collapsed"] [data-bbti-notice-state="collapsed"]',
    element: React.createElement(NoticeFixture, { id: "collapsed", isDismissed: true, notice: filmNotice }),
  },
  ...Object.entries(nextPlayScenes).map(([id, actions]) => ({
    id,
    title: `Next Play / ${id.replace("next-play-", "").replaceAll("-", " ")}`,
    selector: `[data-qa-scene="${id}"] [data-testid="bbti-next-play-panel"]`,
    element: React.createElement(PanelFixture, { actions }),
  })),
  {
    id: "add-files-suggestion-panel",
    title: "Add Files / Coach Queue",
    selector: '[data-qa-scene="add-files-suggestion-panel"] [data-testid="bbti-add-files-suggestion-panel"]',
    element: React.createElement(AddFilesSuggestionFixture),
  },
  {
    id: "arena-event-bracket",
    title: "Arena Event / Route Tree",
    selector: '[data-qa-scene="arena-event-bracket"] [data-testid="bbti-arena-event-bracket"]',
    element: React.createElement(ArenaEventBracketFixture),
  },
  {
    id: "answer-poll-trend-result",
    title: "Result / Answer Poll Trend",
    selector: '[data-qa-scene="answer-poll-trend-result"] [data-testid="bbti-answer-poll-trend"]',
    element: React.createElement(AnswerPollTrendFixture),
  },
  {
    id: "featured-daily-return-arena-context",
    title: "Return / Featured Daily Arena Context",
    selector: '[data-qa-scene="featured-daily-return-arena-context"] [data-testid="bbti-featured-daily-return"]',
    element: React.createElement(FeaturedDailyReturnFixture),
  },
  {
    id: "return-bench-streaks",
    title: "Return / Bench Streaks",
    selector: '[data-qa-scene="return-bench-streaks"] [data-testid="bbti-return-bench"]',
    element: React.createElement(ReturnBenchFixture),
  },
  {
    id: "entry-return-stack-with-last-result",
    title: "Entry / Return Stack With Last Result",
    selector: '[data-qa-scene="entry-return-stack-with-last-result"] [data-testid="bbti-entry-return-stack"]',
    element: React.createElement(EntryReturnStackFixture),
  },
  {
    id: "return-streaks-long-copy-stress",
    title: "Return / Long Copy Stress",
    selector: '[data-qa-scene="return-streaks-long-copy-stress"] [data-testid="bbti-return-bench"]',
    element: React.createElement(ReturnBenchFixture, { result: longReturnResult }),
  },
  {
    id: "film-room-remix-bench",
    title: "Film Room / Remix Bench",
    selector: '[data-qa-scene="film-room-remix-bench"] [data-testid="bbti-film-room-remix-bench"]',
    element: React.createElement(FilmRoomRemixBenchFixture),
  },
  {
    id: "film-room-drill-card",
    title: "Film Room / Drill Card",
    selector: '[data-qa-scene="film-room-drill-card"] [data-testid="bbti-film-room-drill"]',
    element: React.createElement(FilmRoomDrillFixture),
  },
  {
    id: "challenge-replay-seeds",
    title: "Challenge / Replay Seeds",
    selector: '[data-qa-scene="challenge-replay-seeds"] [data-testid="bbti-challenge-replay-seeds"]',
    element: React.createElement(ChallengeReplaySeedsFixture),
  },
  {
    id: "challenge-pick-replay-kit",
    title: "Challenge / Pick Replay Kit",
    selector: '[data-qa-scene="challenge-pick-replay-kit"] [data-testid="bbti-challenge-pick-replay-kit"]',
    element: React.createElement(ChallengePickReplayKitFixture),
  },
  {
    id: "challenge-lane-scoreboard",
    title: "Challenge / Lane Scoreboard",
    selector: '[data-qa-scene="challenge-lane-scoreboard"] [data-testid="bbti-challenge-lane-scoreboard"]',
    element: React.createElement(ChallengeLaneScoreboardFixture),
  },
  {
    id: "challenge-rivalry-scripts",
    title: "Challenge / Rivalry Scripts",
    selector: '[data-qa-scene="challenge-rivalry-scripts"] [data-testid="bbti-challenge-receipt-board"]',
    element: React.createElement(ChallengeReceiptFixture),
  },
  {
    id: "share-card-poster",
    title: "Share / Poster Card",
    selector: '[data-qa-scene="share-card-poster"] [data-testid="bbti-share-kits"]',
    element: React.createElement(ShareCardExportFixture),
  },
  {
    id: "share-kit-locker-room",
    title: "Share / Kit Locker Room",
    selector: '[data-qa-scene="share-kit-locker-room"] [data-testid="bbti-share-locker-room"]',
    element: React.createElement(ShareLockerRoomFixture),
  },
  {
    id: "share-route-scoreboard",
    title: "Share / Route Scoreboard",
    selector: '[data-qa-scene="share-route-scoreboard"] [data-testid="bbti-share-route-scoreboard"]',
    element: React.createElement(ShareRouteScoreboardFixture),
  },
  {
    id: "share-return-lane-check",
    title: "Share / Return Lane Check",
    selector: '[data-qa-scene="share-return-lane-check"] [data-testid="bbti-share-return-lane-check"]',
    element: React.createElement(ShareReturnLaneCheckFixture),
  },
  {
    id: "duo-chemistry",
    title: "Duo / Lineup Chemistry",
    selector: '[data-qa-scene="duo-chemistry"] [data-testid="bbti-lineup-chemistry"]',
    element: React.createElement(LineupChemistryFixture),
  },
  {
    id: "compare-report-program",
    title: "Duo / Compare Report Program",
    selector: '[data-qa-scene="compare-report-program"] [data-testid="bbti-compare-report-program"]',
    element: React.createElement(CompareProgramFixture, { codeA: "OAIL", codeB: "DAIR" }),
  },
  {
    id: "compare-report-clash",
    title: "Duo / Compare Report Clash",
    selector: '[data-qa-scene="compare-report-clash"] [data-testid="bbti-compare-report-program"]',
    element: React.createElement(CompareProgramFixture, { codeA: "OAIL", codeB: "DETR" }),
  },
  {
    id: "duo-rematch-prompts",
    title: "Duo / Rematch Prompts",
    selector: '[data-qa-scene="duo-rematch-prompts"] [data-testid="bbti-duo-rematch-prompts"]',
    element: React.createElement(DuoRematchPromptsFixture),
  },
  {
    id: "result-action-stack",
    title: "Result Actions / Dock + Next Play",
    selector: '[data-qa-scene="result-action-stack"] [data-testid="bbti-result-action-stack"]',
    element: React.createElement(ActionStackFixture, { actions: actionStackActions }),
  },
  {
    id: "result-scouting-refresh",
    title: "Result / Scouting Refresh",
    selector: '[data-qa-scene="result-scouting-refresh"] [data-testid="bbti-result-scouting-report"]',
    element: React.createElement(ResultScoutingRefreshFixture),
  },
  {
    id: "result-scouting-copy-kit",
    title: "Result / Scouting Copy Kit",
    selector: '[data-qa-scene="result-scouting-copy-kit"] [data-testid="bbti-result-scouting-copy-kit"]',
    element: React.createElement(ResultScoutingCopyKitFixture),
  },
  {
    id: "case-postgame-film-room",
    title: "Case Postgame / Film Room",
    selector: '[data-qa-scene="case-postgame-film-room"] [data-testid="bbti-case-postgame"]',
    element: React.createElement(CasePostgameFixture, { context: filmNotice.caseContext }),
  },
  {
    id: "case-postgame-result",
    title: "Case Postgame / Result",
    selector: '[data-qa-scene="case-postgame-result"] [data-testid="bbti-case-postgame"]',
    element: React.createElement(CasePostgameFixture, { context: resultNotice.caseContext }),
  },
  {
    id: "case-postgame-arena-event",
    title: "Case Postgame / Arena Event",
    selector: '[data-qa-scene="case-postgame-arena-event"] [data-testid="bbti-case-postgame"]',
    element: React.createElement(CasePostgameFixture, { context: arenaNotice.caseContext, playerAName: "LeBron", playerBName: "Jordan" }),
  },
  {
    id: "replay-center-coach-challenge",
    title: "Battle / Replay Center Coach Challenge",
    selector: '[data-qa-scene="replay-center-coach-challenge"] [data-testid="bbti-replay-center"]',
    element: React.createElement(ReplayCenterFixture),
  },
  {
    id: "case-battle-mobile-polish",
    title: "Battle / Case Mobile Stack",
    selector: '[data-qa-scene="case-battle-mobile-polish"] [data-testid="bbti-case-battle-mobile-stack"]',
    element: React.createElement(CaseBattleMobileStackFixture),
  },
  {
    id: "battle-replay-lens-case",
    title: "Battle / Replay Lens Case",
    selector: '[data-qa-scene="battle-replay-lens-case"] [data-testid="bbti-battle-replay-lens"]',
    element: React.createElement(BattleReplayLensFixture),
  },
  {
    id: "case-trail-film-room",
    title: "Case Trail / Film Room",
    selector: '[data-qa-scene="case-trail-film-room"] [data-testid="bbti-case-trail"]',
    element: React.createElement(TrailFixture, { context: filmNotice.caseContext, currentRound: 2 }),
  },
  {
    id: "case-trail-result",
    title: "Case Trail / Result",
    selector: '[data-qa-scene="case-trail-result"] [data-testid="bbti-case-trail"]',
    element: React.createElement(TrailFixture, { context: resultNotice.caseContext, currentRound: 1, trailVotes: votes.slice(0, 1) }),
  },
  {
    id: "case-trail-arena-event",
    title: "Case Trail / Arena Event",
    selector: '[data-qa-scene="case-trail-arena-event"] [data-testid="bbti-case-trail"]',
    element: React.createElement(TrailFixture, { context: arenaNotice.caseContext, currentRound: 0, nameA: "LeBron", nameB: "Jordan", trailVotes: [] }),
  },
];

function VisualQaPage() {
  return React.createElement("main", { className: "qa-page" },
    scenes.map((scene) => React.createElement(Block, {
      id: scene.id,
      key: scene.id,
      title: scene.title,
    }, scene.element)),
  );
}

const { css, files: cssFiles } = loadCssBundle();
const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(VisualQaPage));
const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BBTI Visual QA Fixtures</title>
  <style>
${css}
html,body{margin:0;min-height:100%;background:#06070a;color:#fff;font-family:Arial,"Helvetica Neue",sans-serif;}
body{padding:20px;}
.qa-page{display:grid;gap:22px;justify-items:center;}
.qa-block{width:min(100%,980px);padding:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);border-radius:18px;}
.qa-title{margin:0 0 12px;color:rgba(255,255,255,.62);font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:.12em;}
.qa-surface{display:grid;justify-items:center;}
@media(max-width:520px){body{padding:10px}.qa-block{padding:10px;border-radius:14px}.qa-title{font-size:10px}}
  </style>
</head>
<body>${markup}</body>
</html>
`;

[
  'data-testid="bbti-deep-link-notice"',
  'data-testid="bbti-result-action-stack"',
  'data-testid="bbti-result-action-dock"',
  'data-testid="bbti-action-dock-primary-challenge"',
  'data-testid="bbti-action-dock-custom-challenge"',
  'data-testid="bbti-action-dock-compare"',
  'data-testid="bbti-action-dock-share"',
  'data-testid="bbti-result-program-nav"',
  'data-testid="bbti-result-program-tab"',
  'data-testid="bbti-result-section-nav"',
  'data-testid="bbti-result-section-chip"',
  'data-testid="bbti-add-files-suggestion-panel"',
  'data-testid="bbti-add-files-suggestion-card"',
  'data-testid="bbti-add-files-suggestion-cta"',
  'data-testid="bbti-add-files-copy"',
  'data-bbti-add-files-version="bbti-add-files-v1"',
  'data-bbti-add-files-stage="next"',
  'data-testid="bbti-add-files-suggestion-stage"',
  'data-bbti-add-files-target="bbti-share"',
  'data-bbti-add-files-target="bbti-challenges"',
  'data-bbti-add-files-target="bbti-scouting"',
  'data-testid="bbti-myteam-scouting-card"',
  'data-myteam-card-context="bbti-result"',
  'data-myteam-card-version="bbti-myteam-result-card-v1"',
  'data-testid="bbti-myteam-scouting-attribute"',
  'data-testid="bbti-result-scouting-report"',
  'data-bbti-result-scouting-version="bbti-result-scouting-refresh-v1"',
  'data-bbti-result-scouting-count="4"',
  'data-testid="bbti-result-scouting-lane"',
  'data-bbti-result-scouting-lane="pace-read"',
  'data-bbti-result-scouting-lane="proof-read"',
  'data-bbti-result-scouting-lane="usage-read"',
  'data-bbti-result-scouting-lane="stakes-read"',
  'data-bbti-result-scouting-axis="OD"',
  'data-bbti-result-scouting-axis="AE"',
  'data-bbti-result-scouting-axis="IT"',
  'data-bbti-result-scouting-axis="LR"',
  'data-testid="bbti-result-scouting-evidence"',
  'data-testid="bbti-result-scouting-copy-kit"',
  'data-bbti-result-scouting-copy-kit-version="bbti-result-scouting-copy-kit-v1"',
  'data-bbti-result-scouting-copy-kit-source-version="bbti-result-scouting-refresh-v1"',
  'data-bbti-result-scouting-copy-kit-count="3"',
  'data-testid="bbti-result-scouting-copy-kit-item"',
  'data-bbti-result-scouting-copy-kit-item="group-recap"',
  'data-bbti-result-scouting-copy-kit-item="counter-read"',
  'data-bbti-result-scouting-copy-kit-item="next-workout"',
  'data-bbti-result-scouting-copy-kit-target="group-chat"',
  'data-bbti-result-scouting-copy-kit-target="counter"',
  'data-bbti-result-scouting-copy-kit-target="workout"',
  'data-bbti-result-scouting-copy-kit-action="copy-kit"',
  'data-bbti-result-scouting-copy-kit-action="copy"',
  'data-testid="bbti-result-scouting-copy-kit-boundary"',
  'data-testid="bbti-result-scouting-boundary"',
  'data-testid="bbti-arena-event-card"',
  'data-bbti-arena-event-active="true"',
  'data-bbti-arena-event-today="true"',
  'data-testid="bbti-arena-event-bracket"',
  'data-bbti-arena-event-bracket-version="bbti-arena-event-bracket-v1"',
  'data-bbti-arena-event-bracket-count="3"',
  'data-testid="bbti-arena-event-bracket-route"',
  'data-bbti-arena-event-bracket-route="event-tipoff"',
  'data-bbti-arena-event-bracket-route="challenge-branch"',
  'data-bbti-arena-event-bracket-route="share-return"',
  'data-bbti-arena-event-bracket-target="daily-event"',
  'data-bbti-arena-event-bracket-target="challenge"',
  'data-bbti-arena-event-bracket-target="share"',
  'data-testid="bbti-arena-event-bracket-action"',
  'data-testid="bbti-arena-event-bracket-boundary"',
  'data-testid="bbti-answer-poll-trend"',
  'data-bbti-answer-poll-trend-version="bbti-answer-poll-trend-v1"',
  'data-bbti-answer-poll-trend-source="local-simulation"',
  'data-testid="bbti-answer-poll-trend-copy"',
  'data-bbti-answer-poll-trend-action="copy"',
  'data-testid="bbti-answer-poll-trend-stat"',
  'data-bbti-answer-poll-trend-stat="mainstream"',
  'data-bbti-answer-poll-trend-stat="tossup"',
  'data-bbti-answer-poll-trend-stat="minority"',
  'data-testid="bbti-answer-poll-trend-round"',
  'data-bbti-answer-poll-trend-round="strongest"',
  'data-bbti-answer-poll-trend-round="toughest"',
  'data-testid="bbti-answer-poll-trend-seat"',
  'data-testid="bbti-entry-return-stack"',
  'data-bbti-entry-return-stack="last-result"',
  'data-testid="bbti-featured-daily-return"',
  'data-testid="bbti-return-bench"',
  'data-bbti-return-streak-version="bbti-return-streaks-v1"',
  'data-bbti-return-streak-case-source="arena-event"',
  'data-testid="bbti-return-streak-rail"',
  'data-testid="bbti-return-streak-summary"',
  'data-bbti-return-streak-step-count="3"',
  'data-testid="bbti-return-streak-step"',
  'data-bbti-return-streak-step="last-report"',
  'data-bbti-return-streak-step="daily-event"',
  'data-bbti-return-streak-step="featured-challenge"',
  'data-bbti-return-streak-target="result"',
  'data-bbti-return-streak-target="daily-event"',
  'data-bbti-return-streak-target="challenge"',
  'data-testid="bbti-return-streak-boundary"',
  'data-testid="bbti-daily-return-remix"',
  'data-bbti-daily-return-remix-version="bbti-daily-return-remix-v1"',
  'data-bbti-daily-return-remix-lane="daily-event"',
  'data-bbti-daily-return-remix-count="3"',
  'data-testid="bbti-daily-return-remix-tab"',
  'data-bbti-daily-return-remix-tab="daily-event"',
  'data-bbti-daily-return-remix-tab="film-room-return"',
  'data-bbti-daily-return-remix-tab="featured-challenge"',
  'data-bbti-daily-return-remix-target="daily-event"',
  'data-bbti-daily-return-remix-target="film-room"',
  'data-bbti-daily-return-remix-target="challenge"',
  'data-bbti-daily-return-remix-active="true"',
  'data-testid="bbti-daily-return-remix-detail"',
  'data-bbti-daily-return-remix-detail="daily-event"',
  'data-testid="bbti-daily-return-remix-action"',
  'data-bbti-daily-return-remix-action="daily-event"',
  'data-testid="bbti-featured-daily-return-action"',
  'data-bbti-featured-daily-return-action="open-daily-event"',
  'data-bbti-featured-daily-return-action="open-featured-challenge"',
  'data-bbti-featured-daily-return-action="copy-daily-prompt"',
  'data-testid="bbti-return-bench-action"',
  'data-bbti-return-bench-action="open-last-result"',
  'data-bbti-return-bench-action="copy-compare-invite"',
  'data-bbti-return-bench-action="copy-return-streak"',
  'data-testid="bbti-return-bench-challenge"',
  'data-bbti-return-bench-featured="true"',
  'data-bbti-return-bench-action="open-challenge-lane"',
  'data-testid="bbti-lineup-chemistry"',
  'data-bbti-lineup-chemistry-version="bbti-lineup-chemistry-v1"',
  'data-testid="bbti-lineup-chemistry-card"',
  'data-testid="bbti-lineup-chemistry-brief"',
  'data-testid="bbti-lineup-chemistry-brief-row"',
  'data-bbti-lineup-chemistry-brief="role-split"',
  'data-bbti-lineup-chemistry-brief="friction-plan"',
  'data-bbti-lineup-chemistry-brief="fit-action"',
  'data-testid="bbti-lineup-chemistry-copy"',
  'data-testid="bbti-lineup-chemistry-open"',
  'data-bbti-lineup-chemistry-action="copy-invite"',
  'data-bbti-lineup-chemistry-action="open-compare"',
  'data-testid="bbti-compare-report"',
  'data-testid="bbti-compare-report-program"',
  'data-bbti-compare-report-version="bbti-compare-report-v1"',
  'data-bbti-compare-program-count="3"',
  'data-testid="bbti-compare-program-row"',
  'data-bbti-compare-program="opening-read"',
  'data-bbti-compare-program="swing-point"',
  'data-bbti-compare-program="closing-challenge"',
  'data-testid="bbti-compare-rematch-plan"',
  'data-testid="bbti-duo-rematch-prompts"',
  'data-bbti-duo-rematch-version="bbti-duo-rematch-prompts-v1"',
  'data-bbti-duo-rematch-count="3"',
  'data-testid="bbti-duo-rematch-prompt"',
  'data-bbti-duo-rematch-prompt="standard-lock"',
  'data-bbti-duo-rematch-prompt="receipt-swap"',
  'data-bbti-duo-rematch-prompt="last-shot"',
  'data-bbti-duo-rematch-position="1"',
  'data-bbti-duo-rematch-position="2"',
  'data-bbti-duo-rematch-position="3"',
  'data-testid="bbti-duo-rematch-prompts-action"',
  'data-bbti-duo-rematch-action="copy-prompts"',
  'data-testid="bbti-duo-rematch-boundary"',
  'data-testid="bbti-film-room-remix-bench"',
  'data-bbti-film-room-remix-version="bbti-film-room-remix-bench-v1"',
  'data-bbti-film-room-remix-source="local-answer-history"',
  'data-bbti-film-room-remix-count="3"',
  'data-testid="bbti-film-room-remix-row"',
  'data-bbti-film-room-remix-row="clip-read"',
  'data-bbti-film-room-remix-row="drill-card"',
  'data-bbti-film-room-remix-row="poll-read"',
  'data-bbti-film-room-remix-target="clip"',
  'data-bbti-film-room-remix-target="drill"',
  'data-bbti-film-room-remix-target="poll"',
  'data-testid="bbti-film-room-remix-copy"',
  'data-bbti-film-room-remix-action="copy-bench"',
  'data-testid="bbti-film-room-remix-boundary"',
  'data-testid="bbti-film-room-drill"',
  'data-testid="bbti-film-room-drill-step"',
  'data-testid="bbti-film-room-drill-copy"',
  'data-bbti-film-room-drill-step-count="4"',
  'data-bbti-film-room-drill-step="evidence"',
  'data-bbti-film-room-drill-step="tension"',
  'data-bbti-film-room-drill-step="cross-exam"',
  'data-bbti-film-room-drill-step="insight"',
  'data-testid="bbti-challenge-receipt-board"',
  'data-testid="bbti-challenge-card"',
  'data-testid="bbti-challenge-rivalry-scripts"',
  'data-testid="bbti-challenge-rivalry-script"',
  'data-bbti-rivalry-script="opener"',
  'data-bbti-rivalry-script="conflict"',
  'data-bbti-rivalry-script="counter"',
  'data-testid="bbti-challenge-copy"',
  'data-testid="bbti-challenge-open"',
  'data-bbti-challenge-action="copy"',
  'data-bbti-challenge-action="open-matchup"',
  'data-testid="bbti-challenge-replay-seeds"',
  'data-bbti-challenge-replay-seeds-version="bbti-challenge-replay-seeds-v1"',
  'data-bbti-challenge-replay-seeds-count="3"',
  'data-testid="bbti-challenge-replay-seed-row"',
  'data-bbti-challenge-replay-seed="source-lock"',
  'data-bbti-challenge-replay-seed="opening-pressure"',
  'data-bbti-challenge-replay-seed="replay-lens"',
  'data-bbti-challenge-replay-seed-target="return"',
  'data-bbti-challenge-replay-seed-target="case"',
  'data-bbti-challenge-replay-seed-target="replay"',
  'data-testid="bbti-challenge-replay-seeds-copy"',
  'data-bbti-challenge-replay-seeds-action="copy-seeds"',
  'data-testid="bbti-challenge-replay-seeds-boundary"',
  'data-testid="bbti-challenge-lane-scoreboard"',
  'data-bbti-challenge-lane-scoreboard-version="bbti-challenge-lane-scoreboard-v1"',
  'data-bbti-challenge-lane-scoreboard-code="OAIL"',
  'data-bbti-challenge-lane-scoreboard-count="3"',
  'data-testid="bbti-challenge-lane-scoreboard-row"',
  'data-bbti-challenge-lane-scoreboard-row="same-court"',
  'data-bbti-challenge-lane-scoreboard-row="counter-court"',
  'data-bbti-challenge-lane-scoreboard-row="overtime-court"',
  'data-bbti-challenge-lane-scoreboard-target="same-temperature"',
  'data-bbti-challenge-lane-scoreboard-target="counter-judgment"',
  'data-bbti-challenge-lane-scoreboard-target="overtime"',
  'data-bbti-challenge-lane-scoreboard-action="open-lane"',
  'data-testid="bbti-challenge-lane-scoreboard-action"',
  'data-bbti-challenge-lane-scoreboard-action="copy-scoreboard"',
  'data-testid="bbti-challenge-lane-scoreboard-boundary"',
  'data-testid="bbti-challenge-pick-replay-kit"',
  'data-bbti-challenge-pick-replay-kit-version="bbti-challenge-pick-replay-kit-v1"',
  'data-bbti-challenge-pick-replay-kit-code="OAIL"',
  'data-bbti-challenge-pick-replay-kit-count="3"',
  'data-testid="bbti-challenge-pick-replay-kit-item"',
  'data-bbti-challenge-pick-replay-kit-item="case-lock"',
  'data-bbti-challenge-pick-replay-kit-item="pressure-check"',
  'data-bbti-challenge-pick-replay-kit-item="first-possession"',
  'data-bbti-challenge-pick-replay-kit-target="case"',
  'data-bbti-challenge-pick-replay-kit-target="pressure"',
  'data-bbti-challenge-pick-replay-kit-target="tipoff"',
  'data-bbti-challenge-pick-replay-kit-position="1"',
  'data-bbti-challenge-pick-replay-kit-position="2"',
  'data-bbti-challenge-pick-replay-kit-position="3"',
  'data-bbti-challenge-pick-replay-kit-action="copy-kit"',
  'data-bbti-challenge-pick-replay-kit-action="copy"',
  'data-testid="bbti-challenge-pick-replay-kit-boundary"',
  'data-testid="bbti-share-card"',
  'data-testid="bbti-share-card-overall"',
  'data-testid="bbti-share-card-axis"',
  'data-testid="bbti-share-card-badge"',
  'data-testid="bbti-share-card-copy"',
  'data-testid="bbti-share-card-copy-url"',
  'data-bbti-share-card-axis-count="4"',
  'data-bbti-share-card-badge-count="3"',
  'data-bbti-share-card-version="bbti-share-card-v1"',
  'data-bbti-share-card-surface="visual"',
  'data-testid="bbti-share-card-controls"',
  'data-bbti-share-card-control-count="2"',
  'data-bbti-share-card-action="copy-card"',
  'data-bbti-share-card-action="copy-url"',
  'data-testid="bbti-share-kits"',
  'data-bbti-share-kit-has-preview="true"',
  'data-testid="bbti-share-locker-room"',
  'data-bbti-share-locker-room-version="bbti-share-kit-locker-room-v1"',
  'data-bbti-share-locker-room-count="3"',
  'data-testid="bbti-share-locker-room-row"',
  'data-bbti-share-locker-room-row="result-door"',
  'data-bbti-share-locker-room-row="rematch-door"',
  'data-bbti-share-locker-room-row="case-door"',
  'data-bbti-share-locker-room-target="result"',
  'data-bbti-share-locker-room-target="duo"',
  'data-bbti-share-locker-room-target="challenge"',
  'data-bbti-share-locker-room-kit="scoreboard"',
  'data-bbti-share-locker-room-kit="duo-invite"',
  'data-bbti-share-locker-room-kit="challenge"',
  'data-bbti-share-locker-room-action="copy-locker-room"',
  'data-bbti-share-locker-room-action="copy-route"',
  'data-testid="bbti-share-locker-room-boundary"',
  'data-testid="bbti-share-route-scoreboard"',
  'data-bbti-share-route-scoreboard-version="bbti-share-route-scoreboard-v1"',
  'data-bbti-share-route-scoreboard-kit="arena-event"',
  `data-bbti-share-route-scoreboard-event="${arenaEvent.id}"`,
  `data-bbti-share-route-scoreboard-challenge="${arenaMatchupId}"`,
  'data-bbti-share-route-scoreboard-count="3"',
  'data-testid="bbti-share-route-scoreboard-row"',
  'data-bbti-share-route-scoreboard-row="event-tipoff"',
  'data-bbti-share-route-scoreboard-row="challenge-branch"',
  'data-bbti-share-route-scoreboard-row="share-return"',
  'data-bbti-share-route-scoreboard-target="daily-event"',
  'data-bbti-share-route-scoreboard-target="challenge"',
  'data-bbti-share-route-scoreboard-target="share"',
  'data-testid="bbti-share-route-scoreboard-action"',
  'data-bbti-share-route-scoreboard-action="copy-scoreboard"',
  'data-testid="bbti-share-route-scoreboard-boundary"',
  'data-testid="bbti-share-return-lane-check"',
  'data-bbti-share-return-lane-check-version="bbti-share-return-lane-check-v1"',
  'data-bbti-share-return-lane-check-count="4"',
  'data-testid="bbti-share-return-lane-check-row"',
  'data-bbti-share-return-lane-check-row="result-return"',
  'data-bbti-share-return-lane-check-row="duo-return"',
  'data-bbti-share-return-lane-check-row="challenge-return"',
  'data-bbti-share-return-lane-check-row="event-return"',
  'data-bbti-share-return-lane-check-target="result"',
  'data-bbti-share-return-lane-check-target="duo"',
  'data-bbti-share-return-lane-check-target="challenge"',
  'data-bbti-share-return-lane-check-target="event-challenge"',
  'data-bbti-share-return-lane-check-status="ready"',
  'data-bbti-share-return-lane-check-status="fallback"',
  'data-bbti-share-return-lane-check-action="copy-check"',
  'data-bbti-share-return-lane-check-action="copy-lane"',
  'data-testid="bbti-share-return-lane-check-boundary"',
  'data-testid="bbti-share-target-picker"',
  'data-testid="bbti-share-target-option"',
  'data-bbti-share-target-selected="true"',
  'data-testid="bbti-share-target-action"',
  'data-bbti-share-target-action="system-share"',
  'data-bbti-share-target-action="copy-active"',
  'data-bbti-share-target-action="copy-all"',
  'data-testid="bbti-share-kit-quick-copy"',
  'data-testid="bbti-next-play-panel"',
  'data-testid="bbti-case-postgame"',
  'data-bbti-case-postgame-version="bbti-case-postgame-v1"',
  'data-bbti-case-postgame-source="film-room"',
  'data-bbti-case-postgame-source="result"',
  'data-bbti-case-postgame-source="arena-event"',
  'data-bbti-case-postgame-source-version="film-room-v1"',
  'data-bbti-case-postgame-source-version="result-v1"',
  'data-bbti-case-postgame-source-version="arena-event-v1"',
  'data-bbti-case-postgame-case-version="bbti-case-v1"',
  'data-bbti-case-postgame-score="2-1"',
  'data-testid="bbti-case-postgame-source"',
  'data-testid="bbti-case-postgame-origin"',
  'data-testid="bbti-case-postgame-session-card"',
  'data-bbti-case-postgame-session="selected-side"',
  'data-bbti-case-postgame-session="winner"',
  'data-testid="bbti-case-postgame-return-url"',
  'data-testid="bbti-case-postgame-replay-index"',
  'data-bbti-case-postgame-replay-index-version="bbti-case-postgame-replay-index-v1"',
  'data-bbti-case-postgame-replay-index-count="4"',
  'data-testid="bbti-case-postgame-replay-row"',
  'data-bbti-case-postgame-replay-row="coach-challenge"',
  'data-bbti-case-postgame-replay-row="case-source"',
  'data-bbti-case-postgame-replay-row="session-verdict"',
  'data-bbti-case-postgame-replay-row="return-link"',
  'data-bbti-case-postgame-replay-target="replay"',
  'data-bbti-case-postgame-replay-target="case-source"',
  'data-bbti-case-postgame-replay-target="verdict"',
  'data-bbti-case-postgame-replay-target="bbti-result"',
  'data-testid="bbti-case-postgame-boundary"',
  'data-bbti-case-postgame-action="copy-recap"',
  'data-bbti-case-postgame-action="open-bbti-result"',
  'data-testid="bbti-replay-center"',
  'data-bbti-replay-center-version="bbti-replay-center-v1"',
  `data-bbti-replay-center-matchup-id="${filmRoomMatchupId}"`,
  'data-bbti-replay-center-topic-id="shot-quality"',
  'data-bbti-replay-center-round="2"',
  'data-bbti-replay-center-side="lebron"',
  'data-bbti-replay-center-source="Local Replay Fixture"',
  'data-testid="bbti-replay-center-source"',
  'data-testid="bbti-case-battle-mobile-stack"',
  'data-bbti-case-battle-mobile-version="bbti-case-battle-mobile-polish-v1"',
  'data-bbti-case-battle-mobile-source="film-room"',
  'data-bbti-case-battle-mobile-round="2"',
  'data-bbti-case-battle-mobile-side="kobe"',
  'data-bbti-case-battle-mobile-auto-advance="paused"',
  'data-bbti-case-battle-mobile-step-count="5"',
  'data-testid="bbti-case-battle-mobile-rhythm"',
  'data-testid="bbti-case-battle-mobile-step"',
  'data-bbti-case-battle-mobile-step="replay"',
  'data-bbti-case-battle-mobile-step="advisor"',
  'data-bbti-case-battle-mobile-step="controls"',
  'data-bbti-case-battle-mobile-step="lens"',
  'data-bbti-case-battle-mobile-step="trail"',
  'data-bbti-case-battle-mobile-target="bbti-replay-center"',
  'data-bbti-case-battle-mobile-target="bbti-courtside-advisor"',
  'data-bbti-case-battle-mobile-target="bbti-case-battle-mobile-controls"',
  'data-bbti-case-battle-mobile-target="bbti-battle-replay-lens"',
  'data-bbti-case-battle-mobile-target="bbti-case-trail"',
  'data-testid="bbti-courtside-advisor"',
  'data-bbti-courtside-advisor-case-source="film-room"',
  'data-testid="bbti-case-battle-mobile-controls"',
  'data-bbti-case-battle-mobile-action="next"',
  'data-bbti-case-battle-mobile-action="extend"',
  'data-bbti-case-battle-mobile-action="pause"',
  'data-testid="bbti-case-battle-mobile-countdown"',
  'data-testid="bbti-battle-replay-lens"',
  'data-bbti-battle-replay-lens-version="bbti-battle-replay-lens-v1"',
  `data-bbti-battle-replay-lens-matchup-id="${filmRoomMatchupId}"`,
  'data-bbti-battle-replay-lens-topic-id="goat-proximity"',
  'data-bbti-battle-replay-lens-next-topic-id="rings"',
  'data-bbti-battle-replay-lens-round="1"',
  'data-bbti-battle-replay-lens-side="kobe"',
  'data-bbti-battle-replay-lens-case-source="film-room"',
  'data-bbti-battle-replay-lens-count="4"',
  'data-testid="bbti-battle-replay-lens-step"',
  'data-bbti-battle-replay-lens-step="current-claim"',
  'data-bbti-battle-replay-lens-step="counter-replay"',
  'data-bbti-battle-replay-lens-step="coach-cue"',
  'data-bbti-battle-replay-lens-step="next-pressure"',
  'data-bbti-battle-replay-lens-target="current-topic"',
  'data-bbti-battle-replay-lens-target="replay"',
  'data-bbti-battle-replay-lens-target="advisor"',
  'data-bbti-battle-replay-lens-target="next-topic"',
  'data-testid="bbti-battle-replay-lens-copy"',
  'data-bbti-battle-replay-lens-action="copy-lens"',
  'data-testid="bbti-battle-replay-copy-kit"',
  'data-bbti-battle-replay-copy-kit-version="bbti-battle-replay-copy-kit-v1"',
  'data-bbti-battle-replay-copy-kit-source-version="bbti-battle-replay-lens-v1"',
  'data-bbti-battle-replay-copy-kit-count="3"',
  'data-testid="bbti-battle-replay-copy-kit-item"',
  'data-bbti-battle-replay-copy-kit-item="group-recap"',
  'data-bbti-battle-replay-copy-kit-item="counter-punch"',
  'data-bbti-battle-replay-copy-kit-item="next-question"',
  'data-bbti-battle-replay-copy-kit-action="copy"',
  'data-testid="bbti-battle-replay-copy-kit-boundary"',
  'data-testid="bbti-battle-replay-lens-boundary"',
  'data-testid="bbti-case-trail"',
  'data-bbti-action-dock-sticky="true"',
  'data-bbti-action-dock-compare-mode="pending"',
  'data-bbti-action-dock-primary-mode="matchup"',
  'data-bbti-action-dock-action="primary-challenge"',
  'data-bbti-action-dock-action="custom-challenge"',
  'data-bbti-action-dock-action="compare"',
  'data-bbti-action-dock-action="share"',
  'data-bbti-clip-fallback="true"',
  'data-bbti-notice-state="collapsed"',
  'data-next-play-mobile-layout="primary"',
  'data-next-play-mobile-layout="compact"',
  'data-next-play-qa="incoming-film-room"',
  'data-next-play-qa="incoming-arena-event"',
  'data-next-play-qa="incoming-result"',
  'data-bbti-case-source="film-room"',
  'data-bbti-case-source="arena-event"',
].forEach((expected) => assertIncludes("visual QA HTML", html, expected));
assertNotIncludes("visual QA HTML", html, "Q-level");
assertNotIncludes("visual QA HTML", html, "真实全网热度");

const counts = {
  addFilesSuggestionPanel: countOccurrences(html, 'data-testid="bbti-add-files-suggestion-panel"'),
  actionDock: countOccurrences(html, 'data-testid="bbti-result-action-dock"'),
  arenaEventBracket: countOccurrences(html, 'data-testid="bbti-arena-event-bracket"'),
  battleReplayLens: countOccurrences(html, 'data-testid="bbti-battle-replay-lens"'),
  caseBattleMobileStack: countOccurrences(html, 'data-testid="bbti-case-battle-mobile-stack"'),
  caseTrail: countOccurrences(html, 'data-testid="bbti-case-trail"'),
  challengeLaneScoreboard: countOccurrences(html, 'data-testid="bbti-challenge-lane-scoreboard"'),
  challengePickReplayKit: countOccurrences(html, 'data-testid="bbti-challenge-pick-replay-kit"'),
  challengeReceiptBoard: countOccurrences(html, 'data-testid="bbti-challenge-receipt-board"'),
  dailyReturnRemix: countOccurrences(html, 'data-testid="bbti-daily-return-remix"'),
  deepLinkNotice: countOccurrences(html, 'data-testid="bbti-deep-link-notice"'),
  filmRoomRemixBench: countOccurrences(html, 'data-testid="bbti-film-room-remix-bench"'),
  filmRoomDrill: countOccurrences(html, 'data-testid="bbti-film-room-drill"'),
  answerPollTrend: countOccurrences(html, 'data-testid="bbti-answer-poll-trend"'),
  casePostgame: countOccurrences(html, 'data-testid="bbti-case-postgame"'),
  entryReturnStack: countOccurrences(html, 'data-testid="bbti-entry-return-stack"'),
  featuredDailyReturn: countOccurrences(html, 'data-testid="bbti-featured-daily-return"'),
  compareReport: countOccurrences(html, 'data-testid="bbti-compare-report"'),
  compareProgram: countOccurrences(html, 'data-testid="bbti-compare-report-program"'),
  duoRematchPrompts: countOccurrences(html, 'data-testid="bbti-duo-rematch-prompts"'),
  lineupChemistry: countOccurrences(html, 'data-testid="bbti-lineup-chemistry"'),
  nextPlayPanel: countOccurrences(html, 'data-testid="bbti-next-play-panel"'),
  myTeamScoutingCard: countOccurrences(html, 'data-testid="bbti-myteam-scouting-card"'),
  qaScene: countOccurrences(html, "data-qa-scene="),
  replayCenter: countOccurrences(html, 'data-testid="bbti-replay-center"'),
  resultActionStack: countOccurrences(html, 'data-testid="bbti-result-action-stack"'),
  resultScoutingCopyKit: countOccurrences(html, 'data-testid="bbti-result-scouting-copy-kit"'),
  resultScoutingReport: countOccurrences(html, 'data-testid="bbti-result-scouting-report"'),
  resultScoutingLane: countOccurrences(html, 'data-testid="bbti-result-scouting-lane"'),
  returnBench: countOccurrences(html, 'data-testid="bbti-return-bench"'),
  shareCard: countOccurrences(html, 'data-testid="bbti-share-card"'),
  shareKits: countOccurrences(html, 'data-testid="bbti-share-kits"'),
  shareLockerRoom: countOccurrences(html, 'data-testid="bbti-share-locker-room"'),
  shareReturnLaneCheck: countOccurrences(html, 'data-testid="bbti-share-return-lane-check"'),
  shareRouteScoreboard: countOccurrences(html, 'data-testid="bbti-share-route-scoreboard"'),
};

const drillHtml = sceneHtmlFor(html, "film-room-drill-card");
if (!drillHtml) {
  addError("Film Room drill visual scene: missing scene HTML");
} else {
  const stepIds = attributeValues(drillHtml, "data-bbti-film-room-drill-step");
  const positions = attributeValues(drillHtml, "data-bbti-film-room-drill-position");
  const expectedStepIds = ["evidence", "tension", "cross-exam", "insight"];
  const expectedPositions = ["1", "2", "3", "4"];

  if (countOccurrences(drillHtml, 'data-testid="bbti-film-room-drill"') !== 1) {
    addError("Film Room drill visual scene: expected exactly one drill card");
  }
  if (countOccurrences(drillHtml, 'data-testid="bbti-film-room-drill-step"') !== 4) {
    addError("Film Room drill visual scene: expected exactly four drill steps");
  }
  if (JSON.stringify(stepIds) !== JSON.stringify(expectedStepIds)) {
    addError(`Film Room drill visual scene: expected steps ${expectedStepIds.join(",")}, got ${stepIds.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Film Room drill visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
}

const remixBenchHtml = sceneHtmlFor(html, "film-room-remix-bench");
if (!remixBenchHtml) {
  addError("Film Room remix bench visual scene: missing scene HTML");
} else {
  const rowIds = attributeValues(remixBenchHtml, "data-bbti-film-room-remix-row");
  const targets = attributeValues(remixBenchHtml, "data-bbti-film-room-remix-target");
  const positions = attributeValues(remixBenchHtml, "data-bbti-film-room-remix-position");
  const expectedRows = ["clip-read", "drill-card", "poll-read"];
  const expectedTargets = ["clip", "drill", "poll"];
  const expectedPositions = ["1", "2", "3"];

  if (countOccurrences(remixBenchHtml, 'data-testid="bbti-film-room-remix-bench"') !== 1) {
    addError("Film Room remix bench visual scene: expected exactly one bench");
  }
  if (!remixBenchHtml.includes('data-bbti-film-room-remix-version="bbti-film-room-remix-bench-v1"')) {
    addError("Film Room remix bench visual scene: expected bbti-film-room-remix-bench-v1");
  }
  if (!remixBenchHtml.includes('data-bbti-film-room-remix-source="local-answer-history"')) {
    addError("Film Room remix bench visual scene: expected local-answer-history source");
  }
  if (JSON.stringify(rowIds) !== JSON.stringify(expectedRows)) {
    addError(`Film Room remix bench visual scene: expected rows ${expectedRows.join(",")}, got ${rowIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Film Room remix bench visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Film Room remix bench visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (countOccurrences(remixBenchHtml, 'data-bbti-film-room-remix-action="copy-bench"') !== 1) {
    addError("Film Room remix bench visual scene: expected one copy-bench action");
  }
  if (countOccurrences(remixBenchHtml, 'data-testid="bbti-film-room-remix-boundary"') !== 1) {
    addError("Film Room remix bench visual scene: expected one local boundary");
  }
}

const challengeHtml = sceneHtmlFor(html, "challenge-rivalry-scripts");
if (!challengeHtml) {
  addError("Challenge rivalry scripts visual scene: missing scene HTML");
} else {
  const matchupIds = attributeValues(challengeHtml, "data-bbti-challenge-matchup-id");
  const cardPositions = attributeValues(challengeHtml, "data-bbti-challenge-position");
  const scriptSteps = attributeValues(challengeHtml, "data-bbti-rivalry-script");
  const scriptPositions = attributeValues(challengeHtml, "data-bbti-rivalry-script-position");
  const expectedCardPositions = challenges.map((_, index) => String(index + 1));
  const expectedScriptSteps = challenges.flatMap(() => ["opener", "conflict", "counter"]);
  const expectedScriptPositions = challenges.flatMap(() => ["1", "2", "3"]);

  if (countOccurrences(challengeHtml, 'data-testid="bbti-challenge-receipt-board"') !== 1) {
    addError("Challenge rivalry scripts visual scene: expected exactly one challenge receipt board");
  }
  if (countOccurrences(challengeHtml, 'data-testid="bbti-challenge-card"') !== challenges.length) {
    addError(`Challenge rivalry scripts visual scene: expected ${challenges.length} challenge cards`);
  }
  if (countOccurrences(challengeHtml, 'data-testid="bbti-challenge-rivalry-scripts"') !== challenges.length) {
    addError(`Challenge rivalry scripts visual scene: expected ${challenges.length} rivalry script panels`);
  }
  if (countOccurrences(challengeHtml, 'data-testid="bbti-challenge-rivalry-script"') !== challenges.length * 3) {
    addError(`Challenge rivalry scripts visual scene: expected ${challenges.length * 3} rivalry script rows`);
  }
  if (JSON.stringify(cardPositions) !== JSON.stringify(expectedCardPositions)) {
    addError(`Challenge rivalry scripts visual scene: expected card positions ${expectedCardPositions.join(",")}, got ${cardPositions.join(",")}`);
  }
  if (new Set(matchupIds).size !== matchupIds.length) {
    addError(`Challenge rivalry scripts visual scene: duplicate matchup ids ${matchupIds.join(",")}`);
  }
  if (JSON.stringify(scriptSteps) !== JSON.stringify(expectedScriptSteps)) {
    addError(`Challenge rivalry scripts visual scene: expected script steps ${expectedScriptSteps.join(",")}, got ${scriptSteps.join(",")}`);
  }
  if (JSON.stringify(scriptPositions) !== JSON.stringify(expectedScriptPositions)) {
    addError(`Challenge rivalry scripts visual scene: expected script positions ${expectedScriptPositions.join(",")}, got ${scriptPositions.join(",")}`);
  }
  if (countOccurrences(challengeHtml, 'data-bbti-challenge-action="copy"') !== challenges.length) {
    addError(`Challenge rivalry scripts visual scene: expected ${challenges.length} copy actions`);
  }
  if (countOccurrences(challengeHtml, 'data-bbti-challenge-action="open-matchup"') !== challenges.length) {
    addError(`Challenge rivalry scripts visual scene: expected ${challenges.length} open-matchup actions`);
  }
  if (countOccurrences(challengeHtml, 'data-testid="bbti-challenge-replay-seeds"') !== challenges.length) {
    addError(`Challenge rivalry scripts visual scene: expected ${challenges.length} replay seed strips`);
  }
}

const challengeLaneScoreboardHtml = sceneHtmlFor(html, "challenge-lane-scoreboard");
if (!challengeLaneScoreboardHtml) {
  addError("Challenge lane scoreboard visual scene: missing scene HTML");
} else {
  const rowIds = attributeValues(challengeLaneScoreboardHtml, "data-bbti-challenge-lane-scoreboard-row");
  const targets = attributeValues(challengeLaneScoreboardHtml, "data-bbti-challenge-lane-scoreboard-target");
  const categories = attributeValues(challengeLaneScoreboardHtml, "data-bbti-challenge-lane-scoreboard-category");
  const matchupIds = attributeValues(challengeLaneScoreboardHtml, "data-bbti-challenge-lane-scoreboard-matchup");
  const positions = attributeValues(challengeLaneScoreboardHtml, "data-bbti-challenge-lane-scoreboard-position");
  const expectedRows = ["same-court", "counter-court", "overtime-court"];
  const expectedTargets = ["same-temperature", "counter-judgment", "overtime"];
  const expectedCategories = ["同温层局", "反向审判", "破防加赛"];
  const expectedPositions = ["1", "2", "3"];

  if (countOccurrences(challengeLaneScoreboardHtml, 'data-testid="bbti-challenge-lane-scoreboard"') !== 1) {
    addError("Challenge lane scoreboard visual scene: expected exactly one lane scoreboard");
  }
  if (!challengeLaneScoreboardHtml.includes('data-bbti-challenge-lane-scoreboard-version="bbti-challenge-lane-scoreboard-v1"')) {
    addError("Challenge lane scoreboard visual scene: expected lane scoreboard version marker");
  }
  if (!challengeLaneScoreboardHtml.includes('data-bbti-challenge-lane-scoreboard-count="3"')) {
    addError("Challenge lane scoreboard visual scene: expected three route rows");
  }
  if (JSON.stringify(rowIds) !== JSON.stringify(expectedRows)) {
    addError(`Challenge lane scoreboard visual scene: expected rows ${expectedRows.join(",")}, got ${rowIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Challenge lane scoreboard visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(categories) !== JSON.stringify(expectedCategories)) {
    addError(`Challenge lane scoreboard visual scene: expected categories ${expectedCategories.join(",")}, got ${categories.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Challenge lane scoreboard visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (new Set(matchupIds).size !== matchupIds.length) {
    addError(`Challenge lane scoreboard visual scene: duplicate matchup ids ${matchupIds.join(",")}`);
  }
  if (countOccurrences(challengeLaneScoreboardHtml, 'data-bbti-challenge-lane-scoreboard-action="open-lane"') !== 3) {
    addError("Challenge lane scoreboard visual scene: expected three open-lane actions");
  }
  if (countOccurrences(challengeLaneScoreboardHtml, 'data-bbti-challenge-lane-scoreboard-action="copy-scoreboard"') !== 1) {
    addError("Challenge lane scoreboard visual scene: expected one copy-scoreboard action");
  }
  if (countOccurrences(challengeLaneScoreboardHtml, 'data-testid="bbti-challenge-lane-scoreboard-boundary"') !== 1) {
    addError("Challenge lane scoreboard visual scene: expected one local boundary");
  }
}

const challengeReplaySeedsHtml = sceneHtmlFor(html, "challenge-replay-seeds");
if (!challengeReplaySeedsHtml) {
  addError("Challenge replay seeds visual scene: missing scene HTML");
} else {
  const rowIds = attributeValues(challengeReplaySeedsHtml, "data-bbti-challenge-replay-seed");
  const targets = attributeValues(challengeReplaySeedsHtml, "data-bbti-challenge-replay-seed-target");
  const positions = attributeValues(challengeReplaySeedsHtml, "data-bbti-challenge-replay-seed-position");
  const expectedRows = ["source-lock", "opening-pressure", "replay-lens"];
  const expectedTargets = ["return", "case", "replay"];
  const expectedPositions = ["1", "2", "3"];

  if (countOccurrences(challengeReplaySeedsHtml, 'data-testid="bbti-challenge-replay-seeds"') !== 1) {
    addError("Challenge replay seeds visual scene: expected exactly one seed strip");
  }
  if (!challengeReplaySeedsHtml.includes('data-bbti-challenge-replay-seeds-version="bbti-challenge-replay-seeds-v1"')) {
    addError("Challenge replay seeds visual scene: expected seed version marker");
  }
  if (!challengeReplaySeedsHtml.includes('data-bbti-challenge-replay-seeds-source="shared-return"')) {
    addError("Challenge replay seeds visual scene: expected shared-return source");
  }
  if (!challengeReplaySeedsHtml.includes('data-bbti-challenge-replay-seeds-case-source="result"')) {
    addError("Challenge replay seeds visual scene: expected result case source");
  }
  if (JSON.stringify(rowIds) !== JSON.stringify(expectedRows)) {
    addError(`Challenge replay seeds visual scene: expected rows ${expectedRows.join(",")}, got ${rowIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Challenge replay seeds visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Challenge replay seeds visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (countOccurrences(challengeReplaySeedsHtml, 'data-bbti-challenge-replay-seeds-action="copy-seeds"') !== 1) {
    addError("Challenge replay seeds visual scene: expected one copy-seeds action");
  }
  if (countOccurrences(challengeReplaySeedsHtml, 'data-testid="bbti-challenge-replay-seeds-boundary"') !== 1) {
    addError("Challenge replay seeds visual scene: expected one local boundary");
  }
}

const challengePickReplayKitHtml = sceneHtmlFor(html, "challenge-pick-replay-kit");
if (!challengePickReplayKitHtml) {
  addError("Challenge pick replay kit visual scene: missing scene HTML");
} else {
  const itemIds = attributeValues(challengePickReplayKitHtml, "data-bbti-challenge-pick-replay-kit-item");
  const itemTargets = attributeValues(challengePickReplayKitHtml, "data-bbti-challenge-pick-replay-kit-target");
  const itemPositions = attributeValues(challengePickReplayKitHtml, "data-bbti-challenge-pick-replay-kit-position");
  const expectedItemIds = ["case-lock", "pressure-check", "first-possession"];
  const expectedItemTargets = ["case", "pressure", "tipoff"];
  const expectedItemPositions = ["1", "2", "3"];

  if (countOccurrences(challengePickReplayKitHtml, 'data-testid="bbti-challenge-pick-replay-kit"') !== 1) {
    addError("Challenge pick replay kit visual scene: expected exactly one pick replay kit");
  }
  if (!challengePickReplayKitHtml.includes('data-bbti-challenge-pick-replay-kit-version="bbti-challenge-pick-replay-kit-v1"')) {
    addError("Challenge pick replay kit visual scene: expected pick replay kit version marker");
  }
  if (!challengePickReplayKitHtml.includes('data-bbti-challenge-pick-replay-kit-code="OAIL"')) {
    addError("Challenge pick replay kit visual scene: expected OAIL code marker");
  }
  if (!challengePickReplayKitHtml.includes('data-bbti-challenge-pick-replay-kit-count="3"')) {
    addError("Challenge pick replay kit visual scene: expected three kit items");
  }
  if (JSON.stringify(itemIds) !== JSON.stringify(expectedItemIds)) {
    addError(`Challenge pick replay kit visual scene: expected item ids ${expectedItemIds.join(",")}, got ${itemIds.join(",")}`);
  }
  if (JSON.stringify(itemTargets) !== JSON.stringify(expectedItemTargets)) {
    addError(`Challenge pick replay kit visual scene: expected item targets ${expectedItemTargets.join(",")}, got ${itemTargets.join(",")}`);
  }
  if (JSON.stringify(itemPositions) !== JSON.stringify(expectedItemPositions)) {
    addError(`Challenge pick replay kit visual scene: expected item positions ${expectedItemPositions.join(",")}, got ${itemPositions.join(",")}`);
  }
  if (countOccurrences(challengePickReplayKitHtml, 'data-bbti-challenge-pick-replay-kit-action="copy-kit"') !== 1) {
    addError("Challenge pick replay kit visual scene: expected one copy-kit action");
  }
  if (countOccurrences(challengePickReplayKitHtml, 'data-bbti-challenge-pick-replay-kit-action="copy"') !== expectedItemIds.length) {
    addError(`Challenge pick replay kit visual scene: expected ${expectedItemIds.length} item copy actions`);
  }
  if (countOccurrences(challengePickReplayKitHtml, 'data-testid="bbti-challenge-pick-replay-kit-boundary"') !== 1) {
    addError("Challenge pick replay kit visual scene: expected one local boundary");
  }
}

const addFilesHtml = sceneHtmlFor(html, "add-files-suggestion-panel");
if (!addFilesHtml) {
  addError("Add Files visual scene: missing scene HTML");
} else {
  const ids = attributeValues(addFilesHtml, "data-bbti-add-files-id");
  const positions = attributeValues(addFilesHtml, "data-bbti-add-files-position");
  const stages = attributeValues(addFilesHtml, "data-bbti-add-files-stage");
  const targets = attributeValues(addFilesHtml, "data-bbti-add-files-target");
  const scrollTargets = attributeValues(addFilesHtml, "data-bbti-scroll-target");
  const expectedPositions = ids.map((_, index) => String(index + 1));
  const shippedIds = [
    "duo-chemistry",
    "film-room-quality",
    "rivalry-scripts",
    "share-card-export",
    "compare-report-polish",
    "answer-poll-trend",
    "case-postgame-recap",
    "return-streaks",
    "case-postgame-replay-index",
    "daily-return-remix",
    "battle-replay-lens",
    "visual-regression-pack",
    "arena-event-bracket",
    "replay-copy-kit",
    "case-battle-mobile-polish",
    "share-route-scoreboard",
    "duo-rematch-prompts",
    "film-room-remix-bench",
    "challenge-replay-seeds",
    "share-kit-locker-room",
    "result-scouting-refresh",
    "result-scouting-copy-kit",
    "challenge-lane-scoreboard",
    "share-return-lane-check",
  ];

  if (countOccurrences(addFilesHtml, 'data-testid="bbti-add-files-suggestion-panel"') !== 1) {
    addError("Add Files visual scene: expected exactly one suggestion panel");
  }
  if (countOccurrences(addFilesHtml, 'data-testid="bbti-add-files-suggestion-card"') !== 3) {
    addError("Add Files visual scene: expected exactly three suggestion cards");
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Add Files visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (new Set(ids).size !== ids.length) {
    addError(`Add Files visual scene: duplicate suggestion ids ${ids.join(",")}`);
  }
  if (stages.some((stage) => stage !== "next")) {
    addError(`Add Files visual scene: expected only next-stage cards, got ${stages.join(",")}`);
  }
  if (ids.some((id) => shippedIds.includes(id))) {
    addError(`Add Files visual scene: shipped suggestions must not appear in top Coach Queue, got ${ids.join(",")}`);
  }
  for (const expectedTarget of ["bbti-challenges", "bbti-share", "bbti-scouting"]) {
    if (!targets.includes(expectedTarget)) {
      addError(`Add Files visual scene: expected ${expectedTarget} target after shipped slices are demoted, got ${targets.join(",")}`);
    }
  }
  if (JSON.stringify(scrollTargets) !== JSON.stringify(targets)) {
    addError(`Add Files visual scene: CTA scroll targets must match card targets, got ${scrollTargets.join(",")} vs ${targets.join(",")}`);
  }
}

const resultScoutingHtml = sceneHtmlFor(html, "result-scouting-refresh");
if (!resultScoutingHtml) {
  addError("Result scouting visual scene: missing scene HTML");
} else {
  const laneIds = attributeValues(resultScoutingHtml, "data-bbti-result-scouting-lane");
  const axes = attributeValues(resultScoutingHtml, "data-bbti-result-scouting-axis");
  const targets = attributeValues(resultScoutingHtml, "data-bbti-result-scouting-target");
  const positions = attributeValues(resultScoutingHtml, "data-bbti-result-scouting-position");
  const evidenceAxes = attributeValues(resultScoutingHtml, "data-bbti-result-scouting-evidence-axis");
  const myTeamAttributes = attributeValues(resultScoutingHtml, "data-bbti-myteam-attribute");
  const expectedLanes = ["pace-read", "proof-read", "usage-read", "stakes-read"];
  const expectedAxes = ["OD", "AE", "IT", "LR"];
  const expectedTargets = ["tempo", "evidence", "usage", "identity"];
  const expectedPositions = ["1", "2", "3", "4"];

  if (countOccurrences(resultScoutingHtml, 'data-testid="bbti-myteam-scouting-card"') !== 1) {
    addError("Result scouting visual scene: expected exactly one MyTeam scouting card");
  }
  if (countOccurrences(resultScoutingHtml, 'data-testid="bbti-myteam-scouting-attribute"') !== 4) {
    addError("Result scouting visual scene: expected four MyTeam scouting attributes");
  }
  if (countOccurrences(resultScoutingHtml, 'data-testid="bbti-result-scouting-report"') !== 1) {
    addError("Result scouting visual scene: expected exactly one scouting report");
  }
  if (!resultScoutingHtml.includes('data-bbti-result-scouting-version="bbti-result-scouting-refresh-v1"')) {
    addError("Result scouting visual scene: expected result scouting version");
  }
  if (!resultScoutingHtml.includes('data-bbti-result-scouting-count="4"')) {
    addError("Result scouting visual scene: expected four scouting lanes");
  }
  if (JSON.stringify(laneIds) !== JSON.stringify(expectedLanes)) {
    addError(`Result scouting visual scene: expected lanes ${expectedLanes.join(",")}, got ${laneIds.join(",")}`);
  }
  if (JSON.stringify(axes) !== JSON.stringify(expectedAxes)) {
    addError(`Result scouting visual scene: expected axes ${expectedAxes.join(",")}, got ${axes.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Result scouting visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Result scouting visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  for (const axis of expectedAxes) {
    if (!evidenceAxes.includes(axis)) {
      addError(`Result scouting visual scene: expected evidence for axis ${axis}, got ${evidenceAxes.join(",")}`);
    }
  }
  if (JSON.stringify(myTeamAttributes) !== JSON.stringify(expectedAxes)) {
    addError(`Result scouting visual scene: expected MyTeam attributes ${expectedAxes.join(",")}, got ${myTeamAttributes.join(",")}`);
  }
  if (countOccurrences(resultScoutingHtml, 'data-testid="bbti-result-scouting-boundary"') !== 1) {
    addError("Result scouting visual scene: expected one local boundary");
  }
}

const resultScoutingCopyHtml = sceneHtmlFor(html, "result-scouting-copy-kit");
if (!resultScoutingCopyHtml) {
  addError("Result scouting copy kit visual scene: missing scene HTML");
} else {
  const itemIds = attributeValues(resultScoutingCopyHtml, "data-bbti-result-scouting-copy-kit-item");
  const targets = attributeValues(resultScoutingCopyHtml, "data-bbti-result-scouting-copy-kit-target");
  const sourceLanes = attributeValues(resultScoutingCopyHtml, "data-bbti-result-scouting-copy-kit-source-lane");
  const sourceAxes = attributeValues(resultScoutingCopyHtml, "data-bbti-result-scouting-copy-kit-source-axis");
  const positions = attributeValues(resultScoutingCopyHtml, "data-bbti-result-scouting-copy-kit-position");
  const expectedItemIds = ["group-recap", "counter-read", "next-workout"];
  const expectedTargets = ["group-chat", "counter", "workout"];
  const expectedSourceLanes = ["pace-read", "proof-read", "usage-read"];
  const expectedSourceAxes = ["OD", "AE", "IT"];
  const expectedPositions = ["1", "2", "3"];

  if (countOccurrences(resultScoutingCopyHtml, 'data-testid="bbti-result-scouting-copy-kit"') !== 1) {
    addError("Result scouting copy kit visual scene: expected exactly one copy kit");
  }
  if (!resultScoutingCopyHtml.includes('data-bbti-result-scouting-copy-kit-version="bbti-result-scouting-copy-kit-v1"')) {
    addError("Result scouting copy kit visual scene: expected copy kit version");
  }
  if (!resultScoutingCopyHtml.includes('data-bbti-result-scouting-copy-kit-source-version="bbti-result-scouting-refresh-v1"')) {
    addError("Result scouting copy kit visual scene: expected source report version");
  }
  if (!resultScoutingCopyHtml.includes('data-bbti-result-scouting-copy-kit-count="3"')) {
    addError("Result scouting copy kit visual scene: expected three copy items");
  }
  if (JSON.stringify(itemIds) !== JSON.stringify(expectedItemIds)) {
    addError(`Result scouting copy kit visual scene: expected items ${expectedItemIds.join(",")}, got ${itemIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Result scouting copy kit visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(sourceLanes) !== JSON.stringify(expectedSourceLanes)) {
    addError(`Result scouting copy kit visual scene: expected source lanes ${expectedSourceLanes.join(",")}, got ${sourceLanes.join(",")}`);
  }
  if (JSON.stringify(sourceAxes) !== JSON.stringify(expectedSourceAxes)) {
    addError(`Result scouting copy kit visual scene: expected source axes ${expectedSourceAxes.join(",")}, got ${sourceAxes.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Result scouting copy kit visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (countOccurrences(resultScoutingCopyHtml, 'data-bbti-result-scouting-copy-kit-action="copy-kit"') !== 1) {
    addError("Result scouting copy kit visual scene: expected one copy-kit action");
  }
  if (countOccurrences(resultScoutingCopyHtml, 'data-bbti-result-scouting-copy-kit-action="copy"') !== 3) {
    addError("Result scouting copy kit visual scene: expected three item copy actions");
  }
  if (countOccurrences(resultScoutingCopyHtml, 'data-testid="bbti-result-scouting-copy-kit-boundary"') !== 1) {
    addError("Result scouting copy kit visual scene: expected one copy kit boundary");
  }
}

const arenaBracketHtml = sceneHtmlFor(html, "arena-event-bracket");
if (!arenaBracketHtml) {
  addError("Arena Event bracket visual scene: missing scene HTML");
} else {
  const routeIds = attributeValues(arenaBracketHtml, "data-bbti-arena-event-bracket-route");
  const routeTargets = attributeValues(arenaBracketHtml, "data-bbti-arena-event-bracket-target");
  const routePositions = attributeValues(arenaBracketHtml, "data-bbti-arena-event-bracket-position");
  const actionIds = attributeValues(arenaBracketHtml, "data-bbti-arena-event-bracket-action");
  const actionTargets = attributeValues(arenaBracketHtml, "data-bbti-arena-event-bracket-action-target");
  const expectedRouteIds = ["event-tipoff", "challenge-branch", "share-return"];
  const expectedTargets = ["daily-event", "challenge", "share"];
  const expectedPositions = ["1", "2", "3"];

  if (countOccurrences(arenaBracketHtml, 'data-testid="bbti-arena-event-bracket"') !== 1) {
    addError("Arena Event bracket visual scene: expected exactly one route tree");
  }
  if (!arenaBracketHtml.includes('data-bbti-arena-event-bracket-version="bbti-arena-event-bracket-v1"')) {
    addError("Arena Event bracket visual scene: expected bracket version marker");
  }
  if (!arenaBracketHtml.includes('data-bbti-arena-event-bracket-count="3"')) {
    addError("Arena Event bracket visual scene: expected three route rows");
  }
  if (JSON.stringify(routeIds) !== JSON.stringify(expectedRouteIds)) {
    addError(`Arena Event bracket visual scene: expected routes ${expectedRouteIds.join(",")}, got ${routeIds.join(",")}`);
  }
  if (JSON.stringify(routeTargets) !== JSON.stringify(expectedTargets)) {
    addError(`Arena Event bracket visual scene: expected targets ${expectedTargets.join(",")}, got ${routeTargets.join(",")}`);
  }
  if (JSON.stringify(routePositions) !== JSON.stringify(expectedPositions)) {
    addError(`Arena Event bracket visual scene: expected positions ${expectedPositions.join(",")}, got ${routePositions.join(",")}`);
  }
  if (JSON.stringify(actionIds) !== JSON.stringify(expectedRouteIds)) {
    addError(`Arena Event bracket visual scene: expected actions ${expectedRouteIds.join(",")}, got ${actionIds.join(",")}`);
  }
  if (JSON.stringify(actionTargets) !== JSON.stringify(expectedTargets)) {
    addError(`Arena Event bracket visual scene: expected action targets ${expectedTargets.join(",")}, got ${actionTargets.join(",")}`);
  }
  if (!arenaBracketHtml.includes("本地情境路线树，不代表真实赛程、真实热度或用户行为。")) {
    addError("Arena Event bracket visual scene: expected local-only route boundary");
  }
}

const answerPollHtml = sceneHtmlFor(html, "answer-poll-trend-result");
if (!answerPollHtml) {
  addError("Answer Poll Trend visual scene: missing scene HTML");
} else {
  const stats = attributeValues(answerPollHtml, "data-bbti-answer-poll-trend-stat");
  const rounds = attributeValues(answerPollHtml, "data-bbti-answer-poll-trend-round");
  const seatPositions = attributeValues(answerPollHtml, "data-bbti-answer-poll-trend-seat-position");
  const readCounts = attributeValues(answerPollHtml, "data-bbti-answer-poll-trend-read-count");
  const expectedStats = ["mainstream", "tossup", "minority"];
  const expectedRounds = ["strongest", "toughest"];
  const expectedSeatPositions = seatPositions.map((_, index) => String(index + 1));

  if (countOccurrences(answerPollHtml, 'data-testid="bbti-answer-poll-trend"') !== 1) {
    addError("Answer Poll Trend visual scene: expected exactly one trend section");
  }
  if (!answerPollHtml.includes('data-bbti-answer-poll-trend-source="local-simulation"')) {
    addError("Answer Poll Trend visual scene: expected local-simulation source marker");
  }
  if (Number(readCounts[0]) < 1) {
    addError(`Answer Poll Trend visual scene: expected positive read count, got ${readCounts.join(",")}`);
  }
  if (JSON.stringify(stats) !== JSON.stringify(expectedStats)) {
    addError(`Answer Poll Trend visual scene: expected stats ${expectedStats.join(",")}, got ${stats.join(",")}`);
  }
  if (JSON.stringify(rounds) !== JSON.stringify(expectedRounds)) {
    addError(`Answer Poll Trend visual scene: expected rounds ${expectedRounds.join(",")}, got ${rounds.join(",")}`);
  }
  if (seatPositions.length < 1 || seatPositions.length > 3) {
    addError(`Answer Poll Trend visual scene: expected 1-3 seat rows, got ${seatPositions.length}`);
  }
  if (JSON.stringify(seatPositions) !== JSON.stringify(expectedSeatPositions)) {
    addError(`Answer Poll Trend visual scene: expected seat positions ${expectedSeatPositions.join(",")}, got ${seatPositions.join(",")}`);
  }
  if (countOccurrences(answerPollHtml, 'data-bbti-answer-poll-trend-action="copy"') !== 1) {
    addError("Answer Poll Trend visual scene: expected one copy action");
  }
}

function validateReturnStreakSteps(sceneId, sceneHtml, expectedRootTestId) {
  const stepIds = attributeValues(sceneHtml, "data-bbti-return-streak-step");
  const targets = attributeValues(sceneHtml, "data-bbti-return-streak-target");
  const positions = attributeValues(sceneHtml, "data-bbti-return-streak-position");
  const expectedStepIds = ["last-report", "daily-event", "featured-challenge"];
  const expectedTargets = ["result", "daily-event", "challenge"];
  const expectedPositions = ["1", "2", "3"];

  if (countOccurrences(sceneHtml, `data-testid="${expectedRootTestId}"`) !== 1) {
    addError(`Return streak scene ${sceneId}: expected exactly one ${expectedRootTestId}`);
  }
  if (!sceneHtml.includes('data-bbti-return-streak-version="bbti-return-streaks-v1"')) {
    addError(`Return streak scene ${sceneId}: expected return-streaks version marker`);
  }
  if (!sceneHtml.includes('data-bbti-return-streak-case-source="arena-event"')) {
    addError(`Return streak scene ${sceneId}: expected arena-event case source`);
  }
  if (!sceneHtml.includes("本地回访连线，不代表连续登录或真实活跃。")) {
    addError(`Return streak scene ${sceneId}: expected local-only return boundary`);
  }
  if (JSON.stringify(stepIds) !== JSON.stringify(expectedStepIds)) {
    addError(`Return streak scene ${sceneId}: expected steps ${expectedStepIds.join(",")}, got ${stepIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Return streak scene ${sceneId}: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Return streak scene ${sceneId}: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
}

function validateDailyReturnRemix(sceneId, sceneHtml) {
  const laneIds = attributeValues(sceneHtml, "data-bbti-daily-return-remix-tab");
  const targets = attributeValues(sceneHtml, "data-bbti-daily-return-remix-target");
  const positions = attributeValues(sceneHtml, "data-bbti-daily-return-remix-position");
  const activeFlags = attributeValues(sceneHtml, "data-bbti-daily-return-remix-active");
  const expectedLaneIds = ["daily-event", "film-room-return", "featured-challenge"];
  const expectedTargets = ["daily-event", "film-room", "challenge"];
  const expectedPositions = ["1", "2", "3"];

  if (countOccurrences(sceneHtml, 'data-testid="bbti-daily-return-remix"') !== 1) {
    addError(`Daily return remix scene ${sceneId}: expected exactly one remix switcher`);
  }
  if (!sceneHtml.includes('data-bbti-daily-return-remix-version="bbti-daily-return-remix-v1"')) {
    addError(`Daily return remix scene ${sceneId}: expected remix version marker`);
  }
  if (!sceneHtml.includes('data-bbti-daily-return-remix-count="3"')) {
    addError(`Daily return remix scene ${sceneId}: expected three remix lanes`);
  }
  if (!sceneHtml.includes('data-bbti-daily-return-remix-lane="daily-event"')) {
    addError(`Daily return remix scene ${sceneId}: expected daily-event as default active lane`);
  }
  if (JSON.stringify(laneIds) !== JSON.stringify(expectedLaneIds)) {
    addError(`Daily return remix scene ${sceneId}: expected lanes ${expectedLaneIds.join(",")}, got ${laneIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Daily return remix scene ${sceneId}: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Daily return remix scene ${sceneId}: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (JSON.stringify(activeFlags) !== JSON.stringify(["true", "false", "false"])) {
    addError(`Daily return remix scene ${sceneId}: expected first lane active, got ${activeFlags.join(",")}`);
  }
  if (!sceneHtml.includes("本地每日主场切换，不代表真实赛程、真实回访或用户行为。")) {
    addError(`Daily return remix scene ${sceneId}: expected local-only remix boundary`);
  }
}

const featuredReturnHtml = sceneHtmlFor(html, "featured-daily-return-arena-context");
if (!featuredReturnHtml) {
  addError("Featured daily return visual scene: missing scene HTML");
} else {
  const actions = attributeValues(featuredReturnHtml, "data-bbti-featured-daily-return-action");
  validateReturnStreakSteps("featured-daily-return-arena-context", featuredReturnHtml, "bbti-featured-daily-return");
  validateDailyReturnRemix("featured-daily-return-arena-context", featuredReturnHtml);
  if (JSON.stringify(actions) !== JSON.stringify(["open-daily-event", "open-featured-challenge", "copy-daily-prompt"])) {
    addError(`Featured daily return visual scene: expected actions open-daily-event,open-featured-challenge,copy-daily-prompt, got ${actions.join(",")}`);
  }
}

for (const sceneId of ["return-bench-streaks", "return-streaks-long-copy-stress"]) {
  const returnBenchHtml = sceneHtmlFor(html, sceneId);
  if (!returnBenchHtml) {
    addError(`Return bench visual scene ${sceneId}: missing scene HTML`);
    continue;
  }
  const actions = attributeValues(returnBenchHtml, "data-bbti-return-bench-action")
    .filter((action) => action !== "open-challenge-lane");
  const challengeActions = attributeValues(returnBenchHtml, "data-bbti-return-bench-action")
    .filter((action) => action === "open-challenge-lane");
  const challengeIds = attributeValues(returnBenchHtml, "data-bbti-return-bench-challenge");

  validateReturnStreakSteps(sceneId, returnBenchHtml, "bbti-return-bench");
  if (JSON.stringify(actions) !== JSON.stringify(["open-last-result", "copy-compare-invite", "copy-return-streak"])) {
    addError(`Return bench visual scene ${sceneId}: expected bench actions open-last-result,copy-compare-invite,copy-return-streak, got ${actions.join(",")}`);
  }
  if (challengeIds.length !== challenges.length) {
    addError(`Return bench visual scene ${sceneId}: expected ${challenges.length} challenge lanes, got ${challengeIds.length}`);
  }
  if (challengeActions.length !== challenges.length) {
    addError(`Return bench visual scene ${sceneId}: expected ${challenges.length} open-challenge-lane actions, got ${challengeActions.length}`);
  }
  if (countOccurrences(returnBenchHtml, 'data-bbti-return-bench-featured="true"') !== 1) {
    addError(`Return bench visual scene ${sceneId}: expected exactly one featured lane`);
  }
}

const entryReturnHtml = sceneHtmlFor(html, "entry-return-stack-with-last-result");
if (!entryReturnHtml) {
  addError("Entry return stack visual scene: missing scene HTML");
} else {
  if (countOccurrences(entryReturnHtml, 'data-testid="bbti-entry-return-stack"') !== 1) {
    addError("Entry return stack visual scene: expected one entry return stack");
  }
  if (countOccurrences(entryReturnHtml, 'data-testid="bbti-featured-daily-return"') !== 1) {
    addError("Entry return stack visual scene: expected one featured daily return");
  }
  if (countOccurrences(entryReturnHtml, 'data-testid="bbti-return-bench"') !== 1) {
    addError("Entry return stack visual scene: expected one return bench");
  }
  if (countOccurrences(entryReturnHtml, 'data-testid="bbti-return-streak-step"') !== 6) {
    addError("Entry return stack visual scene: expected six return streak steps across featured and bench");
  }
  validateDailyReturnRemix("entry-return-stack-with-last-result", entryReturnHtml);
}

const lineupHtml = sceneHtmlFor(html, "duo-chemistry");
if (!lineupHtml) {
  addError("Duo chemistry visual scene: missing scene HTML");
} else {
  const cardIds = attributeValues(lineupHtml, "data-bbti-lineup-chemistry-id");
  const cardPositions = attributeValues(lineupHtml, "data-bbti-lineup-chemistry-position");
  const briefRows = attributeValues(lineupHtml, "data-bbti-lineup-chemistry-brief");
  const briefPositions = attributeValues(lineupHtml, "data-bbti-lineup-chemistry-brief-position");
  const targetCodes = attributeValues(lineupHtml, "data-bbti-lineup-chemistry-target-code");
  const scores = attributeValues(lineupHtml, "data-bbti-lineup-chemistry-score");
  const expectedCardIds = ["compatibility", "nemesis"];
  const expectedCardPositions = ["1", "2"];
  const expectedBriefRows = expectedCardIds.flatMap(() => ["role-split", "friction-plan", "fit-action"]);
  const expectedBriefPositions = expectedCardIds.flatMap(() => ["1", "2", "3"]);

  if (countOccurrences(lineupHtml, 'data-testid="bbti-lineup-chemistry"') !== 1) {
    addError("Duo chemistry visual scene: expected exactly one lineup chemistry section");
  }
  if (JSON.stringify(cardIds) !== JSON.stringify(expectedCardIds)) {
    addError(`Duo chemistry visual scene: expected cards ${expectedCardIds.join(",")}, got ${cardIds.join(",")}`);
  }
  if (JSON.stringify(cardPositions) !== JSON.stringify(expectedCardPositions)) {
    addError(`Duo chemistry visual scene: expected card positions ${expectedCardPositions.join(",")}, got ${cardPositions.join(",")}`);
  }
  if (JSON.stringify(briefRows) !== JSON.stringify(expectedBriefRows)) {
    addError(`Duo chemistry visual scene: expected brief rows ${expectedBriefRows.join(",")}, got ${briefRows.join(",")}`);
  }
  if (JSON.stringify(briefPositions) !== JSON.stringify(expectedBriefPositions)) {
    addError(`Duo chemistry visual scene: expected brief positions ${expectedBriefPositions.join(",")}, got ${briefPositions.join(",")}`);
  }
  if (new Set(targetCodes).size !== targetCodes.length) {
    addError(`Duo chemistry visual scene: expected distinct target codes, got ${targetCodes.join(",")}`);
  }
  if (scores.some((score) => Number(score) < 18 || Number(score) > 98)) {
    addError(`Duo chemistry visual scene: score markers must stay in valid compare range, got ${scores.join(",")}`);
  }
  if (countOccurrences(lineupHtml, 'data-bbti-lineup-chemistry-action="copy-invite"') !== 2) {
    addError("Duo chemistry visual scene: expected two copy-invite actions");
  }
  if (countOccurrences(lineupHtml, 'data-bbti-lineup-chemistry-action="open-compare"') !== 2) {
    addError("Duo chemistry visual scene: expected two open-compare actions");
  }
}

for (const sceneId of ["compare-report-program", "compare-report-clash"]) {
  const compareHtml = sceneHtmlFor(html, sceneId);
  if (!compareHtml) {
    addError(`Compare report visual scene ${sceneId}: missing scene HTML`);
    continue;
  }

  const programIds = attributeValues(compareHtml, "data-bbti-compare-program");
  const programPositions = attributeValues(compareHtml, "data-bbti-compare-program-position");
  const expectedProgramIds = ["opening-read", "swing-point", "closing-challenge"];
  const expectedProgramPositions = ["1", "2", "3"];

  if (countOccurrences(compareHtml, 'data-testid="bbti-compare-report"') !== 1) {
    addError(`Compare report visual scene ${sceneId}: expected exactly one compare report shell`);
  }
  if (countOccurrences(compareHtml, 'data-testid="bbti-compare-report-program"') !== 1) {
    addError(`Compare report visual scene ${sceneId}: expected exactly one program panel`);
  }
  if (countOccurrences(compareHtml, 'data-testid="bbti-compare-program-row"') !== 3) {
    addError(`Compare report visual scene ${sceneId}: expected three program rows`);
  }
  if (JSON.stringify(programIds) !== JSON.stringify(expectedProgramIds)) {
    addError(`Compare report visual scene ${sceneId}: expected program ids ${expectedProgramIds.join(",")}, got ${programIds.join(",")}`);
  }
  if (JSON.stringify(programPositions) !== JSON.stringify(expectedProgramPositions)) {
    addError(`Compare report visual scene ${sceneId}: expected positions ${expectedProgramPositions.join(",")}, got ${programPositions.join(",")}`);
  }
  if (countOccurrences(compareHtml, 'data-testid="bbti-compare-rematch-plan"') !== 1) {
    addError(`Compare report visual scene ${sceneId}: expected one rematch plan`);
  }
  if (!compareHtml.includes("本地 BBTI 化学反应分")) {
    addError(`Compare report visual scene ${sceneId}: score label must stay local`);
  }
}

const duoRematchHtml = sceneHtmlFor(html, "duo-rematch-prompts");
if (!duoRematchHtml) {
  addError("Duo rematch prompts visual scene: missing scene HTML");
} else {
  const promptIds = attributeValues(duoRematchHtml, "data-bbti-duo-rematch-prompt");
  const promptPositions = attributeValues(duoRematchHtml, "data-bbti-duo-rematch-position");
  const expectedPromptIds = ["standard-lock", "receipt-swap", "last-shot"];
  const expectedPromptPositions = ["1", "2", "3"];

  if (countOccurrences(duoRematchHtml, 'data-testid="bbti-duo-rematch-prompts"') !== 1) {
    addError("Duo rematch prompts visual scene: expected one prompt shell");
  }
  if (!duoRematchHtml.includes('data-bbti-duo-rematch-version="bbti-duo-rematch-prompts-v1"')) {
    addError("Duo rematch prompts visual scene: expected bbti-duo-rematch-prompts-v1");
  }
  if (!duoRematchHtml.includes('data-bbti-duo-rematch-count="3"')) {
    addError("Duo rematch prompts visual scene: expected count 3");
  }
  if (JSON.stringify(promptIds) !== JSON.stringify(expectedPromptIds)) {
    addError(`Duo rematch prompts visual scene: expected prompt ids ${expectedPromptIds.join(",")}, got ${promptIds.join(",")}`);
  }
  if (JSON.stringify(promptPositions) !== JSON.stringify(expectedPromptPositions)) {
    addError(`Duo rematch prompts visual scene: expected prompt positions ${expectedPromptPositions.join(",")}, got ${promptPositions.join(",")}`);
  }
  if (countOccurrences(duoRematchHtml, 'data-bbti-duo-rematch-action="copy-prompts"') !== 1) {
    addError("Duo rematch prompts visual scene: expected one copy-prompts action");
  }
  if (countOccurrences(duoRematchHtml, 'data-testid="bbti-duo-rematch-boundary"') !== 1) {
    addError("Duo rematch prompts visual scene: expected one local boundary");
  }
  if (!duoRematchHtml.includes("本地复赛追问")) {
    addError("Duo rematch prompts visual scene: boundary must mark the prompts as local");
  }
}

const shareCardHtml = sceneHtmlFor(html, "share-card-poster");
if (!shareCardHtml) {
  addError("Share card poster visual scene: missing scene HTML");
} else {
  const axisIds = attributeValues(shareCardHtml, "data-bbti-share-card-axis");
  const axisPositions = attributeValues(shareCardHtml, "data-bbti-share-card-axis-position");
  const axisValues = attributeValues(shareCardHtml, "data-bbti-share-card-axis-value");
  const badgePositions = attributeValues(shareCardHtml, "data-bbti-share-card-badge-position");
  const targetIds = attributeValues(shareCardHtml, "data-bbti-share-target-id");
  const targetPositions = attributeValues(shareCardHtml, "data-bbti-share-target-position");
  const targetActions = attributeValues(shareCardHtml, "data-bbti-share-target-action");
  const quickCopyIds = attributeValues(shareCardHtml, "data-bbti-share-kit-id");
  const quickCopyPositions = attributeValues(shareCardHtml, "data-bbti-share-kit-position");
  const expectedAxisPositions = ["1", "2", "3", "4"];
  const expectedBadgePositions = ["1", "2", "3"];
  const expectedShareKitPositions = ["1", "2", "3", "4", "5"];

  if (countOccurrences(shareCardHtml, 'data-testid="bbti-share-kits"') !== 1) {
    addError("Share card poster visual scene: expected exactly one share kits shell");
  }
  if (countOccurrences(shareCardHtml, 'data-testid="bbti-share-card"') !== 1) {
    addError("Share card poster visual scene: expected exactly one share card");
  }
  if (countOccurrences(shareCardHtml, 'data-testid="bbti-share-card-axis"') !== 4) {
    addError("Share card poster visual scene: expected exactly four axis rows");
  }
  if (countOccurrences(shareCardHtml, 'data-testid="bbti-share-card-badge"') !== 3) {
    addError("Share card poster visual scene: expected exactly three badges");
  }
  if (JSON.stringify(axisPositions) !== JSON.stringify(expectedAxisPositions)) {
    addError(`Share card poster visual scene: expected axis positions ${expectedAxisPositions.join(",")}, got ${axisPositions.join(",")}`);
  }
  if (JSON.stringify(badgePositions) !== JSON.stringify(expectedBadgePositions)) {
    addError(`Share card poster visual scene: expected badge positions ${expectedBadgePositions.join(",")}, got ${badgePositions.join(",")}`);
  }
  if (new Set(axisIds).size !== axisIds.length) {
    addError(`Share card poster visual scene: duplicate axis ids ${axisIds.join(",")}`);
  }
  if (axisValues.some((value) => Number(value) < 0 || Number(value) > 100)) {
    addError(`Share card poster visual scene: axis values must stay in 0-100, got ${axisValues.join(",")}`);
  }
  if (countOccurrences(shareCardHtml, 'data-testid="bbti-share-card-controls"') !== 1) {
    addError("Share card poster visual scene: expected one external share card controls block");
  }
  if (countOccurrences(shareCardHtml, 'data-bbti-share-card-action="copy-card"') !== 1) {
    addError("Share card poster visual scene: expected one copy-card action outside the card");
  }
  if (countOccurrences(shareCardHtml, 'data-bbti-share-card-action="copy-url"') !== 1) {
    addError("Share card poster visual scene: expected one copy-url action outside the card");
  }
  const visualSurfaceStart = shareCardHtml.indexOf('data-testid="bbti-share-card"');
  const controlsStart = shareCardHtml.indexOf('data-testid="bbti-share-card-controls"');
  const visualSurfaceHtml = visualSurfaceStart >= 0 && controlsStart > visualSurfaceStart
    ? shareCardHtml.slice(visualSurfaceStart, controlsStart)
    : "";
  if (!visualSurfaceHtml) {
    addError("Share card poster visual scene: could not isolate visual card surface");
  } else {
    if (visualSurfaceHtml.includes("<button")) {
      addError("Share card poster visual scene: visual card surface must not include buttons");
    }
    if (visualSurfaceHtml.includes("data-bbti-share-card-action")) {
      addError("Share card poster visual scene: visual card surface must not include copy actions");
    }
  }
  if (countOccurrences(shareCardHtml, 'data-testid="bbti-share-target-picker"') !== 1) {
    addError("Share card poster visual scene: expected one share target picker");
  }
  if (targetIds.length !== 5 || JSON.stringify(targetPositions) !== JSON.stringify(expectedShareKitPositions)) {
    addError(`Share card poster visual scene: expected five ordered share target options, got ids ${targetIds.join(",")} positions ${targetPositions.join(",")}`);
  }
  if (countOccurrences(shareCardHtml, 'data-bbti-share-target-selected="true"') !== 1) {
    addError("Share card poster visual scene: expected exactly one selected share target");
  }
  if (JSON.stringify(targetActions) !== JSON.stringify(["system-share", "copy-active", "copy-all"])) {
    addError(`Share card poster visual scene: expected share target actions system-share,copy-active,copy-all, got ${targetActions.join(",")}`);
  }
  if (quickCopyIds.length !== 5 || JSON.stringify(quickCopyPositions) !== JSON.stringify(expectedShareKitPositions)) {
    addError(`Share card poster visual scene: expected five ordered quick-copy chips, got ids ${quickCopyIds.join(",")} positions ${quickCopyPositions.join(",")}`);
  }
}

const shareLockerHtml = sceneHtmlFor(html, "share-kit-locker-room");
if (!shareLockerHtml) {
  addError("Share locker room visual scene: missing scene HTML");
} else {
  const rowIds = attributeValues(shareLockerHtml, "data-bbti-share-locker-room-row");
  const targets = attributeValues(shareLockerHtml, "data-bbti-share-locker-room-target");
  const sourceKits = attributeValues(shareLockerHtml, "data-bbti-share-locker-room-kit");
  const linkKinds = attributeValues(shareLockerHtml, "data-bbti-share-locker-room-link-kind");
  const positions = attributeValues(shareLockerHtml, "data-bbti-share-locker-room-position");
  const routeActions = attributeValues(shareLockerHtml, "data-bbti-share-locker-room-action")
    .filter((action) => action === "copy-route");
  const expectedRows = ["result-door", "rematch-door", "case-door"];
  const expectedTargets = ["result", "duo", "challenge"];
  const expectedSourceKits = ["scoreboard", "duo-invite", "challenge"];
  const expectedLinkKinds = ["result", "compare-invite", "challenge"];
  const expectedPositions = ["1", "2", "3"];

  if (countOccurrences(shareLockerHtml, 'data-testid="bbti-share-kits"') !== 1) {
    addError("Share locker room visual scene: expected exactly one share kits shell");
  }
  if (countOccurrences(shareLockerHtml, 'data-testid="bbti-share-locker-room"') !== 1) {
    addError("Share locker room visual scene: expected exactly one locker room");
  }
  if (!shareLockerHtml.includes('data-bbti-share-locker-room-version="bbti-share-kit-locker-room-v1"')) {
    addError("Share locker room visual scene: expected locker room version");
  }
  if (!shareLockerHtml.includes('data-bbti-share-locker-room-count="3"')) {
    addError("Share locker room visual scene: expected three locker rows");
  }
  if (countOccurrences(shareLockerHtml, 'data-testid="bbti-share-route-scoreboard"') !== 0) {
    addError("Share locker room visual scene: ordinary share kit must not render event route scoreboard");
  }
  if (countOccurrences(shareLockerHtml, 'data-testid="bbti-share-return-lane-check"') !== 1) {
    addError("Share locker room visual scene: expected one return lane check");
  }
  if (!shareLockerHtml.includes('data-bbti-share-return-lane-check-version="bbti-share-return-lane-check-v1"')) {
    addError("Share locker room visual scene: expected return lane check version");
  }
  if (!shareLockerHtml.includes('data-bbti-share-return-lane-check-count="4"')) {
    addError("Share locker room visual scene: expected four return lane rows");
  }
  const returnStatuses = attributeValues(shareLockerHtml, "data-bbti-share-return-lane-check-status");
  if (JSON.stringify(returnStatuses) !== JSON.stringify(["ready", "ready", "ready", "fallback"])) {
    addError(`Share locker room visual scene: expected ordinary return statuses ready,ready,ready,fallback, got ${returnStatuses.join(",")}`);
  }
  if (JSON.stringify(rowIds) !== JSON.stringify(expectedRows)) {
    addError(`Share locker room visual scene: expected rows ${expectedRows.join(",")}, got ${rowIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Share locker room visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(sourceKits) !== JSON.stringify(expectedSourceKits)) {
    addError(`Share locker room visual scene: expected source kits ${expectedSourceKits.join(",")}, got ${sourceKits.join(",")}`);
  }
  if (JSON.stringify(linkKinds) !== JSON.stringify(expectedLinkKinds)) {
    addError(`Share locker room visual scene: expected link kinds ${expectedLinkKinds.join(",")}, got ${linkKinds.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Share locker room visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (countOccurrences(shareLockerHtml, 'data-bbti-share-locker-room-action="copy-locker-room"') !== 1) {
    addError("Share locker room visual scene: expected one copy-locker-room action");
  }
  if (routeActions.length !== 3) {
    addError(`Share locker room visual scene: expected three copy-route actions, got ${routeActions.length}`);
  }
  if (countOccurrences(shareLockerHtml, 'data-testid="bbti-share-locker-room-boundary"') !== 1) {
    addError("Share locker room visual scene: expected one local boundary");
  }
}

const shareRouteHtml = sceneHtmlFor(html, "share-route-scoreboard");
const shareReturnLaneHtml = sceneHtmlFor(html, "share-return-lane-check");
if (!shareReturnLaneHtml) {
  addError("Share return lane check visual scene: missing scene HTML");
} else {
  const rowIds = attributeValues(shareReturnLaneHtml, "data-bbti-share-return-lane-check-row");
  const targets = attributeValues(shareReturnLaneHtml, "data-bbti-share-return-lane-check-target");
  const statuses = attributeValues(shareReturnLaneHtml, "data-bbti-share-return-lane-check-status");
  const sourceKits = attributeValues(shareReturnLaneHtml, "data-bbti-share-return-lane-check-kit");
  const linkKinds = attributeValues(shareReturnLaneHtml, "data-bbti-share-return-lane-check-link-kind");
  const positions = attributeValues(shareReturnLaneHtml, "data-bbti-share-return-lane-check-position");
  const expectedRows = ["result-return", "duo-return", "challenge-return", "event-return"];
  const expectedTargets = ["result", "duo", "challenge", "event-challenge"];
  const expectedStatuses = ["ready", "ready", "ready", "ready"];
  const expectedSourceKits = ["scoreboard", "duo-invite", "challenge", "arena-event"];
  const expectedLinkKinds = ["result", "compare-invite", "challenge", "event-challenge"];
  const expectedPositions = ["1", "2", "3", "4"];

  if (countOccurrences(shareReturnLaneHtml, 'data-testid="bbti-share-kits"') !== 1) {
    addError("Share return lane check visual scene: expected exactly one share kits shell");
  }
  if (countOccurrences(shareReturnLaneHtml, 'data-testid="bbti-share-return-lane-check"') !== 1) {
    addError("Share return lane check visual scene: expected exactly one return lane check");
  }
  if (!shareReturnLaneHtml.includes('data-bbti-share-return-lane-check-version="bbti-share-return-lane-check-v1"')) {
    addError("Share return lane check visual scene: expected return lane check version");
  }
  if (!shareReturnLaneHtml.includes('data-bbti-share-return-lane-check-count="4"')) {
    addError("Share return lane check visual scene: expected four return lanes");
  }
  if (JSON.stringify(rowIds) !== JSON.stringify(expectedRows)) {
    addError(`Share return lane check visual scene: expected rows ${expectedRows.join(",")}, got ${rowIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Share return lane check visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(statuses) !== JSON.stringify(expectedStatuses)) {
    addError(`Share return lane check visual scene: expected statuses ${expectedStatuses.join(",")}, got ${statuses.join(",")}`);
  }
  if (JSON.stringify(sourceKits) !== JSON.stringify(expectedSourceKits)) {
    addError(`Share return lane check visual scene: expected source kits ${expectedSourceKits.join(",")}, got ${sourceKits.join(",")}`);
  }
  if (JSON.stringify(linkKinds) !== JSON.stringify(expectedLinkKinds)) {
    addError(`Share return lane check visual scene: expected link kinds ${expectedLinkKinds.join(",")}, got ${linkKinds.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Share return lane check visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (countOccurrences(shareReturnLaneHtml, 'data-bbti-share-return-lane-check-action="copy-check"') !== 1) {
    addError("Share return lane check visual scene: expected one copy-check action");
  }
  if (countOccurrences(shareReturnLaneHtml, 'data-bbti-share-return-lane-check-action="copy-lane"') !== 4) {
    addError("Share return lane check visual scene: expected four copy-lane actions");
  }
  if (countOccurrences(shareReturnLaneHtml, 'data-testid="bbti-share-return-lane-check-boundary"') !== 1) {
    addError("Share return lane check visual scene: expected one local boundary");
  }
  if (!shareReturnLaneHtml.includes("本地分享回流体检")) {
    addError("Share return lane check visual scene: expected local-only return boundary");
  }
}

if (!shareRouteHtml) {
  addError("Share route scoreboard visual scene: missing scene HTML");
} else {
  const rowIds = attributeValues(shareRouteHtml, "data-bbti-share-route-scoreboard-row");
  const targets = attributeValues(shareRouteHtml, "data-bbti-share-route-scoreboard-target");
  const positions = attributeValues(shareRouteHtml, "data-bbti-share-route-scoreboard-position");
  const targetIds = attributeValues(shareRouteHtml, "data-bbti-share-target-id");
  const targetPositions = attributeValues(shareRouteHtml, "data-bbti-share-target-position");
  const quickCopyIds = attributeValues(shareRouteHtml, "data-bbti-share-kit-id");
  const quickCopyPositions = attributeValues(shareRouteHtml, "data-bbti-share-kit-position");
  const expectedRows = ["event-tipoff", "challenge-branch", "share-return"];
  const expectedTargets = ["daily-event", "challenge", "share"];
  const expectedPositions = ["1", "2", "3"];
  const expectedShareTargets = ["arena-event", "scoreboard", "court-bait", "challenge", "duo-invite", "receipt"];
  const expectedSharePositions = ["1", "2", "3", "4", "5", "6"];

  if (countOccurrences(shareRouteHtml, 'data-testid="bbti-share-kits"') !== 1) {
    addError("Share route scoreboard visual scene: expected exactly one share kits shell");
  }
  if (countOccurrences(shareRouteHtml, 'data-testid="bbti-share-route-scoreboard"') !== 1) {
    addError("Share route scoreboard visual scene: expected exactly one route scoreboard");
  }
  if (!shareRouteHtml.includes('data-bbti-share-route-scoreboard-version="bbti-share-route-scoreboard-v1"')) {
    addError("Share route scoreboard visual scene: expected route scoreboard version");
  }
  if (!shareRouteHtml.includes('data-bbti-share-route-scoreboard-kit="arena-event"')) {
    addError("Share route scoreboard visual scene: expected arena-event source kit");
  }
  if (!shareRouteHtml.includes(`data-bbti-share-route-scoreboard-event="${arenaEvent.id}"`)) {
    addError("Share route scoreboard visual scene: expected active arena event id");
  }
  if (!shareRouteHtml.includes(`data-bbti-share-route-scoreboard-challenge="${arenaMatchupId}"`)) {
    addError("Share route scoreboard visual scene: expected active arena challenge id");
  }
  if (JSON.stringify(rowIds) !== JSON.stringify(expectedRows)) {
    addError(`Share route scoreboard visual scene: expected rows ${expectedRows.join(",")}, got ${rowIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Share route scoreboard visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Share route scoreboard visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (countOccurrences(shareRouteHtml, 'data-bbti-share-route-scoreboard-action="copy-scoreboard"') !== 1) {
    addError("Share route scoreboard visual scene: expected one copy-scoreboard action");
  }
  if (!shareRouteHtml.includes("本地分享路线比分牌")) {
    addError("Share route scoreboard visual scene: expected local-only route boundary");
  }
  if (JSON.stringify(targetIds) !== JSON.stringify(expectedShareTargets)) {
    addError(`Share route scoreboard visual scene: expected share targets ${expectedShareTargets.join(",")}, got ${targetIds.join(",")}`);
  }
  if (JSON.stringify(targetPositions) !== JSON.stringify(expectedSharePositions)) {
    addError(`Share route scoreboard visual scene: expected share target positions ${expectedSharePositions.join(",")}, got ${targetPositions.join(",")}`);
  }
  if (JSON.stringify(quickCopyIds) !== JSON.stringify(expectedShareTargets)) {
    addError(`Share route scoreboard visual scene: expected quick-copy ids ${expectedShareTargets.join(",")}, got ${quickCopyIds.join(",")}`);
  }
  if (JSON.stringify(quickCopyPositions) !== JSON.stringify(expectedSharePositions)) {
    addError(`Share route scoreboard visual scene: expected quick-copy positions ${expectedSharePositions.join(",")}, got ${quickCopyPositions.join(",")}`);
  }
  if (countOccurrences(shareRouteHtml, 'data-bbti-share-target-selected="true"') !== 1) {
    addError("Share route scoreboard visual scene: expected exactly one selected share target");
  }
  if (!shareRouteHtml.includes('data-bbti-share-target-active="arena-event"')) {
    addError("Share route scoreboard visual scene: expected arena-event as active target");
  }
}

const stackHtml = sceneHtmlFor(html, "result-action-stack");
if (!stackHtml) {
  addError("Result action stack visual scene: missing scene HTML");
} else {
  const dockIndex = stackHtml.indexOf('data-testid="bbti-result-action-dock"');
  const nextPlayIndex = stackHtml.indexOf('data-testid="bbti-next-play-panel"');
  const dockActionValues = attributeValues(stackHtml, "data-bbti-action-dock-action");
  const dockProgramValues = attributeValues(stackHtml, "data-bbti-action-dock-program");
  const dockSectionValues = attributeValues(stackHtml, "data-bbti-action-dock-section");
  const nextPlayKeys = attributeValues(stackHtml, "data-next-play-qa");
  const nextPlayLayouts = attributeValues(stackHtml, "data-next-play-mobile-layout");
  const expectedDockActions = ["primary-challenge", "custom-challenge", "compare", "share"];
  const expectedDockPrograms = ["scouting", "film-room", "challenge", "share"];
  const expectedNextPlayKeys = actionStackActions.map((action) => action.qaKey);

  if (countOccurrences(stackHtml, 'data-testid="bbti-result-action-dock"') !== 1) {
    addError("Result action stack visual scene: expected exactly one Action Dock");
  }
  if (countOccurrences(stackHtml, 'data-testid="bbti-next-play-panel"') !== 1) {
    addError("Result action stack visual scene: expected exactly one Next Play panel");
  }
  if (dockIndex < 0 || nextPlayIndex < 0 || dockIndex > nextPlayIndex) {
    addError("Result action stack visual scene: Action Dock must render before Next Play panel");
  }
  if (JSON.stringify(dockActionValues) !== JSON.stringify(expectedDockActions)) {
    addError(`Result action stack visual scene: expected dock actions ${expectedDockActions.join(",")}, got ${dockActionValues.join(",")}`);
  }
  if (JSON.stringify(dockProgramValues) !== JSON.stringify(expectedDockPrograms)) {
    addError(`Result action stack visual scene: expected dock programs ${expectedDockPrograms.join(",")}, got ${dockProgramValues.join(",")}`);
  }
  if (!dockSectionValues.includes("bbti-card") || !dockSectionValues.includes("bbti-scouting")) {
    addError(`Result action stack visual scene: expected scouting section selectors, got ${dockSectionValues.join(",")}`);
  }
  if (JSON.stringify(nextPlayKeys) !== JSON.stringify(expectedNextPlayKeys)) {
    addError(`Result action stack visual scene: expected next-play keys ${expectedNextPlayKeys.join(",")}, got ${nextPlayKeys.join(",")}`);
  }
  if (nextPlayLayouts[0] !== "primary" || nextPlayLayouts.slice(1).some((layout) => layout !== "compact")) {
    addError(`Result action stack visual scene: expected primary/compact next-play mobile layouts, got ${nextPlayLayouts.join(",")}`);
  }
}

for (const [sceneId, expected] of Object.entries({
  "case-postgame-film-room": {
    source: "film-room",
    sourceVersion: "film-room-v1",
    expectedParams: { bbti: code, challenge: filmRoomMatchupId, clip: "q12-m0" },
    forbiddenParams: ["event"],
  },
  "case-postgame-result": {
    source: "result",
    sourceVersion: "result-v1",
    expectedParams: { bbti: code, challenge: resultMatchupId },
    forbiddenParams: ["event", "clip"],
  },
  "case-postgame-arena-event": {
    source: "arena-event",
    sourceVersion: "arena-event-v1",
    expectedParams: { bbti: code, challenge: arenaMatchupId, event: arenaEvent.id },
    forbiddenParams: ["clip"],
  },
})) {
  const sceneHtml = sceneHtmlFor(html, sceneId);
  if (!sceneHtml) {
    addError(`Case Postgame visual scene ${sceneId}: missing scene HTML`);
    continue;
  }

  const actionValues = attributeValues(sceneHtml, "data-bbti-case-postgame-action");
  const sessionValues = attributeValues(sceneHtml, "data-bbti-case-postgame-session");
  const returnUrl = decodeAttributeValue(attributeValues(sceneHtml, "data-bbti-case-postgame-return-url")[0]);
  const lensPositions = attributeValues(sceneHtml, "data-bbti-case-postgame-lens-position");
  const replayIndexRows = attributeValues(sceneHtml, "data-bbti-case-postgame-replay-row");
  const replayIndexTargets = attributeValues(sceneHtml, "data-bbti-case-postgame-replay-target");
  const replayIndexPositions = attributeValues(sceneHtml, "data-bbti-case-postgame-replay-position");
  const replayIndexHrefs = attributeValues(sceneHtml, "href")
    .map(decodeAttributeValue)
    .filter((href) => href.includes("replay?matchup=case-postgame") || href.includes("?bbti="));

  if (countOccurrences(sceneHtml, 'data-testid="bbti-case-postgame"') !== 1) {
    addError(`Case Postgame visual scene ${sceneId}: expected exactly one postgame card`);
  }
  if (!sceneHtml.includes(`data-bbti-case-postgame-source="${expected.source}"`)) {
    addError(`Case Postgame visual scene ${sceneId}: expected source ${expected.source}`);
  }
  if (!sceneHtml.includes(`data-bbti-case-postgame-source-version="${expected.sourceVersion}"`)) {
    addError(`Case Postgame visual scene ${sceneId}: expected source version ${expected.sourceVersion}`);
  }
  if (!sceneHtml.includes('data-bbti-case-postgame-version="bbti-case-postgame-v1"')) {
    addError(`Case Postgame visual scene ${sceneId}: expected postgame version`);
  }
  if (!sceneHtml.includes('data-bbti-case-postgame-case-version="bbti-case-v1"')) {
    addError(`Case Postgame visual scene ${sceneId}: expected case version`);
  }
  if (countOccurrences(sceneHtml, 'data-testid="bbti-case-postgame-replay-index"') !== 1) {
    addError(`Case Postgame visual scene ${sceneId}: expected exactly one replay index`);
  }
  if (!sceneHtml.includes('data-bbti-case-postgame-replay-index-version="bbti-case-postgame-replay-index-v1"')) {
    addError(`Case Postgame visual scene ${sceneId}: expected replay index version`);
  }
  if (!sceneHtml.includes('data-bbti-case-postgame-replay-index-count="4"')) {
    addError(`Case Postgame visual scene ${sceneId}: expected four replay index rows`);
  }
  if (JSON.stringify(replayIndexRows) !== JSON.stringify(["coach-challenge", "case-source", "session-verdict", "return-link"])) {
    addError(`Case Postgame visual scene ${sceneId}: expected replay index rows coach-challenge,case-source,session-verdict,return-link, got ${replayIndexRows.join(",")}`);
  }
  if (JSON.stringify(replayIndexTargets) !== JSON.stringify(["replay", "case-source", "verdict", "bbti-result"])) {
    addError(`Case Postgame visual scene ${sceneId}: expected replay index targets replay,case-source,verdict,bbti-result, got ${replayIndexTargets.join(",")}`);
  }
  if (JSON.stringify(replayIndexPositions) !== JSON.stringify(["1", "2", "3", "4"])) {
    addError(`Case Postgame visual scene ${sceneId}: expected replay index positions 1,2,3,4, got ${replayIndexPositions.join(",")}`);
  }
  if (JSON.stringify(sessionValues) !== JSON.stringify(["selected-side", "winner"])) {
    addError(`Case Postgame visual scene ${sceneId}: expected selected-side,winner session cards, got ${sessionValues.join(",")}`);
  }
  if (JSON.stringify(actionValues) !== JSON.stringify(["copy-recap", "open-bbti-result"])) {
    addError(`Case Postgame visual scene ${sceneId}: expected copy/open actions, got ${actionValues.join(",")}`);
  }
  if (!sceneHtml.includes("仅记录本次会话复盘，不代表真实胜率或外部排名。")) {
    addError(`Case Postgame visual scene ${sceneId}: expected session-local boundary`);
  }
  if (!returnUrl) {
    addError(`Case Postgame visual scene ${sceneId}: expected return URL attribute`);
  } else {
    const parsed = new URL(returnUrl);
    for (const [key, value] of Object.entries(expected.expectedParams)) {
      if (parsed.searchParams.get(key) !== value) {
        addError(`Case Postgame visual scene ${sceneId}: expected return param ${key}=${value}, got ${parsed.searchParams.get(key)}`);
      }
    }
    for (const key of expected.forbiddenParams) {
      if (parsed.searchParams.has(key)) {
        addError(`Case Postgame visual scene ${sceneId}: return URL must not include ${key}`);
      }
    }
    for (const key of ["caseCopy", "caseQuestion", "caseVersion", "sourceUrl", "sourceId"]) {
      if (parsed.searchParams.has(key)) {
        addError(`Case Postgame visual scene ${sceneId}: return URL leaked internal case param ${key}`);
      }
    }
  }
  for (const href of replayIndexHrefs) {
    const parsed = new URL(href);
    for (const key of ["caseCopy", "caseQuestion", "caseVersion", "sourceUrl", "sourceId"]) {
      if (parsed.searchParams.has(key)) {
        addError(`Case Postgame visual scene ${sceneId}: replay index href leaked internal case param ${key}`);
      }
    }
  }
  if (lensPositions.length > 0) {
    const expectedLensPositions = lensPositions.map((_, index) => String(index + 1));
    if (JSON.stringify(lensPositions) !== JSON.stringify(expectedLensPositions)) {
      addError(`Case Postgame visual scene ${sceneId}: expected ordered lens positions, got ${lensPositions.join(",")}`);
    }
  }
}

const replayCenterHtml = sceneHtmlFor(html, "replay-center-coach-challenge");
if (!replayCenterHtml) {
  addError("Replay Center visual scene: missing scene HTML");
} else {
  if (countOccurrences(replayCenterHtml, 'data-testid="bbti-replay-center"') !== 1) {
    addError("Replay Center visual scene: expected exactly one replay center");
  }
  for (const expected of [
    'data-bbti-replay-center-version="bbti-replay-center-v1"',
    `data-bbti-replay-center-matchup-id="${filmRoomMatchupId}"`,
    'data-bbti-replay-center-topic-id="shot-quality"',
    'data-bbti-replay-center-round="2"',
    'data-bbti-replay-center-side="lebron"',
    'data-bbti-replay-center-source="Local Replay Fixture"',
    'data-testid="bbti-replay-center-source"',
  ]) {
    if (!replayCenterHtml.includes(expected)) {
      addError(`Replay Center visual scene: missing ${expected}`);
    }
  }
}

const caseBattleMobileHtml = sceneHtmlFor(html, "case-battle-mobile-polish");
if (!caseBattleMobileHtml) {
  addError("Case Battle Mobile visual scene: missing scene HTML");
} else {
  const stepIds = attributeValues(caseBattleMobileHtml, "data-bbti-case-battle-mobile-step");
  const targets = attributeValues(caseBattleMobileHtml, "data-bbti-case-battle-mobile-target");
  const positions = attributeValues(caseBattleMobileHtml, "data-bbti-case-battle-mobile-position");
  const slots = attributeValues(caseBattleMobileHtml, "data-bbti-case-battle-mobile-slot");
  const actions = attributeValues(caseBattleMobileHtml, "data-bbti-case-battle-mobile-action");
  const expectedStepIds = ["replay", "advisor", "controls", "lens", "trail"];
  const expectedTargets = [
    "bbti-replay-center",
    "bbti-courtside-advisor",
    "bbti-case-battle-mobile-controls",
    "bbti-battle-replay-lens",
    "bbti-case-trail",
  ];
  const expectedPositions = ["1", "2", "3", "4", "5"];
  const expectedSlots = ["replay", "advisor", "lens", "trail", "controls"];
  const expectedActions = ["next", "extend", "pause"];

  if (countOccurrences(caseBattleMobileHtml, 'data-testid="bbti-case-battle-mobile-stack"') !== 1) {
    addError("Case Battle Mobile visual scene: expected exactly one mobile stack");
  }
  if (!caseBattleMobileHtml.includes('data-bbti-case-battle-mobile-version="bbti-case-battle-mobile-polish-v1"')) {
    addError("Case Battle Mobile visual scene: expected mobile stack version");
  }
  if (!caseBattleMobileHtml.includes('data-bbti-case-battle-mobile-source="film-room"')) {
    addError("Case Battle Mobile visual scene: expected film-room case source");
  }
  if (!caseBattleMobileHtml.includes('data-bbti-case-battle-mobile-auto-advance="paused"')) {
    addError("Case Battle Mobile visual scene: expected paused read mode");
  }
  if (JSON.stringify(stepIds) !== JSON.stringify(expectedStepIds)) {
    addError(`Case Battle Mobile visual scene: expected steps ${expectedStepIds.join(",")}, got ${stepIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Case Battle Mobile visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Case Battle Mobile visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (JSON.stringify(slots) !== JSON.stringify(expectedSlots)) {
    addError(`Case Battle Mobile visual scene: expected slots ${expectedSlots.join(",")}, got ${slots.join(",")}`);
  }
  if (JSON.stringify(actions) !== JSON.stringify(expectedActions)) {
    addError(`Case Battle Mobile visual scene: expected controls ${expectedActions.join(",")}, got ${actions.join(",")}`);
  }
  for (const expected of [
    'data-testid="bbti-replay-center"',
    'data-testid="bbti-courtside-advisor"',
    'data-testid="bbti-battle-replay-lens"',
    'data-testid="bbti-battle-replay-copy-kit"',
    'data-testid="bbti-case-trail"',
    'data-testid="bbti-case-battle-mobile-controls"',
  ]) {
    if (!caseBattleMobileHtml.includes(expected)) {
      addError(`Case Battle Mobile visual scene: missing ${expected}`);
    }
  }
}

const battleReplayLensHtml = sceneHtmlFor(html, "battle-replay-lens-case");
if (!battleReplayLensHtml) {
  addError("Battle replay lens visual scene: missing scene HTML");
} else {
  const stepIds = attributeValues(battleReplayLensHtml, "data-bbti-battle-replay-lens-step");
  const targets = attributeValues(battleReplayLensHtml, "data-bbti-battle-replay-lens-target");
  const positions = attributeValues(battleReplayLensHtml, "data-bbti-battle-replay-lens-position");
  const copyKitItems = attributeValues(battleReplayLensHtml, "data-bbti-battle-replay-copy-kit-item");
  const copyKitPositions = attributeValues(battleReplayLensHtml, "data-bbti-battle-replay-copy-kit-position");
  const expectedStepIds = ["current-claim", "counter-replay", "coach-cue", "next-pressure"];
  const expectedTargets = ["current-topic", "replay", "advisor", "next-topic"];
  const expectedPositions = ["1", "2", "3", "4"];
  const expectedCopyKitItems = ["group-recap", "counter-punch", "next-question"];
  const expectedCopyKitPositions = ["1", "2", "3"];

  if (countOccurrences(battleReplayLensHtml, 'data-testid="bbti-battle-replay-lens"') !== 1) {
    addError("Battle replay lens visual scene: expected exactly one replay lens");
  }
  if (!battleReplayLensHtml.includes('data-bbti-battle-replay-lens-version="bbti-battle-replay-lens-v1"')) {
    addError("Battle replay lens visual scene: expected replay lens version");
  }
  if (!battleReplayLensHtml.includes('data-bbti-battle-replay-lens-case-source="film-room"')) {
    addError("Battle replay lens visual scene: expected film-room case source");
  }
  if (!battleReplayLensHtml.includes('data-bbti-battle-replay-lens-count="4"')) {
    addError("Battle replay lens visual scene: expected four steps");
  }
  if (countOccurrences(battleReplayLensHtml, 'data-testid="bbti-battle-replay-copy-kit"') !== 1) {
    addError("Battle replay lens visual scene: expected exactly one replay copy kit");
  }
  if (!battleReplayLensHtml.includes('data-bbti-battle-replay-copy-kit-version="bbti-battle-replay-copy-kit-v1"')) {
    addError("Battle replay lens visual scene: expected replay copy kit version");
  }
  if (!battleReplayLensHtml.includes('data-bbti-battle-replay-copy-kit-source-version="bbti-battle-replay-lens-v1"')) {
    addError("Battle replay lens visual scene: expected replay copy kit source version");
  }
  if (!battleReplayLensHtml.includes('data-bbti-battle-replay-copy-kit-count="3"')) {
    addError("Battle replay lens visual scene: expected three replay copy kit items");
  }
  if (JSON.stringify(stepIds) !== JSON.stringify(expectedStepIds)) {
    addError(`Battle replay lens visual scene: expected steps ${expectedStepIds.join(",")}, got ${stepIds.join(",")}`);
  }
  if (JSON.stringify(targets) !== JSON.stringify(expectedTargets)) {
    addError(`Battle replay lens visual scene: expected targets ${expectedTargets.join(",")}, got ${targets.join(",")}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Battle replay lens visual scene: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (JSON.stringify(copyKitItems) !== JSON.stringify(expectedCopyKitItems)) {
    addError(`Battle replay lens visual scene: expected copy kit items ${expectedCopyKitItems.join(",")}, got ${copyKitItems.join(",")}`);
  }
  if (JSON.stringify(copyKitPositions) !== JSON.stringify(expectedCopyKitPositions)) {
    addError(`Battle replay lens visual scene: expected copy kit positions ${expectedCopyKitPositions.join(",")}, got ${copyKitPositions.join(",")}`);
  }
  if (!battleReplayLensHtml.includes("本地单回合战术镜头，只是本场阅读，不代表外部结论或用户热度。")) {
    addError("Battle replay lens visual scene: expected local-only boundary");
  }
  if (!battleReplayLensHtml.includes("本地复盘话术包，只复用本场镜头，不代表真实赢面、外部排名或用户热度。")) {
    addError("Battle replay lens visual scene: expected replay copy kit local-only boundary");
  }
}

for (const [sceneId, actions] of Object.entries(nextPlayScenes)) {
  const sceneHtml = sceneHtmlFor(html, sceneId);
  if (!sceneHtml) {
    addError(`Next Play visual scene ${sceneId}: missing scene HTML`);
    continue;
  }

  const qaKeys = attributeValues(sceneHtml, "data-next-play-qa");
  const positions = attributeValues(sceneHtml, "data-next-play-position");
  const mobileLayouts = attributeValues(sceneHtml, "data-next-play-mobile-layout");
  const expectedPositions = actions.map((_, index) => String(index + 1));

  if (qaKeys.length !== actions.length) {
    addError(`Next Play visual scene ${sceneId}: expected ${actions.length} qa markers, got ${qaKeys.length}`);
  }
  if (new Set(qaKeys).size !== qaKeys.length) {
    addError(`Next Play visual scene ${sceneId}: duplicate data-next-play-qa markers ${JSON.stringify(qaKeys)}`);
  }
  if (JSON.stringify(positions) !== JSON.stringify(expectedPositions)) {
    addError(`Next Play visual scene ${sceneId}: expected positions ${expectedPositions.join(",")}, got ${positions.join(",")}`);
  }
  if (mobileLayouts[0] !== "primary") {
    addError(`Next Play visual scene ${sceneId}: first action must be mobile primary`);
  }
  if (mobileLayouts.slice(1).some((layout) => layout !== "compact")) {
    addError(`Next Play visual scene ${sceneId}: secondary actions must be mobile compact`);
  }
}

if (counts.deepLinkNotice < 5) addError(`visual QA HTML: expected at least 5 deep-link notices, got ${counts.deepLinkNotice}`);
if (counts.addFilesSuggestionPanel !== 1) addError(`visual QA HTML: expected 1 Add Files suggestion panel, got ${counts.addFilesSuggestionPanel}`);
if (counts.actionDock < 1) addError(`visual QA HTML: expected at least 1 result action dock, got ${counts.actionDock}`);
if (counts.arenaEventBracket !== 1) addError(`visual QA HTML: expected 1 Arena Event bracket scene, got ${counts.arenaEventBracket}`);
if (counts.battleReplayLens !== 2) addError(`visual QA HTML: expected 2 Battle Replay Lens scenes, got ${counts.battleReplayLens}`);
if (counts.caseBattleMobileStack !== 1) addError(`visual QA HTML: expected 1 Case Battle Mobile Stack scene, got ${counts.caseBattleMobileStack}`);
if (counts.challengeLaneScoreboard !== 2) addError(`visual QA HTML: expected 2 Challenge Lane Scoreboard scenes, got ${counts.challengeLaneScoreboard}`);
if (counts.challengePickReplayKit !== 3) addError(`visual QA HTML: expected 3 Challenge Pick Replay Kit scenes, got ${counts.challengePickReplayKit}`);
if (counts.challengeReceiptBoard !== 2) addError(`visual QA HTML: expected 2 challenge receipt boards, got ${counts.challengeReceiptBoard}`);
if (counts.dailyReturnRemix !== 2) addError(`visual QA HTML: expected 2 Daily Return Remix switchers, got ${counts.dailyReturnRemix}`);
if (counts.filmRoomRemixBench !== 1) addError(`visual QA HTML: expected 1 Film Room Remix Bench, got ${counts.filmRoomRemixBench}`);
if (counts.filmRoomDrill !== 1) addError(`visual QA HTML: expected 1 Film Room drill card, got ${counts.filmRoomDrill}`);
if (counts.answerPollTrend !== 1) addError(`visual QA HTML: expected 1 Answer Poll Trend section, got ${counts.answerPollTrend}`);
if (counts.entryReturnStack !== 1) addError(`visual QA HTML: expected 1 Entry return stack, got ${counts.entryReturnStack}`);
if (counts.featuredDailyReturn !== 2) addError(`visual QA HTML: expected 2 Featured Daily Return sections, got ${counts.featuredDailyReturn}`);
if (counts.returnBench !== 3) addError(`visual QA HTML: expected 3 Return Bench sections, got ${counts.returnBench}`);
if (counts.lineupChemistry !== 1) addError(`visual QA HTML: expected 1 Lineup Chemistry section, got ${counts.lineupChemistry}`);
if (counts.compareReport !== 3) addError(`visual QA HTML: expected 3 Compare report shells, got ${counts.compareReport}`);
if (counts.compareProgram !== 2) addError(`visual QA HTML: expected 2 Compare report program panels, got ${counts.compareProgram}`);
if (counts.duoRematchPrompts !== 1) addError(`visual QA HTML: expected 1 Duo Rematch Prompts panel, got ${counts.duoRematchPrompts}`);
if (counts.myTeamScoutingCard !== 1) addError(`visual QA HTML: expected 1 MyTeam scouting card, got ${counts.myTeamScoutingCard}`);
if (counts.resultScoutingCopyKit !== 2) addError(`visual QA HTML: expected 2 Result Scouting copy kits, got ${counts.resultScoutingCopyKit}`);
if (counts.resultScoutingReport !== 2) addError(`visual QA HTML: expected 2 Result Scouting reports, got ${counts.resultScoutingReport}`);
if (counts.resultScoutingLane !== 8) addError(`visual QA HTML: expected 8 Result Scouting lanes, got ${counts.resultScoutingLane}`);
if (counts.shareCard !== 1) addError(`visual QA HTML: expected 1 Share Card poster, got ${counts.shareCard}`);
if (counts.shareKits !== 4) addError(`visual QA HTML: expected 4 Share Kits shells, got ${counts.shareKits}`);
if (counts.shareLockerRoom !== 4) addError(`visual QA HTML: expected 4 Share Kit Locker Room scenes, got ${counts.shareLockerRoom}`);
if (counts.shareReturnLaneCheck !== 4) addError(`visual QA HTML: expected 4 Share Return Lane Check scenes, got ${counts.shareReturnLaneCheck}`);
if (counts.shareRouteScoreboard !== 2) addError(`visual QA HTML: expected 2 Share Route Scoreboard scenes, got ${counts.shareRouteScoreboard}`);
if (counts.replayCenter !== 2) addError(`visual QA HTML: expected 2 Replay Center scenes, got ${counts.replayCenter}`);
if (counts.resultActionStack !== 1) addError(`visual QA HTML: expected 1 result action stack, got ${counts.resultActionStack}`);
if (counts.nextPlayPanel < 6) addError(`visual QA HTML: expected at least 6 next-play panels, got ${counts.nextPlayPanel}`);
if (counts.casePostgame !== 3) addError(`visual QA HTML: expected 3 case postgame cards, got ${counts.casePostgame}`);
if (counts.caseTrail < 4) addError(`visual QA HTML: expected at least 4 case trails, got ${counts.caseTrail}`);

const visualRegressionScenes = buildVisualRegressionManifestEntries(scenes, html);
const visualRegressionGroups = groupSceneIds(visualRegressionScenes, "group");
const visualRegressionRiskPacks = groupSceneIds(visualRegressionScenes, "risks");
const visualRegressionRiskCounts = Object.fromEntries(
  Object.entries(visualRegressionRiskPacks).map(([risk, sceneIds]) => [risk, sceneIds.length]),
);

if (errors.length) {
  console.error("BBTI visual QA fixture render failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const outDir = resolveOutDir();
fs.mkdirSync(outDir, { recursive: true });
const htmlPath = path.join(outDir, "index.html");
const manifestPath = path.join(outDir, "manifest.json");
fs.writeFileSync(htmlPath, html);
fs.writeFileSync(manifestPath, JSON.stringify({
  counts,
  cssFiles,
  generatedAt: new Date().toISOString(),
  htmlPath,
  manifestVersion: BBTI_VISUAL_QA_MANIFEST_VERSION,
  scenes: visualRegressionScenes,
  visualRegressionPack: {
    auditPacks: VISUAL_QA_AUDIT_PACKS,
    groups: visualRegressionGroups,
    requiredSelectorCount: visualRegressionScenes.reduce((total, scene) => total + scene.auditSelectors.length, 0),
    riskCounts: visualRegressionRiskCounts,
    riskPacks: visualRegressionRiskPacks,
    sceneCount: visualRegressionScenes.length,
    version: BBTI_VISUAL_REGRESSION_PACK_VERSION,
    viewportCount: VISUAL_QA_VIEWPORTS.length,
    viewportMatrix: VISUAL_QA_VIEWPORTS,
  },
}, null, 2));

console.log("BBTI visual QA fixtures");
console.log(`- html: ${htmlPath}`);
console.log(`- manifest: ${manifestPath}`);
console.log(`- scenes: ${scenes.length}`);
console.log(`- visual regression pack: ${BBTI_VISUAL_REGRESSION_PACK_VERSION}`);
console.log(`- audit packs: ${Object.keys(VISUAL_QA_AUDIT_PACKS).length}`);
console.log(`- css files: ${cssFiles.length}`);
console.log("OK: visual QA fixtures rendered with stable selectors.");
