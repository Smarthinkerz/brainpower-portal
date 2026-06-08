import pg from 'pg';
const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
const dbUrl = process.env.DATABASE_URL;

// Step 1: signUp via Supabase
const r = await fetch(`${url}/auth/v1/signup`, {
  method: 'POST',
  headers: { 'apikey': anon, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'fathi.alriyami1@gmail.com', password: 'TOMOKOnote76$' })
});
const data = await r.json();
console.log('SUPABASE_STATUS', r.status);
console.log('SUPABASE_RES', JSON.stringify(data, null, 2));

const userId = data?.user?.id || data?.id;
const email = data?.user?.email || 'fathi.alriyami1@gmail.com';

if (!userId) { console.log('NO_USER_ID, exiting'); process.exit(1); }

// Step 2: upsert into local users table with super_admin
const client = new pg.Client({ connectionString: dbUrl });
await client.connect();
const res = await client.query(
  `INSERT INTO users (open_id, name, email, role, login_method, last_signed_in)
   VALUES ($1, $2, $3, 'super_admin', 'email', NOW())
   ON CONFLICT (open_id) DO UPDATE SET role = 'super_admin', email = EXCLUDED.email
   RETURNING id, open_id, email, role`,
  [userId, 'Fathi Alriyami', email]
);
console.log('DB_RESULT', JSON.stringify(res.rows, null, 2));
await client.end();
