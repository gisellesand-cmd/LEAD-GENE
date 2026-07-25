import Link from "next/link";

export const metadata = {
  title: "Terms of Service | First Avenue Financial",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#333333]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold text-[#71b664] hover:underline">
          ← Back to First Avenue Financial
        </Link>
        <div className="mt-6 rounded-sm border border-[#e8c3c3] bg-[#fff5f5] p-4 text-sm text-[#8c2f2f]">
          DRAFT. Working copy prepared by KOKO Agency. Must be reviewed and approved by First
          Avenue Financial&apos;s Canadian counsel before publishing (PRD Section 16, Appendix A).
        </div>
        <h1 className="mt-8 text-3xl font-semibold">Terms of Service</h1>
        <div className="mt-6 space-y-4 text-sm leading-6 text-[#4b4a47]">
          <p>
            By using this website you agree to these terms. Content on this site, including
            calculator estimates, is for informational purposes only and does not constitute a
            binding insurance quote, contract, or financial advice.
          </p>
          <p>
            Insurance quotes shown by the calculator are estimates generated from data you
            provide and are subject to underwriting approval by the relevant insurance carrier.
          </p>
          <p>
            First Avenue Financial is not liable for decisions made based solely on estimates
            shown on this site. Contact a licensed advisor for personalized guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
