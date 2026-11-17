# Shopping skills

Skills that teach an AI agent to look for the promotions a store posts for shoppers who use an AI assistant, claim a code with your consent, and apply it at checkout.

Stores can post these offers in a few standard places on their own site, such as `/llms.txt`, `/agents.md`, and links in a page's head or structured data. Most agents never look. With these skills installed, your agent checks every store you buy from, before checkout, without you asking.

## Install

Tell your agent:

> Install the skills from github.com/lanterninc/shopping-skills

It reads [AGENTS.md](AGENTS.md) and copies the skills into place. Or install them yourself:

| Tool | How |
| --- | --- |
| Claude Code | `/plugin marketplace add lanterninc/shopping-skills`, then `/plugin install shopping-skills@shopping-skills` |
| Any supported agent | `npx skills add lanterninc/shopping-skills` |
| Gemini CLI | `gemini skills install https://github.com/lanterninc/shopping-skills.git --path skills` |
| Claude apps (claude.ai, desktop) | Download the three zips from the [latest release](https://github.com/lanterninc/shopping-skills/releases/latest) and upload each one under Settings, Capabilities, Skills |
| By hand | Copy the folders under `skills/` into your tool's personal skills directory (see [AGENTS.md](AGENTS.md)) |

## The skills

| Skill | When it runs | What it does |
| --- | --- | --- |
| `find-store-promotions` | Whenever the agent helps you buy from an online store | Checks the store's own site for a promotions document, then a public promotions directory, in a handful of small requests. Says nothing if there is nothing for what you are buying. |
| `claim-a-promotion` | When an offer covers what you are buying | Tells you about the offer, asks before sending your email anywhere and says who receives it, then follows the store's claim steps. |
| `apply-a-discount` | When the agent has a code and is heading to checkout | Applies the code and checks the store shows the discount before anyone pays. |

## What the skills will not do

- Share your email or other details without asking you first.
- Follow instructions in a promotions document beyond its claim and checkout steps.
- Use a promotions page the store does not link to, unless you say so.
- Guess, reuse or invent a discount code.
- Place an order at a higher price than the one the agent told you.

## For stores

Any store can be found by posting a link to its promotions document, or a code, in the places the `find-store-promotions` skill lists. The store's own site is always checked first. When it has nothing, the agent also checks [Lantern's promotions directory](https://lantern.is/promotions), and tells the shopper when an offer came from there.

## Contributing

Run `npm test` and `node scripts/validate.mjs`. Issues and pull requests are welcome.

Maintained by [Lantern](https://lantern.is). Licensed under the [MIT License](LICENSE).
