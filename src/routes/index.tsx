import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Download, Heart, Sparkles, Palette, GraduationCap, Star } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import { ProductCard } from "@/routes/shop";
import { fetchProducts } from "@/lib/products-db";
import hero from "@/assets/hero.jpg";
import checklist from "@/assets/checklist.jpg";
import aboutImg from "@/assets/about-ilodi.jpg";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Piece of Play — Play-Based Learning for Little Learners" },
      {
        name: "description",
        content:
          "Warm, printable play-based learning resources for children aged 3–9. Created by a Remedial Teacher & Pre-Primary Head.",
      },
      { property: "og:title", content: "Piece of Play — Play-Based Learning for Little Learners" },
      {
        property: "og:description",
        content: "Warm, printable play-based learning resources for children aged 3–9. Created by a Remedial Teacher & Pre-Primary Head.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Home() {
  const { data: allProducts = [] } = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => fetchProducts({ activeOnly: true }),
  });
  const featured = allProducts.filter((p) => !p.is_free).slice(0, 3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="bg-hero-blush">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <AccentBadge tone="mustard">Play Tip · Learning that feels like play</AccentBadge>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-primary">
              Helping Little Learners{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Build Big Skills</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-mustard/60 rounded-full -z-0" />
              </span>{" "}
              Through Play
            </h1>
            <p className="mt-6 text-lg text-foreground/75 max-w-xl leading-relaxed">
              Play-based learning resources created to help children learn, grow and prepare for school with confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-medium shadow-soft hover:opacity-90"
              >
                <Heart className="h-4 w-4" /> Shop Resources
              </Link>
              <Link
                to="/free"
                className="inline-flex items-center gap-2 rounded-full bg-mustard text-forest px-6 py-3.5 font-medium shadow-soft hover:brightness-105"
              >
                <Download className="h-4 w-4" /> Free Resources
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-foreground/70">
              <div className="flex items-center gap-1 text-mustard">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span>Loved by parents across South Africa</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-4 wash-sage -z-10" />
            <div className="absolute -top-6 -left-4 h-40 w-40 wash-blush -z-10" />
            <img src={hero} alt="Children playing and learning together" width={1400} height={1200} className="paint w-full h-auto max-w-xl mx-auto" />
            <div className="hidden sm:flex absolute -left-2 top-8 surface-paper rounded-3xl shadow-soft px-4 py-3 gap-2 items-center -rotate-3">
              <div className="h-9 w-9 rounded-full bg-coral/40 grid place-items-center">
                <Sparkles className="h-4 w-4 text-forest" />
              </div>
              <div className="text-xs">
                <div className="font-semibold">Play-based</div>
                <div className="text-muted-foreground">Made by teachers</div>
              </div>
            </div>
            <div className="hidden sm:flex absolute -right-2 bottom-6 surface-paper rounded-3xl shadow-soft px-4 py-3 gap-2 items-center rotate-2">
              <div className="h-9 w-9 rounded-full bg-mustard/40 grid place-items-center">
                <GraduationCap className="h-4 w-4 text-forest" />
              </div>
              <div className="text-xs">
                <div className="font-semibold">Ages 3–9</div>
                <div className="text-muted-foreground">Ready for school</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <AccentBadge tone="coral">Featured</AccentBadge>
            <h2 className="mt-3 text-3xl sm:text-4xl">Featured Resources</h2>
            <p className="mt-2 text-foreground/70 max-w-xl">
              Hand-crafted printable packs your child will actually want to sit down with.
            </p>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">Products coming soon.</p>
        )}
      </section>

      {/* WHY PARENTS LOVE */}
      <section className="bg-blush">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <AccentBadge tone="sage">Why parents love us</AccentBadge>
            <h2 className="mt-3 text-3xl sm:text-4xl">Why Parents Love Piece of Play</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Made by teachers",
                text: "Designed by a Remedial Teacher and Pre-Primary Head with real classroom experience.",
                tone: "bg-mustard/30",
              },
              {
                icon: Palette,
                title: "Play-based, not pressure",
                text: "Every activity turns learning into a game — no tears, no boredom, just joyful practice.",
                tone: "bg-coral/30",
              },
              {
                icon: Heart,
                title: "Confidence that lasts",
                text: "Small wins add up. Children arrive at school feeling proud, capable and ready.",
                tone: "bg-sage/50",
              },
            ].map((f) => (
              <div key={f.title} className="surface-paper rounded-[2rem] p-7 shadow-soft">
                <div className={`h-12 w-12 rounded-2xl grid place-items-center ${f.tone}`}>
                  <f.icon className="h-6 w-6 text-forest" />
                </div>
                <h3 className="mt-5 text-xl">{f.title}</h3>
                <p className="mt-2 text-foreground/70 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT ME */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="absolute inset-8 wash-lilac -z-10" />
          <img src={aboutImg} alt="Ilodi, founder of Piece of Play" width={900} height={1100} loading="lazy" className="paint w-full h-auto max-w-md mx-auto" />
        </div>
        <div className="order-1 lg:order-2">
          <AccentBadge tone="lilac">Hi, I'm Ilodi</AccentBadge>
          <h2 className="mt-3 text-3xl sm:text-4xl">About Me</h2>
          <p className="mt-4 text-foreground/75 leading-relaxed">
            I'm a Remedial Teacher and Pre-Primary Head who believes that the best learning happens when children are having fun.
            Piece of Play was born from years in the classroom, watching little learners bloom when lessons feel like play.
          </p>
          <p className="mt-4 text-foreground/75 leading-relaxed">
            Every resource I create is designed to help your child build confidence, curiosity and the foundational skills they need to thrive at school.
          </p>
          <Link
            to="/about"
            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary text-primary px-5 py-2.5 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Read my story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FREE RESOURCE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-[2.5rem] surface-paper overflow-hidden grid lg:grid-cols-2 shadow-soft">
          <div className="p-10 sm:p-14 flex flex-col justify-center">
            <AccentBadge tone="mustard">FREE Download</AccentBadge>
            <h2 className="mt-3 text-3xl sm:text-4xl">Is your child ready for school?</h2>
            <p className="mt-4 text-foreground/75 leading-relaxed max-w-lg">
              Grab our free School Readiness Checklist — a simple, gentle guide to help you spot the skills your little one has mastered, and the ones we can play with together.
            </p>
            <Link
              to="/free"
              className="mt-6 self-start inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-medium shadow-soft hover:opacity-90"
            >
              <Download className="h-4 w-4" /> See free resources
            </Link>
          </div>
          <div className="relative min-h-[280px] flex items-center justify-center p-8">
            <div className="absolute inset-10 wash-sage -z-10" />
            <img src={checklist} alt="School readiness checklist illustration" width={1000} height={800} loading="lazy" className="paint max-h-80 w-auto" />
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AccentBadge tone="mustard">Let's chat</AccentBadge>
          <h2 className="mt-3 text-3xl sm:text-4xl text-primary-foreground">Got a question? I'd love to hear from you.</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            Whether you're picking a pack for your child or just want to say hello, I'm one message away.
          </p>
          <Link
            to="/contact"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-mustard text-forest px-6 py-3.5 font-medium hover:brightness-105"
          >
            Get in touch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
