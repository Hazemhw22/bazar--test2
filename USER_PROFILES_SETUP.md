# User Profiles Setup Guide

## Overview
This guide explains how to set up and use the new `user_profiles` table for user authentication and profile management.

## Database Setup

### Step 1: Fix RLS Policies
The error "infinite recursion detected in policy" occurs when RLS policies reference themselves. To fix this:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the SQL script located at `scripts/fix-rls-policies.sql`

This will:
- Remove any recursive policies
- Create simple, non-recursive policies
- Enable proper access control for users

### Step 2: Ensure Required Tables Exist

#### user_roles table
```sql
CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO user_roles (id, name) VALUES
  (1, 'admin'),
  (2, 'shopowner'),
  (3, 'shopeditor'),
  (4, 'driver'),
  (5, 'delivery'),
  (7, 'customer')
ON CONFLICT (id) DO NOTHING;
```

#### user_profiles table
```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES user_roles(id) DEFAULT 7,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
```

## Application Flow

### 1. User Registration
When a user signs up:
1. Supabase Auth creates a user in `auth.users`
2. The frontend calls `/api/users/create-profile`
3. The API creates a record in `user_profiles` with `role_id = 7` (customer)
4. User is redirected to the account page

### 2. User Login
When a user logs in:
1. Supabase Auth validates credentials
2. Session is created
3. Frontend fetches user profile from `user_profiles`
4. User data is displayed in the UI

### 3. Profile Display
User profiles are displayed in:
- **Account Page**: Shows full profile details
- **Mobile Sidebar**: Shows name and avatar
- **Site Header**: Shows user status

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

⚠️ **Security Note**: Never commit the service role key to version control!

## Testing

### Test User Registration
1. Go to `/auth`
2. Click "Sign Up"
3. Fill in the form with:
   - Full Name
   - Email
   - Password
4. Submit the form
5. Check that:
   - User is created in `auth.users`
   - Profile is created in `user_profiles` with `role_id = 7`
   - User is redirected to `/account`

### Test Profile Display
1. After registration, check the account page
2. Verify that:
   - User name is displayed
   - Email is displayed
   - Role badge shows "customer"
   - Member since date is correct

3. Open the mobile sidebar
4. Verify that:
   - User name is displayed (not "guest")
   - Avatar is shown

## Troubleshooting

### Error: "infinite recursion detected in policy"
**Solution**: Run the `scripts/fix-rls-policies.sql` script in your Supabase SQL Editor.

### Error: "Not authenticated"
**Solution**: Ensure the user has a valid session and the access token is being sent in the Authorization header.

### Profile not created after signup
**Solution**: 
1. Check browser console for errors
2. Verify the API route is accessible
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
4. Check Supabase logs for any errors

### User shows as "guest" in sidebar
**Solution**:
1. Verify the user profile exists in `user_profiles` table
2. Check that the `site-header.tsx` is fetching from `user_profiles` (not `profiles`)
3. Clear browser cache and reload

## Migration from Old Schema

If you have existing users in a `profiles` table:

1. Run the migration script:
   ```bash
   cd scripts
   npm install
   npx ts-node migrate-users.ts
   ```

2. Set environment variables for old and new databases
3. The script will:
   - Copy all users from `profiles` to `user_profiles`
   - Set all users to `role_id = 7` (customer)
   - Preserve user IDs and emails

## API Endpoints

### POST /api/users/create-profile
Creates a new user profile.

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "roleId": 7
}
```

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role_id": 7,
    ...
  }
}
```

## Support

For issues or questions:
1. Check the Supabase logs in your dashboard
2. Review browser console for frontend errors
3. Check the API route logs in your deployment platform
4. Verify RLS policies are correctly set up
