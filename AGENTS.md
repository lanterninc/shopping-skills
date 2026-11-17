# Installing these skills

This file has two readers. If someone asked you to install the skills from this repository, follow the steps below. If you are working on the repository itself (editing, reviewing, testing), do not install anything: skip to "Working on this repository" at the end.

## 1. Get the files

The skills are the three folders under `skills/` in this repository:

- `skills/find-store-promotions/`
- `skills/claim-a-promotion/`
- `skills/apply-a-discount/`

Clone the repository to a temporary folder, or download each folder's `SKILL.md`. Install all three: each one hands off to the next.

## 2. Copy them into your personal skills directory

Copy each folder, keeping its name, into the personal skills directory of the tool you are running in. If a folder with the same name is already there, replace it.

| Tool | Personal skills directory |
| --- | --- |
| Claude Code | `~/.claude/skills/` |
| Codex | `~/.agents/skills/` |
| Cursor | `~/.cursor/skills/` |
| Gemini CLI | `~/.gemini/skills/` |
| GitHub Copilot CLI and other tools that read the shared location | `~/.agents/skills/` |

If you are not sure which tool you are, check which of these directories already exists, and ask the person if more than one does. Create the directory if it is missing.

When you are done, each skill is at `<skills directory>/<skill name>/SKILL.md`.

## 3. Tell the person

Say which three skills you installed and where. Most tools pick up new skills at the start of the next session, so tell them to start a new session if the skills do not appear.

## What the skills do

They make you check a store for promotions it posts for shoppers who use an AI assistant, whenever you help someone buy something. They also cover claiming a code with the shopper's consent and applying it at checkout. They never share the shopper's details without asking first.

## Working on this repository

Run `npm test` and `node scripts/validate.mjs` before committing. Skill text is plain Markdown with `name` and `description` frontmatter, and the description starts with "Use when".
