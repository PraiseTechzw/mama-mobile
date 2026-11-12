# MamaBot messaging prototype

The mobile app keeps its in-app chatbot and saved conversation on the device. Offline replies come from the shared response catalog. When a user explicitly turns on online AI, the app sends only the current question and selected language to this Flask service. The service can use OpenRouter to classify the language and topic, then selects a fixed catalog response; it does not ask a model to generate medical advice. If the service or model is unavailable, the app uses its local reply.

WhatsApp and SMS are optional online channels: Twilio forwards inbound messages to this Flask service, which returns a reply using TwiML. They can use the same OpenRouter classifier after `OPENROUTER_MESSAGING_ENABLED=true`; keep this disabled until users are clearly told that their messages go to OpenRouter. The backend does not store a message history or profile. Twilio, carriers, OpenRouter, and the selected inference provider still process online messages.

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

For deployment, install `requirements.txt` from the repository root (it includes `backend/requirements.txt`), start the web process with `gunicorn --bind 0.0.0.0:$PORT backend.app:app`, and configure the environment variables in the hosting service rather than uploading a local `.env` file.

## Deploy to Render

The repository-root `render.yaml` defines a Render Blueprint for the Flask backend. It deliberately keeps Render's **Root Directory** at the repository root (`.`): the app imports the `backend` package and reads the shared catalog from `shared/`. Do not set the service root directory to `backend`.

To deploy:

1. Push this repository and branch to GitHub, sign in to [Render](https://dashboard.render.com/), choose **New → Blueprint**, and connect this repository. Render reads `render.yaml`; review the service settings and create the Blueprint.
2. Provide `OPENROUTER_API_KEY` and `TWILIO_AUTH_TOKEN` as secret values when prompted. Keep `OPENROUTER_MESSAGING_ENABLED` set to `false` for initial testing. The model defaults to the free-model router.
3. Wait for the first deploy. Render assigns a public HTTPS origin such as `https://mamabot-backend.onrender.com`. Confirm that `<origin>/healthz` returns `ok`.
4. In the Render service's **Environment** settings, set `TWILIO_WEBHOOK_BASE_URL` to that exact origin, without a trailing slash. Save changes and wait for the service to redeploy.
5. In Twilio, configure the SMS and WhatsApp incoming-message webhooks as shown below, using the Render origin and `POST`.
6. To enable the in-app online toggle, set `EXPO_PUBLIC_MAMABOT_API_URL` in the repository-root `.env` to the Render origin, restart Expo, and rebuild the app when making a release build. This URL is public; do not put credentials in it.
7. Test the app and Twilio Sandbox with non-sensitive sample questions. Leave `OPENROUTER_MESSAGING_ENABLED=false` until messaging users are informed that their message will also be classified by OpenRouter and applicable consent is in place.

If an existing Render service still fails, open **Settings → Build & Deploy** and set **Root Directory** to the repository root (clear the field or use `.`), **Build Command** to `pip install -r requirements.txt`, and **Start Command** to `gunicorn --bind 0.0.0.0:$PORT backend.app:app`, then redeploy the latest commit. The root `requirements.txt` includes the backend's pinned dependencies, so it also works with Render's existing `pip install -r requirements.txt` setting.

The Blueprint uses Render's Free plan for academic testing. Free web services spin down after 15 minutes without traffic and can take about a minute to start again; this can cause delayed or missed Twilio webhook responses. Render documents Free instances as unsuitable for production. Use an always-on paid service before any dependable field trial. The service does not store user state, and its filesystem is not used for persistence.

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

The root `.env` values configure the mobile app's public contact links and backend origin. Keep Twilio and OpenRouter secrets in `backend/.env` for local development or in the backend host's secret settings for deployment; do not put secrets in `EXPO_PUBLIC_*` variables.

## Optional OpenRouter classifier

The app's online mode requires `EXPO_PUBLIC_MAMABOT_API_URL` in the repository-root `.env`, set to the Flask service's HTTPS origin (without a trailing slash). Expo embeds `EXPO_PUBLIC_*` values in the app bundle, so this must never contain a secret. Restart Expo after changing it.

The backend's optional online classifier uses:

| Variable | Required for model classification | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | Secret OpenRouter credential. Configure only on the backend host or in ignored `backend/.env`. |
| `OPENROUTER_MODEL` | No | Defaults to `openrouter/free`, which picks an available free model. Set a specific OpenRouter model ID to override it. |
| `OPENROUTER_MESSAGING_ENABLED` | For WhatsApp/SMS only | Defaults to `false`; set to `true` only after messaging users are informed and consent requirements are met. |

The model returns only a validated intent ID, language, and confidence. The service rejects unknown/low-confidence classifications and uses existing local matching instead. It always bypasses the model when local urgent-symptom patterns match. Requests ask OpenRouter to route only to providers that deny data collection and support zero-data-retention; if no provider meets those requirements, classification falls back locally. Review OpenRouter's current privacy terms and the selected provider's handling before real-user testing.

The endpoint sends no app profile, pregnancy week, reminders, or chat history. Set spending limits for the OpenRouter key and hosting-level request limits before exposing the service publicly. The fixed answer catalog is still prototype content and has not been clinically or linguistically approved; the model does not make it safer or more complete.

## Prototype limitations and safety

- Offline classification is deterministic phrase matching, not an AI model. Online OpenRouter classification can better map varied questions to the fixed topics, but it does not generate or verify clinical guidance.
- In WhatsApp/SMS, prefix a question with `EN:`, `SN:`, or `ND:` to select English, Shona, or Ndebele explicitly. Otherwise, the reply language is inferred from recognized phrases; unrecognized messages default to English.
- The backend has no access to the app's local pregnancy week or reminders and does not retain channel conversations.
- Automated outbound reminders and backend-synced in-app chat are not enabled. App reminders and in-app chat remain on-device; adding scheduled Twilio messages requires server-side persistence, explicit messaging consent, and a delivery scheduler.
- The responses and translations are a prototype content set, not a substitute for clinical review. A qualified maternal-health professional and fluent Shona/Ndebele reviewers must approve the catalog before participant testing or real health use.
- Confirm Zimbabwe SMS delivery, sender requirements, and current costs with Twilio before field testing. Longer SMS replies may be split into multiple billable segments.
- Obtain appropriate participant consent and ethics approval before collecting or evaluating real user messages. Set hosting and provider logging/retention to minimize personal data.

See [Twilio's WhatsApp API overview](https://www.twilio.com/docs/whatsapp/api), [SMS quickstart](https://www.twilio.com/docs/messaging/quickstart), and [webhook security guide](https://www.twilio.com/docs/usage/webhooks/webhooks-security) for current provider setup requirements.
