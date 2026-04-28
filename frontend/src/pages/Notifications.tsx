import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, FileText } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { ApiClientError, getNotifications, type NotificationRecord } from "@/lib/api";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";

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
  const [page, setPage] = useState(1);
  const { data: notificationsPage = emptyPaginatedResponse<NotificationRecord>(), isLoading, isError, error } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => getNotifications({ page, page_size: DEFAULT_PAGE_SIZE }),
    retry: false
  });
  const notifications = notificationsPage.items;

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Workflow updates for your Club Services account."
      />

      {isLoading ? (
        <NeoLoadingState title="Loading notifications" message="We are getting your latest updates." />
      ) : isError ? (
        <NeoStateCard icon={Bell} title="Unable to load notifications" message={getErrorMessage(error)} tone="danger" />
      ) : notifications.length === 0 ? (
        <NeoStateCard icon={Bell} title="No notifications yet" message="Important workflow and announcement updates will appear here." />
      ) : (
        <div>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                    <p className="whitespace-nowrap text-xs text-muted-foreground">
                      {getDateLabel(notification.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DataPagination
            page={notificationsPage.page}
            pageSize={notificationsPage.page_size}
            total={notificationsPage.total}
            hasNext={notificationsPage.has_next}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
