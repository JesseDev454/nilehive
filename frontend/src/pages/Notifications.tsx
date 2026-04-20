import { useQuery } from "@tanstack/react-query";
import { Bell, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { ApiClientError, getNotifications } from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Unable to load notifications right now.";
}

function getDateLabel(value?: string) {
  return value ? new Date(value).toLocaleString() : "-";
}

function getNotificationLabel(type: string) {
  return type.replace(/_/g, " ");
}

export default function Notifications() {
  const { data: notifications = [], isLoading, isError, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    retry: false
  });

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Workflow updates for your Club Services account."
      />

      {isLoading ? (
        <NeoStateCard icon={Bell} title="Loading notifications" message="We are getting your latest updates." />
      ) : isError ? (
        <NeoStateCard icon={Bell} title="Unable to load notifications" message={getErrorMessage(error)} tone="danger" />
      ) : notifications.length === 0 ? (
        <NeoStateCard icon={Bell} title="No notifications yet" message="Important workflow and announcement updates will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium capitalize">{getNotificationLabel(notification.type)}</p>
                        <Badge variant="outline" className="capitalize">
                          {notification.delivery_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Proposal ID: {notification.proposal_id}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {getDateLabel(notification.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
