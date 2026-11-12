CREATE TABLE IF NOT EXISTS mamabot_language_session (
    sender_hash BYTEA PRIMARY KEY CHECK (octet_length(sender_hash) = 32),
    language TEXT CHECK (language IN ('en', 'sn', 'nd')),
    awaiting_selection BOOLEAN NOT NULL DEFAULT TRUE,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    CHECK (
        (awaiting_selection AND language IS NULL)
        OR (NOT awaiting_selection AND language IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS mamabot_language_session_expires_at_idx
    ON mamabot_language_session (expires_at);
