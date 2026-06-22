import * as React from "react";
import { Shield, User, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DisputeRole = "user" | "auditor" | "system";

export interface DisputeMessage {
  id: string | number;
  role: DisputeRole;
  name?: string;
  avatar?: string;
  content: React.ReactNode;
  time: string;
  attachments?: {
    name: string;
    size?: string;
    icon?: React.ReactNode;
  }[];
  status?: "pending" | "resolved" | "escalated";
}

export interface DisputeTimelineProps {
  messages: DisputeMessage[];
  className?: string;
  animate?: boolean;
}

const roleConfig: Record<DisputeRole, {
  label: string;
  icon: React.ReactNode;
  bubbleBg: string;
  bubbleText: string;
  avatarBg: string;
  nameClass: string;
  align: "left" | "right";
}> = {
  user: {
    label: "捐赠人",
    icon: <User className="w-4 h-4" />,
    bubbleBg: "bg-white border border-slate-200",
    bubbleText: "text-slate-700",
    avatarBg: "bg-gradient-to-br from-secondary-400 to-secondary-500",
    nameClass: "text-secondary-700",
    align: "left",
  },
  auditor: {
    label: "审核员",
    icon: <Shield className="w-4 h-4" />,
    bubbleBg: "bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/50",
    bubbleText: "text-slate-700",
    avatarBg: "bg-gradient-to-br from-primary-400 to-primary-500",
    nameClass: "text-primary-700",
    align: "right",
  },
  system: {
    label: "系统通知",
    icon: <AlertTriangle className="w-4 h-4" />,
    bubbleBg: "bg-gradient-to-br from-warning-50 to-warning-100/50 border border-warning-200/50",
    bubbleText: "text-warning-800",
    avatarBg: "bg-gradient-to-br from-warning-400 to-warning-500",
    nameClass: "text-warning-700",
    align: "left",
  },
};

export const DisputeTimeline: React.FC<DisputeTimelineProps> = ({
  messages,
  className,
  animate = true,
}) => {
  return (
    <div className={cn("space-y-5", className)}>
      {messages.map((msg, index) => {
        const config = roleConfig[msg.role];
        const isRight = config.align === "right";
        return (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 items-start",
              isRight && "flex-row-reverse",
              animate && "animate-fade-in-up"
            )}
            style={
              animate
                ? ({ animationDelay: `${index * 120}ms` } as React.CSSProperties)
                : undefined
            }
          >
            <div
              className={cn(
                "shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-soft",
                config.avatarBg
              )}
            >
              {config.icon}
            </div>

            <div className={cn("flex-1 max-w-[85%]", isRight ? "text-right" : "text-left")}>
              <div
                className={cn(
                  "flex items-center gap-2 mb-1.5 text-xs",
                  isRight && "justify-end"
                )}
              >
                <span className={cn("font-semibold", config.nameClass)}>
                  {msg.name ?? config.label}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-400">{msg.time}</span>
                {msg.status && (
                  <>
                    <span className="text-slate-400">·</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                        msg.status === "resolved" &&
                          "bg-primary-50 text-primary-600",
                        msg.status === "pending" &&
                          "bg-warning-50 text-warning-600",
                        msg.status === "escalated" &&
                          "bg-danger-50 text-danger-600"
                      )}
                    >
                      {msg.status === "resolved" && <CheckCircle2 className="w-3 h-3" />}
                      {msg.status === "pending" && <AlertTriangle className="w-3 h-3" />}
                      {msg.status === "escalated" && <AlertTriangle className="w-3 h-3" />}
                      {msg.status === "resolved" && "已处理"}
                      {msg.status === "pending" && "处理中"}
                      {msg.status === "escalated" && "已升级"}
                    </span>
                  </>
                )}
              </div>

              <div
                className={cn(
                  "rounded-2xl px-4 py-3 shadow-soft",
                  isRight ? "rounded-tr-md" : "rounded-tl-md",
                  config.bubbleBg,
                  config.bubbleText
                )}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>

              {msg.attachments && msg.attachments.length > 0 && (
                <div
                  className={cn(
                    "mt-2 flex flex-wrap gap-2",
                    isRight && "justify-end"
                  )}
                >
                  {msg.attachments.map((att, i) => (
                    <div
                      key={i}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      )}
                    >
                      <span className="text-slate-500">{att.icon ?? "📎"}</span>
                      <span className="text-xs text-slate-600 font-medium">
                        {att.name}
                      </span>
                      {att.size && (
                        <span className="text-[10px] text-slate-400">
                          {att.size}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

DisputeTimeline.displayName = "DisputeTimeline";
