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

        <div className="mt-6 rounded-sm border-2 border-[#c0392b] bg-[#fff5f5] p-4 text-sm text-[#8c2f2f]">
          <p className="font-semibold uppercase tracking-wide">Draft — Not for Publication</p>
          <p className="mt-1">
            Working copy prepared by KOKO Agency. Must be reviewed and approved by First Avenue
            Financial&apos;s Canadian counsel before publishing (PRD Section 16, Appendix A).
            Required before any Meta Lead Ads form can be created. Bracketed items below are
            placeholders pending information from the client.
          </p>
        </div>

        <h1 className="mt-8 text-3xl font-semibold text-[#333333]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#888888]">Last updated: [effective date]</p>

        <div className="mt-8 space-y-8 text-sm leading-6 text-[#4b4a47]">
          <p>
            First Avenue Financial (&quot;First Avenue Financial&quot;, &quot;we&quot;,
            &quot;us&quot;, or &quot;our&quot;) is a licensed insurance broker operating in
            Alberta and British Columbia, Canada. This Privacy Policy explains how we collect,
            use, disclose, and protect personal information when you visit this website, request
            an insurance quote, or otherwise interact with us. By using this website, you agree
            to the collection and use of information in accordance with this policy.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">1. Information We Collect</h2>
            <p className="mt-3">We collect the following categories of personal information:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold">Contact information</span> — full name, email
                address, and phone number.
              </li>
              <li>
                <span className="font-semibold">Quote information</span> — date of birth, sex,
                smoker/nicotine status, desired coverage amount, term length, and province of
                residence, used solely to generate an estimated life insurance premium.
              </li>
              <li>
                <span className="font-semibold">Communication preferences</span> — your consent
                (or withdrawal of consent) to receive marketing communications from us.
              </li>
              <li>
                <span className="font-semibold">Technical information</span> — IP address,
                browser type, referring URL, and analytics/advertising identifiers (e.g. Google
                Click ID, Meta Click ID) collected automatically when you visit the site.
              </li>
              <li>
                <span className="font-semibold">Lead ad information</span> — if you submit an
                inquiry through a Meta (Facebook/Instagram) Lead Ads form, we receive the contact
                and quote information you provided to Meta.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">2. How We Use Your Information</h2>
            <p className="mt-3">We use the personal information we collect to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Generate an estimated insurance premium using your quote information;</li>
              <li>Respond to your inquiry and connect you with a licensed insurance advisor;</li>
              <li>
                Send you marketing or follow-up communications, where you have provided express
                consent in accordance with Canada&apos;s Anti-Spam Legislation (CASL);
              </li>
              <li>Maintain records of our communications with you in our client relationship system;</li>
              <li>Measure and improve the performance of this website and our advertising; and</li>
              <li>Comply with legal, regulatory, and insurance industry recordkeeping obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">3. Consent</h2>
            <p className="mt-3">
              By submitting the quote form, you consent to First Avenue Financial collecting and
              using your personal information as described in this policy, and to being contacted
              by a licensed advisor about the products and services you inquired about. Where you
              provide separate consent to receive marketing communications, that consent is
              obtained in accordance with CASL and can be withdrawn at any time, free of charge,
              by using the unsubscribe link included in our emails or by contacting us using the
              information in Section 10 below. Withdrawing consent to marketing communications
              does not affect our ability to contact you regarding a quote or inquiry you have
              already submitted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">4. Disclosure of Your Information</h2>
            <p className="mt-3">We may share your personal information with:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-semibold">Insurance carriers and underwriters</span> —
                where you proceed with an application, to obtain formal underwriting and issue a
                policy;
              </li>
              <li>
                <span className="font-semibold">Compulife Software Inc.</span> — a third-party
                quote comparison engine we use to calculate estimated premiums from information
                you provide;
              </li>
              <li>
                <span className="font-semibold">Service providers</span> — including our website
                hosting, database, and customer relationship management providers, who process
                information on our behalf and are contractually required to protect it;
              </li>
              <li>
                <span className="font-semibold">Advertising platforms</span> — Meta (Facebook/
                Instagram) and Google, for the purpose of measuring and optimizing our
                advertising, in accordance with those platforms&apos; own privacy policies; and
              </li>
              <li>
                <span className="font-semibold">Legal and regulatory authorities</span> — where
                required by law, regulation, or a valid legal process.
              </li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">5. Cookies and Analytics</h2>
            <p className="mt-3">
              This website uses essential cookies required for the site to function, and
              analytics/advertising cookies that help us understand website usage and measure
              advertising performance. Non-essential cookies are only set after you provide
              consent through our cookie banner. You can withdraw or manage cookie consent at any
              time through your browser settings or the cookie preferences on this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">6. Data Retention and Security</h2>
            <p className="mt-3">
              We retain personal information only for as long as necessary to fulfill the
              purposes described in this policy, or as required by applicable law and insurance
              industry recordkeeping requirements. We use reasonable administrative, technical,
              and physical safeguards — including encrypted data transmission and access-
              controlled databases — to protect your personal information against unauthorized
              access, use, disclosure, or loss.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">7. Your Privacy Rights</h2>
            <p className="mt-3">
              Subject to limited exceptions, you have the right to request access to the personal
              information we hold about you, request correction of inaccurate information, and
              request that we delete or stop using your information. This website is operated in
              accordance with the federal Personal Information Protection and Electronic
              Documents Act (PIPEDA), Alberta&apos;s Personal Information Protection Act (PIPA),
              and British Columbia&apos;s Personal Information Protection Act (PIPA). To exercise
              any of these rights, contact us using the information in Section 10 below. We will
              respond to your request within the timelines required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">8. Children&apos;s Privacy</h2>
            <p className="mt-3">
              This website is not directed at, and is not knowingly used by, children. Insurance
              products described on this site can only be purchased by individuals who have
              reached the age of majority in their province of residence. We do not knowingly
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">9. Third-Party Links</h2>
            <p className="mt-3">
              This website may contain links to third-party websites, including insurance carrier
              websites. We are not responsible for the privacy practices or content of third-party
              websites. We encourage you to review the privacy policy of any third-party site you
              visit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">10. Contact Us</h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy, or wish to exercise your privacy
              rights, please contact us at:
            </p>
            <p className="mt-3">
              First Avenue Financial
              <br />
              [Registered business address pending]
              <br />
              [Contact email pending]
              <br />
              Phone: 403-390-2380
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">11. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time to reflect changes to our
              practices or applicable law. The &quot;Last updated&quot; date at the top of this
              page indicates when this policy was last revised. We encourage you to review this
              page periodically.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
