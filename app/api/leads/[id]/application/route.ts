import { NextResponse, after } from "next/server";
import { getLeadById, updateLead, type ApplicationData } from "@/lib/leads-store";
import { queueApplicationEmail } from "@/lib/email";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}
function strOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}
function num(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function numOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function bool(value: unknown): boolean {
  return Boolean(value);
}
function obj(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

// Body is unauthenticated public input (the applicant isn't logged into the
// CRM), so this fills sane defaults for anything missing/malformed instead
// of rejecting the whole submission over one bad field.
function sanitizeApplicationData(input: unknown): ApplicationData {
  const body = obj(input);
  const personal = obj(body.personal);
  const primaryAddress = obj(personal.primaryAddress);
  const mailingAddress = obj(personal.mailingAddress);
  const identification = obj(personal.identification);
  const insuranceHistory = obj(body.insuranceHistory);
  const financialOccupation = obj(body.financialOccupation);
  const lifestyle = obj(body.lifestyle);
  const medical = obj(body.medical);
  const conditions = obj(medical.conditions);
  const beneficiaries = obj(body.beneficiaries);
  const primaryBeneficiaries = Array.isArray(beneficiaries.primary) ? beneficiaries.primary : [];
  const policySpecific = obj(body.policySpecific);
  const policyDetails = obj(policySpecific.details);
  const hearAboutUs = obj(body.hearAboutUs);

  return {
    personal: {
      education: str(personal.education),
      maritalStatus: str(personal.maritalStatus),
      primaryAddress: {
        street: str(primaryAddress.street),
        city: str(primaryAddress.city),
        province: str(primaryAddress.province),
        postalCode: str(primaryAddress.postalCode),
      },
      mailingAddress: {
        sameAsPrimary: mailingAddress.sameAsPrimary === undefined ? true : bool(mailingAddress.sameAsPrimary),
        street: strOrNull(mailingAddress.street),
        city: strOrNull(mailingAddress.city),
        province: strOrNull(mailingAddress.province),
        postalCode: strOrNull(mailingAddress.postalCode),
      },
      identification: {
        type: str(identification.type),
        provinceOfIssue: str(identification.provinceOfIssue),
        number: str(identification.number),
        expiryDate: str(identification.expiryDate),
      },
      citizenshipStatus: str(personal.citizenshipStatus),
      countryOfBirth: str(personal.countryOfBirth),
      provinceOfBirth: str(personal.provinceOfBirth),
    },
    insuranceHistory: {
      hasCoverageInForceOrPending: bool(insuranceHistory.hasCoverageInForceOrPending),
      everDeclinedRatedModified: bool(insuranceHistory.everDeclinedRatedModified),
    },
    financialOccupation: {
      occupationTitle: str(financialOccupation.occupationTitle),
      occupationalDuties: str(financialOccupation.occupationalDuties),
      employerName: str(financialOccupation.employerName),
      employmentStartDate: str(financialOccupation.employmentStartDate),
      annualEarnedIncomeCad: num(financialOccupation.annualEarnedIncomeCad),
      otherIncomeSourcesCad: num(financialOccupation.otherIncomeSourcesCad),
      netWorthCanadaCad: num(financialOccupation.netWorthCanadaCad),
      netWorthForeignCad: numOrNull(financialOccupation.netWorthForeignCad),
      bankruptcyLast5Years: bool(financialOccupation.bankruptcyLast5Years),
      usCitizenOrTaxResident: bool(financialOccupation.usCitizenOrTaxResident),
      taxResidentOtherThanCanadaUs: bool(financialOccupation.taxResidentOtherThanCanadaUs),
    },
    lifestyle: {
      lastTobaccoNicotineUse: str(lifestyle.lastTobaccoNicotineUse),
      cannabisUse: bool(lifestyle.cannabisUse),
      nonPrescribedDrugsLast10Years: bool(lifestyle.nonPrescribedDrugsLast10Years),
      highwaySafetyViolationsLast3Years: bool(lifestyle.highwaySafetyViolationsLast3Years),
      hazardousActivities: bool(lifestyle.hazardousActivities),
      pilotOrCrewLast5Years: bool(lifestyle.pilotOrCrewLast5Years),
    },
    medical: {
      heightFeet: num(medical.heightFeet),
      heightInches: num(medical.heightInches),
      weightLb: num(medical.weightLb),
      hasPhysician: bool(medical.hasPhysician),
      physicianName: strOrNull(medical.physicianName),
      physicianAddress: strOrNull(medical.physicianAddress),
      conditions: {
        heartOrCirculatory: bool(conditions.heartOrCirculatory),
        highBloodPressure: bool(conditions.highBloodPressure),
        cancerOrTumor: bool(conditions.cancerOrTumor),
        diabetes: bool(conditions.diabetes),
        hivAids: bool(conditions.hivAids),
        mentalHealth: bool(conditions.mentalHealth),
        otherMajorIllness: bool(conditions.otherMajorIllness),
        noneOfAbove: bool(conditions.noneOfAbove),
      },
      hospitalTestsSurgeryLastYear: bool(medical.hospitalTestsSurgeryLastYear),
      currentlyTakingUnlistedMedication: bool(medical.currentlyTakingUnlistedMedication),
    },
    beneficiaries: {
      primary: primaryBeneficiaries.map((entry) => {
        const beneficiary = obj(entry);
        return {
          fullName: str(beneficiary.fullName),
          dateOfBirth: str(beneficiary.dateOfBirth),
          relationship: str(beneficiary.relationship),
          relationshipOther: strOrNull(beneficiary.relationshipOther),
          sharePercent: num(beneficiary.sharePercent, 100),
        };
      }),
      wantsContingent: bool(beneficiaries.wantsContingent),
      anyBeneficiaryIsMinor: bool(beneficiaries.anyBeneficiaryIsMinor),
    },
    policySpecific: {
      purpose: str(policySpecific.purpose, "Personal"),
      details: {
        familyDependentProtection: bool(policyDetails.familyDependentProtection),
        incomeReplacement: bool(policyDetails.incomeReplacement),
        mortgageProtection: bool(policyDetails.mortgageProtection),
        debtProtection: bool(policyDetails.debtProtection),
        educationFunding: bool(policyDetails.educationFunding),
        retirementPlanning: bool(policyDetails.retirementPlanning),
        wealthInvestmentGrowth: bool(policyDetails.wealthInvestmentGrowth),
      },
    },
    hearAboutUs: {
      google: bool(hearAboutUs.google),
      socialMedia: bool(hearAboutUs.socialMedia),
      referral: bool(hearAboutUs.referral),
      advertisement: bool(hearAboutUs.advertisement),
      other: bool(hearAboutUs.other),
      otherSpecify: strOrNull(hearAboutUs.otherSpecify),
    },
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const body = await request.json();
  const applicationData = sanitizeApplicationData(body?.applicationData);
  const selectedCarrier = obj(body?.selectedCarrier);

  const updated = await updateLead(id, {
    application_data: applicationData,
    application_submitted_at: new Date().toISOString(),
    applied_company_name: strOrNull(selectedCarrier.companyName) ?? lead.applied_company_name,
    applied_product_name: strOrNull(selectedCarrier.productName) ?? lead.applied_product_name,
    applied_monthly_premium: strOrNull(selectedCarrier.monthlyPremium) ?? lead.applied_monthly_premium,
  });

  if (!updated) {
    return NextResponse.json({ error: "Could not save the application." }, { status: 500 });
  }

  after(() => queueApplicationEmail(updated));

  return NextResponse.json({ ok: true });
}
