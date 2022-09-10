import axios from "axios";
import { AutoMediaAppDoc } from "../model/document/amApp";

enum WebhookStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}
export async function sendWebhook(
  app: AutoMediaAppDoc | null,
  data: any
): Promise<WebhookStatus> {
  if (!app) return WebhookStatus.FAILED;
  if (app.webhook && app.secret) {
    try {
      await axios.post(app.webhook, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${app.secret}`,
        },
      });
      // await axios.get(app.webhook);
      return WebhookStatus.SUCCESS;
    } catch (error) {
      return WebhookStatus.FAILED;
    }
  }
  return WebhookStatus.FAILED;
}
