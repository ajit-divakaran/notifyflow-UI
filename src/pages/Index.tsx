import { Link} from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Activity, Shield, Zap as ZapIcon } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (user) {
  //     navigate("/dashboard");
  //   }
  // }, [user, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">NotifyFlow</span>
          </div>
         { !user ? <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button>Get started</Button>
            </Link>
          </div>
          :
          <div>
              <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
              </Link>
          </div>
          }

        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight">
              Developer-first notification infrastructure
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Send transactional emails, SMS, and push notifications with a single API.
              Built for developers who need reliability at scale.
            </p>
            <div className="flex justify-center gap-4">
              {!user ? <Link to="/register">
                <Button size="lg">
                  Start building free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              :
              <Link to="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              }
              <Button size="lg" variant="outline">
                View documentation
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ZapIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Lightning fast</h3>
                <p className="text-muted-foreground">
                  Sub-200ms API response times with global edge infrastructure
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Real-time logs</h3>
                <p className="text-muted-foreground">
                  Debug with detailed request/response logs and performance metrics
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Enterprise ready</h3>
                <p className="text-muted-foreground">
                  SOC 2 compliant with 99.99% uptime SLA
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 NotifyFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
