# MamaBot messaging prototype

The mobile app keeps its in-app chatbot and saved conversation on the device. Offline replies come from the shared English, Shona, and Ndebele response catalog. In-app replies follow the language selected in Settings. When online chat is enabled and the backend URL is configured, the app sends the current question, selected app language, pregnancy week, and up to six recent chat messages to this Flask service. It does not send the user's name or phone number. The service uses local matching to identify the topic and language, then gives the online model relevant reviewed catalog guidance when available so it can explain that guidance conversationally. Urgent questions stay local. If OpenRouter or the model is unavailable, the app uses its local reply.

WhatsApp and SMS are optional online channels: Twilio forwards inbound messages to this Flask service, which returns a reply using TwiML. With PostgreSQL configured, new senders are asked to choose English, Shona, or Ndebele; the selected language is used for replies until the session expires after 24 hours of inactivity. Users can change it by sending “change language”. The backend stores only a keyed hash of the channel and sender, the language choice, and session timestamps; it does not store message text or a conversation history. If PostgreSQL is not configured, the existing automatic language detection flow remains active. Twilio, carriers, OpenRouter, and the selected inference provider still process online messages. Tell users when their messages may be sent to OpenRouter for classification or response generation, and obtain consent before live use.

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
| `DATABASE_URL` | To remember messaging language | PostgreSQL connection URL. The service creates `mamabot_language_session` from `backend/schema.sql` at startup. |
| `LANGUAGE_SESSION_HASH_KEY` | To remember messaging language | Secret key used to HMAC sender identifiers. Set a random, high-entropy value; never reuse an API key. |

The backend does not make outbound Twilio REST API calls. For replies to inbound messages, it returns TwiML and Twilio sends the reply on the same channel. An Account SID is not required for this flow, but the Auth Token is required to validate webhook signatures. Hosting platforms provide `PORT` to Gunicorn; it is not an application environment variable.

For deployment, install `requirements.txt` from the repository root (it includes `backend/requirements.txt`), start the web process with `gunicorn --bind 0.0.0.0:$PORT backend.app:app`, and configure the environment variables in the hosting service rather than uploading a local `.env` file.

## Deploy to Render

The repository-root `render.yaml` defines a Render Blueprint for the Flask backend. It deliberately keeps Render's **Root Directory** at the repository root (`.`): the app imports the `backend` package and reads the shared catalog from `shared/`. Do not set the service root directory to `backend`.

To deploy:

1. Push this repository and branch to GitHub, sign in to [Render](https://dashboard.render.com/), choose **New → Blueprint**, and connect this repository. Render reads `render.yaml`; review the service settings and create the Blueprint.
2. Provide `OPENROUTER_API_KEY` and `TWILIO_AUTH_TOKEN` as secret values when prompted. To enable persistent WhatsApp/SMS language choice, also set `DATABASE_URL` to your PostgreSQL connection URL and `LANGUAGE_SESSION_HASH_KEY` to a generated secret. For an existing Render service, add both under **Environment** and redeploy. The service creates the session table automatically. `OPENROUTER_MESSAGING_ENABLED` defaults to `true` for automatic topic classification; disable it if messaging users have not been informed that their messages may be sent to OpenRouter. The default free classifier uses Perplexity's Decisions API and may process or retain submitted messages under Perplexity's terms; disclose this and obtain consent before enabling it for real users.
3. Wait for the first deploy. Render assigns a public HTTPS origin such as `https://mamabot-backend.onrender.com`. Confirm that `<origin>/healthz` returns `ok`.
4. In the Render service's **Environment** settings, set `TWILIO_WEBHOOK_BASE_URL` to that exact origin, without a trailing slash. Save changes and wait for the service to redeploy.
5. In Twilio, configure the SMS and WhatsApp incoming-message webhooks as shown below, using the Render origin and `POST`.
6. To enable automatic in-app online chat, set `EXPO_PUBLIC_MAMABOT_API_URL` in the repository-root `.env` to the Render origin, restart Expo, and rebuild the app when making a release build. This URL is public; do not put credentials in it.
7. Test the app and Twilio Sandbox with non-sensitive sample questions. Do not use real or identifying health details. Inform users when questions may be sent to OpenRouter for classification or response generation, and obtain applicable consent before real-user testing.

If an existing Render service still fails, open **Settings → Build & Deploy** and set **Root Directory** to the repository root (clear the field or use `.`), **Build Command** to `pip install -r requirements.txt`, and **Start Command** to `gunicorn --bind 0.0.0.0:$PORT backend.app:app`, then redeploy the latest commit. The root `requirements.txt` includes the backend's pinned dependencies, so it also works with Render's existing `pip install -r requirements.txt` setting.

The Blueprint uses Render's Free plan for academic testing. Free web services spin down after 15 minutes without traffic and can take about a minute to start again; this can cause delayed or missed Twilio webhook responses. Render documents Free instances as unsuitable for production. Use an always-on paid service before any dependable field trial. PostgreSQL is used only for temporary messaging language sessions; the service filesystem is not used for persistence.

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
3. Confirm `https://<host>/healthz` returns `ok`. On first contact, choose `1` for English, `2` for Shona, or `3` for Ndebele; then send a non-sensitive test question to confirm replies stay in that language. Send “change language” to choose again. A choice expires after 24 hours without a message.
4. If the in-app contact buttons should open the configured Twilio number, set `EXPO_PUBLIC_MAMABOT_WHATSAPP_NUMBER` and/or `EXPO_PUBLIC_MAMABOT_SMS_NUMBER` in the repository-root `.env`, using international digits (Zimbabwe numbers start with `263`, without `+`), then rebuild the app. These are public contact numbers, not credentials; leave them blank to hide the buttons.

The root `.env` values configure the mobile app's public contact links and backend origin. Keep Twilio and OpenRouter secrets in `backend/.env` for local development or in the backend host's secret settings for deployment; do not put secrets in `EXPO_PUBLIC_*` variables.

## Optional OpenRouter AI

The app's online chat requires `EXPO_PUBLIC_MAMABOT_API_URL` in the repository-root `.env`, set to the Flask service's HTTPS origin (without a trailing slash), and the backend's `OPENROUTER_API_KEY`. Expo embeds `EXPO_PUBLIC_*` values in the app bundle, so this must never contain a secret. Restart Expo after changing it. The app sends the current question, selected language, pregnancy week, and up to six recent messages for context; it never sends the saved name, phone number, reminders, or location. Questions and context are sent to OpenRouter and may be processed or retained by the selected model provider, so disclose this and obtain consent before enabling online use.

Configure the backend's online features with:

| Variable | When needed | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes for online chat; optional for messaging | Secret OpenRouter credential. Configure only on the backend host or in ignored `backend/.env`. |
| `OPENROUTER_CHAT_MODEL` | No | Chat Completions model used to generate conversational in-app replies. Defaults to `openrouter/free`; choose a model available to your OpenRouter account if overriding it. |
| `OPENROUTER_MODEL` | No | WhatsApp/SMS classification model. Defaults to `perplexity/pplx-decider-v1.3:free`, which uses OpenRouter's Decisions API. If overridden, select a model that supports that API. |
| `OPENROUTER_MESSAGING_ENABLED` | For WhatsApp/SMS only | Defaults to `true` for automatic topic/language detection. Set to `false` to keep those channels on local phrase matching only. Inform users and meet consent requirements before live use. |

In-app chat uses OpenRouter's Chat Completions API to generate a reply grounded in reviewed MamaBot guidance when the local topic matcher finds a relevant answer. It falls back to local replies on provider errors and bypasses online generation for locally detected urgent symptoms. The separate WhatsApp/SMS classifier returns only a validated intent, language, and confidence; unknown or low-confidence results fall back to local matching. Review the current privacy and retention terms of OpenRouter and the selected provider, inform users, and obtain consent before enabling online features with real health information.

The endpoint sends no full app profile, phone number, or reminders. It receives only the current question, selected language, pregnancy week, and up to six recent messages for each online chat request; it does not retain those messages. Set spending limits for the OpenRouter key and hosting-level request limits before exposing the service publicly. The fixed answer catalog is still prototype content and has not been clinically or linguistically approved; the model does not make it safer or more complete.

## Prototype limitations and safety

- Offline topic and language detection is deterministic phrase matching, not an AI model. Online chat can explain reviewed answers conversationally, but generated text is not a substitute for clinical review and may still be incomplete or incorrect.
- WhatsApp/SMS automatically classifies topic and language using OpenRouter by default; local phrase matching remains the fallback if OpenRouter is unavailable. Language detection quality must be tested with fluent English, Shona, and Ndebele speakers.
- Reminders remain on-device and are not sent to the backend. In-app chat history is stored on-device; up to six recent messages are included with each online chat request for context but are not retained by this backend.
- Automated outbound reminders and backend-synced in-app chat are not enabled. Adding scheduled Twilio messages requires server-side persistence, explicit messaging consent, and a delivery scheduler.
- The responses and translations are a prototype content set, not a substitute for clinical review. A qualified maternal-health professional and fluent Shona/Ndebele reviewers must approve the catalog before participant testing or real health use.
- Confirm Zimbabwe SMS delivery, sender requirements, and current costs with Twilio before field testing. Longer SMS replies may be split into multiple billable segments.
- Obtain appropriate participant consent and ethics approval before collecting or evaluating real user messages. Set hosting and provider logging/retention to minimize personal data.

See [Twilio's WhatsApp API overview](https://www.twilio.com/docs/whatsapp/api), [SMS quickstart](https://www.twilio.com/docs/messaging/quickstart), and [webhook security guide](https://www.twilio.com/docs/usage/webhooks/webhooks-security) for current provider setup requirements.
