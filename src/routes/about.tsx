import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Heart, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import aboutImg from "@/assets/about-ilodi.jpg";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Ilodi — Piece of Play" },
      {
        name: "description",
        content:
          "Meet Ilodi — Remedial Teacher, Pre-Primary Head and founder of Piece of Play. Passionate about play-based learning.",
      },
      { property: "og:title", content: "About Ilodi — Piece of Play" },
      { property: "og:description", content: "Meet the teacher behind Piece of Play." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="bg-hero-blush">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <div className="relative">
            <div className="absolute inset-6 wash-lilac -z-10" />
            <img src={aboutImg} alt="Ilodi" className="paint w-full h-auto max-w-sm mx-auto" />
          </div>
          <div>
            <AccentBadge tone="lilac">Hi, I'm Ilodi</AccentBadge>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl">The teacher behind Piece of Play</h1>
            <p className="mt-5 text-foreground/75 leading-relaxed">
              I've spent years in the classroom watching little humans discover the world. What I know for sure is this: children learn best when they are laughing, moving, exploring — when learning feels like play.
            </p>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              Piece of Play is my way of putting the best of my classroom into your home. Every resource is designed with love, backed by experience, and made to give your child the joyful start they deserve.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl text-center">What I bring to the table</h2>
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {[
            { icon: GraduationCap, title: "Remedial Teacher", text: "Trained to spot how each child learns best and to gently support the skills that need extra love.", tone: "bg-mustard/30" },
            { icon: BookOpen, title: "Pre-Primary Head", text: "Years of experience leading a pre-primary school and preparing hundreds of children for big school.", tone: "bg-sage/50" },
            { icon: Sparkles, title: "Play-based approach", text: "Every resource is built on the belief that play is the most powerful teacher a child can have.", tone: "bg-coral/30" },
            { icon: Heart, title: "Confidence first", text: "Meaningful learning experiences that help children believe in themselves before, during and after school.", tone: "bg-lilac/40" },
          ].map((f) => (
            <div key={f.title} className="bg-card rounded-3xl p-7 shadow-soft flex gap-4">
              <div className={`h-12 w-12 shrink-0 rounded-2xl grid place-items-center ${f.tone}`}>
                <f.icon className="h-6 w-6 text-forest" />
              </div>
              <div>
                <h3 className="text-xl">{f.title}</h3>
                <p className="mt-1 text-foreground/70 leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-medium shadow-soft hover:opacity-90"
          >
            Browse the resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
