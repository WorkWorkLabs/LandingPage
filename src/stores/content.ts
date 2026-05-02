import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  NavItem,
  Feature,
  Product,
  Stat,
  Review,
} from "@/types";

export const useContentStore = defineStore("content", () => {
  const navigation = ref<NavItem[]>([
    { id: "home", label: "Home", href: "#hero" },
    { id: "working", label: "What we are doing", href: "#features" },
    { id: "case", label: "Services", href: "#products" },
    { id: "contact", label: "Contact Us", href: "#contact" },
  ]);

  const hero = ref({
    badge: "Building.....",
    title: "Work everywhere, Work anytime",
    highlight: "everywhere",
    subtitle:
      "The AI x Crypto Super App for Digital Nomads. Get paid in stablecoins, and live anywhere. 🌍 Work smarter. Earn globally. Live freely.",
    cta: {
      primary: {
        text: "Join now",
        href: "https://www.t.me/WorkWorkWeb3/",
      },
      secondary: {
        text: "View Docs",
        href: "https://docs.work-work.org/",
      },
    },
    stats: [
      { value: "1000+", label: "GitHub Stars" },
      { value: "3500", label: "TG Community" },
      { value: "50+", label: "Countries" },
    ],
  });

  const features = ref({
    badge: "What We Do",
    title: "Building the Future of Remote Work",
    subtitle: "Serving digital nomads, remote workers, freelancers, and super individuals",
    items: [
      {
        icon: "🌍",
        title: "Global Remote Work Ecosystem",
        description: "Building a global remote work ecosystem for digital nomads, remote workers, freelancers, and super individuals",
        color: "blue",
      },
      {
        icon: "🤝",
        title: "Warm Global Connectivity",
        description: "Freedom to work and live across borders, providing space to connect, collaborate and grow",
        color: "purple",
      },
      {
        icon: "🚀",
        title: "Work Freedom & Flexibility",
        description: '"Work everywhere, work anytime" — empowering you to choose where and how you work',
        color: "green",
      },
      {
        icon: "💰",
        title: "Stablecoin Payments",
        description: "Get paid in stablecoins with low fees. Borderless payments for a borderless workforce",
        color: "orange",
      },
      {
        icon: "🤖",
        title: "AI-Powered Matching",
        description: "Smart algorithms connect you with the best remote opportunities tailored to your skills",
        color: "teal",
      },
    ],
  });

  const products = ref({
    badge: "Services",
    title: "Our Products & Services",
    subtitle: "Comprehensive tools and platforms for the modern digital nomad",
    items: [
      {
        icon: "💳",
        title: "Digital Nomad Co-branded Card",
        description: "Workwork collaborate with upstream partners, while remaining independent from direct cash-out operations. Global Pay with Visa + Master, fees as low as 0.1%.",
        tags: ["Visa + Master", "Low Fees", "Global Pay"],
        cta: { text: "Learn More", href: "#card" },
        image: "/images/mastercard.svg",
      },
      {
        icon: "🌐",
        title: "One-stop Connection Platform",
        description: "A one-stop platform for Web3 professionals and digital nomads. The work and life of digital nomads, all in one place.",
        tags: ["Free job postings", "Community-driven", "Web3 focus", "Remote-first"],
        cta: { text: "Explore Platform", href: "#platform" },
        image: "/images/growthos.svg",
      },
      {
        icon: "👥",
        title: "Community Platform",
        description: "Connect with digital nomads worldwide and build meaningful professional relationships.",
        tags: ["Community", "Networking", "Global"],
        cta: { text: "Join Community", href: "#community" },
        image: "/images/growthos.svg",
      },
    ],
  });

  const communityStats = ref({
    badge: "Community",
    title: "Join Our Growing Community",
    subtitle: "Thousands of digital nomads and remote workers trust WorkWork",
    stats: [
      { value: "1000+", label: "GitHub Stars" },
      { value: "3500", label: "Telegram Members" },
      { value: "50+", label: "Countries" },
      { value: "100+", label: "Remote Jobs" },
    ],
  });

  const testimonial = ref({
    badge: "Testimonials",
    title: "Loved by Digital Nomads",
    items: [
      {
        quote: "WorkWork has been essential for my digital nomad journey, helping me find Web3 jobs while navigating visa requirements across Asia.",
        name: "Yanbo",
        role: "Web3 Community Manager",
      },
      {
        quote: "The stablecoin payment feature is a game changer. I can work from anywhere and get paid instantly without worrying about bank transfers.",
        name: "Morty",
        role: "Product Manager at HashKey",
      },
      {
        quote: "The community is incredibly supportive. I've found collaborators and friends from all over the world through WorkWork.",
        name: "Anna",
        role: "Marketing Lead & Content Creator",
      },
    ],
  });

  const contact = ref({
    badge: "Contact",
    title: "Get in Touch",
    subtitle: "Have questions? We'd love to hear from you.",
    form: {
      name: {
        label: "Name",
        placeholder: "Your name",
      },
      email: {
        label: "Email",
        placeholder: "your@email.com",
      },
      message: {
        label: "Message",
        placeholder: "Tell us what you're looking for...",
      },
      submit: {
        text: "Send Message",
        sending: "Sending...",
        success: "Sent!",
      },
    },
  });

  const stats = ref<Stat[]>([
    { id: "1", number: "1000+", label: "GitHub Stars", icon: "/images/github-icon.png" },
    { id: "2", number: "3500", label: "Telegram Community", icon: "/images/tg-icon.png" },
  ]);

  const reviews = ref<Review[]>([
    { id: "1", image: "/images/review1.svg", alt: "Digital Nomad Review 1" },
    { id: "2", image: "/images/review2.svg", alt: "Digital Nomad Review 2" },
    { id: "3", image: "/images/review1.svg", alt: "Digital Nomad Review 3" },
    { id: "4", image: "/images/review2.svg", alt: "Digital Nomad Review 4" },
    { id: "5", image: "/images/review1.svg", alt: "Digital Nomad Review 5" },
  ]);

  return {
    navigation,
    hero,
    features,
    products,
    communityStats,
    testimonial,
    contact,
    stats,
    reviews,
  };
});
