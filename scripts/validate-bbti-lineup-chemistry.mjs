#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(path.join(ROOT, "package.json"));
const runtimeModuleCache = new Map();
const errors = [];

const FORBIDDEN_TERMS = [
  "FBTI",
  "football",
  "soccer",
  "足球",
  "VAR",
  "FUT",
  "点球",
  "德比",
  "pitch",
  "penalty",
  "真实热度",
  "实时热度",
  "全网",
  "用户投票",
  "官方认证",
  "公认第一",
  "sourceId",
  "sourceVersion",
];

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

function addError(message) {
  errors.push(message);
}

function checkText(label, value, maxLength = 96) {
  if (!value?.trim()) {
    addError(`${label} must be non-empty`);
    return;
  }

  if (value.length > maxLength) {
    addError(`${label} is too long (${value.length} > ${maxLength})`);
  }

  for (const term of FORBIDDEN_TERMS) {
    if (value.includes(term)) {
      addError(`${label} contains forbidden term "${term}"`);
    }
  }
}

const {
  BBTI_LINEUP_CHEMISTRY_VERSION,
  buildBbtiLineupChemistryCopy,
  resolveBbtiLineupChemistryBrief,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-lineup-chemistry.ts"));
const {
  BBTI_CODES,
  getBbtiCompareReport,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-rivalries.ts"));
const {
  getBbtiType,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti.ts"));

const cases = BBTI_CODES.flatMap((codeA) => {
  const type = getBbtiType(codeA);
  return [
    { codeA, codeB: type.compatibility, id: "compatibility" },
    { codeA, codeB: type.nemesis, id: "nemesis" },
  ];
});

const seenQaKeys = new Set();

for (const item of cases) {
  const report = getBbtiCompareReport(item.codeA, item.codeB);
  const brief = resolveBbtiLineupChemistryBrief({ id: item.id, report });
  const label = `${item.id}:${item.codeA}-${item.codeB}`;

  if (brief.version !== BBTI_LINEUP_CHEMISTRY_VERSION) {
    addError(`${label} has wrong version "${brief.version}"`);
  }
  if (brief.id !== item.id) {
    addError(`${label} has wrong id "${brief.id}"`);
  }
  if (!brief.qaKey.includes(item.id) || !brief.qaKey.includes(report.codeA) || !brief.qaKey.includes(report.codeB)) {
    addError(`${label} qaKey must include card id and both codes`);
  }
  if (seenQaKeys.has(brief.qaKey)) {
    addError(`${label} duplicate qaKey "${brief.qaKey}"`);
  }
  seenQaKeys.add(brief.qaKey);

  checkText(`${label}.roleTitle`, brief.roleTitle);
  checkText(`${label}.roleSplit`, brief.roleSplit);
  checkText(`${label}.frictionTitle`, brief.frictionTitle);
  checkText(`${label}.frictionPlan`, brief.frictionPlan);
  checkText(`${label}.actionTitle`, brief.actionTitle);
  checkText(`${label}.fitAction`, brief.fitAction);
  checkText(`${label}.copyCue`, brief.copyCue);

  const copy = buildBbtiLineupChemistryCopy({
    brief,
    report,
    url: `https://example.test/?a=${report.codeA}&b=${report.codeB}`,
  });
  checkText(`${label}.copy`, copy, 620);
  if (!copy.includes(brief.roleSplit) || !copy.includes(brief.frictionPlan) || !copy.includes(brief.fitAction)) {
    addError(`${label} copy must include role split, friction plan, and fit action`);
  }
}

console.log("BBTI Lineup Chemistry validation");
console.log(`- contract: ${BBTI_LINEUP_CHEMISTRY_VERSION}`);
console.log(`- fixture cases: ${cases.length}`);
console.log(`- forbidden terms: ${FORBIDDEN_TERMS.length}`);

if (errors.length) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("OK: Lineup Chemistry briefs stay short, basketball-native, and link-light.");
