# Inline Tribunal

A Claude Code mod that has your current change reviewed by Codex and Grok side by side, without leaving the session.

- **`second_opinion` tool.** Claude can call it itself, for example before declaring risky work done. It takes an optional `focus`, and an optional `base`, such as `main`, to review the branch since its merge base. The tool returns each reviewer's findings and verdict (SHIP / SHIP AFTER FIXES / REWORK) as its result, so Claude can act on them.
- **`/tribunal [--base <ref>] [focus]`.** The same review, run by you. It runs immediately, even mid-turn. If the working tree is clean, it reviews the branch against `origin`'s default branch, or against `defaultBase` if you set it.
- **Side-by-side pane.** It shows both full reviews with a one-line *Agree* / *Split* summary, and says plainly when part of the change wasn't shown to the reviewers. On a narrow terminal it falls back to toasts.
- **New files count.** Untracked files are sent as additions while they fit in the size limit. Anything left out is listed.
- **No silent gaps.** You are told whenever the reviewers did not see something: commits on your branch outside an uncommitted-only review, truncation, binaries, unreadable or withheld files. The summary then says *Partial review*.

## Safety

The reviewers see the diff and nothing else. Testing showed that a temp working directory and the CLIs' usual flags were not enough: both CLIs could still read arbitrary files. So each seat is locked down explicitly:

- **An empty home for each seat.** `HOME` (and `CODEX_HOME` / `GROK_HOME`) points at a fresh temp home that holds only a link to that CLI's login. None of your MCP servers, plugins, hooks, skills, global rules, memories or always-approve settings load.
- **Codex:**
  - Runs with `-s read-only`, `--ephemeral`, `--ignore-user-config` and `--ignore-rules`.
  - Its shell, exec, multi-agent, browser, computer-use, image, hooks and web features are disabled, and so are project docs.
- **Grok:**
  - Runs with `--deny '*'`, which refuses every tool call.
  - Runs with `--no-subagents` and `--disable-web-search`, and reads the prompt from a file, never from argv.
  - Never gets `--always-approve` or `--cwd`.
- **Both:** run in a fresh directory under `/tmp` that is deleted afterwards. `git diff` runs with `--no-ext-diff --no-textconv` and no pager, so no configured helper programs run.
- **The diff and focus note are data.** Both sit inside a random-marker fence, the focus note is capped, and the verdict rules are repeated after the data. The verdict is read only from the reply's closing lines. Back in the session, both reviews are handed to Claude marked as untrusted text.
- **Secrets stay home.**
  - `.env*` (but not `.env.example`/`.sample`/`.template`), `.envrc`, `.pgpass`, `*.pem`, `*.key`, SSH keys, `.npmrc`/`.netrc` and credentials files are withheld from the reviewers. They are excluded by exact path before git reads any content, and any diff section whose header can't be parsed is withheld too.
  - High-confidence credential shapes (private keys, AWS, GitHub, Anthropic/OpenAI, Slack, Stripe, Google) are redacted before the size cut, so a cut can't split one. A private-key block with no END marker in sight is withheld from that point on.
- **Banned models:** Google/Gemini model names are refused.
- **Failures:** if a CLI is missing or times out, the result names the failed seat and returns the other seat's review. If no seat answers, the tool returns an error.

## Requirements

[`codex`](https://github.com/openai/codex) and/or [`grok`](https://x.ai) on your `PATH`, already logged in.

## Settings (`/config`)

| Field | Default |
|---|---|
| `codexEnabled` / `grokEnabled` | `true` |
| `codexModel` / `codexEffort` | `gpt-6-astra` / `medium` |
| `grokModel` / `grokEffort` | `grok-4.7` / `high` |
| `maxDiffKb` | `120` (200 max) |
| `defaultBase` | empty (the remote's default branch) |
| `timeoutMinutes` | `8` (10 max) |

## Install

```
/plugin marketplace add ccdwyer/claude-mods
/plugin install inline-tribunal@ccdwyer-mods
/reload-plugins
```

## Develop

```
claude plugin validate .
claude plugin test .
```
