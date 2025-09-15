// routesRootPost.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { routesRootPost, type RootPostRequest } from "./routes_root_post.js";

const SLACK_URL =
  "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX";

describe("routesRootPost", () => {
  beforeEach(() => {
    // Mock global fetch
    vi.spyOn(globalThis as any, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "ok",
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards 'Warning' notifications to Slack and returns OK", async () => {
    const req: RootPostRequest = {
      Type: "Warning",
      Name: "Backup Failure",
      Description: "The backup failed due to a database problem",
    };

    const res = await routesRootPost(req);

    // reply shape
    expect(res).toEqual({
      code: 200,
      header: {
        headerType: "Content-Type",
        headerValue: "application/json; charset=utf-8",
      },
      send: "OK",
    });

    // called Slack with correct payload
    const expectedText = `${req.Type}: ${req.Name} \n ${req.Description}`;
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      SLACK_URL,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ text: expectedText }),
      })
    );
  });

  it("does NOT forward non-'Warning' notifications and returns message", async () => {
    const req: RootPostRequest = {
      Type: "Info",
      Name: "Routine Backup",
      Description: "Backup completed successfully",
    };

    const res = await routesRootPost(req);

    expect(res).toEqual({
      code: 200,
      header: {
        headerType: "Content-Type",
        headerValue: "application/json; charset=utf-8",
      },
      send: "Only notifications of type 'Warning' are forwarded",
    });

    // fetch must not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
