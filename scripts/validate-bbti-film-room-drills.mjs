#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const ROOT = process.cwd();
const nodeRequire = createRequire(import.meta.url);
const runtimeModuleCache = new Map();
const errors = [];
const EXPECTED_STEPS = ["evidence", "tension", "cross-exam", "insight"];
const FORBIDDEN_TERMS = [
  "VAR",
  "点球",
  "德比",
  "FUT",
  "足球",
  "官方",
  "官方认证",
  "公认第一",
  "唯一",
  "碾压",
  "真实热度",
  "实时热度",
  "全网",
  "用户投票",
  "播放量",
  "热搜",
  "多数球迷",
  "大家都选",
  "sourceId",
  "sourceVersion",
  "caseVersion",
];

function resolveRuntimeModule(fromPath, request) {
  if (!request.startsWith(".")) return null;

  const basePath = path.resolve(path.dirname(fromPath), request);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    path.join(basePath, "index.ts"),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
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
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  const localRequire = (request) => {
    const runtimePath = resolveRuntimeModule(absolutePath, request);
    return runtimePath ? loadRuntimeTsModule(runtimePath) : nodeRequire(request);
  };
  const wrapper = vm.runInThisContext(
    `(function(require, module, exports, __filename, __dirname) {\n${compiled.outputText}\n})`,
    { filename: absolutePath },
  );
  wrapper(localRequire, runtimeModule, runtimeModule.exports, absolutePath, path.dirname(absolutePath));
  return runtimeModule.exports;
}

function addError(message) {
  errors.push(message);
}

function assertEqual(label, actual, expected) {
  if (actual !== expected) {
    addError(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTruthy(label, value) {
  if (!value) addError(`${label}: expected a non-empty value`);
}

function assertCopyBoundaries(label, value) {
  const text = String(value ?? "");
  for (const term of FORBIDDEN_TERMS) {
    if (text.includes(term)) {
      addError(`${label}: must not include ${JSON.stringify(term)}`);
    }
  }
}

const {
  buildSharedFilmRoomClipFromKey,
  getBbtiFilmRoomDimensionLabel,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-playbook.ts"));
const {
  getBbtiFilmRoomCrossExam,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-film-room-cross-exams.ts"));
const {
  buildBbtiFilmRoomDrillCopy,
  resolveBbtiFilmRoomDrill,
} = loadRuntimeTsModule(path.join(ROOT, "src/data/bbti-film-room-drills.ts"));

if (typeof resolveBbtiFilmRoomDrill !== "function") {
  addError("resolveBbtiFilmRoomDrill must be exported");
}
if (typeof buildBbtiFilmRoomDrillCopy !== "function") {
  addError("buildBbtiFilmRoomDrillCopy must be exported");
}

if (
  typeof buildSharedFilmRoomClipFromKey === "function" &&
  typeof getBbtiFilmRoomCrossExam === "function" &&
  typeof getBbtiFilmRoomDimensionLabel === "function" &&
  typeof resolveBbtiFilmRoomDrill === "function" &&
  typeof buildBbtiFilmRoomDrillCopy === "function"
) {
  for (const clipKey of ["q12-m0", "q3-a", "q13-b"]) {
    const clip = buildSharedFilmRoomClipFromKey(clipKey);
    assertTruthy(`${clipKey} shared clip`, clip);
    if (!clip) continue;

    const crossExam = getBbtiFilmRoomCrossExam(clip);
    const dimensionLabel = getBbtiFilmRoomDimensionLabel(clip.dimension);
    const drill = resolveBbtiFilmRoomDrill({ clip, crossExam, dimensionLabel });
    const stepIds = drill.steps.map((step) => step.id);
    assertEqual(`${clipKey} step order`, JSON.stringify(stepIds), JSON.stringify(EXPECTED_STEPS));
    assertEqual(`${clipKey} step count`, drill.steps.length, 4);
    assertTruthy(`${clipKey} title`, drill.title);
    assertTruthy(`${clipKey} qaKey`, drill.qaKey);

    for (const step of drill.steps) {
      assertTruthy(`${clipKey}.${step.id}.label`, step.label);
      assertTruthy(`${clipKey}.${step.id}.text`, step.text);
      assertCopyBoundaries(`${clipKey}.${step.id}`, `${step.label}\n${step.text}`);
    }

    const payload = buildBbtiFilmRoomDrillCopy({
      code: "OAIL",
      drill,
      typeName: "空间捕食者",
    });
    for (const expected of ["BBTI 录像室加练", "证据句", "矛盾句", "质询句", "洞察句"]) {
      if (!payload.includes(expected)) {
        addError(`${clipKey} payload: missing ${JSON.stringify(expected)}`);
      }
    }
    assertCopyBoundaries(`${clipKey} payload`, payload);
  }
}

if (errors.length) {
  console.error("BBTI Film Room drill validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI Film Room drill validation");
console.log("- drill fixture clips: 3");
console.log(`- required steps: ${EXPECTED_STEPS.join(", ")}`);
console.log(`- forbidden terms: ${FORBIDDEN_TERMS.length}`);
console.log("OK: Film Room drill cards stay four-step, basketball-native, and copy-safe.");
