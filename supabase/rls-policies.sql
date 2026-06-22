-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomad_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles RLS Policies
-- ============================================

-- Everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert own profile (handled by trigger, but just in case)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Articles RLS Policies
-- ============================================

-- Published articles are viewable by everyone
CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published');

-- Authors can view own articles (any status)
CREATE POLICY "Authors can view own articles"
  ON articles FOR SELECT
  USING (auth.uid() = author_id);

-- Editors and admins can view all articles
CREATE POLICY "Editors and admins can view all articles"
  ON articles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Authenticated users can insert articles
CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update own articles
CREATE POLICY "Authors can update own articles"
  ON articles FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Editors and admins can update article status
CREATE POLICY "Editors and admins can update article status"
  ON articles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Authors can delete own articles (draft only)
CREATE POLICY "Authors can delete own draft articles"
  ON articles FOR DELETE
  USING (auth.uid() = author_id AND status = 'draft');

-- ============================================
-- Podcast Episodes RLS Policies
-- ============================================

-- Everyone can view published podcast episodes
CREATE POLICY "Published podcasts are viewable by everyone"
  ON podcast_episodes FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());

-- Editors and admins can view all podcasts
CREATE POLICY "Editors and admins can view all podcasts"
  ON podcast_episodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Editors and admins can insert podcasts
CREATE POLICY "Editors and admins can insert podcasts"
  ON podcast_episodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- Editors and admins can update podcasts
CREATE POLICY "Editors and admins can update podcasts"
  ON podcast_episodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('editor', 'admin')
    )
  );

-- ============================================
-- Nomad Spots RLS Policies
-- ============================================

-- Active spots are viewable by everyone
CREATE POLICY "Active spots are viewable by everyone"
  ON nomad_spots FOR SELECT
  USING (status = 'active');

-- Creators can view own spots (any status)
CREATE POLICY "Creators can view own spots"
  ON nomad_spots FOR SELECT
  USING (auth.uid() = creator_id);

-- Authenticated users can insert spots
CREATE POLICY "Authenticated users can insert spots"
  ON nomad_spots FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update own spots
CREATE POLICY "Creators can update own spots"
  ON nomad_spots FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Admins can update any spot
CREATE POLICY "Admins can update any spot"
  ON nomad_spots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Creators can delete own spots
CREATE POLICY "Creators can delete own spots"
  ON nomad_spots FOR DELETE
  USING (auth.uid() = creator_id);

-- ============================================
-- Bookmarks RLS Policies
-- ============================================

-- Users can view own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Helper functions for checking roles
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is editor or admin
CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('editor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
