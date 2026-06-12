#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const QUESTIONS_RELATIVE_PATH = "src/data/bbti.ts";
const CROSS_EXAMS_RELATIVE_PATH = "src/data/bbti-film-room-cross-exams.ts";
const REQUIRED_TEMPLATE_FIELDS = ["title", "question", "counterPunch", "seat"];
const ALLOWED_SEATS = new Set(["数据席", "录像席", "战术席"]);

const errors = [];

function readSourceFile(relativePath) {
  const filePath = path.join(ROOT, relativePath);
  const text = fs.readFileSync(filePath, "utf8");
  return ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function addIssue(sourceFile, node, message) {
  if (!node) {
    errors.push(`${path.relative(ROOT, sourceFile.fileName)}: ${message}`);
    return;
  }

  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  errors.push(`${path.relative(ROOT, sourceFile.fileName)}:${position.line + 1}:${position.character + 1} ${message}`);
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

function objectFields(sourceFile, objectLiteral) {
  const fields = new Map();

  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      addIssue(sourceFile, property, "only direct property assignments are supported");
      continue;
    }

    const name = propertyNameToString(property.name);
    if (!name) {
      addIssue(sourceFile, property.name, "property names must be static");
      continue;
    }

    if (fields.has(name)) {
      addIssue(sourceFile, property.name, `duplicate property "${name}"`);
    }

    fields.set(name, { node: property, expression: unwrapExpression(property.initializer) });
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

function parseBbtiQuestions(sourceFile) {
  const declaration = findVariableDeclaration(sourceFile, "bbtiQuestions");
  if (!declaration?.initializer) {
    addIssue(sourceFile, declaration, "missing bbtiQuestions");
    return [];
  }

  const initializer = unwrapExpression(declaration.initializer);
  if (!ts.isArrayLiteralExpression(initializer)) {
    addIssue(sourceFile, declaration, "bbtiQuestions must be an array literal");
    return [];
  }

  return initializer.elements.flatMap((element) => {
    const unwrapped = unwrapExpression(element);
    if (!ts.isObjectLiteralExpression(unwrapped)) {
      addIssue(sourceFile, element, "question entries must be object literals");
      return [];
    }

    const fields = objectFields(sourceFile, unwrapped);
    const idExpression = fields.get("id")?.expression;
    const typeExpression = fields.get("type")?.expression;

    if (!idExpression || !ts.isNumericLiteral(idExpression)) {
      addIssue(sourceFile, fields.get("id")?.node ?? element, "question id must be a numeric literal");
      return [];
    }

    const type = typeExpression ? expressionToString(typeExpression) : null;
    if (!type) {
      addIssue(sourceFile, fields.get("type")?.node ?? element, "question type must be a string literal");
      return [];
    }

    return [{ id: Number(idExpression.text), type, node: element }];
  });
}

function parseCrossExamEntries(sourceFile) {
  const initializer = getObjectInitializer(sourceFile, "QUESTION_CROSS_EXAMS");
  if (!initializer) return new Map();

  const entries = new Map();

  for (const property of initializer.properties) {
    if (!ts.isPropertyAssignment(property)) {
      addIssue(sourceFile, property, "QUESTION_CROSS_EXAMS only supports direct question entries");
      continue;
    }

    const questionId = Number(propertyNameToString(property.name));
    if (!Number.isInteger(questionId)) {
      addIssue(sourceFile, property.name, "cross-exam question id must be numeric");
      continue;
    }

    if (entries.has(questionId)) {
      addIssue(sourceFile, property.name, `duplicate cross-exam question id ${questionId}`);
    }

    const value = unwrapExpression(property.initializer);
    if (!ts.isObjectLiteralExpression(value)) {
      addIssue(sourceFile, property.initializer, `cross-exam entry ${questionId} must be an object literal`);
      continue;
    }

    entries.set(questionId, { node: property, fields: objectFields(sourceFile, value) });
  }

  return entries;
}

function validateTemplate(sourceFile, questionId, pole, template) {
  if (!ts.isObjectLiteralExpression(template.expression)) {
    addIssue(sourceFile, template.node, `Q${questionId}.${pole} must be an object literal`);
    return;
  }

  const fields = objectFields(sourceFile, template.expression);

  for (const fieldName of REQUIRED_TEMPLATE_FIELDS) {
    const field = fields.get(fieldName);
    const value = field ? expressionToString(field.expression) : null;
    if (!value?.trim()) {
      addIssue(sourceFile, template.node, `Q${questionId}.${pole}.${fieldName} is required`);
    }
  }

  const seat = fields.get("seat");
  const seatValue = seat ? expressionToString(seat.expression) : null;
  if (seatValue && !ALLOWED_SEATS.has(seatValue)) {
    addIssue(sourceFile, seat.node, `Q${questionId}.${pole}.seat must be one of: ${Array.from(ALLOWED_SEATS).join(", ")}`);
  }
}

const questionsSource = readSourceFile(QUESTIONS_RELATIVE_PATH);
const crossExamSource = readSourceFile(CROSS_EXAMS_RELATIVE_PATH);
const questions = parseBbtiQuestions(questionsSource);
const crossExamEntries = parseCrossExamEntries(crossExamSource);
const nonOpenQuestions = questions.filter((question) => question.type !== "open");
const questionIds = new Set(nonOpenQuestions.map((question) => question.id));

for (const question of nonOpenQuestions) {
  if (!crossExamEntries.has(question.id)) {
    addIssue(crossExamSource, null, `Q${question.id} is missing a question-level Film Room cross-exam`);
  }
}

for (const [questionId, entry] of crossExamEntries.entries()) {
  if (!questionIds.has(questionId)) {
    addIssue(crossExamSource, entry.node, `Q${questionId} does not match a binary/multi BBTI question`);
  }

  if (entry.fields.size === 0) {
    addIssue(crossExamSource, entry.node, `Q${questionId} must define at least one pole template`);
    continue;
  }

  for (const [pole, template] of entry.fields.entries()) {
    validateTemplate(crossExamSource, questionId, pole, template);
  }
}

console.log("BBTI Film Room cross-exam validation");
console.log(`- binary/multi questions: ${nonOpenQuestions.length}`);
console.log(`- question-level cross-exams: ${crossExamEntries.size}`);

if (errors.length) {
  console.error("\nErrors:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("\nOK: every binary/multi BBTI question has a valid Film Room cross-exam.");
