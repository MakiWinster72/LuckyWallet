import { authenticatedApiRequest } from "./auth.js";
import { adaptMemberFromApi } from "./member-adapter.js";

export async function listMembersApi() {
  const response = await authenticatedApiRequest("/members");
  return (await response.json()).map(adaptMemberFromApi);
}
