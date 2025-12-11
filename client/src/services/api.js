export async function authFetch(url, options = {}, currentUser) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (currentUser) {
    // Force refresh the token to ensure it's never stale
    // 'true' forces a refresh if expired
    const token = await currentUser.getIdToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error (${res.status}): ${errorText}`);
  }
  return res.json();
}
