import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useNotificationLogs } from "@/hooks/useNotificationLogs";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: logs, isLoading, error } = useNotificationLogs(user?.id);
console.log(logs,typeof logs)
  const stats = [
    {
      title: "Total Logs",
      value: `${logs?.length}`,
      change: "+12.5%",
      icon: Activity,
      color: "text-primary",
    },
    {
      title: "Success Rate",
      value: `${logs?.length? Math.round((logs.filter(log => log?.provider_response.status == 200 ).length / logs.length) * 100):0}%`,
      change: "+2.1%",
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      title: "Failed",
      value: `${logs?.length? Math.round((logs.filter(log => log?.provider_response.status==400).length / logs.length) * 100):0}%`,
      change: "-0%",
      icon: XCircle,
      color: "text-destructive",
    },
    {
      title: "Avg Latency",
      value: `${logs?.length? Math.round(logs.reduce((acc, log) => acc + log.request_latency_ms, 0) / logs.length):0}ms`,
      change: "0%",
      icon: Clock,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.change.startsWith("+") ? "text-success" : "text-destructive"}>
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Quick actions to get you up and running
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              1
            </div>
            <div>
              <h3 className="font-medium">Generate your first API key</h3>
              <p className="text-sm text-muted-foreground">
                Head to the API Keys page to create your first key
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              2
            </div>
            <div>
              <h3 className="font-medium">Send your first notification</h3>
              <p className="text-sm text-muted-foreground">
                Use our API to send your first test notification
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              3
            </div>
            <div>
              <h3 className="font-medium">Monitor in real-time</h3>
              <p className="text-sm text-muted-foreground">
                Watch your notifications flow through the Logs page
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
