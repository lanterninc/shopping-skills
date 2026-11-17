#!/usr/bin/env node
// Checks the repo before release: skill frontmatter, no em or en dashes anywhere, and no forbidden
// terms in the skill text or AGENTS.md. The forbidden terms are not kept in this repo; they come from
// the HYGIENE_TERMS environment variable (one term per line), which CI reads from a secret.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const SKIPPED_DIRS = new Set(['.git', 'node_modules', '.superpowers', 'dist']);
const DASHES = [
  ['\u2014', 'em dash (U+2014)'],
  ['\u2013', 'en dash (U+2013)'],
];
// The Agent Skills format allows 1024 characters; Claude apps accept 200, so that is the limit here.
const MAX_DESCRIPTION = 200;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) walk(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

function readText(path) {
  const buffer = readFileSync(path);
  return buffer.includes(0) ? null : buffer.toString('utf8');
}

function frontmatter(lines) {
  if (lines[0] !== '---') return null;
  const fields = {};
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') return fields;
    const match = /^([A-Za-z_-]+):\s*(.*)$/.exec(lines[i]);
    if (match) fields[match[1]] = { value: match[2].replace(/^(["'])(.*)\1$/, '$2'), line: i + 1 };
  }
  return null;
}

function checkSkill(file, folder, lines, problems) {
  const fields = frontmatter(lines);
  if (!fields) {
    problems.push({ file, line: 1, message: 'missing frontmatter' });
    return;
  }
  const { name, description } = fields;
  if (!name || name.value !== folder) problems.push({ file, line: name?.line ?? 1, message: 'name must equal folder name' });
  if (!description) {
    problems.push({ file, line: 1, message: 'missing description' });
  } else if (!description.value.startsWith('Use when')) {
    problems.push({ file, line: description.line, message: 'description must start with "Use when"' });
  } else if (description.value.length > MAX_DESCRIPTION) {
    problems.push({ file, line: description.line, message: `description exceeds ${MAX_DESCRIPTION} characters` });
  }
}

/** @returns {{ file: string, line: number, message: string }[]} */
export function validate(rootDir, terms) {
  const problems = [];
  const lowered = terms.map((term) => term.trim().toLowerCase()).filter(Boolean);
  if (lowered.length === 0 && process.env.CI === 'true') {
    problems.push({ file: '.', line: 0, message: 'hygiene terms unavailable' });
  }
  const skillsDir = join(rootDir, 'skills');
  if (existsSync(skillsDir)) {
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !existsSync(join(skillsDir, entry.name, 'SKILL.md'))) {
        problems.push({ file: `skills/${entry.name}`, line: 0, message: 'skill folder has no SKILL.md' });
      }
    }
  }
  for (const path of walk(rootDir)) {
    const text = readText(path);
    if (text === null) continue;
    const file = relative(rootDir, path).split(sep).join('/');
    const lines = text.split('\n');
    const skillMatch = /^skills\/([^/]+)\/SKILL\.md$/.exec(file);
    if (skillMatch) checkSkill(file, skillMatch[1], lines, problems);
    const termScoped = file.startsWith('skills/') || file === 'AGENTS.md';
    lines.forEach((content, index) => {
      for (const [character, message] of DASHES) {
        if (content.includes(character)) problems.push({ file, line: index + 1, message });
      }
      if (termScoped) {
        const lower = content.toLowerCase();
        lowered.forEach((term, termIndex) => {
          if (lower.includes(term)) problems.push({ file, line: index + 1, message: `forbidden term #${termIndex + 1}` });
        });
      }
    });
  }
  return problems;
}

function main() {
  const root = process.argv[2] ?? process.cwd();
  const terms = (process.env.HYGIENE_TERMS ?? '').split('\n');
  if (terms.every((term) => !term.trim()) && process.env.CI !== 'true') {
    console.warn('HYGIENE_TERMS is not set: the forbidden-term check was skipped.');
  }
  if (!statSync(root).isDirectory()) throw new Error(`not a directory: ${root}`);
  const problems = validate(root, terms);
  for (const problem of problems) console.log(`${problem.file}:${problem.line}: ${problem.message}`);
  process.exitCode = problems.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
