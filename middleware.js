const PASS_HASH = "2268922e20afdc237a219ac77f365acaabf2c27bd1eb5e19a060996e607c5020";

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function getCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? match[1] : null;
}

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>QR 노래 플레이어</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:"Noto Sans KR",sans-serif;color:#f6f4ef;
background:radial-gradient(1200px 600px at 10% -10%,rgba(103,211,194,.25),transparent 60%),
radial-gradient(900px 600px at 90% 0%,rgba(255,184,107,.25),transparent 60%),
linear-gradient(140deg,#0f1b2b,#1c3147);min-height:100vh;display:flex;align-items:center;justify-content:center}
.box{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:18px;
padding:40px 32px;backdrop-filter:blur(10px);box-shadow:0 14px 34px rgba(0,0,0,.35);
text-align:center;width:min(380px,90vw);animation:f .7s ease-out}
h2{margin:0 0 6px;font-size:22px}
p{margin:0 0 24px;color:#b9c1cf;font-size:14px}
input[type=password]{width:100%;padding:12px 16px;border:1px solid rgba(255,255,255,.14);
border-radius:12px;background:rgba(255,255,255,.06);color:#f6f4ef;font-size:16px;
font-family:inherit;outline:none;transition:border-color .2s}
input[type=password]:focus{border-color:#ffb86b}
button{width:100%;margin-top:14px;padding:12px;background:linear-gradient(135deg,#ffb86b,#ffc477);
color:#2c1c0b;font-weight:700;font-size:15px;border:none;border-radius:12px;cursor:pointer;font-family:inherit}
.err{color:#ff6b6b;font-size:13px;margin-top:12px;min-height:20px}
@keyframes f{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<div class="box">
<h2>QR 노래 플레이어</h2>
<p>비밀번호를 입력해 주세요</p>
<form method="POST">
<input type="password" name="pw" placeholder="비밀번호" autocomplete="off" autofocus/>
<button type="submit">입장</button>
</form>
<div class="err" id="err"></div>
</div>
<script>
const u=new URLSearchParams(window.location.search);
if(u.get("e")==="1")document.getElementById("err").textContent="비밀번호가 틀렸습니다.";
</script>
</body>
</html>`;

export default async function middleware(request) {
  const url = new URL(request.url);

  // Check auth cookie
  const token = getCookie(request, "auth");
  if (token === PASS_HASH) {
    return;
  }

  // Handle login POST
  if (request.method === "POST") {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const pw = params.get("pw") || "";
    const hash = await sha256(pw);

    if (hash === PASS_HASH) {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": url.pathname,
          "Set-Cookie": `auth=${PASS_HASH}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
        },
      });
    }

    return new Response(null, {
      status: 302,
      headers: { "Location": url.pathname + "?e=1" },
    });
  }

  // Show login page
  return new Response(LOGIN_HTML, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export const config = {
  matcher: ["/", "/player.html"],
};
