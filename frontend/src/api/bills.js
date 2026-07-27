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

export async function updateBillApi(bill) {
  const response = await authenticatedApiRequest(`/bills/${bill.id}`, {
    method: "PUT",
    body: JSON.stringify(adaptBillToApi(bill)),
  });
  return adaptBillFromApi(await response.json());
}

export async function deleteBillApi(billId) {
  await authenticatedApiRequest(`/bills/${billId}`, {
    method: "DELETE",
  });
}
