import React from "react";
import LegalPage, { LegalSection } from "@/components/legal/LegalPage";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="4 August 2026">
      <LegalSection title="1. Placeholder — Who we are">
        [PLACEHOLDER TEXT — to be replaced with final legal copy] Gems24 is the controller of the
        personal data described in this policy. Add the legal entity name and address here.
      </LegalSection>
      <LegalSection title="2. What data we store">
        Your name, business name, email address, password (stored only as a secure hash by our
        platform provider), profile photo, country and city, years of experience, specialties, bio,
        phone number and contact email, plus the listings, messages and connections you create.
      </LegalSection>
      <LegalSection title="3. Placeholder — How we use it">
        [PLACEHOLDER TEXT] To operate your account, show your profile and listings to other users,
        deliver messages, and manage subscriptions.
      </LegalSection>
      <LegalSection title="4. Who can see your details">
        Your name, business name, location, specialties, bio and listings are visible to anyone
        browsing Gems24. Your phone number and contact email are shown only to traders whose
        connection request you have accepted.
      </LegalSection>
      <LegalSection title="5. Your rights">
        You can view and edit every piece of personal data we hold about you from Settings → Edit
        profile, and you can permanently delete your account and personal data from Settings →
        Delete my account.
      </LegalSection>
      <LegalSection title="6. Placeholder — Retention and transfers">
        [PLACEHOLDER TEXT] Add retention periods, international transfer basis and processor list
        here.
      </LegalSection>
      <LegalSection title="7. Placeholder — Contact">
        [PLACEHOLDER TEXT] Add the privacy contact address for Gems24 here.
      </LegalSection>
    </LegalPage>
  );
}