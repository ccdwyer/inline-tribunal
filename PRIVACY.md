# Privacy

When you run `/tribunal` or Claude calls `second_opinion`, it sends your current git diff (with secret-looking values redacted and sensitive files left out) to the reviewer CLIs you have installed: OpenAI's `codex` and xAI's `grok`. Those requests go to OpenAI and xAI under your own accounts and are covered by their terms. Nothing is sent unless you or Claude starts a review, and either reviewer can be turned off in the plugin settings.

The mod collects no analytics or telemetry, and its author receives no data from it.

Questions: https://github.com/ccdwyer/inline-tribunal/issues
