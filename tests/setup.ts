import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

class TestResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: TestResizeObserver,
});

afterEach(cleanup);
