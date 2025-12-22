import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, MapPin } from 'lucide-react';
import { COUNTRY_CODES } from '@/lib/country-codes';

export default function ContactPage() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden bg-black text-foreground">
      <SiteHeader />
      
      {/* Background effects matching other pages */}
      <div className="pointer-events-none absolute inset-0 -z-10 dark:opacity-0">
         <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50" />
      </div>
      <div className="hero-dark absolute inset-0 -z-10"></div>

      <div className="w-full py-12 pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: Info */}
            <div className="space-y-8 mt-4">
              <h1 className="font-baskerville text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                PONTE EN CONTACTO CON <br/>
                <span className="text-muted-foreground">EL EQUIPO DE </span>
                <span className="text-white">CONTAPRO</span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Empieza por seleccionar la naturaleza de tu consulta y rellena el siguiente formulario. 
                Nuestros especialistas se pondrán en contacto contigo en un plazo de 48 horas.
              </p>
              
              <div className="pt-8 space-y-4 text-sm text-muted-foreground">
                <div className="font-semibold text-foreground text-base">ContaPRO Inc.</div>
                <div className="flex items-start gap-3">
                   <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                   <span>Lima, Perú</span>
                </div>
                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 shrink-0" />
                    <a href="mailto:support@contapro.lat" className="hover:text-white transition-colors">support@contapro.lat</a>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="bg-card/30 border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm relative overflow-hidden">
               {/* Decorative gradient blob inside card */}
               <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
               
               <form className="space-y-6 relative z-10">
                  {/* Asunto */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <div className="relative">
                        <select 
                            id="subject" 
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:bg-input/30 appearance-none"
                            defaultValue=""
                        >
                            <option value="" disabled>- Seleccionar -</option>
                            <option value="support" className="bg-black">Soporte Técnico</option>
                            <option value="sales" className="bg-black">Ventas</option>
                            <option value="billing" className="bg-black">Facturación</option>
                            <option value="other" className="bg-black">Otro</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                  </div>

                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre <span className="text-emerald-500">*</span></Label>
                    <Input id="name" placeholder="" required className="bg-transparent dark:bg-input/30" />
                  </div>

                   {/* Whatsapp */}
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Tu número de Whatsapp <span className="text-emerald-500">*</span></Label>
                    <div className="flex gap-2">
                        <div className="relative w-[7rem]">
                           <select 
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-2 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 appearance-none"
                                defaultValue="+51"
                            >
                                {COUNTRY_CODES.map((c) => (
                                    <option key={`${c.name}-${c.dial}`} value={c.dial} className="bg-black text-white">
                                        {c.flag} {c.dial}
                                    </option>
                                ))}
                           </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        <Input id="whatsapp" placeholder="900 000 000" type="tel" required className="flex-1 bg-transparent dark:bg-input/30" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico <span className="text-emerald-500">*</span></Label>
                    <Input id="email" type="email" required className="bg-transparent dark:bg-input/30" />
                  </div>

                  {/* Mensaje */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje <span className="text-emerald-500">*</span></Label>
                    <textarea 
                        id="message" 
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 resize-none md:text-sm"
                        placeholder="Cualquier información adicional que considere importante"
                        required
                    />
                  </div>

                  {/* Submit */}
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base rounded-md border-0">
                    Enviar
                  </Button>
               </form>
            </div>

          </div>
        </div>
      </div>
      <SiteFooter />
    </section>
  );
}
