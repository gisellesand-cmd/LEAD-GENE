import { redirect } from "next/navigation";
import { getLeadById } from "@/lib/leads-store";
import ApplyForm from "@/components/apply/apply-form";

export const metadata = {
  title: "Complete Your Application | First Avenue Financial",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; company?: string; product?: string; premium?: string }>;
}) {
  const params = await searchParams;
  const leadId = params.leadId;

  if (!leadId) {
    redirect("/");
  }

  const lead = await getLeadById(leadId);

  if (!lead) {
    redirect("/");
  }

  return (
    <ApplyForm
      leadId={lead.id}
      fullName={lead.full_name}
      email={lead.email}
      phone={lead.phone}
      dateOfBirth={lead.date_of_birth}
      sex={lead.sex}
      province={lead.province}
      smoker={lead.smoker}
      selectedCompany={params.company ?? lead.applied_company_name ?? lead.company_name ?? ""}
      selectedProduct={params.product ?? lead.applied_product_name ?? lead.insurer_product_name ?? ""}
      selectedPremium={params.premium ?? lead.applied_monthly_premium ?? ""}
    />
  );
}
