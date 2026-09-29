import { deepmerge, mainLoop } from "./helpers";

describe("deepmerge", () => {
  it("adds new keys", () => {
    expect(deepmerge({ a: 1, b: 2 }, { c: 3, d: 4 })).toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });
  });

  it("lets later values replace earlier values", () => {
    expect(deepmerge({ a: 1, b: 2 }, { a: 3, b: 4 })).toEqual({
      a: 3,
      b: 4,
    });
  });

  it("merges nested objects", () => {
    expect(
      deepmerge(
        {
          a: 1,
          b: {
            c: 3,
          },
          d: 4,
        },
        {
          b: {
            k: 21,
          },
        }
      )
    ).toEqual({
      a: 1,
      b: {
        c: 3,
        k: 21,
      },
      d: 4,
    });
  });

  it("lets later nested values replace earlier nested values", () => {
    expect(
      deepmerge(
        {
          settings: {
            enabled: false,
            delay: 100,
          },
        },
        {
          settings: {
            enabled: true,
          },
        }
      )
    ).toEqual({
      settings: {
        enabled: true,
        delay: 100,
      },
    });
  });

  it("ignores non-object arguments", () => {
    expect(
      deepmerge(
        { a: 1 },
        null,
        undefined,
        "not an object",
        123,
        { b: 2 }
      )
    ).toEqual({
      a: 1,
      b: 2,
    });
  });
});

describe("mainLoop", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("calls the callback immediately", () => {
    const callback = jest.fn().mockResolvedValue(undefined);

    mainLoop(callback, 1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls the callback again after the configured delay", async () => {
    const callback = jest.fn().mockResolvedValue(undefined);

    mainLoop(callback, 1000);

    expect(callback).toHaveBeenCalledTimes(1);

    // Allow the resolved promise's finally() handler to schedule the timer.
    await Promise.resolve();

    await jest.advanceTimersByTimeAsync(999);
    expect(callback).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("waits for the callback to finish before scheduling the next call", async () => {
    let resolveCallback: (() => void) | undefined;

    const callback = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCallback = resolve;
        })
    );

    mainLoop(callback, 1000);

    expect(callback).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1000);

    // The first callback has not resolved, so the next timer
    // should not have been scheduled yet.
    expect(callback).toHaveBeenCalledTimes(1);

    resolveCallback?.();
    await Promise.resolve();

    await jest.advanceTimersByTimeAsync(1000);

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
