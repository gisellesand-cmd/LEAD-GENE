"use client";

import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { captureAttribution, readAttribution } from "@/lib/attribution";

type QuoteResult = {
  mock: boolean;
  monthlyPremium: string;
  companyName: string;
  productName: string;
  coverageAmount: string;
  termLabel: string;
  note: string;
};

const termOptions = [
  { value: "3", label: "10 years" },
  { value: "4", label: "15 years" },
  { value: "5", label: "20 years" },
  { value: "6", label: "25 years" },
  { value: "7", label: "30 years" },
  { value: "E", label: "To age 100 (level)" },
];

const provinceOptions = ["Alberta", "British Columbia"];

const trustBarItems = [
  { icon: "shield", value: "15", label: "Top Canadian insurers" },
  { icon: "people", value: "Thousands Served", label: "Across Canada" },
  { icon: "check", value: "Free Consultation", label: "No obligation, ever" },
];

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

function ShieldIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.75}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbUpIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.75}>
      <path d="M7 11v9H4a1 1 0 01-1-1v-7a1 1 0 011-1h3z" strokeLinejoin="round" />
      <path d="M7 11l4-7a2 2 0 012 2v4h5.5a1.5 1.5 0 011.45 1.86l-1.5 6A2 2 0 0116.5 20H9a2 2 0 01-2-2v-7z" strokeLinejoin="round" />
    </svg>
  );
}

function LightningIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.75}>
      <path d="M13 3L4 14h6l-1 7 9-11h-6l1-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.75}>
      <circle cx="9" cy="8" r="3" />
      <path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" strokeLinecap="round" />
      <path d="M15.5 6.5a3 3 0 010 5.8M18.5 20c0-2.8-1.8-5-4.5-5.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.2 2.2L15.5 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17l-5.9 3.5 1.3-6.6-4.9-4.6 6.6-.7L12 2.5z" />
    </svg>
  );
}

function PhoneIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={2}>
      <path d="M4 5c0 8.5 6.5 15 15 15l2-4-5-2-2 2c-2-1-4-3-5-5l2-2-2-5-4 1z" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  // One unified hero form: mandatory Name + Email up front, followed by the
  // real Compulife quote questions (date of birth, sex, smoker, coverage,
  // term, province). Submitting captures the lead AND fetches a quote.
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
    company_website: "", // honeypot
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
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          product: `Term Life Insurance (${termLabel}, $${form.faceAmount})`,
          message: `Province: ${form.province}. Estimated premium: ${quoteData.monthlyPremium}/month.`,
          consent: form.consent,
          ...attribution,
        }),
      });
      setLeadSaved(true);
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : "We could not calculate your quote.");
    } finally {
      setQuoteLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#333333]">
      <div className="hidden justify-center gap-6 bg-[#14301f] px-4 py-2 text-xs text-[#cfe6c6] sm:flex">
        <span>Servicing all of Canada</span>
        <span className="text-[#4e8221]">|</span>
        <span>Licensed Insurance Advisor</span>
        <span className="text-[#4e8221]">|</span>
        <a href="tel:4033902380" className="font-semibold hover:text-white">
          Call us: 403-390-2380
        </a>
      </div>

      <header className="sticky top-0 z-20 border-b border-[#e5e5e5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/first-avenue-logo.png"
              alt="First Avenue Financial logo"
              width={150}
              height={112}
              className="h-11 w-auto"
              priority
            />
            <div className="hidden sm:block">
              <p className="text-base font-semibold leading-tight text-[#333333]">First Avenue Financial</p>
              <p className="text-sm text-[#666666]">Mortgages · Insurance · Investments</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#333333]">
            <a href="#steps" className="transition hover:text-[#71b664]">
              How it works
            </a>
            <a href="#contact" className="transition hover:text-[#71b664]">
              Get a quote
            </a>
            <a href="tel:4033902380" className="hidden items-center gap-1 text-[#333333] sm:inline-flex">
              <PhoneIcon /> 403-390-2380
            </a>
            <a
              href="#contact"
              className="rounded-sm bg-[#c7a05f] px-5 py-2.5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#af944f] hover:shadow-md"
            >
              Get Free Quote
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* HERO */}
        <section className="relative grid gap-8 overflow-hidden rounded-lg bg-gradient-to-br from-[#173a28] to-[#1f4a34] p-8 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:p-12">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#71b664]/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

          <div className="relative flex flex-col justify-center gap-6 text-white animate-fade-in-up">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#71b664]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#a8d89a]">
              Your top rated local advisor
            </div>
            <div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Get your life insurance quote in Canada.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#d9d9d9]">
                Compare term life insurance quotes from top Canadian carriers in minutes. No
                medical exam required for most plans.
              </p>
            </div>

            <div className="flex flex-col gap-3 text-sm text-[#d9d9d9] sm:flex-row sm:flex-wrap sm:gap-6">
              <span className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5 shrink-0 text-[#a8d89a]" /> No obligation
              </span>
              <span className="flex items-center gap-2">
                <ThumbUpIcon className="h-5 w-5 shrink-0 text-[#a8d89a]" /> 100% secure and private
              </span>
              <span className="flex items-center gap-2">
                <LightningIcon className="h-5 w-5 shrink-0 text-[#a8d89a]" /> Quote in 60 seconds
              </span>
            </div>

            <div className="relative mt-2 overflow-hidden rounded-lg border border-white/10">
              <Image
                src="/hero-photo.jpg"
                alt="A couple checking their life insurance quote on their phones"
                width={900}
                height={520}
                style={{ objectPosition: "50% 18%" }}
                className="h-56 w-full object-cover sm:h-64"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#173a28]/40 to-transparent" />
            </div>
          </div>

          {/* Unified quote + contact capture card */}
          <div className="relative rounded-lg bg-white p-6 shadow-2xl sm:p-8 animate-fade-in-up [animation-delay:150ms]">
            <h2 className="text-xl font-semibold text-[#1f4a34]">Get Your Free Quote</h2>
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
                    className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none transition focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                    className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none transition focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                  className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-4 py-3 text-sm text-[#222] outline-none transition focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                        className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                        className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                        className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                        className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                        className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                        className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
                      />
                    </label>
                    <label className="text-sm font-medium text-[#333333]">
                      Term
                      <select
                        name="termCategory"
                        value={form.termCategory}
                        onChange={handleChange}
                        className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                      className="mt-2 w-full rounded-sm border border-[#d0d0d0] bg-white px-4 py-3 text-sm text-[#222] outline-none focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20"
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
                className="inline-flex items-center justify-center rounded-sm bg-[#c7a05f] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#c7a05f]/30 transition hover:-translate-y-0.5 hover:bg-[#af944f] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {quoteLoading ? "Calculating..." : "See My Free Quote"}
              </button>

              {quoteError ? (
                <div className="rounded-sm border border-[#e8c3c3] bg-[#fff5f5] p-4 text-sm text-[#8c2f2f]">
                  {quoteError}
                </div>
              ) : null}

              {quoteResult ? (
                <div className="grid gap-3 animate-fade-in-up rounded-sm border border-[#cfe6c6] bg-[#f0f8ed] p-4">
                  <div>
                    <p className="text-sm text-[#345c22]">Estimated monthly premium</p>
                    <p className="text-2xl font-semibold text-[#1f4a34]">{quoteResult.monthlyPremium}</p>
                  </div>
                  <p className="text-xs text-[#345c22]">{quoteResult.note}</p>
                  {leadSaved ? (
                    <p className="text-sm font-medium text-[#1f4a34]">
                      Thanks! Your request has been received and our team will be in touch shortly.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </form>
          </div>
        </section>

        {/* TRUST BAR */}
        <section className="-mt-8 grid gap-4 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-6 sm:grid-cols-3">
          {trustBarItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#71b664]/10 text-[#4e8221]">
                {item.icon === "shield" ? <ShieldIcon /> : item.icon === "people" ? <PeopleIcon /> : <CheckCircleIcon />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1f4a34]">{item.value}</p>
                <p className="text-xs text-[#666666]">{item.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* 3 STEPS */}
        <section id="steps" className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#c7a05f]">Simple process</p>
          <h2 className="mt-2 text-3xl font-semibold text-[#1f4a34]">Get Covered in 3 Easy Steps</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#666666]">
            No paperwork, no confusing jargon. Just honest advice and competitive rates from
            Canadian insurers.
          </p>
          <div className="mt-8 grid gap-6 text-left lg:grid-cols-3">
            {stepItems.map((item) => (
              <div
                key={item.step}
                className="rounded-lg border border-[#e5e5e5] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_-25px_rgba(31,74,52,0.35)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f4a34] text-base font-semibold text-white">
                  {item.step}
                </span>
                <p className="mt-4 text-base font-semibold text-[#1f4a34]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#666666]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section>
          <h2 className="text-center text-3xl font-semibold text-[#1f4a34]">Families Protected Across Canada</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-lg border border-[#e5e5e5] bg-white p-6">
                <div className="flex gap-1 text-[#c7a05f]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="mt-4 text-sm italic leading-6 text-[#4b4a47]">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f4a34] text-xs font-semibold text-white">
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
        <section>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-[#c7a05f]">Questions</p>
          <h2 className="mt-2 text-center text-3xl font-semibold text-[#1f4a34]">Everything You Need to Know</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <details key={item.question} className="group rounded-lg border border-[#e5e5e5] bg-white p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#1f4a34] marker:content-none">
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
        <section className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#173a28] to-[#1f4a34] p-10 text-center text-white">
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
                className="inline-flex items-center justify-center rounded-sm bg-[#c7a05f] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#c7a05f]/20 transition hover:-translate-y-0.5 hover:bg-[#af944f]"
              >
                Get My Free Quote
              </a>
              <a
                href="tel:4033902380"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <PhoneIcon /> Call 403-390-2380
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e5e5e5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-[#666666] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 First Avenue Financial. Placeholder content for future launch.</p>
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
