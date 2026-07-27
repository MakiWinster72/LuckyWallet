import { authenticatedApiRequest } from "./auth";


export async function getBudgetApi() {
  const response = await authenticatedApiRequest("/settings/budget");
  const result = await response.json();
  return Number(result.monthly_budget);
}


export async function updateBudgetApi(monthlyBudget) {
  const response = await authenticatedApiRequest("/settings/budget", {
    method: "PUT",
    body: JSON.stringify({ monthly_budget: monthlyBudget }),
  });
  const result = await response.json();
  return Number(result.monthly_budget);
}
