import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Video, FileText, Activity } from "lucide-react";
import heroImage from "@/assets/hospital-hero.jpg";

const features = [
  { icon: Video, title: "Teleconsultation", desc: "Real-time video, audio & chat with doctors" },
  { icon: FileText, title: "Health Records", desc: "Structured digital patient records" },
  { icon: Activity, title: "Remote Monitoring", desc: "Track vitals & follow-up care" },
  { icon: Shield, title: "Secure & Private", desc: "End-to-end encrypted data" },
];

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/85" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 lg:px-16 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-heading text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="font-heading text-xl font-semibold text-foreground tracking-tight">
              Afia-Connect
            </span>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 border border-primary text-primary font-heading font-medium text-sm rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Sign In
          </button>
        </header>

        {/* Hero */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary/50 text-sm text-muted-foreground mb-8">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Telemedicine Platform for Nord-Kivu, DRC
            </div>
            <h1 className="font-heading text-5xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              Afia-Connect
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Bridging healthcare across distances — connecting community health workers
              with hospital doctors through secure digital consultations and structured medical records.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity"
              >
                Log In
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3.5 border border-border text-foreground font-heading font-medium text-sm rounded-lg hover:bg-secondary transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Features strip */}
        <div className="px-8 lg:px-16 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card/60 backdrop-blur-sm"
              >
                <div className="p-2 bg-primary/10 rounded-md flex-shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-heading font-medium text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-8 lg:px-16 py-6 border-t border-border">
          <p className="text-center text-xs text-muted-foreground">
            Adventist University of Central Africa · Final Year Project · INEZA Tania Horline · 2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default WelcomePage;
