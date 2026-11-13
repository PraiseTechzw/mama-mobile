# Contributing

Thanks for helping improve MamaBot. Changes should keep the app safe, usable on mobile, and clear about the limits of prototype health information.

## Before you start

1. Check existing issues and pull requests for related work.
2. For a substantial change, open an issue first to agree on scope.
3. Never include API keys, credentials, real patient information, or identifiable chat transcripts in code, tests, issues, or screenshots.

## Local setup

Install the JavaScript dependencies and start the Expo app:

```sh
bun install
cp .env.example .env
bun run start
```

For backend work, follow the Python setup in [backend/README.md](backend/README.md).

## Before opening a pull request

Run the relevant checks from the repository root:

```sh
bun run lint
bun run typecheck
python -m unittest discover -s backend/tests
```

Include a focused description of the change, how it was tested, and screenshots or a short recording for visible UI changes when possible. Use synthetic data in all captures.

## Health content and translations

- Do not present MamaBot as a clinician, diagnostic service, or emergency response service.
- Do not introduce model-generated medical advice. The online classifier should continue selecting from the fixed response catalog.
- Do not weaken urgent-symptom handling or safety messaging to make a test pass.
- Health content and English, ChiShona, and isiNdebele translations require qualified clinical and fluent-language review before real-world use. Mark unreviewed content as prototype material.

## Pull requests

- Keep changes focused and explain the user impact.
- Update relevant documentation and tests.
- Call out changes to data collection, network requests, permissions, notifications, or third-party providers.
- Confirm that new secrets and local configuration files are not included.
