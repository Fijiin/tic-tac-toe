## Security Policy

### Reporting a vulnerability

Do not open a public GitHub issue for security vulnerabilities. Use GitHub's private vulnerability reporting instead — click **"Report a vulnerability"** on the [Security tab](https://github.com/Fijiin/tic-tac-toe/security/advisories/new) of this repository. A response can be expected within 48 hours.

### Supported versions

Only the latest commit on `master` is maintained.

### Scope

This is a client-side only app with no backend, no user accounts, and no data storage. The security surface is minimal:

- Player name input is written via `textContent`, not `innerHTML`, so injected markup is never executed.
- There are no third-party dependencies — no npm packages, no CDN scripts.
- GitHub Actions workflows run with minimal permissions and use pinned action versions.
