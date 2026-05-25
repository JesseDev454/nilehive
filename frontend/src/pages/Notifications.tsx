import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bell, BellOff, BellRing, FileText } from "lucide-react";
import { DataPagination } from "@/components/DataPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NeoLoadingState, NeoPageHeader, NeoStateCard } from "@/components/NeoBrutal";
import { ApiClientError, getNotifications, type NotificationRecord } from "@/lib/api";
import { actionError, actionSuccess } from "@/lib/notify";
import { DEFAULT_PAGE_SIZE, emptyPaginatedResponse } from "@/lib/pagination";
import {
  disablePushNotifications,
  enablePushNotifications,
  getCurrentPushSubscription,
  isPushSupported
} from "@/lib/pushNotifications";

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
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);
  const { data: notificationsPage = emptyPaginatedResponse<NotificationRecord>(), isLoading, isError, error } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => getNotifications({ page, page_size: DEFAULT_PAGE_SIZE }),
    retry: false
  });
  const notifications = notificationsPage.items;
  const enablePushMutation = useMutation({
    mutationFn: enablePushNotifications,
    onSuccess: () => {
      setPushEnabled(true);
      actionSuccess("Phone notifications enabled", "This device can now receive Club Services alerts.");
    },
    onError: (mutationError) => {
      actionError("Could not enable notifications", mutationError, getErrorMessage(mutationError));
    }
  });
  const disablePushMutation = useMutation({
    mutationFn: disablePushNotifications,
    onSuccess: () => {
      setPushEnabled(false);
      actionSuccess("Phone notifications disabled", "This device will no longer receive push alerts.");
    },
    onError: (mutationError) => {
      actionError("Could not disable notifications", mutationError, getErrorMessage(mutationError));
    }
  });

  useEffect(() => {
    let isMounted = true;

    if (!isPushSupported()) {
      setPushSupported(false);
      setPushEnabled(false);
      return;
    }

    getCurrentPushSubscription()
      .then((subscription) => {
        if (isMounted) {
          setPushEnabled(Boolean(subscription));
        }
      })
      .catch(() => {
        if (isMounted) {
          setPushEnabled(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="nh-page">
      <NeoPageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Workflow updates for your Club Services account."
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
              {pushEnabled ? <BellRing className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-semibold">Phone notifications</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {pushSupported
                  ? pushEnabled
                    ? "Enabled on this device."
                    : "Enable alerts for proposal and event updates."
                  : "This browser does not support web push notifications."}
              </p>
            </div>
          </div>
          {pushSupported ? (
            <Button
              type="button"
              variant={pushEnabled ? "outline" : "default"}
              onClick={() => {
                if (pushEnabled) {
                  disablePushMutation.mutate();
                  return;
                }

                enablePushMutation.mutate();
              }}
              disabled={enablePushMutation.isPending || disablePushMutation.isPending}
            >
              {pushEnabled ? (
                <>
                  <BellOff className="mr-2 h-4 w-4" />
                  Disable on this device
                </>
              ) : (
                <>
                  <BellRing className="mr-2 h-4 w-4" />
                  Enable on this device
                </>
              )}
            </Button>
          ) : null}
        </CardContent>
      </Card>

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
