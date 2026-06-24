-- pgvector extension powers semantic similarity search over highlight
-- embeddings. Requires the postgres image to ship the extension (e.g.
-- pgvector/pgvector:pg17). This statement is a no-op if it's already enabled.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE highlights (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id      BIGINT       NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    text         TEXT         NOT NULL,
    note         TEXT,
    page_number  INTEGER,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- 768 dims matches Google's text-embedding-004 output. Nullable so the
    -- row can be inserted immediately and the embedding filled in async.
    embedding    vector(768)
);

CREATE INDEX idx_highlights_user_id  ON highlights(user_id);
CREATE INDEX idx_highlights_book_id  ON highlights(book_id);

-- HNSW is the faster ANN index for small/medium datasets. Cosine distance
-- matches Google's recommended similarity metric for text-embedding-004.
CREATE INDEX idx_highlights_embedding ON highlights
    USING hnsw (embedding vector_cosine_ops);
