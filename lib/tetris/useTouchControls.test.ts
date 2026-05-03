import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTouchControls } from "./useTouchControls";

function createTouchEvent(type: string, x: number, y: number): TouchEvent {
  const touch = { clientX: x, clientY: y, identifier: 0, target: document.createElement("div") } as unknown as Touch;
  const init: TouchEventInit & { cancelable?: boolean } = { cancelable: true };
  if (type === "touchend" || type === "touchcancel") {
    init.changedTouches = [touch];
  } else {
    init.touches = [touch];
  }
  return new TouchEvent(type, init);
}

function simulateSwipe(el: HTMLElement, startX: number, startY: number, endX: number, endY: number) {
  el.dispatchEvent(createTouchEvent("touchstart", startX, startY));
  el.dispatchEvent(createTouchEvent("touchmove", endX, endY));
}

function simulateTap(el: HTMLElement, x = 100, y = 100) {
  el.dispatchEvent(createTouchEvent("touchstart", x, y));
  el.dispatchEvent(createTouchEvent("touchend", x, y));
}

describe("useTouchControls", () => {
  let el: HTMLDivElement;
  let ref: React.RefObject<HTMLDivElement | null>;
  let actions: {
    onLeft: ReturnType<typeof vi.fn>;
    onRight: ReturnType<typeof vi.fn>;
    onSoftDrop: ReturnType<typeof vi.fn>;
    onHardDrop: ReturnType<typeof vi.fn>;
    onRotate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    el = document.createElement("div");
    document.body.appendChild(el);
    ref = { current: el };
    actions = {
      onLeft: vi.fn(),
      onRight: vi.fn(),
      onSoftDrop: vi.fn(),
      onHardDrop: vi.fn(),
      onRotate: vi.fn(),
    };
  });

  it("calls onRight on swipe right", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    simulateSwipe(el, 100, 100, 200, 100);
    expect(actions.onRight).toHaveBeenCalled();
  });

  it("calls onLeft on swipe left", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    simulateSwipe(el, 200, 100, 100, 100);
    expect(actions.onLeft).toHaveBeenCalled();
  });

  it("calls onSoftDrop on swipe down", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    simulateSwipe(el, 100, 100, 100, 200);
    expect(actions.onSoftDrop).toHaveBeenCalled();
  });

  it("calls onHardDrop on swipe up", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    simulateSwipe(el, 100, 200, 100, 100);
    expect(actions.onHardDrop).toHaveBeenCalled();
  });

  it("calls onRotate on tap", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    simulateTap(el);
    expect(actions.onRotate).toHaveBeenCalled();
  });

  it("does not fire actions when disabled", () => {
    renderHook(() => useTouchControls(ref, actions, false));
    simulateSwipe(el, 100, 100, 200, 100);
    simulateTap(el);
    expect(actions.onRight).not.toHaveBeenCalled();
    expect(actions.onRotate).not.toHaveBeenCalled();
  });

  it("ignores movement below swipe threshold", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    simulateSwipe(el, 100, 100, 120, 100); // dx=20 < 30 threshold
    expect(actions.onRight).not.toHaveBeenCalled();
    expect(actions.onLeft).not.toHaveBeenCalled();
  });

  it("does not call onRotate if touch moved too far", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    el.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    el.dispatchEvent(createTouchEvent("touchend", 120, 100)); // dx=20 > TAP_THRESHOLD(10)
    expect(actions.onRotate).not.toHaveBeenCalled();
  });

  it("allows continuous horizontal swipes by resetting origin", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    el.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    el.dispatchEvent(createTouchEvent("touchmove", 140, 100)); // first swipe right
    el.dispatchEvent(createTouchEvent("touchmove", 180, 100)); // second swipe right
    expect(actions.onRight).toHaveBeenCalledTimes(2);
  });

  it("cleans up listeners on unmount", () => {
    const spy = vi.spyOn(el, "removeEventListener");
    const { unmount } = renderHook(() => useTouchControls(ref, actions, true));
    unmount();
    expect(spy).toHaveBeenCalledWith("touchstart", expect.any(Function));
    expect(spy).toHaveBeenCalledWith("touchmove", expect.any(Function));
    expect(spy).toHaveBeenCalledWith("touchend", expect.any(Function));
  });

  it("prefers horizontal swipe when dx > dy", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    simulateSwipe(el, 100, 100, 160, 120); // dx=60 > dy=20
    expect(actions.onRight).toHaveBeenCalled();
    expect(actions.onSoftDrop).not.toHaveBeenCalled();
  });

  it("prefers vertical swipe when dy > dx", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    simulateSwipe(el, 100, 100, 120, 160); // dy=60 > dx=20
    expect(actions.onSoftDrop).toHaveBeenCalled();
    expect(actions.onRight).not.toHaveBeenCalled();
  });

  it("does not attach listeners when enabled is false", () => {
    const spy = vi.spyOn(el, "addEventListener");
    renderHook(() => useTouchControls(ref, actions, false));
    const touchCalls = spy.mock.calls.filter(([type]) =>
      ["touchstart", "touchmove", "touchend"].includes(type as string)
    );
    expect(touchCalls).toHaveLength(0);
  });

  it("attaches listeners when toggled from disabled to enabled", () => {
    const spy = vi.spyOn(el, "addEventListener");
    const { rerender } = renderHook(
      ({ enabled }) => useTouchControls(ref, actions, enabled),
      { initialProps: { enabled: false } },
    );
    expect(
      spy.mock.calls.filter(([t]) => t === "touchstart"),
    ).toHaveLength(0);

    rerender({ enabled: true });
    expect(
      spy.mock.calls.filter(([t]) => t === "touchstart"),
    ).toHaveLength(1);
  });

  it("removes listeners when toggled from enabled to disabled", () => {
    const removeSpy = vi.spyOn(el, "removeEventListener");
    const { rerender } = renderHook(
      ({ enabled }) => useTouchControls(ref, actions, enabled),
      { initialProps: { enabled: true } },
    );
    rerender({ enabled: false });
    expect(removeSpy).toHaveBeenCalledWith("touchstart", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("touchmove", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("touchend", expect.any(Function));
  });

  it("does not attach listeners when ref is null", () => {
    const nullRef = { current: null };
    const spy = vi.spyOn(el, "addEventListener");
    renderHook(() => useTouchControls(nullRef, actions, true));
    const touchCalls = spy.mock.calls.filter(([type]) =>
      ["touchstart", "touchmove", "touchend"].includes(type as string)
    );
    expect(touchCalls).toHaveLength(0);
  });

  it("does not fire actions after being disabled mid-session", () => {
    const { rerender } = renderHook(
      ({ enabled }) => useTouchControls(ref, actions, enabled),
      { initialProps: { enabled: true } },
    );
    rerender({ enabled: false });
    simulateSwipe(el, 100, 100, 200, 100);
    simulateTap(el);
    expect(actions.onRight).not.toHaveBeenCalled();
    expect(actions.onRotate).not.toHaveBeenCalled();
  });

  it("does not allow continuous swipes after hard drop (origin not reset)", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    el.dispatchEvent(createTouchEvent("touchstart", 100, 200));
    el.dispatchEvent(createTouchEvent("touchmove", 100, 140)); // swipe up → hard drop
    el.dispatchEvent(createTouchEvent("touchmove", 100, 80));  // another swipe up
    expect(actions.onHardDrop).toHaveBeenCalledTimes(1);
  });

  it("allows continuous downward swipes by resetting origin", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    el.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    el.dispatchEvent(createTouchEvent("touchmove", 100, 140)); // first soft drop
    el.dispatchEvent(createTouchEvent("touchmove", 100, 180)); // second soft drop
    expect(actions.onSoftDrop).toHaveBeenCalledTimes(2);
  });

  it("does not call onRotate if tap duration exceeds threshold", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    el.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 300);
    el.dispatchEvent(createTouchEvent("touchend", 100, 100));
    expect(actions.onRotate).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("calls preventDefault on swipe touchmove events", () => {
    renderHook(() => useTouchControls(ref, actions, true));
    const moveEvent = createTouchEvent("touchmove", 200, 100);
    el.dispatchEvent(createTouchEvent("touchstart", 100, 100));
    const spy = vi.spyOn(moveEvent, "preventDefault");
    el.dispatchEvent(moveEvent);
    expect(spy).toHaveBeenCalled();
  });
});
