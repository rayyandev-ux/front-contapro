import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      <SiteHeader />
      <div className="w-full bg-black py-12 pt-28">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-baskerville text-4xl sm:text-5xl font-bold tracking-tight text-center">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">Last update: {new Date().toLocaleDateString()}</p>
          <div className="mt-10 mx-auto max-w-3xl space-y-8 text-sm text-muted-foreground leading-relaxed">
            <p>
              Your privacy is important to us. It is ContaPRO’s policy to respect your privacy regarding any information we may collect from you across our website, <Link href="/" className="underline hover:text-foreground">ContaPRO</Link>, and other sites we own and operate.
            </p>
            <p>
              We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
            </p>
            <p>
              We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification.
            </p>
            <p>
              We don’t share any personally identifying information publicly or with third-parties, except when required to by law.
            </p>
            <p>
              Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.
            </p>
            <p>
              You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.
            </p>
            <p>
              Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Cookie Policy for ContaPRO</h2>
            <p>
              This is the Cookie Policy for ContaPRO, accessible from URL <Link href="https://contapro.lat" className="underline hover:text-foreground">https://contapro.lat</Link>.
            </p>

            <h2 className="text-xl font-semibold text-foreground">What Are Cookies</h2>
            <p>
              As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or break certain elements of the sites functionality.
            </p>

            <h2 className="text-xl font-semibold text-foreground">How We Use Cookies</h2>
            <p>
              We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Disabling Cookies</h2>
            <p>
              You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site. Therefore it is recommended that you do not disable cookies.
            </p>

            <h2 className="text-xl font-semibold text-foreground">The Cookies We Set</h2>
            
            <h3 className="text-lg font-medium text-foreground">Third Party Cookies</h3>
            <p>
              In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
            </p>

            <h2 className="text-xl font-semibold text-foreground">User’s responsibilities</h2>
            <p>
              The user undertakes the responsibility to make appropriate use of the contents and information offered on the site with enunciative, but not imitative, behaviour:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Not to engage in activities that are illegal or contrary to good faith and public order;</li>
              <li>Not to spread propaganda or content of a racist, xenophobic or gambling nature, any type of illegal pornography, terrorist claims or against human rights;</li>
              <li>Do not cause damage to physical systems (hardware) and unattainable (software) of ContaPRO, its suppliers or third parties, to introduce or disseminate computer viruses or any other hardware or software systems that are capable of causing damage previously mentioned.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">More information</h2>
            <p>
              Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren’t sure whether you need or not it’s usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
            </p>
            
            <p className="pt-4 text-xs text-muted-foreground border-t border-border">
              This policy is effective as of 1 May 2025 18:33.
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </section>
  );
}
