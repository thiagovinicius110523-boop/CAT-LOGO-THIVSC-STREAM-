import "./globals.css";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "V11",
  description: "V11 — Next.js + Supabase",
};

function styleVars(tokens: any) {
  const t = tokens || {};
  const accent = t.accent || "#60a5fa";
  const bg = t.bg || "#050c1c";
  const card = t.card || "rgba(16,28,52,.26)";
  const text = t.text || "rgba(243,246,255,.92)";
  const muted = t.muted || "rgba(205,219,245,.62)";
  const radius = String(t.radius || "18");
  return `:root{--accent:${accent};--bg:${bg};--card:${card};--text:${text};--muted:${muted};--radius:${radius}px}`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  const { data: s } = await supabase.from("app_settings").select("theme_tokens").maybeSingle();
  const css = styleVars((s as any)?.theme_tokens);
  return (
    <html lang="pt-br">
      <body>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        {children}
      </body>
    </html>
  );
}
