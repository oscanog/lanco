"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronDown,
  Clock3,
  LineChart,
  LockKeyhole,
  Menu,
  NotebookPen,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

const navItems = ["Features", "Education", "Simulation", "Pricing", "About", "Contact"];

const featureCards = [
  {
    icon: BookOpen,
    title: "Learn",
    points: ["Interactive lessons", "Video courses", "Trading psychology", "Market concepts"],
  },
  {
    icon: LineChart,
    title: "Simulate",
    points: ["Paper trading", "Real market prices", "Guided simulations", "Instant feedback"],
  },
  {
    icon: BarChart3,
    title: "Track",
    points: ["Win rate", "Journal", "Performance analytics", "Progress over time"],
  },
  {
    icon: BrainCircuit,
    title: "Improve",
    points: ["AI insights", "Trade reviews", "Mistake detection", "Personalized plans"],
  },
];

const stats = [
  { value: 92, suffix: "%", label: "lesson completion" },
  { value: 120, suffix: "K", label: "simulated trades" },
  { value: 38, suffix: "%", label: "mistake reduction" },
];

const journey = ["Beginner", "Intermediate", "Advanced", "Consistent Trader"];

const testimonials = [
  {
    name: "Maya Chen",
    role: "Swing trader",
    quote: "Lancotech turned my trade journal into a feedback loop. I stopped repeating the same mistakes.",
    progress: "+18% consistency",
  },
  {
    name: "Daniel Reyes",
    role: "New trader",
    quote: "I could practice setups for weeks inside a calm simulator. That changed how I think about discipline.",
    progress: "64 lessons finished",
  },
  {
    name: "Ari Patel",
    role: "Prop desk trainee",
    quote: "The analytics feel calm and serious. It is training software, not a casino dashboard.",
    progress: "42% fewer bad entries",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    description: "Start learning and practicing in a guided simulation workspace.",
    features: ["Core lessons", "Paper trading", "Basic journal", "Progress dashboard"],
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$19",
    description: "Advanced analytics and AI trade review for serious practice.",
    features: ["AI insights", "Advanced analytics", "Strategy reports", "Unlimited simulations"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Training environments for teams, schools, and trading desks.",
    features: ["Team workspaces", "Admin reporting", "Custom curriculum", "Priority support"],
  },
];

const faqs = [
  {
    question: "Do I need a funded account to use Lancotech?",
    answer: "No. Lancotech is built for education, practice, simulation, and performance review inside a learning workspace.",
  },
  {
    question: "Is this a crypto or gambling product?",
    answer: "No. The product language, analytics, and workflow are designed around disciplined learning and skill development.",
  },
  {
    question: "Can beginners use it?",
    answer: "Yes. The journey starts with market basics, psychology, and guided lessons before moving into advanced simulations.",
  },
  {
    question: "What makes the AI useful?",
    answer: "It reviews patterns in your simulated trades, surfaces repeated mistakes, and recommends focused lessons or drills.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#424242]">
      <Navbar scrolled={scrolled} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Hero />
        <TrustBar />
        <Features />
        <WhyLancotech />
        <DashboardPreview />
        <LearningJourney />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

function Navbar({
  scrolled,
  menuOpen,
  setMenuOpen,
}: {
  scrolled: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/80 bg-[#F5F5F5]/88 shadow-[0_10px_30px_rgba(66,66,66,0.08)] backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <a href="#" className="flex items-center gap-3" aria-label="Lancotech home">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-[#48CFCB] to-[#229799] text-sm font-black text-white shadow-[0_10px_22px_rgba(34,151,153,0.25)]">
            L
          </span>
          <span className="text-lg font-semibold tracking-[0] text-[#2f2f2f]">Lancotech</span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-[#424242]/78 transition hover:text-[#229799]">
              {item}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="/signin" className="rounded-lg px-4 py-2 text-sm font-semibold text-[#424242] transition hover:text-[#229799]">
            Sign In
          </a>
          <Button href="#pricing">Start Free</Button>
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <a href="/signin" className="text-sm font-semibold text-[#229799] transition hover:text-[#1d8587]">
            Sign In
          </a>
          <button
            className="grid size-10 place-items-center rounded-lg border border-[#424242]/10 bg-white/70 text-[#424242]"
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="mx-5 mb-4 rounded-lg border border-white/80 bg-white/92 p-3 shadow-[0_18px_50px_rgba(66,66,66,0.12)] backdrop-blur-xl lg:hidden">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-[#424242]"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a href="/signin" className="rounded-lg border border-[#424242]/12 px-4 py-3 text-center text-sm font-semibold">
              Sign In
            </a>
            <Button href="#pricing" className="justify-center">
              Start Free
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -46]);

  return (
    <section className="relative overflow-hidden px-5 pt-28 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-[680px] bg-[radial-gradient(circle_at_25%_15%,rgba(72,207,203,0.22),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(34,151,153,0.16),transparent_26%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 pb-16 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pb-24 lg:pt-16">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.65 }}>
          <Badge icon={ShieldCheck}>Practice-only simulation</Badge>
          <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[0] text-[#262626] sm:text-6xl lg:text-7xl">
            Learn Trading Through Guided Market Simulation.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#424242]/76">
            Learn, practice, simulate, track, and improve through a premium trading education platform built for discipline, not gambling.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#pricing" size="large">
              Start Free <ArrowRight size={18} />
            </Button>
            <Button href="#demo" variant="secondary" size="large">
              <Play size={18} /> Watch Demo
            </Button>
          </div>
          <div className="mt-9 grid grid-cols-3 gap-3 sm:max-w-xl">
            {["Learn", "Practice", "Master"].map((item) => (
              <div key={item} className="rounded-lg border border-white/85 bg-white/65 px-4 py-3 text-center shadow-[0_14px_35px_rgba(66,66,66,0.07)] backdrop-blur">
                <p className="text-sm font-semibold text-[#424242]">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div style={{ y }} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.12 }}>
          <HeroDashboard />
        </motion.div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div id="demo" className="relative mx-auto max-w-[680px]">
      <motion.div
        className="absolute -left-4 top-16 z-10 hidden rounded-lg border border-white/80 bg-white/78 p-4 shadow-[0_22px_60px_rgba(66,66,66,0.14)] backdrop-blur-xl sm:block"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-[#48CFCB]/15 text-[#229799]">
            <BrainCircuit size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-[#424242]/55">AI Coach</p>
            <p className="text-sm font-semibold text-[#2f2f2f]">Review entry timing</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-2 bottom-12 z-10 hidden rounded-lg border border-white/80 bg-white/80 p-4 shadow-[0_22px_60px_rgba(66,66,66,0.14)] backdrop-blur-xl md:block"
        animate={{ y: [0, 14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-xs font-semibold uppercase text-[#424242]/55">Learning progress</p>
        <div className="mt-2 h-2 w-36 overflow-hidden rounded-full bg-[#424242]/10">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#48CFCB] to-[#229799]" initial={{ width: "36%" }} animate={{ width: "78%" }} transition={{ duration: 2.2, repeat: Infinity, repeatType: "reverse" }} />
        </div>
      </motion.div>

      <div className="rounded-lg border border-white/90 bg-white/72 p-3 shadow-[0_30px_100px_rgba(66,66,66,0.15)] backdrop-blur-xl">
        <div className="rounded-lg border border-[#424242]/10 bg-[#fdfdfd] p-4">
          <div className="flex items-center justify-between border-b border-[#424242]/8 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase text-[#424242]/50">Simulation dashboard</p>
              <p className="mt-1 text-lg font-semibold text-[#262626]">AAPL Strategy Lab</p>
            </div>
            <div className="rounded-lg bg-[#48CFCB]/12 px-3 py-2 text-sm font-semibold text-[#229799]">Live paper</div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-lg border border-[#424242]/8 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Candlestick Analysis</p>
                <TrendingUp className="text-[#229799]" size={18} />
              </div>
              <div className="mt-5 flex h-44 items-end gap-2">
                {[54, 72, 46, 88, 61, 96, 67, 112, 82, 126, 76, 104, 92, 132].map((height, index) => (
                  <div key={index} className="flex flex-1 items-center justify-center">
                    <motion.span
                      className={`w-full max-w-4 rounded-sm ${index % 3 === 0 ? "bg-[#229799]" : "bg-[#48CFCB]"}`}
                      initial={{ height: 20 }}
                      animate={{ height }}
                      transition={{ duration: 0.8, delay: index * 0.04 }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["Win 62%", "R:R 2.4", "Plan 1.0%"].map((item) => (
                  <div key={item} className="rounded-lg bg-[#F5F5F5] px-3 py-2 text-center text-xs font-semibold">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <MiniPanel title="Portfolio" value="$24,820" change="+8.4%" />
              <MiniPanel title="Journal" value="34 notes" change="4 flagged" />
              <MiniPanel title="Performance" value="78/100" change="Improving" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniPanel({ title, value, change }: { title: string; value: string; change: string }) {
  return (
    <div className="rounded-lg border border-[#424242]/8 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-[#424242]/50">{title}</p>
      <p className="mt-2 text-xl font-semibold text-[#262626]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[#229799]">{change}</p>
    </div>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-[#424242]/8 bg-white/70 px-5 py-5 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 sm:justify-between">
        {["Education first", "Guided simulation", "AI trade review", "Performance analytics", "Secure practice"].map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[#424242]/70">
            <Check size={16} className="text-[#229799]" />
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <Section id="features" eyebrow="Platform" title="Everything a trader needs to build skill." description="Structured education, realistic practice, measurable progress, and AI-supported review in one calm workspace.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {featureCards.map((feature, index) => (
          <MotionCard key={feature.title} delay={index * 0.07}>
            <div className="grid size-11 place-items-center rounded-lg bg-[#48CFCB]/14 text-[#229799]">
              <feature.icon size={22} />
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-[#262626]">{feature.title}</h3>
            <ul className="mt-5 space-y-3">
              {feature.points.map((point) => (
                <li key={point} className="flex items-center gap-3 text-sm leading-6 text-[#424242]/78">
                  <Check size={16} className="shrink-0 text-[#229799]" />
                  {point}
                </li>
              ))}
            </ul>
          </MotionCard>
        ))}
      </div>
    </Section>
  );
}

function WhyLancotech() {
  return (
    <Section id="about" eyebrow="Why Lancotech" title="Simulation turns repetition into skill." description="Traditional learning is scattered and hard to measure. Lancotech moves the learning loop into a controlled practice environment.">
      <div className="grid gap-4 lg:grid-cols-2">
        <ComparisonCard
          title="Traditional Trading"
          tone="muted"
          items={["Scattered lessons and tools", "Emotional decisions under pressure", "Unclear feedback after mistakes", "No structured path from beginner to consistent trader"]}
        />
        <ComparisonCard
          title="Lancotech"
          tone="accent"
          items={["Practice in guided simulations", "Lessons connected to each drill", "AI trade reviews and mistake detection", "Progress analytics tied to measurable habits"]}
        />
      </div>
    </Section>
  );
}

function DashboardPreview() {
  return (
    <Section id="simulation" eyebrow="Dashboard Preview" title="A complete practice command center." description="Track charts, statistics, journal notes, heatmaps, portfolio moves, and learning progress from one polished interface.">
      <motion.div
        className="rounded-lg border border-white/90 bg-white/72 p-3 shadow-[0_28px_90px_rgba(66,66,66,0.12)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7 }}
      >
        <div className="grid gap-3 rounded-lg border border-[#424242]/8 bg-[#fbfbfb] p-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-lg border border-[#424242]/8 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-[#424242]/50">Strategy performance</p>
                <p className="mt-1 text-2xl font-semibold text-[#262626]">Momentum Breakout</p>
              </div>
              <Badge icon={Sparkles}>AI reviewed</Badge>
            </div>
            <div className="mt-6 h-64 rounded-lg bg-[linear-gradient(180deg,rgba(72,207,203,0.14),rgba(255,255,255,0)_58%)] p-4">
              <svg className="h-full w-full" viewBox="0 0 620 240" role="img" aria-label="Performance chart">
                <path d="M0 190 C70 160 105 182 150 134 C210 70 258 116 310 92 C378 60 424 116 470 76 C520 34 570 70 620 42" fill="none" stroke="#229799" strokeWidth="5" strokeLinecap="round" />
                <path d="M0 206 C70 174 105 194 150 146 C210 82 258 126 310 104 C378 72 424 128 470 88 C520 46 570 82 620 54 L620 240 L0 240 Z" fill="url(#aquaFill)" />
                <defs>
                  <linearGradient id="aquaFill" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#48CFCB" stopOpacity="0.28" />
                    <stop offset="1" stopColor="#48CFCB" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="grid gap-3">
            <DashboardMetric icon={Target} label="Win rate" value="62%" />
            <DashboardMetric icon={NotebookPen} label="Trade journal" value="126 entries" />
            <DashboardMetric icon={Clock3} label="Practice time" value="48 hours" />
            <Heatmap />
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

function DashboardMetric({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-[#424242]/8 bg-white p-4">
      <div className="grid size-11 place-items-center rounded-lg bg-[#48CFCB]/12 text-[#229799]">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-[#424242]/50">{label}</p>
        <p className="mt-1 text-xl font-semibold text-[#262626]">{value}</p>
      </div>
    </div>
  );
}

function Heatmap() {
  const cells = useMemo(() => Array.from({ length: 28 }, (_, i) => (i * 17) % 100), []);

  return (
    <div className="rounded-lg border border-[#424242]/8 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-[#424242]/50">Calendar heatmap</p>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {cells.map((value, index) => (
          <span
            key={index}
            className="aspect-square rounded"
            style={{ backgroundColor: `rgba(34, 151, 153, ${0.1 + value / 170})` }}
          />
        ))}
      </div>
    </div>
  );
}

function LearningJourney() {
  return (
    <Section id="education" eyebrow="Learning Journey" title="From first lesson to consistent process." description="Lancotech turns trading education into a staged path with practice loops at every level.">
      <div className="grid gap-4 md:grid-cols-4">
        {journey.map((step, index) => (
          <motion.div
            key={step}
            className="relative rounded-lg border border-white/80 bg-white/72 p-5 shadow-[0_18px_45px_rgba(66,66,66,0.08)]"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
          >
            <span className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-[#48CFCB] to-[#229799] font-semibold text-white">
              {index + 1}
            </span>
            <h3 className="mt-5 text-xl font-semibold text-[#262626]">{step}</h3>
            <p className="mt-3 text-sm leading-6 text-[#424242]/70">
              {index === 0 ? "Build core concepts." : index === 1 ? "Practice repeatable setups." : index === 2 ? "Refine strategy and discipline." : "Measure process quality."}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function Testimonials() {
  return (
    <Section eyebrow="Results" title="Designed for traders who want process, not hype." description="Professional feedback, realistic progress, and calm analytics help users improve without noisy incentives.">
      <div className="grid gap-4 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <MotionCard key={testimonial.name} delay={index * 0.08}>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-lg bg-gradient-to-br from-[#48CFCB]/70 to-[#229799] font-semibold text-white">
                {testimonial.name.split(" ").map((part) => part[0]).join("")}
              </div>
              <div>
                <p className="font-semibold text-[#262626]">{testimonial.name}</p>
                <p className="text-sm text-[#424242]/62">{testimonial.role}</p>
              </div>
            </div>
            <p className="mt-6 leading-7 text-[#424242]/78">"{testimonial.quote}"</p>
            <p className="mt-5 inline-flex rounded-lg bg-[#48CFCB]/12 px-3 py-2 text-sm font-semibold text-[#229799]">{testimonial.progress}</p>
          </MotionCard>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Counter key={stat.label} {...stat} delay={index * 0.08} />
        ))}
      </div>
    </Section>
  );
}

function Pricing() {
  return (
    <Section id="pricing" eyebrow="Pricing" title="Start free. Upgrade when your process grows." description="The free tier is designed to be useful from day one, with paid plans for deeper analytics and teams.">
      <div className="grid gap-4 lg:grid-cols-3">
        {pricing.map((plan) => (
          <motion.div
            key={plan.name}
            className={`rounded-lg border p-6 shadow-[0_18px_45px_rgba(66,66,66,0.08)] ${
              plan.highlighted
                ? "border-[#48CFCB]/55 bg-[linear-gradient(135deg,rgba(72,207,203,0.18),rgba(255,255,255,0.9))]"
                : "border-white/80 bg-white/72"
            }`}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-[#262626]">{plan.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#424242]/70">{plan.description}</p>
              </div>
              {plan.highlighted ? <Badge icon={Check}>Best start</Badge> : null}
            </div>
            <p className="mt-7 text-4xl font-semibold text-[#262626]">
              {plan.price}
              {plan.price.startsWith("$") && plan.price !== "$0" ? <span className="text-base font-medium text-[#424242]/55">/mo</span> : null}
            </p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-[#424242]/78">
                  <Check size={16} className="text-[#229799]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button href="/signin" variant={plan.highlighted ? "primary" : "secondary"} className="mt-7 w-full justify-center">
              {plan.highlighted ? "Start Free" : "Choose Plan"}
            </Button>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <Section eyebrow="FAQ" title="Clear answers before you start." description="Lancotech is education-first, practice-first, and built for responsible progress.">
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((item, index) => (
          <div key={item.question} className="rounded-lg border border-white/80 bg-white/72 shadow-[0_12px_35px_rgba(66,66,66,0.06)]">
            <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-[#262626]" type="button" onClick={() => setOpen(open === index ? -1 : index)}>
              {item.question}
              <ChevronDown className={`shrink-0 transition ${open === index ? "rotate-180 text-[#229799]" : "text-[#424242]/45"}`} size={20} />
            </button>
            {open === index ? <p className="px-5 pb-5 leading-7 text-[#424242]/72">{item.answer}</p> : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

function FinalCTA() {
  return (
    <section id="contact" className="px-5 py-16 lg:px-8 lg:py-24">
      <motion.div
        className="mx-auto max-w-7xl overflow-hidden rounded-lg bg-[linear-gradient(135deg,#229799,#48CFCB)] px-6 py-12 text-white shadow-[0_30px_90px_rgba(34,151,153,0.28)] sm:px-10 lg:px-16"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65 }}
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-white/78">Learn. Practice. Master.</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">Build market confidence through structured practice.</h2>
          </div>
          <Button href="#pricing" variant="light" size="large">
            Start Free <ArrowRight size={18} />
          </Button>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#424242]/8 bg-white/65 px-5 py-10 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-[#48CFCB] to-[#229799] text-sm font-black text-white">L</span>
            <span className="text-lg font-semibold text-[#262626]">Lancotech</span>
          </div>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#424242]/65">A modern trading education and simulation platform for disciplined market practice.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-[#424242]/68">
          {["Privacy", "Terms", "Security", "Contact"].map((item) => (
            <a key={item} href="#contact" className="transition hover:text-[#229799]">
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="px-5 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div className="mb-10 max-w-3xl" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={fadeUp} transition={{ duration: 0.58 }}>
          <p className="text-sm font-semibold uppercase text-[#229799]">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight text-[#262626] sm:text-5xl">{title}</h2>
          <p className="mt-4 text-lg leading-8 text-[#424242]/72">{description}</p>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function MotionCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      className="rounded-lg border border-white/80 bg-white/72 p-6 shadow-[0_18px_45px_rgba(66,66,66,0.08)] backdrop-blur"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -5 }}
    >
      {children}
    </motion.div>
  );
}

function ComparisonCard({ title, items, tone }: { title: string; items: string[]; tone: "muted" | "accent" }) {
  return (
    <motion.div
      className={`rounded-lg border p-6 shadow-[0_18px_45px_rgba(66,66,66,0.08)] ${
        tone === "accent" ? "border-[#48CFCB]/55 bg-white" : "border-white/80 bg-white/60"
      }`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55 }}
    >
      <h3 className="text-2xl font-semibold text-[#262626]">{title}</h3>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-[#424242]/76">
            {tone === "accent" ? <Check size={18} className="mt-0.5 shrink-0 text-[#229799]" /> : <LockKeyhole size={18} className="mt-0.5 shrink-0 text-[#424242]/35" />}
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function Counter({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const total = 54;
    const timer = window.setInterval(() => {
      frame += 1;
      setDisplay(Math.round((value * frame) / total));
      if (frame >= total) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      className="rounded-lg border border-white/80 bg-white/72 p-6 text-center shadow-[0_18px_45px_rgba(66,66,66,0.08)]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5, delay }}
    >
      <p className="text-4xl font-semibold text-[#262626]">
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-sm font-semibold uppercase text-[#424242]/55">{label}</p>
    </motion.div>
  );
}

function Badge({ children, icon: Icon }: { children: React.ReactNode; icon: typeof ShieldCheck }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-[#48CFCB]/28 bg-white/72 px-3 py-2 text-xs font-semibold uppercase text-[#229799] shadow-[0_10px_25px_rgba(66,66,66,0.06)] backdrop-blur">
      <Icon size={15} />
      {children}
    </span>
  );
}

function Button({
  href,
  children,
  variant = "primary",
  size = "normal",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light";
  size?: "normal" | "large";
  className?: string;
}) {
  const styles = {
    primary: "bg-[#229799] text-white shadow-[0_16px_35px_rgba(34,151,153,0.24)] hover:bg-[#1d8587]",
    secondary: "border border-[#424242]/12 bg-white/78 text-[#424242] hover:border-[#229799]/35 hover:text-[#229799]",
    light: "bg-white text-[#229799] shadow-[0_16px_35px_rgba(0,0,0,0.12)] hover:bg-[#f7ffff]",
  };

  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition duration-200 ${size === "large" ? "px-6 py-4 text-base" : "px-4 py-2.5 text-sm"} ${styles[variant]} ${className}`}
    >
      {children}
    </a>
  );
}
