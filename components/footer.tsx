import Link from "next/link"
import { Zap, Mail, Phone, MapPin } from "lucide-react"

const footerLinks = {
  "Quick Links": [
    { label: "Home", href: "/" },
    { label: "Pricing", href: "/pricing" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Simulation", href: "/simulation" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Tutorials", href: "/tutorials" },
    { label: "FAQs", href: "/faqs" },
    { label: "Support", href: "/support" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Risk Disclosure", href: "/risk" },
  ],
}

export function Footer() {
  return (
    <footer className="relative">
  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">

          {/* Quick Links / Resources / Legal */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-4">
                {category}
              </h4>

              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Us */}
          <div>
            <h4 className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-4">
              Contact Us
            </h4>

            <div className="space-y-3 text-sm text-muted-foreground">

              <div className="flex items-start gap-3">
  <Mail className="w-4 h-4 text-primary mt-0.5" />
  <span>support@aurorafx.in</span>
</div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Mumbai, Maharashtra, India</span>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom section */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>

            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"/>
                <path d="M16.5 3h-9A4.5 4.5 0 003 7.5v9A4.5 4.5 0 007.5 21h9a4.5 4.5 0 004.5-4.5v-9A4.5 4.5 0 0016.5 3z"/>
              </svg>
            </Link>

            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.94 6.5a1.94 1.94 0 11.002-3.882A1.94 1.94 0 016.94 6.5zM4.5 8h4.9v12H4.5zM13 8h4.7v1.64h.07c.65-1.23 2.23-2.52 4.6-2.52 4.92 0 5.83 3.24 5.83 7.46V20h-4.9v-5.22c0-1.24-.02-2.83-1.73-2.83-1.74 0-2 1.36-2 2.74V20H13z"/>
              </svg>
            </Link>

            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">YouTube</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.8 8s-.2-1.4-.8-2a2.9 2.9 0 00-2-0.8C16.2 5 12 5 12 5s-4.2 0-7 .2a2.9 2.9 0 00-2 .8c-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.6C2 14.4 2.2 16 2.2 16s.2 1.4.8 2a2.9 2.9 0 002 .8c2.8.2 7 .2 7 .2s4.2 0 7-.2a2.9 2.9 0 002-.8c.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.6C22 9.6 21.8 8 21.8 8zM9.75 14.5v-5l5 2.5-5 2.5z"/>
              </svg>
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground text-center md:text-right space-y-1">
  <p>© {new Date().getFullYear()} Aurora FX. All rights reserved.</p>

  <p className="text-[11px] opacity-70 max-w-md">
    Trading involves risk. Past performance is not indicative of future results.
  </p>
</div>

        </div>
      </div>
    </footer>
  )
}