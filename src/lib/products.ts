import gradeR from "@/assets/product-grade-r.jpg";
import grade1 from "@/assets/product-grade-1.jpg";
import grade2 from "@/assets/product-grade-2.jpg";
import grade3 from "@/assets/product-grade-3.jpg";

export type Product = {
  slug: string;
  name: string;
  short: string;
  price: string;
  image: string;
  ageGroup: string;
  badge?: "NEW" | "COMING SOON" | "BESTSELLER";
  comingSoon?: boolean;
  description: string;
  included: string[];
  skills: string[];
  previewPages: number;
};

export const products: Product[] = [
  {
    slug: "grade-r-school-readiness-pack",
    name: "Grade R School Readiness Pack",
    short: "Everything your little one needs to feel confident starting Grade R.",
    price: "R149",
    image: gradeR,
    ageGroup: "Ages 5–6",
    badge: "BESTSELLER",
    description:
      "A play-based printable pack designed to gently prepare your child for Grade R. Colourful, hands-on activities that build core school-readiness skills through play, not pressure.",
    included: [
      "40+ printable activity pages",
      "Alphabet tracing & letter sounds",
      "Numbers 1–10 with hands-on games",
      "Shape, colour & pattern activities",
      "Fine-motor scissor & lacing sheets",
      "Parent guide with play tips",
    ],
    skills: [
      "Pre-reading & phonics",
      "Number sense",
      "Fine-motor control",
      "Listening & concentration",
      "Confidence & independence",
    ],
    previewPages: 6,
  },
  {
    slug: "grade-1-learning-pack",
    name: "Grade 1 Learning Pack",
    short: "Playful reading, writing and number practice for a strong Grade 1 foundation.",
    price: "R179",
    image: grade1,
    ageGroup: "Ages 6–7",
    badge: "NEW",
    description:
      "Support your Grade 1 learner with a warm, structured pack that turns early reading, handwriting and maths into fun, bite-sized activities.",
    included: [
      "50+ printable activity pages",
      "Phonics & sight word practice",
      "Handwriting lines & letter formation",
      "Number bonds to 10 & 20",
      "Story sequencing & comprehension",
      "Reward charts & certificates",
    ],
    skills: [
      "Early reading fluency",
      "Handwriting posture & pencil grip",
      "Addition & subtraction",
      "Sequencing & memory",
      "Self-esteem & focus",
    ],
    previewPages: 8,
  },
  {
    slug: "grade-2-learning-pack",
    name: "Grade 2 Learning Pack",
    short: "Reading comprehension, spelling and maths made playful.",
    price: "R199",
    image: grade2,
    ageGroup: "Ages 7–8",
    badge: "COMING SOON",
    comingSoon: true,
    description:
      "Our Grade 2 pack is coming soon! Sign up to the newsletter to be the first to know when it launches.",
    included: [
      "Reading comprehension passages",
      "Weekly spelling activities",
      "Addition, subtraction & early multiplication",
      "Creative writing prompts",
      "Play-based revision games",
    ],
    skills: ["Reading comprehension", "Spelling patterns", "Number operations", "Written expression"],
    previewPages: 0,
  },
  {
    slug: "grade-3-learning-pack",
    name: "Grade 3 Learning Pack",
    short: "Times tables, fractions and story writing wrapped in play.",
    price: "R219",
    image: grade3,
    ageGroup: "Ages 8–9",
    description:
      "Give your Grade 3 learner a confident boost with playful activities covering times tables, fractions, comprehension and creative writing.",
    included: [
      "60+ printable activity pages",
      "Times tables 2–10 with games",
      "Fractions with visual models",
      "Reading comprehension & inference",
      "Story writing scaffolds & planners",
      "Progress tracker & certificates",
    ],
    skills: [
      "Multiplication fluency",
      "Fraction sense",
      "Comprehension & inference",
      "Creative writing structure",
      "Independent learning",
    ],
    previewPages: 8,
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const whatsappLink = (message: string) =>
  `https://wa.me/27000000000?text=${encodeURIComponent(message)}`;
