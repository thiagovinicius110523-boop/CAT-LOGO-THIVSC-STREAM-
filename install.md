# Instalação (V11) — Passo a passo completo

## 1) Pré-requisitos
- Node.js 18+
- Conta no Supabase (plano gratuito)

## 2) Supabase
1. Crie um projeto no Supabase.
2. Copie **Project URL**, **anon key** e **service role key** (Settings → API).

## 3) Banco + Segurança (SQL)
1. SQL Editor → execute: `supabase/migrations/0001_init.sql`

## 4) Variáveis (.env.local)
Copie `.env.example` → `.env.local` e configure:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## 5) Criar Admin
1. Authentication → Users → crie seu usuário.
2. SQL Editor:
```sql
update public.profiles set role='admin' where email='SEU_EMAIL_AQUI';
insert into public.whitelist(email,active) values ('SEU_EMAIL_AQUI', true)
on conflict (email) do update set active=true;
```

## 6) Rodar local
```bash
npm i
npm run dev
```
Abra: http://localhost:3000
