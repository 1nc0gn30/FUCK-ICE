export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-24 px-6">
      <div className="bg-[var(--color-bg-primary)] border-8 border-[var(--color-bg-dark)] p-12 hard-shadow">
        <h1 className="font-headline font-black text-6xl uppercase tracking-tighter text-[var(--color-bg-dark)] mb-12 border-b-8 border-[var(--color-accent-red)] pb-4">
          PRIVACY POLICY
        </h1>
        
        <div className="space-y-8 font-body text-xl leading-relaxed">
          <section>
            <h2 className="font-headline font-black text-3xl uppercase text-[var(--color-accent-red)] mb-4">1. ANONYMITY BY DESIGN</h2>
            <p>
              Melt The Machine is built to protect you. We do not collect, store, or track your IP address, browser fingerprint, or any personally identifiable information (PII). When you submit a sighting, the only data saved is what you explicitly type into the form and the geolocation you select.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-black text-3xl uppercase text-[var(--color-accent-red)] mb-4">2. DATA STORAGE</h2>
            <p>
              Reports are stored in an encrypted database. We use these reports solely to alert the community to ICE activity. We do not sell, share, or trade your data with any third parties, corporations, or government agencies.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-black text-3xl uppercase text-[var(--color-accent-red)] mb-4">3. GEOLOCATION</h2>
            <p>
              If you choose to provide geolocation for a sighting, it is used only to display the event on the community map. We recommend reporting from a safe distance and not providing the exact coordinates of your own home or sensitive locations.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-black text-3xl uppercase text-[var(--color-accent-red)] mb-4">4. NO TRACKING</h2>
            <p>
              We do not use cookies, analytics scripts, or tracking pixels. This site is a tool for agitation and community defense, not a data harvesting operation.
            </p>
          </section>

          <div className="bg-[var(--color-bg-dark)] text-[var(--color-text-light)] p-8 mt-12 italic font-headline font-black uppercase text-2xl">
            "THE BEST WAY TO PROTECT YOUR DATA IS TO NEVER COLLECT IT."
          </div>
        </div>
      </div>
    </div>
  );
}
