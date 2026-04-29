import { afterEach, describe, expect, it, vi } from "vitest";
import { ghFetch } from "../services/github-fetch.js";

const originalGithubToken = process.env.GITHUB_TOKEN;
const originalGhToken = process.env.GH_TOKEN;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalGithubToken === undefined) {
    delete process.env.GITHUB_TOKEN;
  } else {
    process.env.GITHUB_TOKEN = originalGithubToken;
  }
  if (originalGhToken === undefined) {
    delete process.env.GH_TOKEN;
  } else {
    process.env.GH_TOKEN = originalGhToken;
  }
});

describe("ghFetch", () => {
  it("adds a bearer token from GITHUB_TOKEN while preserving existing headers", async () => {
    process.env.GITHUB_TOKEN = "github-token";
    delete process.env.GH_TOKEN;
    const fetchMock = vi.fn(async () => new Response("ok"));
    vi.stubGlobal("fetch", fetchMock);

    await ghFetch("https://api.github.com/repos/alexmuchau/muchaw-skills", {
      headers: {
        accept: "application/vnd.github+json",
      },
    });

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("accept")).toBe("application/vnd.github+json");
    expect(headers.get("authorization")).toBe("Bearer github-token");
  });

  it("uses GH_TOKEN when GITHUB_TOKEN is not set", async () => {
    delete process.env.GITHUB_TOKEN;
    process.env.GH_TOKEN = "gh-token";
    const fetchMock = vi.fn(async () => new Response("ok"));
    vi.stubGlobal("fetch", fetchMock);

    await ghFetch("https://raw.githubusercontent.com/alexmuchau/muchaw-skills/main/muchaw-api/SKILL.md");

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("Bearer gh-token");
  });
});
