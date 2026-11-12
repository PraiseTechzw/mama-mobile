# MamaBot messaging prototype

The mobile app keeps its in-app chatbot and saved conversation on the device. It can answer without a network connection. WhatsApp and SMS are optional online channels: Twilio forwards inbound messages to this Flask service, which returns a reply using TwiML.

The backend uses the same phrase-intent and translated-response catalogs as the offline app. It does not store a message history or profile. Twilio and the mobile carriers still process messages sent through their services.

## Run locally

From the repository root:

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r backend/requirements.txt
python -m flask --app backend.app run --port 5000
```

In another terminal, run the focused tests:

```sh
python -m unittest discover -s backend/tests
```

For Twilio webhook testing, expose the local port through a public HTTPS tunnel. Set these backend environment variables in `backend/.env`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `TWILIO_AUTH_TOKEN` | Yes | Validates Twilio's `X-Twilio-Signature`; keep it secret. |
| `TWILIO_WEBHOOK_BASE_URL` | Yes | Exact public HTTPS origin used for signature validation, without a trailing slash. |

The backend does not make outbound Twilio REST API calls. For replies to inbound messages, it returns TwiML and Twilio sends the reply on the same channel. An Account SID is not required for this flow, but the Auth Token is required to validate webhook signatures. Hosting platforms provide `PORT` to Gunicorn; it is not an application environment variable.

For deployment, install `backend/requirements.txt`, start the web process with `gunicorn --bind 0.0.0.0:$PORT backend.app:app`, and configure the environment variables in the hosting service rather than uploading a local `.env` file.

## Configure Twilio

Deploy this service to a public HTTPS host, set the two backend environment variables above, and configure the inbound-message webhook URLs:

| Channel | Webhook URL | Method |
| --- | --- | --- |
| SMS | `https://<host>/twilio/sms` | `POST` |
| WhatsApp | `https://<host>/twilio/whatsapp` | `POST` |

For WhatsApp, a Twilio Sandbox can be used for a prototype; each test participant must join the Sandbox. Configure the Sandbox's incoming-message URL to the WhatsApp endpoint. A production WhatsApp sender requires separate Meta/Twilio onboarding.

Twilio signs webhook requests. The backend validates `X-Twilio-Signature` against the exact configured public URL and rejects invalid requests. Do not disable this check outside automated tests. Keep HTTPS enabled.

To activate the app-to-Twilio path end to end:

1. Deploy the backend to a public HTTPS host and set `TWILIO_AUTH_TOKEN` and `TWILIO_WEBHOOK_BASE_URL` in the host's secret environment settings. The webhook base URL must be the exact public origin, without a trailing slash.
2. In the Twilio Console, set the SMS sender's incoming-message webhook to `https://<host>/twilio/sms`. For the WhatsApp Sandbox or approved WhatsApp sender, set its incoming-message webhook to `https://<host>/twilio/whatsapp`. Use `POST` for both.
3. Confirm `https://<host>/healthz` returns `ok`, then send a test message to the Twilio number. Prefix a test with `EN:`, `SN:`, or `ND:` to check a chosen reply language.
4. If the in-app contact buttons should open the configured Twilio number, set `EXPO_PUBLIC_MAMABOT_WHATSAPP_NUMBER` and/or `EXPO_PUBLIC_MAMABOT_SMS_NUMBER` in the repository-root `.env`, using international digits (Zimbabwe numbers start with `263`, without `+`), then rebuild the app. These are public contact numbers, not credentials; leave them blank to hide the buttons.

The root `.env` values configure only the mobile app's visible contact links. Keep Twilio secrets in `backend/.env` for local development or in the backend host's secret settings for deployment; do not put secrets in `EXPO_PUBLIC_*` variables.

## Prototype limitations and safety

- The local/offline and server classifiers are deterministic phrase matching, not a trained NLP model. Unsupported or ambiguous wording gets a localized fallback rather than a generated clinical answer.
- In WhatsApp/SMS, prefix a question with `EN:`, `SN:`, or `ND:` to select English, Shona, or Ndebele explicitly. Otherwise, the reply language is inferred from recognized phrases; unrecognized messages default to English.
- The backend has no access to the app's local pregnancy week or reminders and does not retain channel conversations.
- Automated outbound reminders and backend-synced in-app chat are not enabled. App reminders and in-app chat remain on-device; adding scheduled Twilio messages requires server-side persistence, explicit messaging consent, and a delivery scheduler.
- The responses and translations are a prototype content set, not a substitute for clinical review. A qualified maternal-health professional and fluent Shona/Ndebele reviewers must approve the catalog before participant testing or real health use.
- Confirm Zimbabwe SMS delivery, sender requirements, and current costs with Twilio before field testing. Longer SMS replies may be split into multiple billable segments.
- Obtain appropriate participant consent and ethics approval before collecting or evaluating real user messages. Set hosting and provider logging/retention to minimize personal data.

See [Twilio's WhatsApp API overview](https://www.twilio.com/docs/whatsapp/api), [SMS quickstart](https://www.twilio.com/docs/messaging/quickstart), and [webhook security guide](https://www.twilio.com/docs/usage/webhooks/webhooks-security) for current provider setup requirements.
