import { useMemo, useState } from "react";
import {
  Bell, AlertTriangle, CheckCircle, Info,
  CheckCheck, Filter,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiData } from "@/lib/api";
import type { Notification } from "@/lib/types";

const typeColors: Record<string, string> = {
  urgent: "bg-destructive/10 border-destructive/30 text-destructive",
  warning: "bg-warning/10 border-warning/30 text-warning",
  success: "bg-success/10 border-success/20 text-success",
  info: "bg-info/10 border-info/20 text-info",
};

const dotColors: Record<string, string> = {
  urgent: "bg-destructive animate-pulse",
  warning: "bg-warning",
  success: "bg-success",
  info: "bg-info",
};

const typeIcons: Record<string, any> = {
  urgent: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

function normalizeType(value?: string) {
  const type = (value ?? "info").toLowerCase();
  if (["urgent", "warning", "success", "info"].includes(type)) return type;
  return "info";
}

export default function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiData<Notification[]>("/notifications"),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiData<Notification>(`/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to mark as read", description: error.message, variant: "destructive" });
    },
  });

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const type = normalizeType(n.type);
      const matchesType = typeFilter === "all" || type === typeFilter;
      const matchesRead = !showUnreadOnly || !n.isRead;
      return matchesType && matchesRead;
    });
  }, [notifications, typeFilter, showUnreadOnly]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function markRead(id: string) {
    markReadMutation.mutate(id);
  }

  function markAllRead() {
    const unread = notifications.filter((n) => !n.isRead);
    unread.forEach((n) => markReadMutation.mutate(n.notificationId));
    toast({ title: "All notifications marked as read" });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground px-1.5">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Stay informed about your patients and system updates</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="w-3.5 h-3.5" />Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {["all", "urgent", "warning", "success", "info"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                typeFilter === type
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            showUnreadOnly
              ? "bg-primary/10 text-primary border border-primary/30"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread only
        </button>
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground text-sm">No notifications to show</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const type = normalizeType(n.type);
            const Icon = typeIcons[type] || Bell;
            return (
              <div
                key={n.notificationId}
                className={`bg-card border border-border rounded-lg p-4 hover:border-border/80 transition-colors ${n.isRead ? "opacity-70" : "cursor-pointer"}`}
                onClick={() => !n.isRead && markRead(n.notificationId)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-md flex-shrink-0 border ${typeColors[type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{n.title ?? "Notification"}</p>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[type]}`} />
                      <Badge variant={type === "urgent" ? "destructive" : type === "warning" ? "warning" : type === "success" ? "success" : "info"} className="text-[9px] ml-auto flex-shrink-0">
                        {type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message ?? "—"}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
