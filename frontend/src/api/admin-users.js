import { authenticatedApiRequest } from "./auth";
import {
  adaptAdminUserFromApi,
  adaptAdminUserUpdateToApi,
  adaptNewAdminUserToApi,
} from "./admin-user-adapter";

export async function listAdminUsersApi() {
  const response = await authenticatedApiRequest("/admin/users");
  const users = await response.json();
  return users.map(adaptAdminUserFromApi);
}

export async function createAdminUserApi(user) {
  const response = await authenticatedApiRequest("/admin/users", {
    method: "POST",
    body: JSON.stringify(adaptNewAdminUserToApi(user)),
  });
  return adaptAdminUserFromApi(await response.json());
}

export async function updateAdminUserApi(user) {
  const response = await authenticatedApiRequest(`/admin/users/${user.id}`, {
    method: "PATCH",
    body: JSON.stringify(adaptAdminUserUpdateToApi(user)),
  });
  return adaptAdminUserFromApi(await response.json());
}
