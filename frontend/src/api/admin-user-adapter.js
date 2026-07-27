const VALID_ROLES = new Set(["admin", "user"]);

export function adaptAdminUserFromApi(user) {
  return {
    id: Number(user.id),
    username: user.username,
    nickname: user.nickname ?? "",
    role: VALID_ROLES.has(user.role) ? user.role : "user",
    isActive: Boolean(user.is_active),
    createdAt: user.created_at ?? null,
  };
}

export function adaptNewAdminUserToApi(user) {
  return {
    username: user.username.trim(),
    nickname: user.nickname.trim() || null,
    password: user.password,
    role: VALID_ROLES.has(user.role) ? user.role : "user",
  };
}

export function adaptAdminUserUpdateToApi(user) {
  return {
    nickname: user.nickname.trim() || null,
    role: VALID_ROLES.has(user.role) ? user.role : "user",
    is_active: Boolean(user.isActive),
  };
}

export function filterAdminUsers(users, filters) {
  const query = filters.query.trim().toLocaleLowerCase("zh-CN");

  return users.filter((user) => {
    const matchesQuery = !query
      || user.username.toLocaleLowerCase("zh-CN").includes(query)
      || user.nickname.toLocaleLowerCase("zh-CN").includes(query);
    const matchesRole = filters.role === "all" || user.role === filters.role;
    const matchesStatus = filters.status === "all"
      || (filters.status === "active" ? user.isActive : !user.isActive);
    return matchesQuery && matchesRole && matchesStatus;
  });
}
