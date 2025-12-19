import { Phone, AlertCircle } from "lucide-react";

const Header = () => {
  return (
    <div className="flex flex-col">
      {/* Header with Logo */}
      <header className="px-4 lg:px-6 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary font-display font-bold text-lg">C</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">Conscience</h1>
            <p className="text-xs text-muted-foreground">Your Personal Wellness Companion</p>
          </div>
        </div>
      </header>

      {/* Crisis Banner */}
      <div className="crisis-banner">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>In crisis? Professional support is available 24/7</span>
        </div>
        <a
          href="tel:988"
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Get Help
        </a>
      </div>
    </div>
  );
};

export default Header;