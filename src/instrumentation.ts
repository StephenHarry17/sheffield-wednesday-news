import { startArticlesCron, startFixtureCron, startVideosCron } from "@/lib/cron";

declare global {
  // eslint-disable-next-line no-var
  var __cronStarted: boolean | undefined;
}

export function register() {
  if (global.__cronStarted) return;
  global.__cronStarted = true;

  startFixtureCron();
  startArticlesCron();
  startVideosCron();

  console.log("[cron] registered");
}