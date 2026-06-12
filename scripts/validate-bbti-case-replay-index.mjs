#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assertIncludes(label, source, expected) {
  if (!source.includes(expected)) {
    errors.push(`${label}: missing ${JSON.stringify(expected)}`);
  }
}

const data = read("src/data/bbti-case-postgame.ts");
const component = read("src/components/BbtiCasePostgame.tsx");
const replayCenter = read("src/components/ReplayCenter.tsx");

[
  'BBTI_CASE_POSTGAME_REPLAY_INDEX_VERSION = "bbti-case-postgame-replay-index-v1"',
  "resolveBbtiCaseReplayIndex",
  '"coach-challenge"',
  '"case-source"',
  '"session-verdict"',
  '"return-link"',
  '"replay"',
  '"case-source"',
  '"verdict"',
  '"bbti-result"',
].forEach((expected) => assertIncludes("case replay index data contract", data, expected));

[
  'data-testid="bbti-case-postgame-replay-index"',
  "data-bbti-case-postgame-replay-index-version={recap.replayIndex.version}",
  "data-bbti-case-postgame-replay-index-source={recap.replayIndex.source}",
  "data-bbti-case-postgame-replay-index-source-version={recap.replayIndex.caseSourceVersion}",
  "data-bbti-case-postgame-replay-index-case-version={recap.replayIndex.caseVersion}",
  "data-bbti-case-postgame-replay-index-count={recap.replayIndex.itemCount}",
  'data-testid="bbti-case-postgame-replay-row"',
  "data-bbti-case-postgame-replay-row={item.id}",
  "data-bbti-case-postgame-replay-target={item.target}",
  "data-bbti-case-postgame-replay-position={index + 1}",
].forEach((expected) => assertIncludes("case replay index UI contract", component, expected));

[
  'BBTI_REPLAY_CENTER_VERSION = "bbti-replay-center-v1"',
  'data-testid="bbti-replay-center"',
  "data-bbti-replay-center-version={BBTI_REPLAY_CENTER_VERSION}",
  "data-bbti-replay-center-matchup-id={matchupId}",
  "data-bbti-replay-center-topic-id={topicId}",
  "data-bbti-replay-center-round={roundNumber}",
  "data-bbti-replay-center-side={bomb.side}",
  "data-bbti-replay-center-source={bomb.source}",
  'data-testid="bbti-replay-center-source"',
].forEach((expected) => assertIncludes("ReplayCenter QA contract", replayCenter, expected));

if (!errors.length) {
  const result = spawnSync(process.execPath, ["scripts/validate-bbti-case-postgame.mjs"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    errors.push(`validate-bbti-case-postgame.mjs exited with ${result.status}`);
  }
}

if (errors.length) {
  console.error("BBTI case replay index validation failed");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("BBTI case replay index validation");
console.log("- Contract: bbti-case-postgame-replay-index-v1");
console.log("- Rows: coach-challenge, case-source, session-verdict, return-link");
console.log("- ReplayCenter: version/source/side/matchup/topic/round selectors");
console.log("OK: case replay index is stable and session-local.");
