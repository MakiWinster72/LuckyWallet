import { authenticatedApiRequest } from "./auth";
import { adaptBillFromApi, adaptBillToApi } from "./bill-adapter";

export async function listBillsApi() {
  const response = await authenticatedApiRequest("/bills");
  const bills = await response.json();
  return bills.map(adaptBillFromApi);
}

export async function createBillApi(bill) {
  const response = await authenticatedApiRequest("/bills", {
    method: "POST",
    body: JSON.stringify(adaptBillToApi(bill)),
  });
  return adaptBillFromApi(await response.json());
}
