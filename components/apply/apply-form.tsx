"use client";

import { useState, type ReactNode } from "react";

type ApplyFormProps = {
  leadId: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  sex: "M" | "F" | null;
  province: string | null;
  smoker: boolean | null;
  selectedCompany: string;
  selectedProduct: string;
  selectedPremium: string;
};

const provinces = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
];

const inputClass =
  "mt-2 w-full rounded-lg border border-[#d0d0d0] bg-white px-3 py-3 text-sm text-[#222] outline-none transition focus:border-[#71b664] focus:ring-2 focus:ring-[#71b664]/20";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-[#e5e5e5] pt-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#666666]">{title}</p>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-sm font-medium text-[#333333]">
      {label}
      {children}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <Field label={label}>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </Field>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.valueAsNumber || 0)}
        className={inputClass}
      />
    </Field>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="text-sm font-medium text-[#333333]">
      <p>{label}</p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            value ? "bg-[#5a9150] text-white" : "bg-white text-[#333333] ring-1 ring-[#d0d0d0]"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            !value ? "bg-[#5a9150] text-white" : "bg-white text-[#333333] ring-1 ring-[#d0d0d0]"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#333333]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-[#bbbbbb] text-[#71b664]"
      />
      {label}
    </label>
  );
}

export default function ApplyForm({
  leadId,
  fullName,
  email,
  phone,
  dateOfBirth,
  sex,
  province,
  smoker,
  selectedCompany,
  selectedProduct,
  selectedPremium,
}: ApplyFormProps) {
  const [personal, setPersonal] = useState({
    education: "",
    maritalStatus: "",
    primaryAddress: { street: "", city: "", province: province ?? "", postalCode: "" },
    mailingSameAsPrimary: true,
    mailingAddress: { street: "", city: "", province: "", postalCode: "" },
    identification: { type: "", provinceOfIssue: "", number: "", expiryDate: "" },
    citizenshipStatus: "",
    countryOfBirth: "Canada",
    provinceOfBirth: "",
  });
  const [insuranceHistory, setInsuranceHistory] = useState({
    hasCoverageInForceOrPending: false,
    everDeclinedRatedModified: false,
  });
  const [financialOccupation, setFinancialOccupation] = useState({
    occupationTitle: "",
    occupationalDuties: "",
    employerName: "",
    employmentStartDate: "",
    annualEarnedIncomeCad: 0,
    otherIncomeSourcesCad: 0,
    netWorthCanadaCad: 0,
    netWorthForeignCad: 0,
    bankruptcyLast5Years: false,
    usCitizenOrTaxResident: false,
    taxResidentOtherThanCanadaUs: false,
  });
  const [lifestyle, setLifestyle] = useState({
    lastTobaccoNicotineUse: "",
    cannabisUse: false,
    nonPrescribedDrugsLast10Years: false,
    highwaySafetyViolationsLast3Years: false,
    hazardousActivities: false,
    pilotOrCrewLast5Years: false,
  });
  const [medical, setMedical] = useState({
    heightFeet: 0,
    heightInches: 0,
    weightLb: 0,
    hasPhysician: false,
    physicianName: "",
    physicianAddress: "",
    conditions: {
      heartOrCirculatory: false,
      highBloodPressure: false,
      cancerOrTumor: false,
      diabetes: false,
      hivAids: false,
      mentalHealth: false,
      otherMajorIllness: false,
      noneOfAbove: false,
    },
    hospitalTestsSurgeryLastYear: false,
    currentlyTakingUnlistedMedication: false,
  });
  const [beneficiary, setBeneficiary] = useState({
    fullName: "",
    dateOfBirth: "",
    relationship: "",
    relationshipOther: "",
    sharePercent: 100,
  });
  const [beneficiaryExtras, setBeneficiaryExtras] = useState({
    wantsContingent: false,
    anyBeneficiaryIsMinor: false,
  });
  const [policySpecific, setPolicySpecific] = useState({
    purpose: "Personal",
    details: {
      familyDependentProtection: false,
      incomeReplacement: false,
      mortgageProtection: false,
      debtProtection: false,
      educationFunding: false,
      retirementPlanning: false,
      wealthInvestmentGrowth: false,
    },
  });
  const [hearAboutUs, setHearAboutUs] = useState({
    google: false,
    socialMedia: false,
    referral: false,
    advertisement: false,
    other: false,
    otherSpecify: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/leads/${leadId}/application`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationData: {
            personal: {
              education: personal.education,
              maritalStatus: personal.maritalStatus,
              primaryAddress: personal.primaryAddress,
              mailingAddress: {
                sameAsPrimary: personal.mailingSameAsPrimary,
                ...(personal.mailingSameAsPrimary ? {} : personal.mailingAddress),
              },
              identification: personal.identification,
              citizenshipStatus: personal.citizenshipStatus,
              countryOfBirth: personal.countryOfBirth,
              provinceOfBirth: personal.provinceOfBirth,
            },
            insuranceHistory,
            financialOccupation,
            lifestyle,
            medical,
            beneficiaries: {
              primary: [beneficiary],
              ...beneficiaryExtras,
            },
            policySpecific,
            hearAboutUs,
          },
          selectedCarrier: {
            companyName: selectedCompany,
            productName: selectedProduct,
            monthlyPremium: selectedPremium,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("We could not save your application.");
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not save your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-[#5a9150]">Thanks, {fullName.split(" ")[0]}!</h1>
        <p className="mt-3 text-sm text-[#666666]">
          Your application details were received. A licensed advisor will follow up shortly to finalize
          your application for {selectedCompany || "your selected plan"}
          {selectedProduct ? ` (${selectedProduct})` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
      <h1 className="text-2xl font-semibold text-[#5a9150]">Complete Your Application</h1>
      <div className="mt-3 rounded-lg border border-[#cfe6c6] bg-[#f0f8ed] p-4 text-sm text-[#345c22]">
        <p>
          Applying as <strong>{fullName}</strong> ({email}
          {phone ? `, ${phone}` : ""})
        </p>
        {dateOfBirth ? (
          <p className="mt-1">
            Date of birth: {dateOfBirth} · {sex === "F" ? "Female" : "Male"} ·{" "}
            {smoker ? "Smoker/nicotine user" : "Non-smoker"}
          </p>
        ) : null}
        {selectedCompany ? (
          <p className="mt-1">
            Selected quote: <strong>{selectedCompany}</strong>
            {selectedProduct ? ` — ${selectedProduct}` : ""}
            {selectedPremium ? ` (${selectedPremium}/mo)` : ""}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5 rounded-xl bg-white p-6 shadow-lg ring-1 ring-[#e5e5e5] sm:p-8">
        <Section title="Personal information">
          <SelectField
            label="Highest level of education"
            value={personal.education}
            onChange={(v) => setPersonal({ ...personal, education: v })}
            placeholder="Select one"
            options={["High school", "College diploma", "Bachelor's degree", "Master's degree", "Doctorate", "Other"]}
          />
          <SelectField
            label="Marital status"
            value={personal.maritalStatus}
            onChange={(v) => setPersonal({ ...personal, maritalStatus: v })}
            placeholder="Select one"
            options={["Single", "Married", "Common-law", "Divorced", "Widowed"]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Primary address — street"
              value={personal.primaryAddress.street}
              onChange={(v) => setPersonal({ ...personal, primaryAddress: { ...personal.primaryAddress, street: v } })}
            />
            <TextField
              label="City"
              value={personal.primaryAddress.city}
              onChange={(v) => setPersonal({ ...personal, primaryAddress: { ...personal.primaryAddress, city: v } })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Province"
              value={personal.primaryAddress.province}
              onChange={(v) => setPersonal({ ...personal, primaryAddress: { ...personal.primaryAddress, province: v } })}
              placeholder="Select province"
              options={provinces}
            />
            <TextField
              label="Postal code"
              value={personal.primaryAddress.postalCode}
              onChange={(v) => setPersonal({ ...personal, primaryAddress: { ...personal.primaryAddress, postalCode: v } })}
            />
          </div>
          <CheckboxField
            label="Mailing address is the same as my primary address"
            checked={personal.mailingSameAsPrimary}
            onChange={(v) => setPersonal({ ...personal, mailingSameAsPrimary: v })}
          />
          {!personal.mailingSameAsPrimary ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Mailing address — street"
                value={personal.mailingAddress.street}
                onChange={(v) => setPersonal({ ...personal, mailingAddress: { ...personal.mailingAddress, street: v } })}
              />
              <TextField
                label="City"
                value={personal.mailingAddress.city}
                onChange={(v) => setPersonal({ ...personal, mailingAddress: { ...personal.mailingAddress, city: v } })}
              />
              <SelectField
                label="Province"
                value={personal.mailingAddress.province}
                onChange={(v) => setPersonal({ ...personal, mailingAddress: { ...personal.mailingAddress, province: v } })}
                placeholder="Select province"
                options={provinces}
              />
              <TextField
                label="Postal code"
                value={personal.mailingAddress.postalCode}
                onChange={(v) => setPersonal({ ...personal, mailingAddress: { ...personal.mailingAddress, postalCode: v } })}
              />
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Identification type"
              value={personal.identification.type}
              onChange={(v) => setPersonal({ ...personal, identification: { ...personal.identification, type: v } })}
              placeholder="Select one"
              options={["Driver's licence", "Passport", "Provincial ID card", "Other"]}
            />
            <SelectField
              label="Province of issue"
              value={personal.identification.provinceOfIssue}
              onChange={(v) => setPersonal({ ...personal, identification: { ...personal.identification, provinceOfIssue: v } })}
              placeholder="Select province"
              options={provinces}
            />
            <TextField
              label="ID number"
              value={personal.identification.number}
              onChange={(v) => setPersonal({ ...personal, identification: { ...personal.identification, number: v } })}
            />
            <TextField
              label="Expiry date"
              type="date"
              value={personal.identification.expiryDate}
              onChange={(v) => setPersonal({ ...personal, identification: { ...personal.identification, expiryDate: v } })}
            />
          </div>
          <SelectField
            label="Citizenship / residency status in Canada"
            value={personal.citizenshipStatus}
            onChange={(v) => setPersonal({ ...personal, citizenshipStatus: v })}
            placeholder="Select one"
            options={["Canadian citizen", "Permanent resident", "Work permit", "Study permit", "Other"]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Country of birth"
              value={personal.countryOfBirth}
              onChange={(v) => setPersonal({ ...personal, countryOfBirth: v })}
            />
            <TextField
              label="Province of birth (if born in Canada)"
              value={personal.provinceOfBirth}
              onChange={(v) => setPersonal({ ...personal, provinceOfBirth: v })}
            />
          </div>
        </Section>

        <Section title="Insurance history">
          <YesNoField
            label="Do you have any Life, Critical Illness, or Disability insurance in force or pending?"
            value={insuranceHistory.hasCoverageInForceOrPending}
            onChange={(v) => setInsuranceHistory({ ...insuranceHistory, hasCoverageInForceOrPending: v })}
          />
          <YesNoField
            label="Have you ever been declined, rated, or modified for an insurance application?"
            value={insuranceHistory.everDeclinedRatedModified}
            onChange={(v) => setInsuranceHistory({ ...insuranceHistory, everDeclinedRatedModified: v })}
          />
        </Section>

        <Section title="Financial information and occupation">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Occupation title"
              value={financialOccupation.occupationTitle}
              onChange={(v) => setFinancialOccupation({ ...financialOccupation, occupationTitle: v })}
            />
            <TextField
              label="Occupational duties"
              value={financialOccupation.occupationalDuties}
              onChange={(v) => setFinancialOccupation({ ...financialOccupation, occupationalDuties: v })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Employer name"
              value={financialOccupation.employerName}
              onChange={(v) => setFinancialOccupation({ ...financialOccupation, employerName: v })}
            />
            <TextField
              label="Employment start date"
              type="date"
              value={financialOccupation.employmentStartDate}
              onChange={(v) => setFinancialOccupation({ ...financialOccupation, employmentStartDate: v })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Annual earned income (CAD)"
              value={financialOccupation.annualEarnedIncomeCad}
              onChange={(v) => setFinancialOccupation({ ...financialOccupation, annualEarnedIncomeCad: v })}
            />
            <NumberField
              label="Income from other sources (CAD)"
              value={financialOccupation.otherIncomeSourcesCad}
              onChange={(v) => setFinancialOccupation({ ...financialOccupation, otherIncomeSourcesCad: v })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Canadian net worth (CAD)"
              value={financialOccupation.netWorthCanadaCad}
              onChange={(v) => setFinancialOccupation({ ...financialOccupation, netWorthCanadaCad: v })}
            />
            <NumberField
              label="Foreign net worth (CAD, if applicable)"
              value={financialOccupation.netWorthForeignCad}
              onChange={(v) => setFinancialOccupation({ ...financialOccupation, netWorthForeignCad: v })}
            />
          </div>
          <YesNoField
            label="In the last 5 years, have you declared bankruptcy or made a consumer proposal?"
            value={financialOccupation.bankruptcyLast5Years}
            onChange={(v) => setFinancialOccupation({ ...financialOccupation, bankruptcyLast5Years: v })}
          />
          <YesNoField
            label="Are you a US citizen or a US tax resident?"
            value={financialOccupation.usCitizenOrTaxResident}
            onChange={(v) => setFinancialOccupation({ ...financialOccupation, usCitizenOrTaxResident: v })}
          />
          <YesNoField
            label="Are you a tax resident of a country other than Canada or the US?"
            value={financialOccupation.taxResidentOtherThanCanadaUs}
            onChange={(v) => setFinancialOccupation({ ...financialOccupation, taxResidentOtherThanCanadaUs: v })}
          />
        </Section>

        <Section title="Lifestyle">
          <TextField
            label="When was the last time you used tobacco or nicotine in any form?"
            value={lifestyle.lastTobaccoNicotineUse}
            onChange={(v) => setLifestyle({ ...lifestyle, lastTobaccoNicotineUse: v })}
          />
          <YesNoField
            label="Do you consume cannabis products (recreational or medicinal)?"
            value={lifestyle.cannabisUse}
            onChange={(v) => setLifestyle({ ...lifestyle, cannabisUse: v })}
          />
          <YesNoField
            label="In the last 10 years, have you used non-prescribed drugs or narcotics?"
            value={lifestyle.nonPrescribedDrugsLast10Years}
            onChange={(v) => setLifestyle({ ...lifestyle, nonPrescribedDrugsLast10Years: v })}
          />
          <YesNoField
            label="In the last 3 years, have you been found guilty of 2+ Highway Safety Code violations?"
            value={lifestyle.highwaySafetyViolationsLast3Years}
            onChange={(v) => setLifestyle({ ...lifestyle, highwaySafetyViolationsLast3Years: v })}
          />
          <YesNoField
            label="In the last (or next) 12 months, have you done/do you intend to do hazardous activities (racing, scuba, skydiving, climbing, etc.)?"
            value={lifestyle.hazardousActivities}
            onChange={(v) => setLifestyle({ ...lifestyle, hazardousActivities: v })}
          />
          <YesNoField
            label="In the last 5 years, have you flown as a pilot, student pilot, or crew member, or intend to?"
            value={lifestyle.pilotOrCrewLast5Years}
            onChange={(v) => setLifestyle({ ...lifestyle, pilotOrCrewLast5Years: v })}
          />
        </Section>

        <Section title="Medical questions">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Height (feet)"
              value={medical.heightFeet}
              onChange={(v) => setMedical({ ...medical, heightFeet: v })}
            />
            <NumberField
              label="Height (inches)"
              value={medical.heightInches}
              onChange={(v) => setMedical({ ...medical, heightInches: v })}
            />
          </div>
          <NumberField label="Weight (lb)" value={medical.weightLb} onChange={(v) => setMedical({ ...medical, weightLb: v })} />
          <YesNoField label="Do you have a physician?" value={medical.hasPhysician} onChange={(v) => setMedical({ ...medical, hasPhysician: v })} />
          {medical.hasPhysician ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Physician name"
                value={medical.physicianName}
                onChange={(v) => setMedical({ ...medical, physicianName: v })}
              />
              <TextField
                label="Physician address"
                value={medical.physicianAddress}
                onChange={(v) => setMedical({ ...medical, physicianAddress: v })}
              />
            </div>
          ) : null}
          <div>
            <p className="text-sm font-medium text-[#333333]">
              Have you ever been treated for or had any indication of:
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <CheckboxField
                label="Heart or circulatory disease"
                checked={medical.conditions.heartOrCirculatory}
                onChange={(v) => setMedical({ ...medical, conditions: { ...medical.conditions, heartOrCirculatory: v } })}
              />
              <CheckboxField
                label="High blood pressure"
                checked={medical.conditions.highBloodPressure}
                onChange={(v) => setMedical({ ...medical, conditions: { ...medical.conditions, highBloodPressure: v } })}
              />
              <CheckboxField
                label="Cancer or tumor"
                checked={medical.conditions.cancerOrTumor}
                onChange={(v) => setMedical({ ...medical, conditions: { ...medical.conditions, cancerOrTumor: v } })}
              />
              <CheckboxField
                label="Diabetes"
                checked={medical.conditions.diabetes}
                onChange={(v) => setMedical({ ...medical, conditions: { ...medical.conditions, diabetes: v } })}
              />
              <CheckboxField
                label="HIV / AIDS"
                checked={medical.conditions.hivAids}
                onChange={(v) => setMedical({ ...medical, conditions: { ...medical.conditions, hivAids: v } })}
              />
              <CheckboxField
                label="Mental health condition"
                checked={medical.conditions.mentalHealth}
                onChange={(v) => setMedical({ ...medical, conditions: { ...medical.conditions, mentalHealth: v } })}
              />
              <CheckboxField
                label="Other major illness"
                checked={medical.conditions.otherMajorIllness}
                onChange={(v) => setMedical({ ...medical, conditions: { ...medical.conditions, otherMajorIllness: v } })}
              />
              <CheckboxField
                label="None of the above"
                checked={medical.conditions.noneOfAbove}
                onChange={(v) => setMedical({ ...medical, conditions: { ...medical.conditions, noneOfAbove: v } })}
              />
            </div>
          </div>
          <YesNoField
            label="In the past year, have you been admitted to a hospital, advised to undergo tests/surgery, or had untreated symptoms?"
            value={medical.hospitalTestsSurgeryLastYear}
            onChange={(v) => setMedical({ ...medical, hospitalTestsSurgeryLastYear: v })}
          />
          <YesNoField
            label="Are you currently taking prescription medication for a condition not listed above?"
            value={medical.currentlyTakingUnlistedMedication}
            onChange={(v) => setMedical({ ...medical, currentlyTakingUnlistedMedication: v })}
          />
        </Section>

        <Section title="Beneficiary information">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Primary beneficiary — full name"
              value={beneficiary.fullName}
              onChange={(v) => setBeneficiary({ ...beneficiary, fullName: v })}
            />
            <TextField
              label="Date of birth"
              type="date"
              value={beneficiary.dateOfBirth}
              onChange={(v) => setBeneficiary({ ...beneficiary, dateOfBirth: v })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Relationship"
              value={beneficiary.relationship}
              onChange={(v) => setBeneficiary({ ...beneficiary, relationship: v })}
              placeholder="Select one"
              options={["Spouse", "Child", "Parent", "Sibling", "Other"]}
            />
            <NumberField
              label="Share (%)"
              value={beneficiary.sharePercent}
              onChange={(v) => setBeneficiary({ ...beneficiary, sharePercent: v })}
            />
          </div>
          {beneficiary.relationship === "Other" ? (
            <TextField
              label="Relationship (please specify)"
              value={beneficiary.relationshipOther}
              onChange={(v) => setBeneficiary({ ...beneficiary, relationshipOther: v })}
            />
          ) : null}
          <YesNoField
            label="Would you like to add a contingent beneficiary?"
            value={beneficiaryExtras.wantsContingent}
            onChange={(v) => setBeneficiaryExtras({ ...beneficiaryExtras, wantsContingent: v })}
          />
          <YesNoField
            label="Is any beneficiary a minor?"
            value={beneficiaryExtras.anyBeneficiaryIsMinor}
            onChange={(v) => setBeneficiaryExtras({ ...beneficiaryExtras, anyBeneficiaryIsMinor: v })}
          />
        </Section>

        <Section title="Policy-specific information">
          <SelectField
            label="Purpose of insurance"
            value={policySpecific.purpose}
            onChange={(v) => setPolicySpecific({ ...policySpecific, purpose: v })}
            options={["Personal", "Business"]}
          />
          <div>
            <p className="text-sm font-medium text-[#333333]">Additional details (select all that apply)</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <CheckboxField
                label="Family / dependent protection"
                checked={policySpecific.details.familyDependentProtection}
                onChange={(v) => setPolicySpecific({ ...policySpecific, details: { ...policySpecific.details, familyDependentProtection: v } })}
              />
              <CheckboxField
                label="Income replacement"
                checked={policySpecific.details.incomeReplacement}
                onChange={(v) => setPolicySpecific({ ...policySpecific, details: { ...policySpecific.details, incomeReplacement: v } })}
              />
              <CheckboxField
                label="Mortgage protection"
                checked={policySpecific.details.mortgageProtection}
                onChange={(v) => setPolicySpecific({ ...policySpecific, details: { ...policySpecific.details, mortgageProtection: v } })}
              />
              <CheckboxField
                label="Debt protection"
                checked={policySpecific.details.debtProtection}
                onChange={(v) => setPolicySpecific({ ...policySpecific, details: { ...policySpecific.details, debtProtection: v } })}
              />
              <CheckboxField
                label="Education funding"
                checked={policySpecific.details.educationFunding}
                onChange={(v) => setPolicySpecific({ ...policySpecific, details: { ...policySpecific.details, educationFunding: v } })}
              />
              <CheckboxField
                label="Retirement planning"
                checked={policySpecific.details.retirementPlanning}
                onChange={(v) => setPolicySpecific({ ...policySpecific, details: { ...policySpecific.details, retirementPlanning: v } })}
              />
              <CheckboxField
                label="Wealth / investment growth"
                checked={policySpecific.details.wealthInvestmentGrowth}
                onChange={(v) => setPolicySpecific({ ...policySpecific, details: { ...policySpecific.details, wealthInvestmentGrowth: v } })}
              />
            </div>
          </div>
        </Section>

        <Section title="How did you hear about us?">
          <div className="grid gap-2 sm:grid-cols-2">
            <CheckboxField
              label="Google / search engine"
              checked={hearAboutUs.google}
              onChange={(v) => setHearAboutUs({ ...hearAboutUs, google: v })}
            />
            <CheckboxField
              label="Social media"
              checked={hearAboutUs.socialMedia}
              onChange={(v) => setHearAboutUs({ ...hearAboutUs, socialMedia: v })}
            />
            <CheckboxField
              label="Friend or family referral"
              checked={hearAboutUs.referral}
              onChange={(v) => setHearAboutUs({ ...hearAboutUs, referral: v })}
            />
            <CheckboxField
              label="Advertisement"
              checked={hearAboutUs.advertisement}
              onChange={(v) => setHearAboutUs({ ...hearAboutUs, advertisement: v })}
            />
            <CheckboxField
              label="Other"
              checked={hearAboutUs.other}
              onChange={(v) => setHearAboutUs({ ...hearAboutUs, other: v })}
            />
          </div>
          {hearAboutUs.other ? (
            <TextField
              label="Please specify"
              value={hearAboutUs.otherSpecify}
              onChange={(v) => setHearAboutUs({ ...hearAboutUs, otherSpecify: v })}
            />
          ) : null}
        </Section>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-[#c7a05f] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#c7a05f]/30 transition hover:-translate-y-0.5 hover:bg-[#af944f] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>

        {submitError ? (
          <div className="rounded-lg border border-[#e8c3c3] bg-[#fff5f5] p-4 text-sm text-[#8c2f2f]">{submitError}</div>
        ) : null}
      </form>
    </div>
  );
}
