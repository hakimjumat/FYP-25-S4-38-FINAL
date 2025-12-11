// small wrapper to include the Firebase ID token in requests
export async function authFetch(url, options = {}, currentUser) {
const headers = new Headers(options.headers || {});
headers.set("Content-Type", "application/json");


if (currentUser?.token) {
headers.set("Authorization", `Bearer ${currentUser.token}`);
} else if (currentUser) {
// If token not present, try to refresh it
const token = await currentUser.getIdToken();
headers.set("Authorization", `Bearer ${token}`);
}


const res = await fetch(url, { ...options, headers, credentials: "include" });
if (!res.ok) throw new Error(`API error (${res.status})`);
return res.json();
}