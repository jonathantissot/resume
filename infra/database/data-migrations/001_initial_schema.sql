-- data-migrations/001_initial_schema.sql
-- Run once after the Aurora cluster is provisioned.
-- The CI pipeline applies migrations via flyway or psql before app deployment.

-- Users
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    username    VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    avatar_url  VARCHAR(500),
    bio         TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id        UUID NOT NULL REFERENCES users(id),
    title            VARCHAR(255) NOT NULL,
    slug             VARCHAR(100) UNIQUE NOT NULL,
    content          TEXT NOT NULL,
    excerpt          VARCHAR(500),
    cover_image_url  VARCHAR(500),
    thumbnail_url    VARCHAR(500),
    status           VARCHAR(20) DEFAULT 'draft',
    visibility       VARCHAR(20) DEFAULT 'private',
    category         VARCHAR(50),
    tags             TEXT[],
    metadata         JSONB,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    published_at     TIMESTAMPTZ,
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_status      ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at  ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug        ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author_id   ON posts(author_id);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id),
    parent_id  UUID REFERENCES comments(id),
    content    TEXT NOT NULL,
    depth      INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- Likes
CREATE TABLE IF NOT EXISTS likes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
