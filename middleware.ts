export { auth as middleware } from "@/auth";

// 👈 ਇਹ ਲਾਈਨ ਐਡ ਕਰੋ
export const runtime = "nodejs";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/(logs|vaccines|medicines|appointments|growth|users|notifications)/:path*",
  ],
};