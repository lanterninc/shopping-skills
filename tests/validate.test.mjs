// Fixtures are written to temp dirs at runtime so this repo never commits the dash characters it checks for.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { validate } from '../scripts/validate.mjs';

const EM = '\u2014';
const EN = '\u2013';
const roots = [];
const savedCi = process.env.CI;

afterEach(() => {
  while (roots.length) rmSync(roots.pop(), { recursive: true, force: true });
  if (savedCi === undefined) delete process.env.CI; else process.env.CI = savedCi;
});

function makeRepo(files) {
  const root = mkdtempSync(join(tmpdir(), 'skills-validate-'));
  roots.push(root);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

function skill(name, description) {
  return `---\nname: ${name}\ndescription: ${description}\n---\n\n# Title\n\nBody.\n`;
}

const goodSkill = skill('find-things', 'Use when the agent helps someone buy from an online store.');

test('a skill folder with no SKILL.md is reported', () => {
  const root = makeRepo({ 'skills/empty-skill/notes.md': 'x\n' });
  assert.deepEqual(validate(root, ['acme-secret']).map((p) => p.message), ['skill folder has no SKILL.md']);
});

test('a well-formed repo has no problems', () => {
  delete process.env.CI;
  const root = makeRepo({ 'skills/find-things/SKILL.md': goodSkill, 'README.md': '# Readme\n', 'AGENTS.md': '# Agents\n' });
  assert.deepEqual(validate(root, ['acme-secret']), []);
});

test('a name that differs from its folder is reported', () => {
  const root = makeRepo({ 'skills/find-things/SKILL.md': skill('other-name', 'Use when shopping.') });
  const problems = validate(root, ['acme-secret']);
  assert.equal(problems.length, 1);
  assert.equal(problems[0].file, 'skills/find-things/SKILL.md');
  assert.equal(problems[0].line, 2);
  assert.equal(problems[0].message, 'name must equal folder name');
});

test('a description that does not start with "Use when" is reported', () => {
  const root = makeRepo({ 'skills/find-things/SKILL.md': skill('find-things', 'Finds promotions on stores.') });
  const problems = validate(root, ['acme-secret']);
  assert.deepEqual(problems.map((p) => [p.line, p.message]), [[3, 'description must start with "Use when"']]);
});

test('a description longer than 200 characters is reported', () => {
  const long = `Use when ${'x'.repeat(192)}`;
  assert.equal(long.length, 201);
  const root = makeRepo({ 'skills/find-things/SKILL.md': skill('find-things', long) });
  const problems = validate(root, ['acme-secret']);
  assert.deepEqual(problems.map((p) => [p.line, p.message]), [[3, 'description exceeds 200 characters']]);
});

test('a description of exactly 200 characters passes', () => {
  const exact = `Use when ${'x'.repeat(191)}`;
  assert.equal(exact.length, 200);
  const root = makeRepo({ 'skills/find-things/SKILL.md': skill('find-things', exact) });
  assert.deepEqual(validate(root, ['acme-secret']), []);
});

test('em and en dashes are reported by file and line, anywhere in the repo', () => {
  const root = makeRepo({
    'README.md': `# Readme\n\nOne line ${EM} with an em dash.\n`,
    'skills/find-things/SKILL.md': `${goodSkill}Range 1${EN}2.\n`,
  });
  const problems = validate(root, ['acme-secret']).map((p) => `${p.file}:${p.line}: ${p.message}`).sort();
  assert.deepEqual(problems, [
    'README.md:3: em dash (U+2014)',
    'skills/find-things/SKILL.md:9: en dash (U+2013)',
  ]);
});

test('dashes inside .git and node_modules are ignored', () => {
  const root = makeRepo({ '.git/HEAD': `x ${EM}\n`, 'node_modules/pkg/index.js': `// ${EM}\n`, '.superpowers/sdd/x.md': `${EM}\n` });
  assert.deepEqual(validate(root, ['acme-secret']), []);
});

test('forbidden terms are reported in skills and AGENTS.md, case-insensitively, but not in README.md', () => {
  const root = makeRepo({
    'skills/find-things/SKILL.md': `${goodSkill}See ACME-Secret here.\n`,
    'AGENTS.md': '# Agents\n\nacme-secret\n',
    'README.md': 'Maintained by acme-secret.\n',
  });
  const problems = validate(root, ['acme-secret']).map((p) => `${p.file}:${p.line}: ${p.message}`).sort();
  assert.deepEqual(problems, ['AGENTS.md:3: forbidden term #1', 'skills/find-things/SKILL.md:9: forbidden term #1']);
});

test('forbidden term messages never print the term itself', () => {
  const root = makeRepo({ 'AGENTS.md': 'acme-secret\n' });
  const [problem] = validate(root, ['acme-secret']);
  assert.doesNotMatch(problem.message, /acme-secret/);
});

test('with no terms in CI, the check reports that hygiene terms are unavailable', () => {
  process.env.CI = 'true';
  const root = makeRepo({ 'skills/find-things/SKILL.md': goodSkill });
  assert.deepEqual(validate(root, []).map((p) => p.message), ['hygiene terms unavailable']);
});

test('with no terms locally, only the term check is skipped', () => {
  delete process.env.CI;
  const root = makeRepo({ 'AGENTS.md': 'acme-secret\n', 'README.md': `x ${EM}\n` });
  assert.deepEqual(validate(root, []).map((p) => p.message), ['em dash (U+2014)']);
});
