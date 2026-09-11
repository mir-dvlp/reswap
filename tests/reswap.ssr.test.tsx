// @vitest-environment node

import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ReSwap, ReSwapProvider } from "../src/reswap";

describe("ReSwap server rendering", () => {
  it("renders named groups without a useLayoutEffect server warning", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const html = renderToString(
      createElement(
        ReSwapProvider,
        null,
        createElement(ReSwap, { as: "h1", group: "language" }, "Server-safe text"),
      ),
    );
    expect(html).toContain("Server-safe text");
    expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining("useLayoutEffect does nothing on the server"));
    consoleError.mockRestore();
  });
});
