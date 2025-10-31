# Quick Start Guide - User Profiles Implementation

## 🚀 What Was Done

I've implemented a complete user authentication and profile system using the new `user_profiles` table structure. Here's what changed:

### ✅ Changes Made

1. **API Route Created** (`/app/api/users/create-profile/route.ts`)
   - Creates user profiles in `user_profiles` table
   - Uses service role key for admin operations
   - Validates authentication tokens
   - Handles errors gracefully

2. **Auth Page Updated** (`/app/auth/AuthPage.tsx`)
   - Calls profile creation API after signup
   - Waits for session to be available
   - Redirects to account page after successful registration
   - Improved error handling

3. **Account Page Updated** (`/app/account/page.tsx`)
   - Fetches from `user_profiles` table (not `profiles`)
   - Displays user name, email, and role
   - Shows member since date
   - Simplified query to avoid RLS recursion

4. **Site Header Updated** (`/components/site-header.tsx`)
   - Fetches user data from `user_profiles` table
   - Passes correct data to mobile sidebar

5. **Mobile Sidebar Updated** (`/components/mobile-sidebar.tsx`)
   - Shows user name instead of "guest"
   - Uses `image_url` field for avatar
   - Proper fallbacks for unauthenticated users

## 🔧 What You Need to Do

### Step 1: Fix Database RLS Policies (CRITICAL)

The error you're seeing is due to recursive RLS policies. Fix it by:

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `scripts/setup-database.sql`
4. Click **Run**

This will:
- Create the required tables
- Set up proper RLS policies (non-recursive)
- Create necessary indexes
- Insert default roles

### Step 2: Verify Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tfzkrfmzpmdbkysdcoua.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

⚠️ **IMPORTANT**: You should rotate your service role key since it was exposed in the chat.

### Step 3: Test the Implementation

1. **Test Registration**:
   ```
   - Go to /auth
   - Click "Sign Up"
   - Fill in: Name, Email, Password
   - Submit
   - Should redirect to /account after 2 seconds
   ```

2. **Verify Database**:
   ```
   - Check Supabase Dashboard
   - Go to Table Editor > user_profiles
   - Verify new user has role_id = 7
   ```

3. **Check UI**:
   ```
   - Account page should show your name and email
   - Mobile sidebar should show your name (not "guest")
   - Role badge should show "customer"
   ```

## 📁 Files Created/Modified

### Created:
- `/app/api/users/create-profile/route.ts` - Profile creation API
- `/scripts/migrate-users.ts` - Migration script for old data
- `/scripts/setup-database.sql` - Database setup script
- `/scripts/fix-rls-policies.sql` - RLS policy fixes
- `USER_PROFILES_SETUP.md` - Detailed documentation
- `QUICK_START.md` - This file

### Modified:
- `/app/auth/AuthPage.tsx` - Signup flow
- `/app/account/page.tsx` - Profile display
- `/components/site-header.tsx` - User data fetching
- `/components/mobile-sidebar.tsx` - User display

## 🐛 Troubleshooting

### Issue: "infinite recursion detected in policy"
**Solution**: Run `scripts/setup-database.sql` in Supabase SQL Editor

### Issue: User shows as "guest" in sidebar
**Solution**: 
1. Verify user profile exists in `user_profiles` table
2. Check browser console for errors
3. Clear cache and reload

### Issue: Profile not created after signup
**Solution**:
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Check browser console for API errors
3. Verify RLS policies are set up correctly

## 📊 Database Schema

```
user_roles
├── id (integer, PK)
├── name (varchar)
├── description (text)
└── created_at (timestamp)

user_profiles
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users.id)
├── role_id (integer, FK → user_roles.id)
├── email (varchar)
├── name (varchar)
├── phone (varchar)
├── address (text)
├── image_url (text)
├── is_active (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)
```

## 🔐 Security Notes

1. **Service Role Key**: Keep it secret, never commit to git
2. **RLS Policies**: Ensure they're properly set up
3. **API Routes**: Always validate authentication
4. **User Data**: Only allow users to access their own data

## 📞 Next Steps

1. Run the database setup script
2. Test user registration
3. Verify profile display
4. (Optional) Migrate old users using `scripts/migrate-users.ts`
5. Rotate your service role key for security

## ✨ Features

- ✅ User registration with profile creation
- ✅ Automatic role assignment (customer = 7)
- ✅ Profile display in account page
- ✅ User name in mobile sidebar
- ✅ Role-based access control ready
- ✅ Secure API with token validation
- ✅ Proper error handling
- ✅ Loading states and redirects

---

**Need Help?** Check `USER_PROFILES_SETUP.md` for detailed documentation.
