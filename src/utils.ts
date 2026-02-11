import { execFileSync } from "child_process";
import * as os from "os";

export const extractUserIdFromJwt = (token: string) => {
  const payload = token.split(".")[1];
  const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
  const sub = decoded.sub as string;

  // Format: "auth-provider|user_xxxx"
  const parts = sub.split("|");
  
  return parts[parts.length - 1];
};
