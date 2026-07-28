const avatarColors = ["var(--color-avatar-1)", "var(--color-avatar-2)", "var(--color-avatar-3)", "var(--color-avatar-4)", "var(--color-avatar-5)"];

function initials(value) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.length > 1
    ? words.slice(0, 2).map((word) => word[0]).join("").toUpperCase()
    : value.slice(0, 2).toUpperCase();
}

export function adaptMemberFromApi(member) {
  const name = member.nickname?.trim() || member.username;
  return {
    id: member.id,
    username: member.username,
    name,
    initials: initials(name),
    color: avatarColors[(member.id - 1) % avatarColors.length],
    avatarUrl: member.avatar_url ?? "",
  };
}
