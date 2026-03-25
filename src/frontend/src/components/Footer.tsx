import { Car } from "lucide-react";

function FooterLink({
  href,
  children,
}: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="hover:text-white transition-colors">
      {children}
    </a>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-foreground text-white/80">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
            الشركة
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <FooterLink href="/about">من نحن</FooterLink>
            </li>
            <li>
              <FooterLink href="/careers">الوظائف</FooterLink>
            </li>
            <li>
              <FooterLink href="/blog">المدونة</FooterLink>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
            الخدمات
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <FooterLink href="/passenger">طلب توصيلة</FooterLink>
            </li>
            <li>
              <FooterLink href="/driver">اشتغل سائق</FooterLink>
            </li>
            <li>
              <FooterLink href="/airport">رحلات المطار</FooterLink>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
            الدعم
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <FooterLink href="/help">مركز المساعدة</FooterLink>
            </li>
            <li>
              <FooterLink href="/safety">الأمان</FooterLink>
            </li>
            <li>
              <FooterLink href="/contact">تواصل معنا</FooterLink>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
            القانوني
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <FooterLink href="/terms">الشروط والأحكام</FooterLink>
            </li>
            <li>
              <FooterLink href="/privacy">سياسة الخصوصية</FooterLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">RIDELINK</span>
          </div>
          <p className="text-xs text-white/50">
            © {year}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
