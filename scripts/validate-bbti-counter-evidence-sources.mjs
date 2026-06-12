#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const SOURCE_RELATIVE_PATH = "src/data/bbti-counter-evidence-sources.ts";
const FACTS_RELATIVE_PATH = "src/data/bbti-counter-evidence-facts.ts";
const STALE_DAYS = Number.parseInt(process.env.BBTI_SOURCE_STALE_DAYS ?? "180", 10);
const STRICT_STALE_CHECK = process.env.BBTI_SOURCE_STRICT_STALE === "1";
const DAY_MS = 24 * 60 * 60 * 1000;

const SOURCE_TIERS = new Set(["official", "database", "media", "video"]);
const EVIDENCE_TYPES = new Set([
  "boxScore",
  "playByPlay",
  "awardVoting",
  "tracking",
  "transaction",
  "injuryReport",
  "quote",
  "video",
]);
const RISK_LEVELS = new Set(["hardNumber", "movingTotal", "quote", "subjectiveBanter"]);
const CHECKED_BY_VALUES = new Set(["manual", "script"]);

const REQUIRED_FIELDS = [
  "id",
  "label",
  "url",
  "publisher",
  "sourceTier",
  "evidenceType",
  "riskLevel",
  "verificationStatus",
  "checkedAt",
  "checkedBy",
];
const OPTIONAL_FIELDS = ["canonicalHost", "eventDate", "season", "asOfDate", "notes"];
const KNOWN_STRING_FIELDS = new Set([...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]);

const errors = [];
const warnings = [];

function readSourceFile(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const text = fs.readFileSync(filePath, "utf8");

  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
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

function parseAllowedHosts(sourceFile) {
  const declaration = findVariableDeclaration(sourceFile, "ALLOWED_COUNTER_EVIDENCE_SOURCE_HOSTS");
  if (!declaration?.initializer) {
    addIssue(errors, sourceFile, declaration, "missing ALLOWED_COUNTER_EVIDENCE_SOURCE_HOSTS");
    return [];
  }

  const initializer = unwrapExpression(declaration.initializer);
  if (!ts.isArrayLiteralExpression(initializer)) {
    addIssue(errors, sourceFile, declaration, "ALLOWED_COUNTER_EVIDENCE_SOURCE_HOSTS must be an array");
    return [];
  }

  return initializer.elements.flatMap((element) => {
    const value = expressionToString(element);
    if (!value) {
      addIssue(errors, sourceFile, element, "allowed source hosts must be string literals");
      return [];
    }

    return [value];
  });
}

function collectStringFields(sourceFile, objectLiteral) {
  const fields = new Map();

  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      addIssue(errors, sourceFile, property, "source records only support direct property assignments");
      continue;
    }

    const fieldName = propertyNameToString(property.name);
    if (!fieldName) {
      addIssue(errors, sourceFile, property.name, "source record field names must be static");
      continue;
    }

    if (fields.has(fieldName)) {
      addIssue(errors, sourceFile, property.name, `duplicate source record field "${fieldName}"`);
      continue;
    }

    if (!KNOWN_STRING_FIELDS.has(fieldName)) {
      addIssue(warnings, sourceFile, property.name, `unknown source record field "${fieldName}"`);
    }

    const value = expressionToString(property.initializer);
    if (value === null) {
      addIssue(errors, sourceFile, property.initializer, `source record field "${fieldName}" must be a string literal`);
      continue;
    }

    fields.set(fieldName, { value, node: property });
  }

  return fields;
}

function parseSourceRecords(sourceFile) {
  const declaration = findVariableDeclaration(sourceFile, "VERIFIED_COUNTER_EVIDENCE_SOURCES");
  if (!declaration?.initializer) {
    addIssue(errors, sourceFile, declaration, "missing VERIFIED_COUNTER_EVIDENCE_SOURCES");
    return [];
  }

  const initializer = unwrapExpression(declaration.initializer);
  if (!ts.isObjectLiteralExpression(initializer)) {
    addIssue(errors, sourceFile, declaration, "VERIFIED_COUNTER_EVIDENCE_SOURCES must be an object literal");
    return [];
  }

  const seenKeys = new Set();

  return initializer.properties.flatMap((property) => {
    if (!ts.isPropertyAssignment(property)) {
      addIssue(errors, sourceFile, property, "source registry only supports direct property assignments");
      return [];
    }

    const key = propertyNameToString(property.name);
    if (!key) {
      addIssue(errors, sourceFile, property.name, "source registry keys must be static");
      return [];
    }

    if (seenKeys.has(key)) {
      addIssue(errors, sourceFile, property.name, `duplicate source registry key "${key}"`);
    }
    seenKeys.add(key);

    const value = unwrapExpression(property.initializer);
    if (!ts.isObjectLiteralExpression(value)) {
      addIssue(errors, sourceFile, property.initializer, `source registry entry "${key}" must be an object literal`);
      return [];
    }

    return [{ key, node: property, fields: collectStringFields(sourceFile, value) }];
  });
}

function isParseableDate(value) {
  return !Number.isNaN(Date.parse(value));
}

function checkEnum(sourceFile, record, fieldName, allowedValues) {
  const field = record.fields.get(fieldName);
  if (!field || allowedValues.has(field.value)) return;

  addIssue(
    errors,
    sourceFile,
    field.node,
    `${record.key}.${fieldName} must be one of: ${Array.from(allowedValues).join(", ")}`,
  );
}

function validateSourceRecords(sourceFile, records, allowedHosts) {
  const ids = new Set();

  for (const record of records) {
    for (const fieldName of REQUIRED_FIELDS) {
      const field = record.fields.get(fieldName);
      if (!field?.value.trim()) {
        addIssue(errors, sourceFile, record.node, `${record.key}.${fieldName} is required`);
      }
    }

    const id = record.fields.get("id")?.value;
    if (id) {
      if (id !== record.key) {
        addIssue(errors, sourceFile, record.node, `source id "${id}" must match registry key "${record.key}"`);
      }

      if (ids.has(id)) {
        addIssue(errors, sourceFile, record.node, `duplicate source id "${id}"`);
      }
      ids.add(id);
    }

    checkEnum(sourceFile, record, "sourceTier", SOURCE_TIERS);
    checkEnum(sourceFile, record, "evidenceType", EVIDENCE_TYPES);
    checkEnum(sourceFile, record, "riskLevel", RISK_LEVELS);
    checkEnum(sourceFile, record, "checkedBy", CHECKED_BY_VALUES);

    const verificationStatus = record.fields.get("verificationStatus");
    if (verificationStatus && verificationStatus.value !== "verified") {
      addIssue(errors, sourceFile, verificationStatus.node, `${record.key}.verificationStatus must be verified`);
    }

    const url = record.fields.get("url");
    let parsedUrl = null;
    if (url) {
      if (!url.value.startsWith("https://")) {
        addIssue(errors, sourceFile, url.node, `${record.key}.url must use HTTPS`);
      }

      try {
        parsedUrl = new URL(url.value);
        if (!allowedHosts.includes(parsedUrl.hostname)) {
          addIssue(errors, sourceFile, url.node, `${record.key}.url hostname "${parsedUrl.hostname}" is not allowlisted`);
        }
      } catch {
        addIssue(errors, sourceFile, url.node, `${record.key}.url must be parseable`);
      }
    }

    const canonicalHost = record.fields.get("canonicalHost");
    if (canonicalHost && parsedUrl && canonicalHost.value !== parsedUrl.hostname) {
      addIssue(errors, sourceFile, canonicalHost.node, `${record.key}.canonicalHost must match url hostname`);
    }

    for (const dateFieldName of ["checkedAt", "asOfDate", "eventDate"]) {
      const dateField = record.fields.get(dateFieldName);
      if (dateField && !isParseableDate(dateField.value)) {
        addIssue(errors, sourceFile, dateField.node, `${record.key}.${dateFieldName} must be a parseable date`);
      }
    }

    const riskLevel = record.fields.get("riskLevel")?.value;
    const asOfDate = record.fields.get("asOfDate");
    if (riskLevel === "movingTotal") {
      if (!asOfDate) {
        addIssue(errors, sourceFile, record.node, `${record.key}.asOfDate is required for movingTotal sources`);
      } else if (isParseableDate(asOfDate.value) && Number.isFinite(STALE_DAYS)) {
        const ageDays = Math.floor((Date.now() - Date.parse(asOfDate.value)) / DAY_MS);
        if (ageDays > STALE_DAYS) {
          const issue = `${record.key}.asOfDate is ${ageDays} days old; refresh movingTotal sources or raise BBTI_SOURCE_STALE_DAYS`;
          addIssue(STRICT_STALE_CHECK ? errors : warnings, sourceFile, asOfDate.node, issue);
        }
      }
    }
  }

  return ids;
}

function parseFactSourceIds(sourceFile) {
  const references = [];

  function visit(node) {
    if (ts.isPropertyAssignment(node) && propertyNameToString(node.name) === "sourceId") {
      const sourceId = expressionToString(node.initializer);
      if (!sourceId) {
        addIssue(warnings, sourceFile, node, "sourceId is not a static string literal and cannot be validated offline");
      } else {
        references.push({ sourceId, node });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return references;
}

const sourceFile = readSourceFile(SOURCE_RELATIVE_PATH);
const factsFile = readSourceFile(FACTS_RELATIVE_PATH);
const allowedHosts = parseAllowedHosts(sourceFile);
const records = parseSourceRecords(sourceFile);
const sourceIds = validateSourceRecords(sourceFile, records, allowedHosts);
const factSourceIds = parseFactSourceIds(factsFile);

for (const reference of factSourceIds) {
  if (!sourceIds.has(reference.sourceId)) {
    addIssue(errors, factsFile, reference.node, `fact sourceId "${reference.sourceId}" is not registered`);
  }
}

if (records.length > 0 && factSourceIds.length === 0) {
  addIssue(warnings, factsFile, factsFile, "verified sources exist but no static fact sourceId references were found");
}

for (const sourceId of sourceIds) {
  if (!factSourceIds.some((reference) => reference.sourceId === sourceId)) {
    addIssue(warnings, sourceFile, sourceFile, `registered source "${sourceId}" is not referenced by a fact sourceId`);
  }
}

console.log("BBTI counter-evidence source validation");
console.log(`- source records: ${records.length}`);
console.log(`- allowed hosts: ${allowedHosts.length}`);
console.log(`- static fact sourceId refs: ${factSourceIds.length}`);

if (records.length === 0) {
  console.log("- registry mode: empty and fail-closed");
}

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("\nOK: counter-evidence source metadata is internally consistent.");
}
