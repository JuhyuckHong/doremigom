const PASS_HASH = "2b4932f635721359115ea94ec6346217b4e943225ea01f3e2e8e6f04382a55fe";

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default async function middleware(request) {
  const auth = request.headers.get("authorization");

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const idx = decoded.indexOf(":");
      const pass = idx !== -1 ? decoded.slice(idx + 1) : decoded;
      const passHash = await sha256(pass);
      if (passHash === PASS_HASH) {
        return;
      }
    }
  }

  return new Response("인증이 필요합니다.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="QR 노래 플레이어", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const config = {
  matcher: ["/", "/player.html"],
};
