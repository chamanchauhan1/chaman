import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getFarmId() {
  const { data, error } = await supabase
    .from('farms')
    .select('id')
    .eq('name', "Chaman's Farm 2");

  if (error) {
    console.error('Error getting farm ID:', error);
    return;
  }

  console.log(data[0].id);
}

getFarmId();