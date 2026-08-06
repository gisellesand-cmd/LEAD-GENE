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

        <h1 className="mt-8 text-3xl font-semibold text-[#333333]">Terms of Service</h1>
        <p className="mt-2 text-sm text-[#888888]">Last updated: [effective date]</p>

        <div className="mt-8 space-y-8 text-sm leading-6 text-[#4b4a47]">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of this website, operated
            by First Avenue Financial (&quot;First Avenue Financial&quot;, &quot;we&quot;,
            &quot;us&quot;, or &quot;our&quot;), a licensed insurance broker operating in Alberta
            and British Columbia, Canada. By accessing or using this website, you agree to be
            bound by these Terms. If you do not agree, please do not use this website.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">1. Eligibility</h2>
            <p className="mt-3">
              This website is intended for residents of Alberta and British Columbia who have
              reached the age of majority in their province of residence. First Avenue Financial
              is not licensed to offer insurance products outside of Alberta and British
              Columbia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">2. Description of Services</h2>
            <p className="mt-3">
              This website allows you to submit basic personal and health information in order to
              receive an estimated term life insurance premium, compiled by comparing rates from
              multiple Canadian insurance carriers, and to request a callback from a licensed
              insurance advisor. This website does not itself sell or issue insurance policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">
              3. Quote Estimates Are Not Binding
            </h2>
            <p className="mt-3">
              Any premium estimate, coverage amount, or rate displayed on this website is
              generated automatically from the information you provide and from third-party
              rate-comparison data (including Compulife Software Inc.). Estimates are provided
              for informational purposes only, are not a quote, offer, or contract of insurance,
              and do not guarantee eligibility, coverage, or final pricing. Final rates,
              eligibility, and coverage are determined solely by the applicable insurance
              carrier following formal underwriting, which may include a medical exam,
              questionnaire, or other requirements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">
              4. No Insurance, Financial, or Legal Advice
            </h2>
            <p className="mt-3">
              Content on this website, including calculator estimates, is provided for general
              informational purposes only and does not constitute insurance, financial, legal, or
              tax advice. You should consult a licensed insurance advisor before making any
              decision about insurance coverage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">
              5. Accuracy of Information You Provide
            </h2>
            <p className="mt-3">
              You are responsible for the accuracy and completeness of the information you submit
              through this website. Inaccurate or incomplete information may result in an
              inaccurate estimate, delays, or denial of coverage during underwriting.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">6. Consent to Be Contacted</h2>
            <p className="mt-3">
              By submitting the quote form, you consent to being contacted by a licensed First
              Avenue Financial advisor about your inquiry. Where you provide separate consent to
              receive marketing communications, that consent is obtained and may be withdrawn in
              accordance with Canada&apos;s Anti-Spam Legislation (CASL) and our{" "}
              <Link href="/privacy" className="font-semibold text-[#71b664] hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">7. Intellectual Property</h2>
            <p className="mt-3">
              All text, graphics, logos, and other content on this website are the property of
              First Avenue Financial or its licensors and are protected by Canadian and
              international copyright and trademark laws. You may not reproduce, distribute, or
              create derivative works from this content without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">
              8. Third-Party Services and Links
            </h2>
            <p className="mt-3">
              This website relies on and may link to third-party services, including Compulife
              Software Inc. for rate comparisons and various insurance carriers. We are not
              responsible for the content, accuracy, or practices of any third-party service or
              website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">9. Limitation of Liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by law, First Avenue Financial is not liable for any
              loss or damage arising from your use of, or inability to use, this website, or from
              any decision made based solely on an estimate shown on this site. This website and
              its content are provided &quot;as is&quot; without warranties of any kind, express
              or implied.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">10. Indemnification</h2>
            <p className="mt-3">
              You agree to indemnify and hold harmless First Avenue Financial, its employees, and
              agents from any claim, loss, or damage arising from your misuse of this website or
              your breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">11. Governing Law</h2>
            <p className="mt-3">
              These Terms are governed by the laws of the Province of [Alberta / British Columbia
              — to confirm] and the federal laws of Canada applicable therein, without regard to
              conflict of law principles. You agree that any dispute arising from these Terms
              will be resolved in the courts of that province.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">12. Changes to These Terms</h2>
            <p className="mt-3">
              We may update these Terms from time to time. The &quot;Last updated&quot; date at
              the top of this page indicates when these Terms were last revised. Continued use of
              this website after changes are posted constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#5a9150]">13. Contact Us</h2>
            <p className="mt-3">
              If you have questions about these Terms, please contact us at:
            </p>
            <p className="mt-3">
              First Avenue Financial
              <br />
              Phone: 403-390-2380
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
