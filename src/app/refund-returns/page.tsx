import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function RefundReturnsPage() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      <SiteHeader />
      <div className="w-full bg-black py-12 pt-28">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-baskerville text-4xl sm:text-5xl font-bold tracking-tight text-center">Refund and Return Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground text-center">Last update: {new Date().toLocaleDateString()}</p>
          <div className="mt-10 mx-auto max-w-3xl space-y-8 text-sm text-muted-foreground leading-relaxed">
            <p>
              At ContaPRO, our commitment is to provide a high-quality service that meets the management needs of our clients. Below is our refund and return policy:
            </p>

            <h2 className="text-xl font-semibold text-foreground">1. Subscription Model</h2>
            <p>
              ContaPRO operates under a subscription model that offers monthly and annual options. Once a subscription is purchased, full access to the software and its features is granted, which means that all sales are final.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Refunds</h2>
            <p>
              We do not offer refunds for subscription cancellations, whether monthly or annual, after the customer has accessed the service, with the following exceptions:
            </p>
            <p>
              <strong>Credit card fraud:</strong> If it is proven that a purchase was made using a stolen card or without the authorization of the legitimate owner, the corresponding refund will be issued. In this case, the user must contact our support team as soon as possible to initiate the validation process.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. Refund Procedure</h2>
            <p>
              In the case of a fraudulent or unauthorized purchase, once the claim is validated, the refund will be issued within 15 business days. The refund will be processed through the original payment method used for the purchase.
            </p>

            <h2 className="text-xl font-semibold text-foreground">4. Cancellations</h2>
            <p>
              Users may cancel their subscription at any time. However, cancellation will not result in any refund for the unused time of the subscription period, and access to the service will continue until the end of the current billing cycle.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. Contact</h2>
            <p>
              If you have any questions about this policy or wish to initiate a claim related to a fraudulent purchase, you can contact us through our support team at <a href="mailto:support@contapro.lat" className="text-foreground hover:underline">support@contapro.lat</a>.
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </section>
  );
}
