import { useState } from "react";

import { resolveAssetUrl } from "../api/auth";

function initialsFor(user, name) {
  if (user?.initials) return user.initials;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? parts.slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("zh-CN")
    : name.slice(0, 2).toLocaleUpperCase("zh-CN");
}

function imageSource(avatarUrl) {
  return /^(?:blob:|data:)/.test(avatarUrl) ? avatarUrl : resolveAssetUrl(avatarUrl);
}

export function UserAvatar({
  user,
  avatarUrl = user?.avatarUrl ?? user?.avatar_url ?? "",
  variant = "default",
  className = "",
  label = "",
}) {
  const [failedUrl, setFailedUrl] = useState("");
  const name = user?.name || user?.nickname || user?.username || "未知成员";
  const initials = initialsFor(user, name) || "?";

  return (
    <span
      className={`user-avatar user-avatar-${variant} ${className}`.trim()}
      style={{ "--avatar": user?.color }}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : "true"}
    >
      {avatarUrl && failedUrl !== avatarUrl
        ? <img src={imageSource(avatarUrl)} alt="" onError={() => setFailedUrl(avatarUrl)} />
        : initials}
    </span>
  );
}
