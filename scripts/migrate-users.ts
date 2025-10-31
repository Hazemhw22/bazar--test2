import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Get environment variables
const oldSupabaseUrl = process.env.OLD_SUPABASE_URL || '';
const oldSupabaseKey = process.env.OLD_SUPABASE_KEY || '';
const newSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const newSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!oldSupabaseUrl || !oldSupabaseKey || !newSupabaseUrl || !newSupabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const oldSupabase = createClient(oldSupabaseUrl, oldSupabaseKey);
const newSupabase = createClient(newSupabaseUrl, newSupabaseKey);

// Ensure the new database has the customer role (id=7)
async function ensureCustomerRole() {
  console.log('Ensuring customer role exists...');
  
  const { data: existingRole, error: roleError } = await newSupabase
    .from('user_roles')
    .select('id')
    .eq('id', 7)
    .maybeSingle();

  if (roleError) {
    console.error('Error checking for customer role:', roleError);
    return false;
  }

  if (!existingRole) {
    console.log('Creating customer role...');
    const { error: insertError } = await newSupabase
      .from('user_roles')
      .insert([{ id: 7, name: 'customer' }]);
    
    if (insertError) {
      console.error('Error creating customer role:', insertError);
      return false;
    }
    console.log('Customer role created');
  } else {
    console.log('Customer role already exists');
  }
  
  return true;
}

async function migrateUsers() {
  try {
    // Ensure customer role exists
    if (!(await ensureCustomerRole())) {
      throw new Error('Failed to ensure customer role exists');
    }

    console.log('Fetching users from old database...');
    
    // Fetch all users from the old profiles table
    const { data: oldUsers, error: fetchError } = await oldSupabase
      .from('profiles')
      .select('*');

    if (fetchError) {
      throw new Error(`Error fetching users: ${fetchError.message}`);
    }

    if (!oldUsers || oldUsers.length === 0) {
      console.log('No users found to migrate');
      return;
    }

    console.log(`Found ${oldUsers.length} users to migrate`);

    // Prepare data for batch insert
    const newProfiles = oldUsers.map(user => ({
      user_id: user.id,
      email: user.email?.toLowerCase() || `${user.id}@migrated.user`,
      name: user.full_name || null,
      phone: null, // No phone in old schema
      role_id: 7, // Customer role
      is_active: true,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
    }));

    // Insert in batches to avoid hitting limits
    const BATCH_SIZE = 50;
    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < newProfiles.length; i += BATCH_SIZE) {
      const batch = newProfiles.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(newProfiles.length / BATCH_SIZE)}`);
      
      const { error } = await newSupabase
        .from('user_profiles')
        .upsert(batch, { onConflict: 'user_id' });

      if (error) {
        console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
        errorCount += batch.length;
        errors.push({
          batch: i / BATCH_SIZE + 1,
          error: error.message,
          users: batch.map(u => u.user_id)
        });
      } else {
        successCount += batch.length;
        console.log(`Successfully processed batch ${i / BATCH_SIZE + 1}`);
      }
    }

    // Save errors to file for review
    if (errors.length > 0) {
      const errorLogPath = path.join(process.cwd(), 'migration-errors.json');
      fs.writeFileSync(errorLogPath, JSON.stringify(errors, null, 2));
      console.log(`Errors logged to: ${errorLogPath}`);
    }

    console.log('\nMigration Summary:');
    console.log(`Total users to migrate: ${oldUsers.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed to migrate: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\nSome users failed to migrate. Check the error log for details.');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateUsers();
