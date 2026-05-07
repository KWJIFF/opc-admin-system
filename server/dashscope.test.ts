import { describe, it, expect } from "vitest";

describe("DashScope API Key validation", () => {
  it("should successfully call Qwen API with configured key", async () => {
    const apiKey = process.env.ALIYUN_DASHSCOPE_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey!.length).toBeGreaterThan(10);

    const response = await fetch(
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "qwen-max",
          messages: [
            { role: "user", content: "回复'OK'" },
          ],
          max_tokens: 10,
        }),
      }
    );

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.choices).toBeDefined();
    expect(data.choices.length).toBeGreaterThan(0);
    expect(data.choices[0].message.content).toBeTruthy();
    console.log("Qwen API response:", data.choices[0].message.content);
  }, 30000);
});
