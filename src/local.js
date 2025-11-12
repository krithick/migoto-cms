export function clearMigotoStorage() {
  localStorage.removeItem("migoto-cms-token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("currentPathLocation");
  localStorage.removeItem("timeLine");
  localStorage.removeItem("flow");
  localStorage.removeItem("activeTab");
  localStorage.removeItem("TLData");
  localStorage.removeItem("timeline");
  localStorage.removeItem("pathLocation");
}