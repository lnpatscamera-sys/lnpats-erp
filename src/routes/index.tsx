import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import campusBg from "@/assets/campus-background.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LNPATS ERP — Liberia National Police Academy" },
      { name: "description", content: "Secure management system for officers, leave, logistics and training at LNPATS." },
      { property: "og:title", content: "LNPATS ERP — Liberia National Police Academy" },
      { property: "og:description", content: "Secure management system for officers, leave, logistics and training at LNPATS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { session } = useAuth();
  return (
    <div className="relative min-h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* LNPATS Campus Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${campusBg})` }}
      />

      {/* Authoritative deep navy & gradient overlay for maximum readability & police dignity */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/92 backdrop-brightness-[0.8]" />

      {/* Official national stripe band */}
      <div className="relative z-10 stripe-band" />

      {/* Main landing hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto flex flex-col items-center p-8 md:p-12 rounded-3xl bg-slate-950/60 backdrop-blur-md border border-white/10 shadow-2xl">
          <Logo className="h-32 w-32 md:h-36 md:w-36 ring-4 ring-gold shadow-2xl" />
          <p className="mt-8 text-xs uppercase tracking-[0.35em] text-gold font-bold">
            Republic of Liberia
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight max-w-3xl drop-shadow-md text-white">
            Liberia National Police Academy and Training School
          </h1>
          <p className="mt-4 text-slate-200/90 max-w-xl text-base md:text-lg leading-relaxed">
            Enterprise Resource Planning — officers, leave, logistics, training and administration in one secure system.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {session ? (
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold px-8 shadow-lg transition-transform hover:scale-105">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold px-8 shadow-lg transition-transform hover:scale-105">
                <Link to="/auth">Staff sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-white/70 bg-black/40 backdrop-blur-sm border-t border-white/5">
        Authorised personnel only · All actions are logged · Paynesville, Liberia
      </footer>
    </div>
  );
}
