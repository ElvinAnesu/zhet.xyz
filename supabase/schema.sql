-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  bio TEXT,
  preferred_currencies TEXT[] DEFAULT ARRAY['USD'],
  rating DECIMAL(3,1) DEFAULT 0,
  completed_exchanges INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read any profile
CREATE POLICY "Allow users to read any profile"
  ON profiles
  FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
  ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow unauthenticated profile creation during signup
CREATE POLICY "Allow unauthenticated profile creation during signup"
  ON profiles
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to update only their own profile
CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create exchange_ads table
CREATE TABLE IF NOT EXISTS exchange_ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL,
  rate DECIMAL(15,6) NOT NULL,
  target_currency TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '24 hours') NOT NULL
);

-- Create RLS policies for exchange_ads
ALTER TABLE exchange_ads ENABLE ROW LEVEL SECURITY;

-- Allow users to read any active ad
CREATE POLICY "Allow users to read any active ad"
  ON exchange_ads
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

-- Allow users to insert their own ads
CREATE POLICY "Allow users to insert their own ads"
  ON exchange_ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own ads
CREATE POLICY "Allow users to update their own ads"
  ON exchange_ads
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own ads
CREATE POLICY "Allow users to delete their own ads"
  ON exchange_ads
  FOR DELETE USING (auth.uid() = user_id);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES exchange_ads(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for chats
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Allow users to read chats they are part of
CREATE POLICY "Allow users to read chats they are part of"
  ON chats
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allow users to insert chats they are part of
CREATE POLICY "Allow users to insert chats they are part of"
  ON chats
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read BOOLEAN DEFAULT false
);

-- Create RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read messages in chats they are part of
CREATE POLICY "Allow users to read messages in chats they are part of"
  ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND (chats.sender_id = auth.uid() OR chats.receiver_id = auth.uid())
    )
  );

-- Allow users to insert messages in chats they are part of
CREATE POLICY "Allow users to insert messages in chats they are part of"
  ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND (chats.sender_id = auth.uid() OR chats.receiver_id = auth.uid())
    )
  );

-- Create function to update chat updated_at on new message
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats SET updated_at = NOW() WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update chat updated_at on new message
CREATE TRIGGER update_chat_updated_at_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_updated_at();

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) NOT NULL,
  ad_id UUID REFERENCES exchange_ads(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow users to read any review
CREATE POLICY "Allow users to read any review"
  ON reviews
  FOR SELECT USING (true);

-- Allow users to insert reviews for ads they participated in
CREATE POLICY "Allow users to insert reviews for ads they participated in"
  ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM exchange_ads
      WHERE exchange_ads.id = reviews.ad_id
      AND (exchange_ads.user_id = auth.uid() OR reviews.reviewee_id = exchange_ads.user_id)
    )
  );

-- Create function to update user rating on new review
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user rating on new review
CREATE TRIGGER update_user_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();

-- Create function to update completed_exchanges count on ad completion
CREATE OR REPLACE FUNCTION update_completed_exchanges()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE profiles SET completed_exchanges = completed_exchanges + 1 WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update completed_exchanges count on ad completion
CREATE TRIGGER update_completed_exchanges_trigger
AFTER UPDATE ON exchange_ads
FOR EACH ROW
EXECUTE FUNCTION update_completed_exchanges();

-- Create a secure function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create profiles for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 