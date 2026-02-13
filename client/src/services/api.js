// This will now use your .env value during development
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function authFetch(endpoint, options = {}, currentUser) {
  // Logic to ensure we don't double-up on slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  // ... rest of your existing error handling ...
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error (${res.status}): ${errorText}`);
  }
  return res.json();
}
