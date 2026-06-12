#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const BBTI_TYPES_RELATIVE_PATH = "src/data/bbti.ts";
const MATCHUPS_RELATIVE_PATH = "src/data/matchups.ts";
const FIXTURES_RELATIVE_PATH = "src/data/bbti-challenge-fixtures.ts";
const CHALLENGES_RELATIVE_PATH = "src/data/bbti-challenges.ts";
const EVIDENCE_RELATIVE_PATH = "src/data/bbti-challenge-evidence.ts";

const EXPECTED_BBTI_CODES = ["O", "D"].flatMap((style) =>
  ["A", "E"].flatMap((evidence) =>
    ["I", "T"].flatMap((role) => ["L", "R"].map((ambition) => `${style}${evidence}${role}${ambition}`)),
  ),
);
const EXPECTED_CATEGORIES = ["同温层局", "反向审判", "破防加赛"];
const REQUIRED_FIXTURE_FIELDS = ["category", "matchupId", "label", "title", "reason"];
const REQUIRED_CHALLENGE_LIBRARY_FIELDS = ["matchupId", "label", "title", "reason"];
const RIVALRY_SCRIPT_FIELDS = ["scriptOpener", "scriptConflict", "scriptCounter"];
const REQUIRED_EVIDENCE_FIELDS = [
  "pressureQuestion",
  "iconicMoment",
  "receiptA",
  "receiptB",
];
const RIVALRY_SCRIPT_MAX_LENGTH = 72;
const RIVALRY_SCRIPT_FORBIDDEN_TERMS = [
  "官方",
  "公认",
  "唯一",
  "碾压",
  "真实热度",
  "实时热度",
  "全网",
  "用户投票",
  "sourceId",
  "sourceVersion",
];
const KNOWN_CHALLENGE_FIELDS = new Set([
  "category",
  "matchupId",
  "label",
  "title",
  "reason",
  "pressureQuestion",
  "iconicMoment",
  "receiptA",
  "receiptB",
  "groupChatPrompt",
  "shareCopy",
  "scriptOpener",
  "scriptConflict",
  "scriptCounter",
  "evidenceLens",
]);
const TEXT_FIELDS = new Set([
  "category",
  "matchupId",
  "label",
  "title",
  "reason",
  "pressureQuestion",
  "iconicMoment",
  "receiptA",
  "receiptB",
  "groupChatPrompt",
  "shareCopy",
  "scriptOpener",
  "scriptConflict",
  "scriptCounter",
]);
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
  "守门员",
  "射门",
  "破门",
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
const FOOTBALL_TERM_PATTERNS = [
  /守(?:住)?球门/,
  /球门线/,
  /球门前/,
  /进球门/,
];
const BASKETBALL_CONTEXT_TERMS = [
  "篮球",
  "NBA",
  "总决赛",
  "冠军",
  "戒指",
  "季后赛",
  "回合",
  "关键球",
  "单挑",
  "硬解",
  "体系",
  "防守",
  "护框",
  "换防",
  "禁区",
  "战术板",
  "建队",
  "王朝",
  "球迷",
  "主场",
  "客场",
  "进攻",
  "得分",
  "投篮",
  "内线",
  "对位",
  "挡拆",
  "总冠军",
  "荣誉",
  "历史",
  "效率",
  "长度",
  "忠诚",
  "英雄球",
  "奖杯",
  "天才",
  "遗憾",
  "无冠",
  "超级球队",
  "超级球星",
  "老派",
  "时代",
  "球星",
  "球队",
  "传球",
  "跑位",
  "空间",
  "高光",
  "名场面",
];

const errors = [];

function readSourceFile(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const text = fs.readFileSync(filePath, "utf8");
  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function relativeFileName(sourceFile) {
  return path.relative(ROOT, sourceFile.fileName);
}

function addIssue(sourceFile, node, message) {
  if (!node) {
    errors.push(`${relativeFileName(sourceFile)}: ${message}`);
    return;
  }

  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  errors.push(`${relativeFileName(sourceFile)}:${position.line + 1}:${position.character + 1} ${message}`);
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

function objectFields(sourceFile, objectLiteral, contextLabel) {
  const fields = new Map();

  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      addIssue(sourceFile, property, `${contextLabel} only supports direct property assignments`);
      continue;
    }

    const name = propertyNameToString(property.name);
    if (!name) {
      addIssue(sourceFile, property.name, `${contextLabel} property names must be static`);
      continue;
    }

    if (fields.has(name)) {
      addIssue(sourceFile, property.name, `${contextLabel} has duplicate property "${name}"`);
    }

    fields.set(name, {
      expression: unwrapExpression(property.initializer),
      node: property,
    });
  }

  return fields;
}

function getObjectInitializer(sourceFile, variableName) {
  const declaration = findVariableDeclaration(sourceFile, variableName);
  if (!declaration?.initializer) {
    addIssue(sourceFile, declaration, `missing ${variableName}`);
    return null;
  }

  const initializer = unwrapExpression(declaration.initializer);
  if (!ts.isObjectLiteralExpression(initializer)) {
    addIssue(sourceFile, declaration, `${variableName} must be an object literal`);
    return null;
  }

  return initializer;
}

function getArrayInitializer(sourceFile, variableName) {
  const declaration = findVariableDeclaration(sourceFile, variableName);
  if (!declaration?.initializer) {
    addIssue(sourceFile, declaration, `missing ${variableName}`);
    return null;
  }

  const initializer = unwrapExpression(declaration.initializer);
  if (!ts.isArrayLiteralExpression(initializer)) {
    addIssue(sourceFile, declaration, `${variableName} must be an array literal`);
    return null;
  }

  return initializer;
}

function checkForbiddenText(sourceFile, node, label, value) {
  if (!value) return;

  for (const term of FORBIDDEN_TERMS) {
    if (value.includes(term)) {
      addIssue(sourceFile, node, `${label} contains forbidden football/fake-live term "${term}"`);
    }
  }

  for (const pattern of FOOTBALL_TERM_PATTERNS) {
    if (pattern.test(value)) {
      addIssue(sourceFile, node, `${label} contains forbidden football phrase "${pattern.source}"`);
    }
  }
}

function hasBasketballContext(value) {
  return BASKETBALL_CONTEXT_TERMS.some((term) => value.includes(term));
}

function getRequiredString(sourceFile, fields, fieldName, recordLabel) {
  const field = fields.get(fieldName);
  if (!field) {
    addIssue(sourceFile, null, `${recordLabel}.${fieldName} is required`);
    return null;
  }

  const value = expressionToString(field.expression);
  if (!value?.trim()) {
    addIssue(sourceFile, field.node, `${recordLabel}.${fieldName} must be a non-empty string literal`);
    return null;
  }

  checkForbiddenText(sourceFile, field.node, `${recordLabel}.${fieldName}`, value);
  return value;
}

function getOptionalString(sourceFile, fields, fieldName, recordLabel) {
  const field = fields.get(fieldName);
  if (!field) return null;

  const value = expressionToString(field.expression);
  if (!value?.trim()) {
    addIssue(sourceFile, field.node, `${recordLabel}.${fieldName} must be a non-empty string literal when present`);
    return null;
  }

  checkForbiddenText(sourceFile, field.node, `${recordLabel}.${fieldName}`, value);
  return value;
}

function validateRivalryScriptText(sourceFile, node, label, value) {
  if (value.length > RIVALRY_SCRIPT_MAX_LENGTH) {
    addIssue(sourceFile, node, `${label} must be ${RIVALRY_SCRIPT_MAX_LENGTH} characters or less`);
  }

  for (const term of RIVALRY_SCRIPT_FORBIDDEN_TERMS) {
    if (value.includes(term)) {
      addIssue(sourceFile, node, `${label} contains forbidden script claim "${term}"`);
    }
  }
}

function validateRivalryScripts(sourceFile, fields, recordLabel, { required = false } = {}) {
  const presentFields = RIVALRY_SCRIPT_FIELDS.filter((fieldName) => fields.has(fieldName));
  if (!required && !presentFields.length) return;

  if (presentFields.length > 0 && presentFields.length !== RIVALRY_SCRIPT_FIELDS.length) {
    addIssue(sourceFile, null, `${recordLabel} must include all rivalry script fields when any script field is present`);
  }

  const values = RIVALRY_SCRIPT_FIELDS.flatMap((fieldName) => {
    const value = required || fields.has(fieldName)
      ? getRequiredString(sourceFile, fields, fieldName, recordLabel)
      : null;
    const field = fields.get(fieldName);
    if (value && field) {
      validateRivalryScriptText(sourceFile, field.node, `${recordLabel}.${fieldName}`, value);
    }
    return value ? [value] : [];
  });

  if (values.length === RIVALRY_SCRIPT_FIELDS.length && !hasBasketballContext(values.join(" "))) {
    addIssue(sourceFile, null, `${recordLabel} rivalry scripts should include basketball-native context`);
  }
}

function parseRecordObject(sourceFile, variableName) {
  const initializer = getObjectInitializer(sourceFile, variableName);
  if (!initializer) return new Map();

  const records = new Map();

  for (const property of initializer.properties) {
    if (!ts.isPropertyAssignment(property)) {
      addIssue(sourceFile, property, `${variableName} only supports direct property assignments`);
      continue;
    }

    const key = propertyNameToString(property.name);
    if (!key) {
      addIssue(sourceFile, property.name, `${variableName} keys must be static`);
      continue;
    }

    if (records.has(key)) {
      addIssue(sourceFile, property.name, `${variableName} has duplicate key "${key}"`);
    }

    const expression = unwrapExpression(property.initializer);
    if (!ts.isObjectLiteralExpression(expression)) {
      addIssue(sourceFile, property.initializer, `${variableName}.${key} must be an object literal`);
      continue;
    }

    records.set(key, {
      key,
      node: property,
      fields: objectFields(sourceFile, expression, `${variableName}.${key}`),
    });
  }

  return records;
}

function parseBbtiTypes(sourceFile) {
  const records = parseRecordObject(sourceFile, "bbtiTypes");
  for (const [code, record] of records.entries()) {
    if (!/^[OD][AE][IT][LR]$/.test(code)) {
      addIssue(sourceFile, record.node, `bbtiTypes has malformed code "${code}"`);
    }

    const codeField = getRequiredString(sourceFile, record.fields, "code", `bbtiTypes.${code}`);
    if (codeField && codeField !== code) {
      addIssue(sourceFile, record.fields.get("code")?.node ?? record.node, `bbtiTypes.${code}.code must match its key`);
    }
  }

  return records;
}

function parseMatchups(sourceFile) {
  const initializer = getArrayInitializer(sourceFile, "matchups");
  const records = new Map();
  if (!initializer) return records;

  for (const element of initializer.elements) {
    const expression = unwrapExpression(element);
    if (!ts.isObjectLiteralExpression(expression)) {
      addIssue(sourceFile, element, "matchups entries must be object literals");
      continue;
    }

    const fields = objectFields(sourceFile, expression, "matchups entry");
    const id = getRequiredString(sourceFile, fields, "id", "matchups entry");
    const title = getRequiredString(sourceFile, fields, "title", `matchups.${id ?? "unknown"}`);
    if (!id || !title) continue;

    if (records.has(id)) {
      addIssue(sourceFile, fields.get("id")?.node ?? element, `duplicate matchup id "${id}"`);
    }

    records.set(id, {
      id,
      title,
      node: element,
      fields,
    });
  }

  return records;
}

function parseStringUnion(sourceFile, typeName) {
  const declaration = findTypeAliasDeclaration(sourceFile, typeName);
  if (!declaration) {
    addIssue(sourceFile, null, `missing ${typeName}`);
    return new Set();
  }

  if (!ts.isUnionTypeNode(declaration.type)) {
    addIssue(sourceFile, declaration, `${typeName} must be a string literal union`);
    return new Set();
  }

  const values = new Set();
  for (const typeNode of declaration.type.types) {
    if (!ts.isLiteralTypeNode(typeNode) || !ts.isStringLiteral(typeNode.literal)) {
      addIssue(sourceFile, typeNode, `${typeName} only supports string literal values`);
      continue;
    }

    values.add(typeNode.literal.text);
  }

  return values;
}

function parseEvidenceLens(sourceFile, field, recordLabel, allowedLensValues) {
  if (!field) {
    addIssue(sourceFile, null, `${recordLabel}.evidenceLens is required`);
    return [];
  }

  const expression = unwrapExpression(field.expression);
  if (!ts.isArrayLiteralExpression(expression)) {
    addIssue(sourceFile, field.node, `${recordLabel}.evidenceLens must be an array literal`);
    return [];
  }

  if (!expression.elements.length) {
    addIssue(sourceFile, field.node, `${recordLabel}.evidenceLens must not be empty`);
  }

  if (expression.elements.length < 3) {
    addIssue(sourceFile, field.node, `${recordLabel}.evidenceLens must include at least 3 lenses`);
  }

  const seen = new Set();
  const values = [];
  for (const element of expression.elements) {
    const value = expressionToString(element);
    if (!value?.trim()) {
      addIssue(sourceFile, element, `${recordLabel}.evidenceLens entries must be non-empty string literals`);
      continue;
    }

    if (!allowedLensValues.has(value)) {
      addIssue(sourceFile, element, `${recordLabel}.evidenceLens "${value}" is not in BbtiEvidenceLens`);
    }

    if (seen.has(value)) {
      addIssue(sourceFile, element, `${recordLabel}.evidenceLens has duplicate value "${value}"`);
    }
    seen.add(value);
    values.push(value);
  }

  return values;
}

function validateBbtiCodeCoverage(sourceFile, records, recordName) {
  const expected = new Set(EXPECTED_BBTI_CODES);
  for (const [code, record] of records.entries()) {
    if (!expected.has(code)) {
      addIssue(sourceFile, record.node, `${recordName} has unexpected code "${code}"`);
    }
  }

  for (const code of EXPECTED_BBTI_CODES) {
    if (!records.has(code)) {
      addIssue(sourceFile, null, `${recordName} is missing "${code}"`);
    }
  }
}

function parseChallengeLibrary(sourceFile, canonicalMatchups, evidenceRecords) {
  const records = parseRecordObject(sourceFile, "CHALLENGE_LIBRARY");

  for (const [key, record] of records.entries()) {
    for (const fieldName of REQUIRED_CHALLENGE_LIBRARY_FIELDS) {
      getRequiredString(sourceFile, record.fields, fieldName, `CHALLENGE_LIBRARY.${key}`);
    }

    for (const [fieldName, field] of record.fields.entries()) {
      if (!KNOWN_CHALLENGE_FIELDS.has(fieldName)) {
        addIssue(sourceFile, field.node, `CHALLENGE_LIBRARY.${key} has unknown field "${fieldName}"`);
      }

      if (TEXT_FIELDS.has(fieldName)) {
        getOptionalString(sourceFile, record.fields, fieldName, `CHALLENGE_LIBRARY.${key}`);
      }
    }

    const matchupId = getOptionalString(sourceFile, record.fields, "matchupId", `CHALLENGE_LIBRARY.${key}`);
    const title = getOptionalString(sourceFile, record.fields, "title", `CHALLENGE_LIBRARY.${key}`);
    if (matchupId && matchupId !== key) {
      addIssue(sourceFile, record.fields.get("matchupId")?.node ?? record.node, `CHALLENGE_LIBRARY.${key}.matchupId must match its key`);
    }

    const canonical = matchupId ? canonicalMatchups.get(matchupId) : null;
    if (matchupId && !canonical) {
      addIssue(sourceFile, record.fields.get("matchupId")?.node ?? record.node, `CHALLENGE_LIBRARY.${key}.matchupId is not in canonical matchups`);
    }

    if (matchupId && !evidenceRecords.has(matchupId)) {
      addIssue(sourceFile, record.fields.get("matchupId")?.node ?? record.node, `CHALLENGE_LIBRARY.${key}.matchupId is missing MATCHUP_EVIDENCE`);
    }

    if (title && canonical && title !== canonical.title) {
      addIssue(sourceFile, record.fields.get("title")?.node ?? record.node, `CHALLENGE_LIBRARY.${key}.title must match canonical title "${canonical.title}"`);
    }

    validateRivalryScripts(sourceFile, record.fields, `CHALLENGE_LIBRARY.${key}`);
  }

  return records;
}

function parseEvidenceRecords(sourceFile, canonicalMatchups, allowedLensValues) {
  const records = parseRecordObject(sourceFile, "MATCHUP_EVIDENCE");

  for (const [key, record] of records.entries()) {
    if (!canonicalMatchups.has(key)) {
      addIssue(sourceFile, record.node, `MATCHUP_EVIDENCE.${key} is not in canonical matchups`);
    }

    for (const fieldName of REQUIRED_EVIDENCE_FIELDS) {
      getRequiredString(sourceFile, record.fields, fieldName, `MATCHUP_EVIDENCE.${key}`);
    }

    for (const fieldName of REQUIRED_EVIDENCE_FIELDS) {
      getOptionalString(sourceFile, record.fields, fieldName, `MATCHUP_EVIDENCE.${key}`);
    }

    validateRivalryScripts(sourceFile, record.fields, `MATCHUP_EVIDENCE.${key}`, { required: true });
    parseEvidenceLens(sourceFile, record.fields.get("evidenceLens"), `MATCHUP_EVIDENCE.${key}`, allowedLensValues);
  }

  return records;
}

function parseFixtureRecords(sourceFile) {
  const initializer = getObjectInitializer(sourceFile, "BBTI_CHALLENGE_FIXTURES");
  const records = new Map();
  if (!initializer) return records;

  for (const property of initializer.properties) {
    if (!ts.isPropertyAssignment(property)) {
      addIssue(sourceFile, property, "BBTI_CHALLENGE_FIXTURES only supports direct code entries");
      continue;
    }

    const code = propertyNameToString(property.name);
    if (!code) {
      addIssue(sourceFile, property.name, "BBTI_CHALLENGE_FIXTURES code keys must be static");
      continue;
    }

    if (records.has(code)) {
      addIssue(sourceFile, property.name, `BBTI_CHALLENGE_FIXTURES has duplicate key "${code}"`);
    }

    const value = unwrapExpression(property.initializer);
    if (!ts.isArrayLiteralExpression(value)) {
      addIssue(sourceFile, property.initializer, `BBTI_CHALLENGE_FIXTURES.${code} must be an array literal`);
      continue;
    }

    const entries = value.elements.flatMap((element, index) => {
      const expression = unwrapExpression(element);
      if (!ts.isObjectLiteralExpression(expression)) {
        addIssue(sourceFile, element, `BBTI_CHALLENGE_FIXTURES.${code}[${index}] must be an object literal`);
        return [];
      }

      return [{
        index,
        node: element,
        fields: objectFields(sourceFile, expression, `BBTI_CHALLENGE_FIXTURES.${code}[${index}]`),
      }];
    });

    records.set(code, {
      code,
      node: property,
      entries,
    });
  }

  return records;
}

function validateChallengeFields(sourceFile, fields, recordLabel, requiredFields, allowedLensValues) {
  for (const fieldName of requiredFields) {
    getRequiredString(sourceFile, fields, fieldName, recordLabel);
  }

  for (const [fieldName, field] of fields.entries()) {
    if (!KNOWN_CHALLENGE_FIELDS.has(fieldName)) {
      addIssue(sourceFile, field.node, `${recordLabel} has unknown field "${fieldName}"`);
    }

    if (TEXT_FIELDS.has(fieldName)) {
      getOptionalString(sourceFile, fields, fieldName, recordLabel);
    }
  }

  const evidenceLensField = fields.get("evidenceLens");
  if (evidenceLensField) {
    parseEvidenceLens(sourceFile, evidenceLensField, recordLabel, allowedLensValues);
  }

  validateRivalryScripts(sourceFile, fields, recordLabel);
}

function validateFixtures(sourceFile, fixtureRecords, bbtiTypeRecords, canonicalMatchups, challengeLibrary, evidenceRecords, allowedLensValues) {
  validateBbtiCodeCoverage(sourceFile, fixtureRecords, "BBTI_CHALLENGE_FIXTURES");

  for (const code of fixtureRecords.keys()) {
    if (!bbtiTypeRecords.has(code)) {
      addIssue(sourceFile, fixtureRecords.get(code).node, `BBTI_CHALLENGE_FIXTURES.${code} is not in bbtiTypes`);
    }
  }

  const comboOwners = new Map();
  const usedMatchupIds = new Set();
  let fixtureSlotCount = 0;

  for (const [code, record] of fixtureRecords.entries()) {
    if (record.entries.length !== 3) {
      addIssue(sourceFile, record.node, `BBTI_CHALLENGE_FIXTURES.${code} must have exactly 3 fixtures`);
    }

    const seenCategories = new Set();
    const seenMatchupIds = new Set();
    const matchupCombo = [];

    for (const entry of record.entries) {
      const recordLabel = `BBTI_CHALLENGE_FIXTURES.${code}[${entry.index}]`;
      validateChallengeFields(sourceFile, entry.fields, recordLabel, REQUIRED_FIXTURE_FIELDS, allowedLensValues);

      const category = getOptionalString(sourceFile, entry.fields, "category", recordLabel);
      const matchupId = getOptionalString(sourceFile, entry.fields, "matchupId", recordLabel);
      const label = getOptionalString(sourceFile, entry.fields, "label", recordLabel);
      const title = getOptionalString(sourceFile, entry.fields, "title", recordLabel);
      const reason = getOptionalString(sourceFile, entry.fields, "reason", recordLabel);

      if (category) {
        const expectedCategory = EXPECTED_CATEGORIES[entry.index];
        if (!EXPECTED_CATEGORIES.includes(category)) {
          addIssue(sourceFile, entry.fields.get("category")?.node ?? entry.node, `${recordLabel}.category must be one of: ${EXPECTED_CATEGORIES.join(", ")}`);
        } else if (category !== expectedCategory) {
          addIssue(sourceFile, entry.fields.get("category")?.node ?? entry.node, `${recordLabel}.category must be "${expectedCategory}" in slot ${entry.index + 1}`);
        }

        if (seenCategories.has(category)) {
          addIssue(sourceFile, entry.fields.get("category")?.node ?? entry.node, `${code} has duplicate category "${category}"`);
        }
        seenCategories.add(category);
      }

      if (matchupId) {
        usedMatchupIds.add(matchupId);
        matchupCombo.push(matchupId);

        if (seenMatchupIds.has(matchupId)) {
          addIssue(sourceFile, entry.fields.get("matchupId")?.node ?? entry.node, `${code} has duplicate matchupId "${matchupId}"`);
        }
        seenMatchupIds.add(matchupId);

        const canonical = canonicalMatchups.get(matchupId);
        if (!canonical) {
          addIssue(sourceFile, entry.fields.get("matchupId")?.node ?? entry.node, `${recordLabel}.matchupId is not in canonical matchups`);
        }

        if (!challengeLibrary.has(matchupId)) {
          addIssue(sourceFile, entry.fields.get("matchupId")?.node ?? entry.node, `${recordLabel}.matchupId is not in CHALLENGE_LIBRARY`);
        }

        if (!evidenceRecords.has(matchupId)) {
          addIssue(sourceFile, entry.fields.get("matchupId")?.node ?? entry.node, `${recordLabel}.matchupId is missing MATCHUP_EVIDENCE`);
        }

        if (title && canonical && title !== canonical.title) {
          addIssue(sourceFile, entry.fields.get("title")?.node ?? entry.node, `${recordLabel}.title must match canonical title "${canonical.title}"`);
        }
      }

      const basketballCopy = [label, reason].filter(Boolean).join(" ");
      if (basketballCopy && !hasBasketballContext(basketballCopy)) {
        addIssue(sourceFile, entry.node, `${recordLabel} should include basketball-native context in label or reason`);
      }

      fixtureSlotCount += 1;
    }

    for (const category of EXPECTED_CATEGORIES) {
      if (!seenCategories.has(category)) {
        addIssue(sourceFile, record.node, `${code} is missing category "${category}"`);
      }
    }

    if (matchupCombo.length === 3) {
      const comboKey = matchupCombo.join(" > ");
      const existingOwner = comboOwners.get(comboKey);
      if (existingOwner) {
        addIssue(sourceFile, record.node, `${code} repeats the exact three-matchup combo already used by ${existingOwner}`);
      } else {
        comboOwners.set(comboKey, code);
      }
    }
  }

  return {
    fixtureSlotCount,
    uniqueComboCount: comboOwners.size,
    usedMatchupIds,
  };
}

const bbtiTypesSource = readSourceFile(BBTI_TYPES_RELATIVE_PATH);
const matchupsSource = readSourceFile(MATCHUPS_RELATIVE_PATH);
const fixturesSource = readSourceFile(FIXTURES_RELATIVE_PATH);
const challengesSource = readSourceFile(CHALLENGES_RELATIVE_PATH);
const evidenceSource = readSourceFile(EVIDENCE_RELATIVE_PATH);

const bbtiTypeRecords = parseBbtiTypes(bbtiTypesSource);
const canonicalMatchups = parseMatchups(matchupsSource);
const allowedLensValues = parseStringUnion(evidenceSource, "BbtiEvidenceLens");
const evidenceRecords = parseEvidenceRecords(evidenceSource, canonicalMatchups, allowedLensValues);
const challengeLibrary = parseChallengeLibrary(challengesSource, canonicalMatchups, evidenceRecords);
const fixtureRecords = parseFixtureRecords(fixturesSource);

validateBbtiCodeCoverage(bbtiTypesSource, bbtiTypeRecords, "bbtiTypes");

for (const matchupId of challengeLibrary.keys()) {
  if (!evidenceRecords.has(matchupId)) {
    addIssue(evidenceSource, null, `MATCHUP_EVIDENCE is missing CHALLENGE_LIBRARY matchup "${matchupId}"`);
  }
}

for (const matchupId of evidenceRecords.keys()) {
  if (!challengeLibrary.has(matchupId)) {
    addIssue(challengesSource, null, `CHALLENGE_LIBRARY is missing evidence matchup "${matchupId}"`);
  }
}

const fixtureStats = validateFixtures(
  fixturesSource,
  fixtureRecords,
  bbtiTypeRecords,
  canonicalMatchups,
  challengeLibrary,
  evidenceRecords,
  allowedLensValues,
);

for (const matchupId of fixtureStats.usedMatchupIds) {
  if (!challengeLibrary.has(matchupId)) {
    addIssue(challengesSource, null, `CHALLENGE_LIBRARY is missing fixture matchup "${matchupId}"`);
  }

  if (!evidenceRecords.has(matchupId)) {
    addIssue(evidenceSource, null, `MATCHUP_EVIDENCE is missing fixture matchup "${matchupId}"`);
  }
}

console.log("BBTI challenge fixture validation");
console.log(`- BBTI type codes: ${bbtiTypeRecords.size}`);
console.log(`- challenge fixture codes: ${fixtureRecords.size}`);
console.log(`- challenge fixture slots: ${fixtureStats.fixtureSlotCount}`);
console.log(`- unique fixture combos: ${fixtureStats.uniqueComboCount}`);
console.log(`- challenge library matchups: ${challengeLibrary.size}`);
console.log(`- evidence packs: ${evidenceRecords.size}`);

if (errors.length) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("\nOK: BBTI challenge fixtures cover all 16 codes with valid basketball matchups and evidence.");
