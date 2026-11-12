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

For Twilio webhook testing, expose the local port through a public HTTPS tunnel. Create `backend/.env` from `backend/.env.example`, set `TWILIO_AUTH_TOKEN`, and set `TWILIO_WEBHOOK_BASE_URL` to the tunnel's public origin, without a trailing slash. Keep the token secret and out of source control.

For deployment, install `backend/requirements.txt`, start the web process with `gunicorn --bind 0.0.0.0:$PORT backend.app:app`, and configure the environment variables in the hosting service rather than uploading a local `.env` file.

## Configure Twilio

Deploy this service to a public HTTPS host, set the two backend environment variables above, and configure the inbound-message webhook URLs:

| Channel | Webhook URL | Method |
| --- | --- | --- |
| SMS | `https://<host>/twilio/sms` | `POST` |
| WhatsApp | `https://<host>/twilio/whatsapp` | `POST` |

For WhatsApp, a Twilio Sandbox can be used for a prototype; each test participant must join the Sandbox. Configure the Sandbox's incoming-message URL to the WhatsApp endpoint. A production WhatsApp sender requires separate Meta/Twilio onboarding.

Twilio signs webhook requests. The backend validates `X-Twilio-Signature` against the exact configured public URL and rejects invalid requests. Do not disable this check outside automated tests. Keep HTTPS enabled.

The app's optional channel buttons are configured at build time with `EXPO_PUBLIC_MAMABOT_WHATSAPP_NUMBER` and `EXPO_PUBLIC_MAMABOT_SMS_NUMBER` in the repository-root `.env` file. Use the international number digits, including Zimbabwe's `263` country code and without `+`. These are public contact numbers, not credentials. The app does not show the buttons until a valid number is configured.

## Prototype limitations and safety

- The local/offline and server classifiers are deterministic phrase matching, not a trained NLP model. Unsupported or ambiguous wording gets a localized fallback rather than a generated clinical answer.
- In WhatsApp/SMS, prefix a question with `EN:`, `SN:`, or `ND:` to select English, Shona, or Ndebele explicitly. Otherwise, the reply language is inferred from recognized phrases; unrecognized messages default to English.
- The backend has no access to the app's local pregnancy week or reminders and does not retain channel conversations.
- The responses and translations are a prototype content set, not a substitute for clinical review. A qualified maternal-health professional and fluent Shona/Ndebele reviewers must approve the catalog before participant testing or real health use.
- Confirm Zimbabwe SMS delivery, sender requirements, and current costs with Twilio before field testing. Longer SMS replies may be split into multiple billable segments.
- Obtain appropriate participant consent and ethics approval before collecting or evaluating real user messages. Set hosting and provider logging/retention to minimize personal data.

See [Twilio's WhatsApp API overview](https://www.twilio.com/docs/whatsapp/api), [SMS quickstart](https://www.twilio.com/docs/messaging/quickstart), and [webhook security guide](https://www.twilio.com/docs/usage/webhooks/webhooks-security) for current provider setup requirements.
