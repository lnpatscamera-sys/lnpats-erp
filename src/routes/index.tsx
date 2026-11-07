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
      {/* LNPATS Campus Background Image - Full view remains completely visible */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${campusBg})` }}
      />

      {/* Light transparent scrim so the photo remains clear and bright while text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/50" />

      {/* Official national stripe band */}
      <div className="relative z-10 stripe-band" />

      {/* Main landing hero - fully transparent behind the writing */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto flex flex-col items-center p-6 md:p-8 bg-transparent">
          <Logo className="h-32 w-32 md:h-36 md:w-36 ring-4 ring-gold shadow-2xl" />
          <p className="mt-8 text-xs uppercase tracking-[0.35em] text-gold font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            Republic of Liberia
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight max-w-3xl text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.95)]">
            Liberia National Police Academy and Training School
          </h1>
          <p className="mt-4 text-white max-w-xl text-base md:text-lg leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            Enterprise Resource Planning — officers, leave, logistics, training and administration in one secure system.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {session ? (
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold px-8 shadow-2xl transition-transform hover:scale-105">
                <Link to="/dashboard">Open dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold px-8 shadow-2xl transition-transform hover:scale-105">
                <Link to="/auth">Staff sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs text-white/80 bg-black/30 backdrop-blur-xs border-t border-white/10 drop-shadow">
        Authorised personnel only · All actions are logged · Paynesville, Liberia
      </footer>
    </div>
  );
}
