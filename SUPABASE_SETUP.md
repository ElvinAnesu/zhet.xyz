# Supabase Setup for Zhet Currency Exchange Platform

This guide will walk you through setting up Supabase for the Zhet currency exchange platform.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name for your project (e.g., "zhet-currency-exchange")
4. Set a secure database password
5. Choose the region closest to your users
6. Click "Create new project"

## 2. Set Up Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project dashboard under Settings > API.

## 3. Create Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase/schema.sql` from this project
3. Paste the SQL into the editor and run it

This will create the following tables:
- `profiles`: User profiles with personal information
- `exchange_ads`: Currency exchange advertisements
- `chats`: Chat sessions between users
- `messages`: Individual messages in chats
- `reviews`: User reviews and ratings

### Key Features of the Schema

- **Automatic Profile Creation**: When a user signs up, a profile is automatically created via a database trigger
- **Row Level Security (RLS)**: All tables have security policies to protect data
- **Automated Rating System**: User ratings are automatically calculated based on reviews
- **Exchange Tracking**: Completed exchanges are tracked for each user

## 4. Enable Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Under "Email Auth", ensure "Enable Email Signup" is turned on
3. Configure any additional authentication providers you want to use (Google, Facebook, etc.)

## 5. Set Up Storage (Optional)

If you want to allow users to upload profile pictures:

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called "avatars"
3. Set the bucket's privacy to "Public"
4. Create policies to allow authenticated users to upload and manage their own files

## 6. Running the Application

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema Overview

### profiles
- `id`: UUID (references auth.users)
- `username`: TEXT (unique)
- `full_name`: TEXT
- `email`: TEXT (unique)
- `phone`: TEXT
- `location`: TEXT
- `bio`: TEXT
- `preferred_currencies`: TEXT[]
- `rating`: DECIMAL
- `completed_exchanges`: INTEGER
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### exchange_ads
- `id`: UUID
- `user_id`: UUID (references profiles)
- `amount`: DECIMAL
- `currency`: TEXT
- `rate`: DECIMAL
- `target_currency`: TEXT
- `description`: TEXT
- `location`: TEXT
- `status`: TEXT ('active', 'completed', 'cancelled')
- `created_at`: TIMESTAMP
- `expires_at`: TIMESTAMP

### chats
- `id`: UUID
- `ad_id`: UUID (references exchange_ads)
- `sender_id`: UUID (references profiles)
- `receiver_id`: UUID (references profiles)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### messages
- `id`: UUID
- `chat_id`: UUID (references chats)
- `user_id`: UUID (references profiles)
- `content`: TEXT
- `created_at`: TIMESTAMP
- `read`: BOOLEAN

### reviews
- `id`: UUID
- `reviewer_id`: UUID (references profiles)
- `reviewee_id`: UUID (references profiles)
- `ad_id`: UUID (references exchange_ads)
- `rating`: INTEGER (1-5)
- `comment`: TEXT
- `created_at`: TIMESTAMP

## Row Level Security (RLS)

All tables have Row Level Security enabled with appropriate policies to ensure users can only:
- Read their own and public data
- Create their own data
- Update their own data
- Delete their own data

### Key RLS Policies

- **Profiles**: 
  - Users can read any profile
  - Unrestricted profile creation during signup (important for new users)
  - Users can only update their own profile

- **Exchange Ads**:
  - Users can read any active ad or their own ads
  - Users can only create, update, or delete their own ads

- **Chats & Messages**:
  - Users can only read and send messages in chats they're part of

## Automatic Triggers

The database includes several triggers for automating common operations:

1. **Profile Creation**: Automatically creates a profile when a user signs up
2. **Rating Updates**: Automatically updates user ratings when they receive a review
3. **Exchange Counting**: Tracks completed exchanges for each user
4. **Chat Updates**: Updates chat timestamps when new messages are sent

## Troubleshooting

If you encounter issues during signup:

1. **Profile Creation Fails**: The system uses multiple fallback mechanisms to ensure profiles are created:
   - Direct insert during signup
   - Database trigger that creates profiles for new users
   - Permissive RLS policy that allows profile creation

2. **Permission Denied Error**: You may see this error in the console:
   ```
   {code: '42501', message: 'permission denied for table users'}
   ```
   This is expected and can be safely ignored. It occurs because:
   - The RLS policy tries to check against the auth.users table
   - Client-side code doesn't have permission to access auth.users directly
   - The profile is still created successfully via the database trigger

3. **RLS Errors**: If you see other RLS errors, check that:
   - The `Allow unauthenticated profile creation during signup` policy exists
   - The `handle_new_user` function and trigger are properly set up

4. **Manual Profile Creation**: If needed, you can manually create a profile in the Supabase dashboard:
   - Go to the Table Editor
   - Select the profiles table
   - Click "Insert" and add the user's information

## Next Steps

1. Implement social authentication (Google, Facebook)
2. Add profile picture upload functionality
3. Implement real-time chat using Supabase Realtime
4. Add email notifications for new messages and ad responses 