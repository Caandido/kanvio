// Expõe os endpoints internos do Auth.js (callback, signin, signout, etc.)
// em /api/auth/*. O Auth.js cuida do resto.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
