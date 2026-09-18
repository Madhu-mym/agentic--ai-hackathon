import React from "react";
import { ContactDirectory } from "@/components/ContactDirectory";

export default function ContactsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Contacts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Reach HR, IT Support, your manager, and your onboarding buddy without waiting on a ticket.
        </p>
      </div>
      <ContactDirectory />
    </div>
  );
}
