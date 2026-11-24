import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isCloudConfigured = Boolean(
  url &&
  anonKey &&
  !url.includes('TU-PROYECTO') &&
  !anonKey.includes('TU_CLAVE_PUBLICA'),
);

export const supabase = isCloudConfigured && url && anonKey
  ? createClient(url, anonKey)
  : null;
