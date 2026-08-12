"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, PhoneCall } from "lucide-react";
import { captureAttribution, readAttribution } from "@/lib/attribution";

type CarrierQuote = {
  companyName: string;
  productName: string;
  monthlyPremium: string;
};

type QuoteResult = {
  mock: boolean;
  monthlyPremium: string;
  companyName: string;
  productName: string;
  coverageAmount: string;
  termLabel: string;
  note: string;
  topQuotes: CarrierQuote[];
  allQuotes: CarrierQuote[];
};

function trackMetaLead() {
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  fbq?.("track", "Lead");
}

const termOptions = [
  { value: "3", label: "10 years" },
  { value: "4", label: "15 years" },
  { value: "5", label: "20 years" },
  { value: "6", label: "25 years" },
  { value: "7", label: "30 years" },
  { value: "E", label: "To age 100 (level)" },
];

const provinceOptions = ["Alberta", "British Columbia"];

const stepItems = [
  {
    step: "1",
    title: "Tell Us About Yourself",
    description: "Fill out our short form with your age, coverage amount, and province. That's all we need to start.",
  },
  {
    step: "2",
    title: "Compare Live Quotes",
    description: "We pull rates from top Canadian insurers so you can see where you stand.",
  },
  {
    step: "3",
    title: "Talk to a Licensed Advisor",
    description: "A real person, not a bot, calls you to confirm the best plan and get you approved.",
  },
];

const testimonials = [
  {
    quote:
      "I was amazed at how fast the process was. Got quotes from several companies in minutes and was approved the same week. First Avenue made it completely stress-free.",
    name: "Sarah M.",
    meta: "Calgary, AB · Mother of 2",
    initials: "SM",
  },
  {
    quote:
      "As a new immigrant, I didn't understand Canadian insurance at all. The advisor walked me through everything patiently. Got $500K coverage for under $30/month.",
    name: "Raj K.",
    meta: "Edmonton, AB · Engineer",
    initials: "RK",
  },
  {
    quote:
      "We just bought our first home and needed life insurance fast. First Avenue found us a better rate than our bank offered, saving us over $40/month. Highly recommend.",
    name: "James & Paula T.",
    meta: "Okotoks, AB · First-time homeowners",
    initials: "JP",
  },
];

const faqItems = [
  {
    question: "How much does term life insurance cost in Canada?",
    answer:
      "It depends on your age, health, coverage amount, and term length. Many healthy applicants find plans starting around $20 to $40 per month. Our calculator gives you a real estimate in under a minute.",
  },
  {
    question: "Do I need a medical exam to apply?",
    answer: "Most applicants qualify without a medical exam. Some coverage amounts or health histories may require one. Your advisor will let you know upfront.",
  },
  {
    question: "How are you different from going directly to an insurer?",
    answer: "We compare multiple Canadian carriers on your behalf, so you see how your rate stacks up instead of only one company's price.",
  },
  {
    question: "How long does it take to get approved?",
    answer: "Many applicants are approved within a few business days. Your advisor will walk you through the expected timeline for your specific application.",
  },
  {
    question: "Can I get coverage as a new immigrant to Canada?",
    answer: "Yes, we regularly help newcomers to Canada find coverage. Your advisor can explain what documentation is typically needed.",
  },
  {
    question: "What if I'm not healthy? Can I still get coverage?",
    answer: "In most cases, yes. Rates vary based on health history, and there are options designed for a wide range of health situations.",
  },
];

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17l-5.9 3.5 1.3-6.6-4.9-4.6 6.6-.7L12 2.5z" />
    </svg>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-3xl font-semibold tracking-tight text-[#5a9150]">{value}</div>
      <div className="text-sm text-[#666666]">{label}</div>
    </div>
  );
}

function CompareBars() {
  return (
    <div className="mt-6 flex h-24 items-end gap-3">
      {[38, 62, 90, 55].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0, opacity: 0.6 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: 0.4 + i * 0.12, type: "spring" }}
          className="w-8 rounded-lg bg-white/25"
        />
      ))}
    </div>
  );
}

export default function FirstAvenueLandingPreview() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    sex: "M" as "M" | "F",
    smoker: "N" as "Y" | "N",
    faceAmount: "500000",
    termCategory: "5",
    province: "",
    consent: false,
    company_website: "",
  });
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [leadSaved, setLeadSaved] = useState(false);

  useEffect(() => {
    captureAttribution();
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (event.target as HTMLInputElement).checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuoteError("");
    setQuoteResult(null);
    setLeadSaved(false);

    if (form.company_website.trim() !== "") {
      setLeadSaved(true);
      return;
    }

    setQuoteLoading(true);
    try {
      const quoteResponse = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDay: form.birthDay,
          birthMonth: form.birthMonth,
          birthYear: form.birthYear,
          sex: form.sex,
          smoker: form.smoker,
          faceAmount: form.faceAmount,
          termCategory: form.termCategory,
          province: form.province,
        }),
      });
      const quoteData = await quoteResponse.json();
      if (!quoteResponse.ok) {
        throw new Error(quoteData.error || "We could not calculate your quote.");
      }
      setQuoteResult(quoteData);

      const attribution = readAttribution();
      const termLabel = termOptions.find((option) => option.value === form.termCategory)?.label ?? "";
      const dateOfBirth = `${form.birthYear.padStart(4, "0")}-${form.birthMonth.padStart(2, "0")}-${form.birthDay.padStart(2, "0")}`;
      const leadResponse = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          product: `Term Life Insurance (${termLabel}, $${form.faceAmount})`,
          company_name: quoteData.companyName,
          insurer_product_name: quoteData.productName,
          quote_results: quoteData.allQuotes,
          date_of_birth: dateOfBirth,
          smoker: form.smoker === "Y",
          message: `Province: ${form.province}. Estimated premium: ${quoteData.monthlyPremium}/month with ${quoteData.companyName} (${quoteData.productName}).`,
          consent: form.consent,
          ...attribution,
        }),
      });
      if (leadResponse.ok) {
        trackMetaLead();
      }
      setLeadSaved(true);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "We could not calculate your quote.");
    } finally {
      setQuoteLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F3F5F7] text-[#333333]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        .font-jakarta { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif; }
      `}</style>

      <div className="hidden justify-center gap-6 bg-[#14301f] px-4 py-2 text-xs text-[#cfe6c6] sm:flex font-jakarta">
        <span>Servicing Alberta &amp; BC</span>
        <span className="text-[#4e8221]">|</span>
        <span>Licensed Insurance Advisor</span>
        <span className="text-[#4e8221]">|</span>
        <a href="tel:4033902380" className="font-semibold hover:text-white">
          Call us: 403-390-2380
        </a>
      </div>

      <header className="sticky top-0 z-20 border-b border-[#e5e5e5] bg-white/90 backdrop-blur font-jakarta">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/first-avenue-logo.png"
              alt="First Avenue Financial logo"
              width={150}
              height={112}
              className="h-10 w-auto"
              priority
            />
            <span className="hidden text-lg font-semibold tracking-tight text-[#5a9150] sm:inline">
              First Avenue Financial
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#steps" className="text-sm text-[#555555] hover:text-[#5a9150]">How it works</a>
            <a href="#testimonials" className="text-sm text-[#555555] hover:text-[#5a9150]">Reviews</a>
            <a href="#faq" className="text-sm text-[#555555] hover:text-[#5a9150]">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <a href="tel:4033902380" className="hidden items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-[#333333] hover:bg-[#f3f5f7] sm:inline-flex">
              <PhoneCall className="h-4 w-4" /> 403-390-2380
            </a>
            <a
              href="#contact"
              className="rounded-full bg-[#5a9150] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#3f6b3a]"
            >
              Get Free Quote
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-8 sm:px-6 lg:px-8 lg:py-10 font-jakarta">
        {/* HERO */}
        <section className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="contents lg:flex lg:flex-1 lg:flex-col lg:gap-6">
          {/* Photo + headline */}
          <div className="order-1 lg:order-none relative isolate overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10">
            <Image
              src="/hero-photo.jpg"
              alt="Family reviewing their life insurance options together at home"
              fill
              priority
              className="object-cover object-[25%_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/70 to-white/90" />

            <div className="relative flex flex-col justify-center space-y-6 lg:justify-start lg:space-y-6">
            <div>
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#71b664]/40 bg-[#f0f8ed] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4e8221]">
                Your top rated local advisor
              </div>
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#5a9150] sm:text-5xl md:text-6xl md:leading-[1.05]">
                Get your life insurance quote in Canada.
              </h1>
              <p className="mt-5 max-w-md text-[#555555]">
                Compare term life insurance quotes from top Canadian carriers in minutes.
                No medical exam required for most plans.
              </p>
            </div>

            <div>
              <a
                href="#contact"
                className="inline-flex items-center gap-1 rounded-full bg-[#c7a05f] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#af944f] hover:shadow-md"
              >
                See My Free Quote <Sparkles className="h-4 w-4" />
              </a>
            </div>

            <div className="grid max-w-sm grid-cols-2 gap-8 pt-2">
              <Stat value="15" label="Top Canadian insurers" />
              <Stat value="Thousands" label="of families served" />
            </div>

            <div className="flex flex-wrap items-center gap-6 opacity-80">
              <span className="text-xs uppercase tracking-wide text-[#888888]">Backed by</span>
              <div className="flex items-center gap-5 text-sm font-semibold text-[#888888]">
                <span>Manulife</span>
                <span>Canada Life</span>
                <span>Sun Life</span>
              </div>
            </div>
            </div>
          </div>

          <div id="steps" className="order-3 lg:order-none">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c7a05f]">Simple process</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#5a9150]">Get Covered in 3 Easy Steps</h2>
            <div className="mt-6 grid gap-4">
              {stepItems.map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-[#e5e5e5] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-25px_rgba(31,74,52,0.35)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5a9150] text-sm font-semibold text-white">
                    {item.step}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-[#5a9150]">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#666666]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          </div>

          <div className="contents lg:flex lg:flex-1 lg:flex-col lg:gap-6">
          {/* Info cards */}
          <div className="order-4 lg:order-none grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative col-span-1 overflow-hidden rounded-xl bg-gradient-to-b from-[#3f6b3a] to-[#5a9150] p-6 text-white shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/10 p-2 ring-1 ring-white/10">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-xs uppercase tracking-wider text-[#a8d89a]">No exam needed</span>
              </div>
              <div className="mt-6 text-lg leading-snug text-white/95">
                Most plans approve
                <br /> without a medical exam
              </div>
              <div className="mt-5 border-t border-white/15 pt-4">
                <p className="text-sm font-semibold text-white">
                  What if I&apos;m not healthy? Can I still get coverage?
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  In most cases, yes. Rates vary based on health history, and there are options
                  designed for a wide range of health situations.
                </p>
              </div>
              <motion.div
                className="absolute right-5 top-5 h-10 w-10 rounded-full bg-[#71b664]/30"
                animate={{ boxShadow: ["0 0 0 0 rgba(113,182,100,0.35)", "0 0 0 14px rgba(113,182,100,0)"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative col-span-1 overflow-hidden rounded-xl bg-gradient-to-b from-[#c7a05f] to-[#af944f] p-6 text-white shadow-lg"
            >
              <div className="text-sm text-white/85">Compare instantly</div>
              <div className="text-lg font-medium leading-snug">
                15 Canadian carriers,
                <br /> one simple form
              </div>
              <CompareBars />
              <p className="mt-5 border-t border-white/15 pt-4 text-sm leading-6 text-white/85">
                See the top 3 insurance quotes for you, live.
              </p>
            </motion.div>
          </div>

          {/* Real quote + contact capture card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="order-2 lg:order-none rounded-xl bg-white p-6 shadow-lg ring-1 ring-[#e5e5e5] sm:p-8"
          >
              <h2 className="text-xl font-semibold text-[#5a9150]">Get Your Free Quote</h2>
              <p className="mt-1 text-sm text-[#666666]">No spam. A licensed advisor will contact you.</p>

              <form id="contact" onSubmit={handleSubmit} className="mt-5 grid gap-4">
                <input
                  type="text"
                  name="company_website"
                  value={form.company_website}
                  onChange={handleChange}
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-[#333333]">
                    Full Name
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none transition focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                    />
                  </label>
                  <label className="text-sm font-medium text-[#333333]">
                    Email Address
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none transition focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                    />
                  </label>
                </div>
                <label className="text-sm font-medium text-[#333333]">
                  Phone Number (optional)
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-4 py-3 text-sm text-[#222] outline-none transition focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                  />
                </label>

                <div className="border-t border-[#e5e5e5] pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#666666]">
                    Quote details
                  </p>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-3 gap-3">
                      <label className="text-sm font-medium text-[#333333]">
                        Day
                        <input
                          type="number"
                          name="birthDay"
                          min={1}
                          max={31}
                          value={form.birthDay}
                          onChange={handleChange}
                          placeholder="15"
                          required
                          className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                        />
                      </label>
                      <label className="text-sm font-medium text-[#333333]">
                        Month
                        <input
                          type="number"
                          name="birthMonth"
                          min={1}
                          max={12}
                          value={form.birthMonth}
                          onChange={handleChange}
                          placeholder="6"
                          required
                          className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                        />
                      </label>
                      <label className="text-sm font-medium text-[#333333]">
                        Year
                        <input
                          type="number"
                          name="birthYear"
                          min={1920}
                          max={2010}
                          value={form.birthYear}
                          onChange={handleChange}
                          placeholder="1985"
                          required
                          className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm font-medium text-[#333333]">
                        Sex
                        <select
                          name="sex"
                          value={form.sex}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                      </label>
                      <label className="text-sm font-medium text-[#333333]">
                        Smoker / Nicotine User
                        <select
                          name="smoker"
                          value={form.smoker}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                        >
                          <option value="N">Non-smoker / No nicotine use</option>
                          <option value="Y">Smoker / Nicotine user</option>
                        </select>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm font-medium text-[#333333]">
                        Coverage (CAD)
                        <input
                          type="number"
                          name="faceAmount"
                          step={10000}
                          value={form.faceAmount}
                          onChange={handleChange}
                          placeholder="500000"
                          required
                          className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                        />
                      </label>
                      <label className="text-sm font-medium text-[#333333]">
                        Term
                        <select
                          name="termCategory"
                          value={form.termCategory}
                          onChange={handleChange}
                          className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                        >
                          {termOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="text-sm font-medium text-[#333333]">
                      Province
                      <select
                        name="province"
                        value={form.province}
                        onChange={handleChange}
                        required
                        className="mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-4 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                      >
                        <option value="">Select province</option>
                        {provinceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <label className="flex items-start gap-3 text-xs text-[#666666]">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={form.consent}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 rounded border-[#bbbbbb] text-[#71b664]"
                  />
                  <span>
                    By submitting your information you consent to be contacted by First Avenue
                    Financial about its products and services, and you accept our{" "}
                    <a href="/privacy" className="text-[#71b664] underline">
                      Privacy Policy
                    </a>
                    . You can withdraw consent at any time.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={quoteLoading}
                  className="inline-flex items-center justify-center rounded-full bg-[#c7a05f] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#c7a05f]/30 transition hover:-translate-y-0.5 hover:bg-[#af944f] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {quoteLoading ? "Calculating..." : "See My Free Quote"}
                </button>

                {quoteError ? (
                  <div className="rounded-lg border border-[#e8c3c3] bg-[#fff5f5] p-4 text-sm text-[#8c2f2f]">
                    {quoteError}
                  </div>
                ) : null}

                {quoteResult ? (
                  <div className="grid gap-3 rounded-lg border border-[#cfe6c6] bg-[#f0f8ed] p-4">
                    <div>
                      <p className="text-sm text-[#345c22]">Your top rates</p>
                      <div className="mt-2 space-y-2">
                        {quoteResult.topQuotes.map((quote, index) => (
                          <div
                            key={`${quote.companyName}-${index}`}
                            className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-[#345c22]">{quote.companyName}</p>
                                {index === 0 ? (
                                  <span className="whitespace-nowrap rounded-full bg-[#5a9150] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                                    Best rate
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-[#5f7a54]">{quote.productName}</p>
                            </div>
                            <p className="text-lg font-semibold text-[#5a9150]">{quote.monthlyPremium}/mo</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#345c22]">{quoteResult.note}</p>
                    {leadSaved ? (
                      <p className="text-sm font-medium text-[#5a9150]">
                        Thanks! Your request has been received and our team will be in touch shortly.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </form>
            </motion.div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials">
          <h2 className="text-center text-3xl font-semibold text-[#5a9150]">Families Protected Across Canada</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-xl border border-[#e5e5e5] bg-white p-6">
                <div className="flex gap-1 text-[#c7a05f]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="mt-4 text-sm italic leading-6 text-[#4b4a47]">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5a9150] text-xs font-semibold text-white">
                    {item.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#333333]">{item.name}</p>
                    <p className="text-xs text-[#666666]">{item.meta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-[#c7a05f]">Questions</p>
          <h2 className="mt-2 text-center text-3xl font-semibold text-[#5a9150]">Everything You Need to Know</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-xl border border-[#e5e5e5] bg-white p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#5a9150] marker:content-none">
                  {item.question}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#71b664]/10 text-[#4e8221] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-[#666666]">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#3f6b3a] to-[#5a9150] p-10 text-center text-white">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#71b664]/10" />
          <div className="relative">
            <h2 className="text-3xl font-semibold">Your Family Deserves Protection.</h2>
            <h2 className="mt-1 text-3xl font-semibold">Get Started Today. It&apos;s Free.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-[#d9d9d9]">
              Join Canadian families across the country who found their best rate through First
              Avenue Financial.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-full bg-[#c7a05f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c7a05f]/20 transition hover:-translate-y-0.5 hover:bg-[#af944f]"
              >
                Get My Free Quote
              </a>
              <a
                href="tel:4033902380"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <PhoneCall className="h-4 w-4" /> Call 403-390-2380
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5e5e5] bg-white font-jakarta">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-[#666666] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 First Avenue Financial.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-[#71b664]">Privacy Policy</a>
            <a href="/terms" className="hover:text-[#71b664]">Terms of Service</a>
            <span>Phone: 403-390-2380</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
