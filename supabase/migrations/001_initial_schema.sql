-- NotifyGov: Initial Schema
-- Run this in your Supabase SQL editor to set up the database.

-- ============================================================
-- SOURCES: Government websites being monitored
-- ============================================================
CREATE TABLE sources (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  organisation          TEXT,
  url                   TEXT NOT NULL UNIQUE,
  scraper_type          TEXT NOT NULL DEFAULT 'html_list',
  -- scraper_type: 'html_list' | 'pdf_index' | 'rss' | 'dynamic'
  scraper_config        JSONB DEFAULT '{}',
  -- e.g. {"selector": ".notification-list li a", "base_url": "https://..."}
  category              TEXT[] DEFAULT '{}',
  -- e.g. ['exam', 'recruitment', 'result', 'admit_card']
  states                TEXT[] DEFAULT '{"All India"}',
  check_interval_hours  INT NOT NULL DEFAULT 2,
  priority              INT NOT NULL DEFAULT 5, -- 1=highest, 10=lowest
  is_enabled            BOOLEAN NOT NULL DEFAULT true,
  health_status         TEXT NOT NULL DEFAULT 'unknown',
  -- 'unknown' | 'ok' | 'error' | 'rate_limited' | 'blocked'
  last_checked_at       TIMESTAMPTZ,
  avg_notices_per_month INT,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SCRAPE LOGS: Audit trail of every scrape attempt
-- ============================================================
CREATE TABLE scrape_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id        UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  checked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status           TEXT NOT NULL, -- 'ok' | 'error' | 'timeout' | 'blocked' | 'skipped'
  http_status      INT,
  new_docs_found   INT NOT NULL DEFAULT 0,
  error_msg        TEXT,
  duration_ms      INT
);

CREATE INDEX idx_scrape_logs_source_id ON scrape_logs(source_id);
CREATE INDEX idx_scrape_logs_checked_at ON scrape_logs(checked_at DESC);

-- ============================================================
-- DOCUMENTS: Raw fetched pages and PDFs (for deduplication)
-- ============================================================
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id    UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  source_url   TEXT NOT NULL,
  content_hash TEXT NOT NULL,  -- SHA-256 of raw content
  doc_type     TEXT,           -- 'pdf' | 'html'
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  storage_path TEXT            -- Supabase Storage path to original file
);

CREATE UNIQUE INDEX idx_documents_hash ON documents(content_hash);
CREATE INDEX idx_documents_source_id ON documents(source_id);

-- ============================================================
-- NOTIFICATIONS: Processed, published notifications
-- ============================================================
CREATE TABLE notifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id             UUID NOT NULL REFERENCES sources(id),
  document_id           UUID REFERENCES documents(id),
  title                 TEXT NOT NULL,
  organisation          TEXT,
  category              TEXT,
  -- 'exam' | 'recruitment' | 'result' | 'admit_card' | 'corrigendum' | 'syllabus'
  summary               TEXT,           -- AI-generated plain English summary
  official_url          TEXT NOT NULL,  -- Link to original official page or PDF
  apply_url             TEXT,           -- Direct application portal / registration link (e.g. upsconline.nic.in, ssc.gov.in/login, rrbapply.gov.in)
  published_at          TIMESTAMPTZ,    -- Date on the official document (may be NULL if unverifiable)
  first_seen_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_checked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  application_start     TIMESTAMPTZ,
  application_deadline  TIMESTAMPTZ,
  exam_date             TIMESTAMPTZ,
  result_date           TIMESTAMPTZ,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  extraction_confidence FLOAT,          -- 0.0 to 1.0
  needs_review          BOOLEAN NOT NULL DEFAULT false,
  version               INT NOT NULL DEFAULT 1,
  search_vector         TSVECTOR        -- for full-text search
);

CREATE INDEX idx_notifications_source_id ON notifications(source_id);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_first_seen ON notifications(first_seen_at DESC);
CREATE INDEX idx_notifications_deadline ON notifications(application_deadline);
CREATE INDEX idx_notifications_search ON notifications USING GIN(search_vector);
CREATE INDEX idx_notifications_active ON notifications(is_active) WHERE is_active = true;

-- Auto-update search vector on insert/update
CREATE OR REPLACE FUNCTION update_notification_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.organisation, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_search_vector_update
  BEFORE INSERT OR UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_notification_search_vector();

-- ============================================================
-- RECRUITMENT DETAILS: Structured fields from AI extraction
-- ============================================================
CREATE TABLE recruitment_details (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id         UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  vacancies               INT,
  qualification           TEXT[],   -- ['BTech', 'Diploma', 'Graduation']
  disciplines             TEXT[],   -- ['Mechanical', 'Civil', 'Computer Science']
  min_age                 INT,
  max_age_general         INT,
  max_age_obc             INT,
  max_age_sc_st           INT,
  application_fee_general INT,      -- in INR
  application_fee_obc     INT,
  application_fee_sc_st   INT,
  application_fee_ews     INT,
  apply_link              TEXT,
  salary_range            TEXT,     -- "₹35,400–₹1,12,400 (Level 6)"
  pay_scale               TEXT,
  states_applicable       TEXT[],   -- ['Kerala', 'All India']
  raw_eligibility         TEXT,     -- Full eligibility block verbatim from doc
  UNIQUE(notification_id)
);

-- ============================================================
-- NOTIFICATION VERSIONS: Track corrigenda and amendments
-- ============================================================
CREATE TABLE notification_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  version         INT NOT NULL,
  changed_fields  JSONB,
  -- e.g. {"application_deadline": {"old": "2026-01-01", "new": "2026-01-15"}}
  corrigendum_url TEXT,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_versions_notification_id ON notification_versions(notification_id);

-- ============================================================
-- USER PROFILES: Extended profile for Supabase Auth users
-- ============================================================
CREATE TABLE user_profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  email               TEXT,

  -- Core (collected at signup)
  qualification       TEXT,
  -- 'class10' | 'class12' | 'iti' | 'diploma' | 'graduation' | 'btech' | 'postgrad' | 'phd'
  graduation_year     INT,
  preferred_states    TEXT[] DEFAULT '{}',

  -- Progressive (prompted after signup)
  age                 INT,
  category            TEXT DEFAULT 'general',
  -- 'general' | 'obc' | 'obc_ncl' | 'sc' | 'st' | 'ews'
  disciplines         TEXT[] DEFAULT '{}',
  experience_years    INT DEFAULT 0,
  target_exams        TEXT[] DEFAULT '{}',
  job_types           TEXT[] DEFAULT '{}',
  -- 'government_job' | 'psu' | 'teaching' | 'defence' | 'banking' | 'research'

  -- Alert preferences
  alert_email         BOOLEAN NOT NULL DEFAULT true,
  alert_browser_push  BOOLEAN NOT NULL DEFAULT true,
  alert_inapp         BOOLEAN NOT NULL DEFAULT true,
  alert_frequency     TEXT NOT NULL DEFAULT 'instant',
  -- 'instant' | 'daily_digest' | 'weekly'
  quiet_hours_start   INT,   -- e.g. 22 = 10pm
  quiet_hours_end     INT,   -- e.g. 7 = 7am

  -- Freemium
  plan                TEXT NOT NULL DEFAULT 'free', -- 'free' | 'premium'
  plan_expires_at     TIMESTAMPTZ,

  -- Onboarding progress
  profile_completeness INT NOT NULL DEFAULT 0, -- 0–100
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PUSH SUBSCRIPTIONS: Web Push endpoint registry
-- ============================================================
CREATE TABLE push_subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL UNIQUE,
  p256dh       TEXT NOT NULL,   -- Web Push encryption key
  auth_key     TEXT NOT NULL,   -- Web Push auth secret
  device_type  TEXT,            -- 'android' | 'ios' | 'desktop'
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- ============================================================
-- USER NOTIFICATIONS: In-app notification inbox
-- ============================================================
CREATE TABLE user_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  -- 'new_match' | 'deadline_reminder' | 'corrigendum' | 'digest_summary'
  title           TEXT NOT NULL,
  body            TEXT,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  is_actioned     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_unread ON user_notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================
-- SAVED NOTIFICATIONS: User bookmarks + application tracking
-- ============================================================
CREATE TABLE saved_notifications (
  user_id            UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_id    UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  application_status TEXT NOT NULL DEFAULT 'saved',
  -- 'saved' | 'applied' | 'appeared' | 'result_pending' | 'selected' | 'not_selected'
  notes              TEXT,
  saved_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at         TIMESTAMPTZ,
  PRIMARY KEY (user_id, notification_id)
);

-- ============================================================
-- ALERT DELIVERIES: Delivery audit log
-- ============================================================
CREATE TABLE alert_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  channel         TEXT NOT NULL, -- 'email' | 'push' | 'inapp'
  delivered_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'sent' | 'failed' | 'read'
  error_msg       TEXT
);

CREATE INDEX idx_alert_deliveries_user_id ON alert_deliveries(user_id);
CREATE INDEX idx_alert_deliveries_notification_id ON alert_deliveries(notification_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_deliveries ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users manage own profile"
  ON user_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users manage own saved notifications"
  ON saved_notifications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users read own notifications"
  ON user_notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON user_notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Notifications and sources are publicly readable
CREATE POLICY "Public read notifications"
  ON notifications FOR SELECT USING (true);

CREATE POLICY "Public read sources"
  ON sources FOR SELECT USING (true);

-- ============================================================
-- SEED: Initial central government sources
-- ============================================================
INSERT INTO sources (name, organisation, url, scraper_type, category, states, priority) VALUES
  ('UPSC', 'Union Public Service Commission', 'https://upsc.gov.in/examinations/active-examinations', 'html_list', ARRAY['exam', 'recruitment'], ARRAY['All India'], 1),
  ('SSC', 'Staff Selection Commission', 'https://ssc.gov.in/portal/latestNotices', 'html_list', ARRAY['exam', 'recruitment'], ARRAY['All India'], 1),
  ('RRB', 'Railway Recruitment Boards', 'https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554', 'html_list', ARRAY['recruitment'], ARRAY['All India'], 1),
  ('IBPS', 'Institute of Banking Personnel Selection', 'https://www.ibps.in/current-news/', 'html_list', ARRAY['exam', 'recruitment'], ARRAY['All India'], 2),
  ('SBI Careers', 'State Bank of India', 'https://bank.sbi/web/careers/current-openings', 'html_list', ARRAY['recruitment'], ARRAY['All India'], 2),
  ('NTA', 'National Testing Agency', 'https://nta.ac.in/Notices', 'html_list', ARRAY['exam'], ARRAY['All India'], 2),
  ('Employment News', 'Ministry of Information & Broadcasting', 'https://employmentnews.gov.in/NewLayout/EmploymentNewsAPI/api/EN/GetNEWS', 'html_list', ARRAY['recruitment', 'exam'], ARRAY['All India'], 2),
  ('DRDO', 'Defence Research & Development Organisation', 'https://www.drdo.gov.in/careers', 'html_list', ARRAY['recruitment'], ARRAY['All India'], 3),
  ('ISRO', 'Indian Space Research Organisation', 'https://www.isro.gov.in/Careers.html', 'html_list', ARRAY['recruitment'], ARRAY['All India'], 3),
  ('FCI', 'Food Corporation of India', 'https://fci.gov.in/recruitments.php', 'html_list', ARRAY['recruitment'], ARRAY['All India'], 3);
