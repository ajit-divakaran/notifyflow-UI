import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Mail, MessageSquare, Bell } from "lucide-react";
import { mockLogs, type Log } from "@/data/mockLogs";
import { formatDistanceToNow, parseISO } from "date-fns";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/supabaseClient";
import type { Database } from "@/integrations/supabase/database.types";
import { useNotificationLogs } from "@/hooks/useNotificationLogs";

type LogType = Database["public"]['Tables']['notification_logs']['Row']

const Logs = () => {
  const [logs, setLogs] = useState<LogType>();
  const [selectedLog, setSelectedLog] = useState<LogType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
   const { data: userlogs, isLoading, error } = useNotificationLogs(user?.id);

  
    const getLogs = async () => {
      

      // const result = await supabase
      // .from('notification_logs')
      // .select('*')
      // .eq('user_id',user?.id);

      setLogs(userlogs);
    };

  useEffect(() => {
  
    getLogs();
   
  }, []);

  const handleRefresh = () => {
    setLogs([])
    setIsRefreshing(true);
    getLogs()
    if(logs){
      setIsRefreshing(false)
    }
  };

  const getChannelIcon = (channel: Log["channel"]) => {
    switch (channel) {
      case "EMAIL":
        return <Mail className="h-4 w-4" />;
      case "SMS":
        return <MessageSquare className="h-4 w-4" />;
      // case "PUSH":
      //   return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {console.log(logs)}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Logs</h2>
          <p className="text-muted-foreground">
            Real-time notification delivery logs
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Latency</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log:LogType) => (
              <TableRow
                key={log.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedLog(log)}
              >
                <TableCell>
                  <Badge
                    variant={log.status === "SENT" ? "default" : "destructive"}
                    className={
                      log.status === "SENT"
                        ? "text-black bg-green-300 hover:bg-success/80"
                        : ""
                    }
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getChannelIcon(log.channel)}
                    <span className="font-medium">{log.channel}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="font-mono text-sm">{log.recipient}</code>
                </TableCell>
                <TableCell>
                  <code className="font-mono text-sm">{'POST'}</code>
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                  {log.request_latency_ms}ms
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at+"Z"), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedLog && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  Log Inspector
                  <Badge
                    variant={
                      selectedLog.status === "SENT" ? "default" : "destructive"
                    }
                    className={
                      selectedLog.status === "SENT"
                        ? "bg-green-400 hover:bg-green-500"
                        : ""
                    }
                  >
                    {selectedLog.status}
                  </Badge>
                </SheetTitle>
                <SheetDescription>
                  {formatDistanceToNow(new Date(selectedLog.created_at+"Z"), {
                    addSuffix: true,
                  })}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Request</h3>
                  <div className="rounded-lg bg-slate-950 p-4">
                    <pre className="overflow-x-auto text-xs text-slate-50">
                      {/* {JSON.stringify(selectedLog.request, null, 2)} */}
                      {'request data not available'}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Response</h3>
                  <div className="rounded-lg bg-slate-950 p-4">
                    <pre className="overflow-x-auto text-xs text-slate-50">
                      {JSON.stringify(selectedLog.provider_response, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Channel</p>
                    <p className="font-medium">{selectedLog.channel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Latency</p>
                    <p className="font-mono font-medium">
                      {selectedLog.request_latency_ms}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Method</p>
                    <p className="font-mono text-sm">{'POST'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Log ID</p>
                    <p className="font-mono text-xs">log_{selectedLog.id}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Logs;
