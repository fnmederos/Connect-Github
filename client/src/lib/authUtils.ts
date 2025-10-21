import { apiRequest } from "./queryClient";

export async function logout() {
  try {
    await apiRequest("POST", "/api/logout");
    window.location.href = '/';
  } catch (error) {
    console.error("Logout failed:", error);
    // Force redirect anyway
    window.location.href = '/';
  }
}
