import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      <SiteHeader />
      <div className="w-full bg-black py-12 pt-28">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-baskerville text-4xl sm:text-5xl font-bold tracking-tight text-center">Terms and Conditions of Use</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">Last update: {new Date().toLocaleDateString()}</p>
          <div className="mt-10 mx-auto max-w-3xl space-y-8 text-sm text-muted-foreground leading-relaxed">
            
            <h2 className="text-xl font-semibold text-foreground">1. Terms</h2>
            <p>
              By accessing the website at <Link href="/" className="underline hover:text-foreground">ContaPRO</Link> you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on ContaPRO’s website for personal, non-commercial transitory viewing only. This is the grant of a licence, not a transfer of title, and under this licence you may not:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on ContaPRO website;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or ‘mirror’ the materials on any other server.</li>
            </ul>
            <p>
              This licence shall automatically terminate if you violate any of these restrictions and may be terminated by ContaPRO at any time. Upon terminating your viewing of these materials or upon the termination of this licence, you must destroy any downloaded materials in your possession whether in electronic or printed format.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. Disclaimer</h2>
            <p>
              The materials on ContaPRO’s website are provided on an ‘as is’ basis. ContaPRO makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p>
              Further, ContaPRO does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            </p>

            <h2 className="text-xl font-semibold text-foreground">4. Limitations</h2>
            <p>
              In no event shall ContaPRO or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ContaPRO’s website, even if ContaPRO or a ContaPRO authorised representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. Accuracy of materials</h2>
            <p>
              The materials appearing on ContaPRO’s website could include technical, typographical, or photographic errors. ContaPRO does not warrant that any of the materials on its website are accurate, complete or current. ContaPRO may make changes to the materials contained on its website at any time without notice. However ContaPRO does not make any commitment to update the materials.
            </p>

            <h2 className="text-xl font-semibold text-foreground">6. Links</h2>
            <p>
              ContaPRO has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ContaPRO of the site. Use of any such linked website is at the user’s own risk.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7. Modifications</h2>
            <p>
              ContaPRO may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
            </p>

            <h2 className="text-xl font-semibold text-foreground">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of ContaPRO and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </section>
  );
}
