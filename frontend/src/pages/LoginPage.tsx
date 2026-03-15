import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import loginImage from "@/assets/hospital-login.jpg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("chw");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left — Image */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src={loginImage}
          alt="Healthcare worker with patient"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-heading text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="font-heading text-xl font-semibold text-foreground tracking-tight">
              Afia-Connect
            </span>
          </div>
          <div>
            <h1 className="font-heading text-4xl font-bold text-foreground leading-tight mb-4">
              Bridging Healthcare<br />
              Across Distances
            </h1>
            <p className="text-muted-foreground text-base max-w-md leading-relaxed">
              Secure telemedicine connecting community health workers with hospital doctors
              for better healthcare in underserved regions.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Adventist University of Central Africa · 2026
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-heading text-sm font-bold text-primary-foreground">A</span>
            </div>
            <span className="font-heading text-xl font-semibold text-foreground">Afia-Connect</span>
          </div>

          <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">Enter your credentials to access the platform</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-heading">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "chw", label: "CHW" },
                  { value: "doctor", label: "Doctor" },
                  { value: "nurse", label: "Nurse" },
                  { value: "admin", label: "Admin" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                      role === r.value
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-heading">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@facility.org"
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground font-heading">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border accent-primary" />
                Remember me
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Don't have an account?{" "}
            <button className="text-primary hover:underline">Contact your administrator</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
