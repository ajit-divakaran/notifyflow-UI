export interface Log {
  id: string;
  status: "SENT" | "FAILED";
  channel: "EMAIL" | "SMS" ;
  method: string;
  latency: number;
  timestamp: Date;
  request: unknown;
  response: unknown;
}

const generateMockLog = (index: number): Log => {
  const statuses: Log["status"][] = ["SENT", "SENT", "SENT", "SENT", "FAILED"];
  const channels: Log["channel"][] = ["EMAIL", "SMS"];
  const methods = [
    "POST /api/trigger",
    "POST /api/send",
    "PUT /api/update",
    "GET /api/status",
  ];

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const channel = channels[Math.floor(Math.random() * channels.length)];
  const method = methods[Math.floor(Math.random() * methods.length)];
  const latency = Math.floor(Math.random() * 500) + 50;
  const timestamp = new Date(Date.now() - Math.random() * 3600000 * 24);

  const request = {
    method: method.split(" ")[0],
    endpoint: method.split(" ")[1],
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer sk_live_***4321",
    },
    body: {
      recipient:
        channel === "EMAIL"
          ? "user@example.com"
          : channel === "SMS"
          ? "+1234567890"
          : "device_token_abc123",
      template: `template_${channel.toLowerCase()}_001`,
      variables: {
        user_name: "John Doe",
        action: "Password Reset",
      },
    },
  };

  const response =
    status === "SENT"
      ? {
          status: 200,
          message: "Notification sent successfully",
          notification_id: `notif_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: timestamp.toISOString(),
        }
      : {
          status: 500,
          error: "Internal server error",
          message: "Failed to deliver notification",
          code: "DELIVERY_FAILED",
        };

  return {
    id: `log_${index}_${Math.random().toString(36).substr(2, 9)}`,
    status,
    channel,
    method,
    latency,
    timestamp,
    request,
    response,
  };
};

export const mockLogs: Log[] = Array.from({ length: 50 }, (_, i) =>
  generateMockLog(i)
);
