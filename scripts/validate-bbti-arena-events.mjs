#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const ROOT = process.cwd();
const SOURCE_RELATIVE_PATH = "src/data/bbti-arena-events.ts";
const nodeRequire = createRequire(import.meta.url);
const REQUIRED_EVENT_FIELDS = [
  "id",
  "title",
  "tag",
  "context",
  "venue",
  "pressureTier",
  "audienceFrame",
  "court",
  "stakes",
  "recommendedCategory",
  "scenario",
  "instinct",
  "pressureTest",
  "blindSpot",
  "groupChatPrompt",
];
const STATIC_EVENT_FIELDS = new Set([
  "id",
  "title",
  "tag",
  "context",
  "venue",
  "pressureTier",
  "audienceFrame",
  "court",
  "stakes",
  "recommendedCategory",
  "scenario",
]);
const CHALLENGE_CATEGORIES = new Set(["同温层局", "反向审判", "破防加赛"]);
const LENS_KINDS = new Set(["venue", "pressureTier", "audienceFrame"]);
const EXPECTED_BBTI_CODES = ["O", "D"].flatMap((style) =>
  ["A", "E"].flatMap((evidence) =>
    ["I", "T"].flatMap((role) => ["L", "R"].map((ambition) => `${style}${evidence}${role}${ambition}`)),
  ),
);
const DAILY_RETURN_VALIDATION_DATE = new Date("2026-05-30T12:00:00.000Z");
const REQUIRED_BRACKET_ROUTES = [
  { id: "event-tipoff", target: "daily-event" },
  { id: "challenge-branch", target: "challenge" },
  { id: "share-return", target: "share" },
];
const REQUIRED_EVENT_INVARIANTS = {
  "game-7": {
    context: "clutch",
    pressureTier: "elimination",
    audienceFrame: "elimination-pressure",
    recommendedCategory: "破防加赛",
  },
  "trade-deadline": {
    context: "front-office",
    venue: "off-court",
    audienceFrame: "front-office-table",
    recommendedCategory: "反向审判",
  },
  "rebuild-year": {
    context: "development",
    venue: "home",
    pressureTier: "medium",
    audienceFrame: "development-patience",
    recommendedCategory: "同温层局",
  },
  "finals-adjustment": {
    context: "finals",
    venue: "away",
    pressureTier: "high",
    audienceFrame: "road-skepticism",
    recommendedCategory: "破防加赛",
  },
  "media-day-storm": {
    context: "media",
    venue: "off-court",
    audienceFrame: "public-opinion",
    recommendedCategory: "反向审判",
  },
  "road-back-to-back": {
    context: "road",
    venue: "away",
    pressureTier: "high",
    audienceFrame: "road-skepticism",
    recommendedCategory: "同温层局",
  },
  "locker-room-friction": {
    context: "locker-room",
    venue: "off-court",
    audienceFrame: "locker-room-trust",
    recommendedCategory: "反向审判",
  },
};
const FORBIDDEN_TERMS = [
  "FBTI",
  "Football Brain Type Indicator",
  "football",
  "soccer",
  "足球",
  "足球人格",
  "绿茵",
  "足坛",
  "VAR",
  "FUT",
  "Transfermarkt",
  "FotMob",
  "UEFA",
  "FIFA",
  "世界杯",
  "欧冠",
  "欧洲杯",
  "英超",
  "西甲",
  "意甲",
  "法甲",
  "皇马",
  "巴萨",
  "曼联",
  "AC米兰",
  "国米",
  "PSG",
  "诺坎普",
  "伯纳乌",
  "银河战舰",
  "点球",
  "角球",
  "任意球",
  "越位",
  "红牌",
  "黄牌",
  "传中",
  "tiki-taka",
  "门将",
  "球门",
  "梅西",
  "C罗",
  "C 罗",
  "Cristiano",
  "Ronaldo",
  "罗纳尔多",
  "贝利",
  "马拉多纳",
  "齐达内",
  "齐祖",
  "小罗",
  "姆巴佩",
  "哈兰德",
  "内马尔",
  "卡卡",
  "菲戈",
  "托蒂",
  "杰拉德",
  "贝克汉姆",
  "伊布",
  "亨利",
  "莱万",
  "真实投票",
  "真实用户",
  "用户投票",
  "投票数据",
  "实时",
  "全站",
];

const errors = [];
const warnings = [];
const runtimeModuleCache = new Map();

function readSourceFile(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const text = fs.readFileSync(filePath, "utf8");
  return {
    text,
    sourceFile: ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS),
  };
}

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

function loadDataModule(relativePath) {
  return loadRuntimeTsModule(path.join(ROOT, relativePath));
}

function relativeFileName(sourceFile) {
  return path.relative(ROOT, sourceFile.fileName);
}

function addIssue(list, sourceFile, node, message) {
  if (!node) {
    list.push(`${relativeFileName(sourceFile)}: ${message}`);
    return;
  }

  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  list.push(`${relativeFileName(sourceFile)}:${position.line + 1}:${position.character + 1} ${message}`);
}

function unwrapExpression(expression) {
  let current = expression;

  while (current) {
    if (
      ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) ||
      ts.isParenthesizedExpression(current)
    ) {
      current = current.expression;
      continue;
    }

    if (typeof ts.isSatisfiesExpression === "function" && ts.isSatisfiesExpression(current)) {
      current = current.expression;
      continue;
    }

    return current;
  }

  return expression;
}

function findVariableDeclaration(sourceFile, variableName) {
  let match = null;

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName
    ) {
      match = node;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return match;
}

function findTypeAliasDeclaration(sourceFile, typeName) {
  let match = null;

  function visit(node) {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
      match = node;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return match;
}

function findFunctionDeclaration(sourceFile, functionName) {
  let match = null;

  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === functionName) {
      match = node;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return match;
}

function propertyNameToString(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return null;
}

function expressionToString(expression) {
  const unwrapped = unwrapExpression(expression);
  if (ts.isStringLiteral(unwrapped) || ts.isNoSubstitutionTemplateLiteral(unwrapped)) {
    return unwrapped.text;
  }

  return null;
}

function expressionHasContent(expression) {
  return unwrapExpression(expression).getText().trim().length > 0;
}

function checkForbiddenText(sourceFile, node, label, value) {
  if (!value) return;

  for (const term of FORBIDDEN_TERMS) {
    if (value.includes(term)) {
      addIssue(errors, sourceFile, node, `${label} contains forbidden Arena Event copy term "${term}"`);
    }
  }
}

function fieldExpressionText(sourceFile, record, fieldName) {
  const field = record.fields.get(fieldName);
  return field ? field.expression.getText(sourceFile) : "";
}

function objectFields(sourceFile, objectLiteral) {
  const fields = new Map();

  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      addIssue(errors, sourceFile, property, "object entries only support direct property assignments");
      continue;
    }

    const name = propertyNameToString(property.name);
    if (!name) {
      addIssue(errors, sourceFile, property.name, "property names must be static");
      continue;
    }

    if (fields.has(name)) {
      addIssue(errors, sourceFile, property.name, `duplicate property "${name}"`);
    }

    fields.set(name, {
      expression: unwrapExpression(property.initializer),
      node: property,
    });
  }

  return fields;
}

function parseStringUnion(sourceFile, typeName) {
  const declaration = findTypeAliasDeclaration(sourceFile, typeName);
  if (!declaration) {
    addIssue(errors, sourceFile, null, `missing ${typeName}`);
    return new Set();
  }

  if (!ts.isUnionTypeNode(declaration.type)) {
    addIssue(errors, sourceFile, declaration, `${typeName} must be a string literal union`);
    return new Set();
  }

  const values = new Set();
  for (const typeNode of declaration.type.types) {
    if (
      !ts.isLiteralTypeNode(typeNode) ||
      !ts.isStringLiteral(typeNode.literal)
    ) {
      addIssue(errors, sourceFile, typeNode, `${typeName} only supports string literal values`);
      continue;
    }

    values.add(typeNode.literal.text);
  }

  return values;
}

function parseArrayVariable(sourceFile, variableName) {
  const declaration = findVariableDeclaration(sourceFile, variableName);
  if (!declaration?.initializer) {
    addIssue(errors, sourceFile, declaration, `missing ${variableName}`);
    return [];
  }

  const initializer = unwrapExpression(declaration.initializer);
  if (!ts.isArrayLiteralExpression(initializer)) {
    addIssue(errors, sourceFile, declaration, `${variableName} must be an array literal`);
    return [];
  }

  return initializer.elements.flatMap((element) => {
    const entry = unwrapExpression(element);
    if (!ts.isObjectLiteralExpression(entry)) {
      addIssue(errors, sourceFile, element, `${variableName} entries must be object literals`);
      return [];
    }

    return [{ node: element, fields: objectFields(sourceFile, entry) }];
  });
}

function parseRecordVariable(sourceFile, variableName) {
  const declaration = findVariableDeclaration(sourceFile, variableName);
  if (!declaration?.initializer) {
    addIssue(errors, sourceFile, declaration, `missing ${variableName}`);
    return new Map();
  }

  const initializer = unwrapExpression(declaration.initializer);
  if (!ts.isObjectLiteralExpression(initializer)) {
    addIssue(errors, sourceFile, declaration, `${variableName} must be an object literal`);
    return new Map();
  }

  const fields = objectFields(sourceFile, initializer);
  const values = new Map();
  for (const [key, field] of fields.entries()) {
    const value = expressionToString(field.expression);
    if (!value?.trim()) {
      addIssue(errors, sourceFile, field.node, `${variableName}.${key} must be a non-empty string`);
      continue;
    }

    checkForbiddenText(sourceFile, field.node, `${variableName}.${key}`, value);
    values.set(key, { value, node: field.node });
  }

  return values;
}

function parseReturnArray(sourceFile, functionName) {
  const declaration = findFunctionDeclaration(sourceFile, functionName);
  if (!declaration?.body) {
    addIssue(errors, sourceFile, declaration, `missing ${functionName}`);
    return [];
  }

  const returnStatement = declaration.body.statements.find(ts.isReturnStatement);
  const expression = returnStatement?.expression ? unwrapExpression(returnStatement.expression) : null;
  if (!expression || !ts.isArrayLiteralExpression(expression)) {
    addIssue(errors, sourceFile, returnStatement ?? declaration, `${functionName} must return an array literal`);
    return [];
  }

  return expression.elements.flatMap((element) => {
    const entry = unwrapExpression(element);
    if (!ts.isObjectLiteralExpression(entry)) {
      addIssue(errors, sourceFile, element, `${functionName} entries must be object literals`);
      return [];
    }

    return [{ node: element, fields: objectFields(sourceFile, entry) }];
  });
}

function fieldString(sourceFile, record, fieldName, recordLabel) {
  const field = record.fields.get(fieldName);
  if (!field) {
    addIssue(errors, sourceFile, record.node, `${recordLabel}.${fieldName} is required`);
    return null;
  }

  if (STATIC_EVENT_FIELDS.has(fieldName)) {
    const value = expressionToString(field.expression);
    if (!value?.trim()) {
      addIssue(errors, sourceFile, field.node, `${recordLabel}.${fieldName} must be a non-empty string literal`);
      return null;
    }

    return value;
  }

  if (!expressionHasContent(field.expression)) {
    addIssue(errors, sourceFile, field.node, `${recordLabel}.${fieldName} is required`);
  }

  return expressionToString(field.expression);
}

function expectAllowed(sourceFile, field, value, allowedValues, label) {
  if (!value || allowedValues.has(value)) return;
  addIssue(errors, sourceFile, field.node, `${label} must be one of: ${Array.from(allowedValues).join(", ")}`);
}

function assertRecordCoverage(sourceFile, recordName, record, allowedValues) {
  const seen = new Set();
  for (const [key] of record.entries()) {
    if (!allowedValues.has(key)) {
      addIssue(errors, sourceFile, record.get(key).node, `${recordName}.${key} is not in its type union`);
      continue;
    }

    seen.add(key);
  }

  for (const allowedValue of allowedValues) {
    if (!seen.has(allowedValue)) {
      addIssue(errors, sourceFile, null, `${recordName} is missing label for "${allowedValue}"`);
    }
  }
}

function validateContextOptions(sourceFile, entries, contextValues) {
  const seen = new Set();

  for (const entry of entries) {
    const idField = entry.fields.get("id");
    const labelField = entry.fields.get("label");
    const shortLabelField = entry.fields.get("shortLabel");
    const id = idField ? expressionToString(idField.expression) : null;

    if (!id) {
      addIssue(errors, sourceFile, entry.node, "context option id is required");
      continue;
    }

    if (seen.has(id)) {
      addIssue(errors, sourceFile, idField.node, `duplicate context option "${id}"`);
    }
    seen.add(id);

    expectAllowed(sourceFile, idField, id, contextValues, `context option "${id}"`);

    for (const [fieldName, field] of [["label", labelField], ["shortLabel", shortLabelField]]) {
      const value = field ? expressionToString(field.expression) : null;
      if (!value?.trim()) {
        addIssue(errors, sourceFile, entry.node, `context option "${id}".${fieldName} is required`);
      } else {
        checkForbiddenText(sourceFile, field.node, `context option "${id}".${fieldName}`, value);
      }
    }
  }

  for (const context of contextValues) {
    if (!seen.has(context)) {
      addIssue(errors, sourceFile, null, `BBTI_ARENA_EVENT_CONTEXTS is missing "${context}"`);
    }
  }
}

function validateLensFilters(sourceFile, entries, lensIds, allowedByKind, events) {
  const seen = new Set();

  for (const entry of entries) {
    const idField = entry.fields.get("id");
    const labelField = entry.fields.get("label");
    const kindField = entry.fields.get("kind");
    const valueField = entry.fields.get("value");
    const id = idField ? expressionToString(idField.expression) : null;
    const label = labelField ? expressionToString(labelField.expression) : null;
    const kind = kindField ? expressionToString(kindField.expression) : null;
    const value = valueField ? expressionToString(valueField.expression) : null;

    if (!id || !kind || !value) {
      addIssue(errors, sourceFile, entry.node, "lens filters require id, kind, and value");
      continue;
    }

    if (seen.has(id)) {
      addIssue(errors, sourceFile, idField.node, `duplicate lens filter "${id}"`);
    }
    seen.add(id);

    if (!label?.trim()) {
      addIssue(errors, sourceFile, entry.node, `lens filter "${id}".label is required`);
    } else {
      checkForbiddenText(sourceFile, labelField.node, `lens filter "${id}".label`, label);
    }

    expectAllowed(sourceFile, idField, id, lensIds, `lens filter "${id}".id`);
    expectAllowed(sourceFile, kindField, kind, LENS_KINDS, `lens filter "${id}".kind`);

    const allowedValues = allowedByKind[kind];
    if (allowedValues) {
      expectAllowed(sourceFile, valueField, value, allowedValues, `lens filter "${id}".value`);
    }

    const matches = events.filter((event) => event[kind] === value);
    if (!matches.length) {
      addIssue(errors, sourceFile, valueField, `lens filter "${id}" does not match any Arena Event`);
    }
  }

  for (const id of lensIds) {
    if (!seen.has(id)) {
      addIssue(errors, sourceFile, null, `BBTI_ARENA_LENS_FILTERS is missing "${id}"`);
    }
  }
}

function validateSemanticPairing(sourceFile, event) {
  const {
    id,
    node,
    context,
    venue,
    pressureTier,
    audienceFrame,
    scenario,
    stakes,
    tag,
    title,
    recommendedCategory,
  } = event;

  if (audienceFrame === "home-identity" && venue !== "home") {
    addIssue(errors, sourceFile, node, `${id}: home-identity requires venue "home"`);
  }

  if (audienceFrame === "road-skepticism" && venue !== "away") {
    addIssue(errors, sourceFile, node, `${id}: road-skepticism requires venue "away"`);
  }

  if (audienceFrame === "elimination-pressure" && pressureTier !== "elimination") {
    addIssue(errors, sourceFile, node, `${id}: elimination-pressure requires pressureTier "elimination"`);
  }

  if (pressureTier === "elimination" && audienceFrame !== "elimination-pressure") {
    addIssue(errors, sourceFile, node, `${id}: pressureTier "elimination" requires audienceFrame "elimination-pressure"`);
  }

  if (audienceFrame === "public-opinion" && context !== "media") {
    addIssue(errors, sourceFile, node, `${id}: public-opinion should be a media event`);
  }

  if (audienceFrame === "front-office-table" && (context !== "front-office" || venue !== "off-court")) {
    addIssue(errors, sourceFile, node, `${id}: front-office-table requires front-office/off-court`);
  }

  if (audienceFrame === "development-patience" && context !== "development") {
    addIssue(errors, sourceFile, node, `${id}: development-patience should be a development event`);
  }

  if (audienceFrame === "locker-room-trust" && context !== "locker-room") {
    addIssue(errors, sourceFile, node, `${id}: locker-room-trust should be a locker-room event`);
  }

  if (venue === "off-court" && /主场|客场|中立球馆/.test(event.court ?? "")) {
    addIssue(errors, sourceFile, node, `${id}: off-court events should not use home/away/neutral arena court copy`);
  }

  const searchableText = [title, tag, scenario, stakes].filter(Boolean).join(" ");
  if (/(2-2|G5|第五场)/.test(searchableText) && pressureTier === "elimination") {
    addIssue(errors, sourceFile, node, `${id}: a 2-2/G5 game state must not be marked as elimination pressure`);
  }

  if (/(抢七|Game 7|G7|一球定生死)/.test(searchableText) && pressureTier !== "elimination") {
    addIssue(errors, sourceFile, node, `${id}: Game 7 or one-possession survival copy should be marked as elimination pressure`);
  }

  const invariant = REQUIRED_EVENT_INVARIANTS[id];
  if (invariant) {
    for (const [fieldName, expectedValue] of Object.entries(invariant)) {
      if (event[fieldName] !== expectedValue) {
        addIssue(errors, sourceFile, node, `${id}.${fieldName} must remain "${expectedValue}"`);
      }
    }
  }

  if (recommendedCategory && !CHALLENGE_CATEGORIES.has(recommendedCategory)) {
    addIssue(errors, sourceFile, node, `${id}: recommendedCategory is not a valid challenge category`);
  }
}

function validateEvents(sourceFile, entries, allowedValues) {
  const seenIds = new Set();
  const seenTitles = new Map();
  const seenTags = new Map();
  const parsedEvents = [];

  for (const entry of entries) {
    for (const fieldName of REQUIRED_EVENT_FIELDS) {
      if (!entry.fields.has(fieldName)) {
        addIssue(errors, sourceFile, entry.node, `event.${fieldName} is required`);
      }
    }

    const id = fieldString(sourceFile, entry, "id", "event") ?? "";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      addIssue(errors, sourceFile, entry.fields.get("id")?.node ?? entry.node, `event id "${id}" must be kebab-case`);
    }

    if (seenIds.has(id)) {
      addIssue(errors, sourceFile, entry.fields.get("id")?.node ?? entry.node, `duplicate event id "${id}"`);
    }
    seenIds.add(id);

    const event = {
      id,
      node: entry.node,
      title: fieldString(sourceFile, entry, "title", id),
      tag: fieldString(sourceFile, entry, "tag", id),
      context: fieldString(sourceFile, entry, "context", id),
      venue: fieldString(sourceFile, entry, "venue", id),
      pressureTier: fieldString(sourceFile, entry, "pressureTier", id),
      audienceFrame: fieldString(sourceFile, entry, "audienceFrame", id),
      court: fieldString(sourceFile, entry, "court", id),
      stakes: fieldString(sourceFile, entry, "stakes", id),
      recommendedCategory: fieldString(sourceFile, entry, "recommendedCategory", id),
      scenario: fieldString(sourceFile, entry, "scenario", id),
      court: fieldString(sourceFile, entry, "court", id),
    };

    for (const fieldName of STATIC_EVENT_FIELDS) {
      const field = entry.fields.get(fieldName);
      const value = field ? expressionToString(field.expression) : null;
      checkForbiddenText(sourceFile, field?.node ?? entry.node, `${id}.${fieldName}`, value);
    }

    for (const fieldName of ["instinct", "pressureTest", "blindSpot", "groupChatPrompt"]) {
      fieldString(sourceFile, entry, fieldName, id);
      const field = entry.fields.get(fieldName);
      if (field) {
        checkForbiddenText(sourceFile, field.node, `${id}.${fieldName}`, field.expression.getText(sourceFile));
      }
    }

    if (event.title) {
      if (seenTitles.has(event.title)) {
        addIssue(errors, sourceFile, entry.fields.get("title")?.node ?? entry.node, `duplicate event title "${event.title}"`);
      }
      seenTitles.set(event.title, id);
    }

    if (event.tag) {
      if (seenTags.has(event.tag)) {
        addIssue(warnings, sourceFile, entry.fields.get("tag")?.node ?? entry.node, `duplicate event tag "${event.tag}"`);
      }
      seenTags.set(event.tag, id);
    }

    const groupChatPromptText = fieldExpressionText(sourceFile, entry, "groupChatPrompt");
    if (!groupChatPromptText.includes("code")) {
      addIssue(errors, sourceFile, entry.fields.get("groupChatPrompt")?.node ?? entry.node, `${id}.groupChatPrompt must include code context`);
    }

    expectAllowed(sourceFile, entry.fields.get("context"), event.context, allowedValues.contexts, `${id}.context`);
    expectAllowed(sourceFile, entry.fields.get("venue"), event.venue, allowedValues.venues, `${id}.venue`);
    expectAllowed(sourceFile, entry.fields.get("pressureTier"), event.pressureTier, allowedValues.pressureTiers, `${id}.pressureTier`);
    expectAllowed(sourceFile, entry.fields.get("audienceFrame"), event.audienceFrame, allowedValues.audienceFrames, `${id}.audienceFrame`);
    expectAllowed(sourceFile, entry.fields.get("recommendedCategory"), event.recommendedCategory, CHALLENGE_CATEGORIES, `${id}.recommendedCategory`);

    parsedEvents.push(event);
  }

  if (parsedEvents.length < 7) {
    addIssue(errors, sourceFile, null, `expected at least 7 Arena Events, found ${parsedEvents.length}`);
  }

  for (const context of allowedValues.contexts) {
    if (!parsedEvents.some((event) => event.context === context)) {
      addIssue(warnings, sourceFile, null, `no Arena Event currently uses context "${context}"`);
    }
  }

  for (const event of parsedEvents) {
    validateSemanticPairing(sourceFile, event);
  }

  return parsedEvents;
}

function validateDailyReturnCaseContext(sourceFile) {
  let checkedCount = 0;

  try {
    const { getBbtiDailyReturnPlay } = loadDataModule("src/data/bbti-daily-return.ts");

    if (typeof getBbtiDailyReturnPlay !== "function") {
      addIssue(errors, sourceFile, null, "getBbtiDailyReturnPlay must be exported for entry-page daily return validation");
      return checkedCount;
    }

    for (const code of EXPECTED_BBTI_CODES) {
      const dailyReturn = getBbtiDailyReturnPlay(code, DAILY_RETURN_VALIDATION_DATE);
      const event = dailyReturn?.event;
      const featuredChallenge = dailyReturn?.featuredChallenge;
      const caseContext = dailyReturn?.caseContext;

      if (!event) {
        addIssue(errors, sourceFile, null, `${code}: daily return must resolve an Arena Event`);
        continue;
      }

      if (!featuredChallenge) {
        addIssue(errors, sourceFile, null, `${code}: daily return must resolve a featured challenge`);
        continue;
      }

      if (featuredChallenge.category !== event.recommendedCategory) {
        addIssue(
          errors,
          sourceFile,
          null,
          `${code}: daily featured challenge category "${featuredChallenge.category}" must match event recommendedCategory "${event.recommendedCategory}"`,
        );
      }

      if (!caseContext) {
        addIssue(errors, sourceFile, null, `${code}: daily return must hydrate a challenge case context`);
        continue;
      }

      if (caseContext.source !== "arena-event") {
        addIssue(errors, sourceFile, null, `${code}: daily return caseContext must be arena-event, got ${caseContext.source}`);
      }

      if (caseContext.code !== code) {
        addIssue(errors, sourceFile, null, `${code}: daily return caseContext code mismatch`);
      }

      if (caseContext.eventId !== event.id) {
        addIssue(errors, sourceFile, null, `${code}: daily return caseContext eventId must match ${event.id}`);
      }

      if (caseContext.challengeMatchupId !== featuredChallenge.matchupId) {
        addIssue(errors, sourceFile, null, `${code}: daily return caseContext challengeMatchupId must match featured challenge`);
      }

      checkedCount += 1;
    }
  } catch (error) {
    addIssue(errors, sourceFile, null, `daily return runtime validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return checkedCount;
}

function validateArenaEventBracket(sourceFile) {
  let checkedCount = 0;

  try {
    const {
      BBTI_ARENA_EVENT_BRACKET_BOUNDARY,
      BBTI_ARENA_EVENT_BRACKET_VERSION,
      getBbtiArenaEvents,
      resolveBbtiArenaEventBracket,
    } = loadDataModule("src/data/bbti-arena-events.ts");
    const { getBbtiChallengeMatchups } = loadDataModule("src/data/bbti-challenges.ts");

    if (BBTI_ARENA_EVENT_BRACKET_VERSION !== "bbti-arena-event-bracket-v1") {
      addIssue(errors, sourceFile, null, `Arena Event bracket version mismatch: ${BBTI_ARENA_EVENT_BRACKET_VERSION}`);
    }
    if (BBTI_ARENA_EVENT_BRACKET_BOUNDARY !== "本地情境路线树，不代表真实赛程、真实热度或用户行为。") {
      addIssue(errors, sourceFile, null, "Arena Event bracket boundary must stay explicit and local-only");
    }
    if (typeof resolveBbtiArenaEventBracket !== "function") {
      addIssue(errors, sourceFile, null, "resolveBbtiArenaEventBracket must be exported");
      return checkedCount;
    }

    for (const code of EXPECTED_BBTI_CODES) {
      const events = getBbtiArenaEvents(code);
      const challenges = getBbtiChallengeMatchups(code);

      for (const event of events) {
        const challenge = challenges.find((item) => item.category === event.recommendedCategory) ?? challenges[0];
        if (!challenge) {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: missing challenge for bracket`);
          continue;
        }

        const bracket = resolveBbtiArenaEventBracket({ challenge, code, event });
        if (bracket.version !== "bbti-arena-event-bracket-v1") {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: bracket version mismatch`);
        }
        if (bracket.code !== code) {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: bracket code mismatch`);
        }
        if (bracket.eventId !== event.id) {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: bracket eventId mismatch`);
        }
        if (bracket.challengeMatchupId !== challenge.matchupId) {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: bracket challenge mismatch`);
        }
        if (bracket.recommendedCategory !== event.recommendedCategory) {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: bracket category mismatch`);
        }
        if (bracket.boundary !== BBTI_ARENA_EVENT_BRACKET_BOUNDARY) {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: bracket boundary mismatch`);
        }
        if (bracket.routeCount !== REQUIRED_BRACKET_ROUTES.length || bracket.routes?.length !== REQUIRED_BRACKET_ROUTES.length) {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: bracket must expose exactly ${REQUIRED_BRACKET_ROUTES.length} routes`);
          continue;
        }

        const routeIds = bracket.routes.map((route) => route.id);
        if (new Set(routeIds).size !== routeIds.length) {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: duplicate bracket route ids ${routeIds.join(",")}`);
        }
        for (const [index, expected] of REQUIRED_BRACKET_ROUTES.entries()) {
          const route = bracket.routes[index];
          if (route.id !== expected.id) {
            addIssue(errors, sourceFile, null, `${code}:${event.id}: route ${index + 1} must be ${expected.id}, got ${route.id}`);
          }
          if (route.target !== expected.target) {
            addIssue(errors, sourceFile, null, `${code}:${event.id}: route ${route.id} target must be ${expected.target}, got ${route.target}`);
          }
          for (const fieldName of ["label", "title", "body", "ctaLabel"]) {
            if (!route[fieldName]?.trim()) {
              addIssue(errors, sourceFile, null, `${code}:${event.id}: route ${route.id}.${fieldName} is required`);
            }
            checkForbiddenText(sourceFile, null, `${code}:${event.id}:${route.id}.${fieldName}`, route[fieldName]);
          }
        }
        if (!bracket.copyText?.includes(BBTI_ARENA_EVENT_BRACKET_BOUNDARY)) {
          addIssue(errors, sourceFile, null, `${code}:${event.id}: bracket copy must include local-only boundary`);
        }
        for (const term of ["真实赛程", "真实热度", "用户行为"]) {
          if (!bracket.copyText.includes(term)) {
            addIssue(errors, sourceFile, null, `${code}:${event.id}: bracket copy boundary must mention ${term}`);
          }
        }

        checkedCount += 1;
      }
    }
  } catch (error) {
    addIssue(errors, sourceFile, null, `Arena Event bracket runtime validation failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return checkedCount;
}

const { sourceFile } = readSourceFile(SOURCE_RELATIVE_PATH);

const contexts = parseStringUnion(sourceFile, "BbtiArenaEventContext");
const venues = parseStringUnion(sourceFile, "BbtiArenaVenue");
const pressureTiers = parseStringUnion(sourceFile, "BbtiArenaPressureTier");
const audienceFrames = parseStringUnion(sourceFile, "BbtiArenaAudienceFrame");
const lensIds = parseStringUnion(sourceFile, "BbtiArenaLensFilterId");
const contextOptions = parseArrayVariable(sourceFile, "BBTI_ARENA_EVENT_CONTEXTS");
const lensFilters = parseArrayVariable(sourceFile, "BBTI_ARENA_LENS_FILTERS");
const venueLabels = parseRecordVariable(sourceFile, "BBTI_ARENA_VENUE_LABELS");
const pressureLabels = parseRecordVariable(sourceFile, "BBTI_ARENA_PRESSURE_LABELS");
const audienceFrameLabels = parseRecordVariable(sourceFile, "BBTI_ARENA_AUDIENCE_FRAME_LABELS");
const eventEntries = parseReturnArray(sourceFile, "getBbtiArenaEvents");

assertRecordCoverage(sourceFile, "BBTI_ARENA_VENUE_LABELS", venueLabels, venues);
assertRecordCoverage(sourceFile, "BBTI_ARENA_PRESSURE_LABELS", pressureLabels, pressureTiers);
assertRecordCoverage(sourceFile, "BBTI_ARENA_AUDIENCE_FRAME_LABELS", audienceFrameLabels, audienceFrames);
validateContextOptions(sourceFile, contextOptions, contexts);

const events = validateEvents(sourceFile, eventEntries, {
  contexts,
  venues,
  pressureTiers,
  audienceFrames,
});

validateLensFilters(sourceFile, lensFilters, lensIds, {
  venue: venues,
  pressureTier: pressureTiers,
  audienceFrame: audienceFrames,
}, events);
const dailyReturnCases = validateDailyReturnCaseContext(sourceFile);
const bracketRoutes = validateArenaEventBracket(sourceFile);

console.log("BBTI Arena Event validation");
console.log(`- events: ${events.length}`);
console.log(`- contexts: ${contexts.size}`);
console.log(`- lens filters: ${lensFilters.length}`);
console.log(`- daily return case contexts: ${dailyReturnCases}`);
console.log(`- arena event brackets: ${bracketRoutes}`);
console.log(`- forbidden term checks: ${FORBIDDEN_TERMS.length}`);

if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (errors.length) {
  console.error("\nErrors:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log("\nOK: Arena Event metadata is internally consistent.");
}
