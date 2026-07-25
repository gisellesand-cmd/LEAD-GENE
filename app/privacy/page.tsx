import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | First Avenue Financial",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[#333333]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold text-[#71b664] hover:underline">
          ← Back to First Avenue Financial
        </Link>
        <div className="mt-6 rounded-sm border border-[#e8c3c3] bg-[#fff5f5] p-4 text-sm text-[#8c2f2f]">
          DRAFT. Working copy prepared by KOKO Agency. Must be reviewed and approved by First
          Avenue Financial&apos;s Canadian counsel before publishing (PRD Section 16, Appendix A).
          Required before any Meta Lead Ads form can be created.
        </div>
        <h1 className="mt-8 text-3xl font-semibold">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-sm leading-6 text-[#4b4a47]">
          <p>
            First Avenue Financial (&quot;we&quot;, &quot;us&quot;) collects personal information
            you submit through this website, including name, email, phone number, and product
            interest, to respond to your inquiry and provide financial guidance.
          </p>
          <p>
            Information is stored securely and used only for the purpose it was collected for.
            We do not sell your personal information. You may request access to, correction of,
            or deletion of your information at any time by contacting us.
          </p>
          <p>
            This site complies with Canada&apos;s Anti-Spam Legislation (CASL), the Personal
            Information Protection and Electronic Documents Act (PIPEDA), and Quebec&apos;s Law
            25. Analytics cookies are only set after you provide consent via the cookie banner.
          </p>
          <p>Contact: [client mailing address and contact email pending].</p>
        </div>
      </div>
    </div>
  );
}
