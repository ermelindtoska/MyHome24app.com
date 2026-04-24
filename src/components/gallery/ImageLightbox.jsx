import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function getDistance(t1, t2) {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function ImageLightbox({
  isOpen,
  images = [],
  activeIndex = 0,
  onClose,
  onChangeIndex,
  title = "",
  fallbackImage = "/images/hero-1.jpg",
}) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const startRef = useRef({ x: 0, y: 0 });
  const pinchDistanceRef = useRef(null);
  const pinchZoomStartRef = useRef(1);
  const lastTapRef = useRef(0);

  const safeImages =
    Array.isArray(images) && images.length ? images : [fallbackImage];

  const currentImage = safeImages[activeIndex] || fallbackImage;

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetView = () => {
    setZoom(1);
    setTranslate({ x: 0, y: 0 });
    setDragging(false);
    pinchDistanceRef.current = null;
    pinchZoomStartRef.current = 1;
  };

  const close = () => {
    resetView();
    onClose?.();
  };

  const next = () => {
    onChangeIndex?.(activeIndex === safeImages.length - 1 ? 0 : activeIndex + 1);
    resetView();
  };

  const prev = () => {
    onChangeIndex?.(activeIndex === 0 ? safeImages.length - 1 : activeIndex - 1);
    resetView();
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, MAX_ZOOM));

  const zoomOut = () => {
    setZoom((z) => {
      const nextZoom = Math.max(z - 0.25, MIN_ZOOM);
      if (nextZoom === 1) setTranslate({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const resetZoom = () => resetView();

  useEffect(() => {
    if (!isOpen) return;

    const oldBodyOverflow = document.body.style.overflow;
    const oldHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = oldBodyOverflow;
      document.documentElement.style.overflow = oldHtmlOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, activeIndex, safeImages.length]);

  useEffect(() => {
    if (isOpen) resetView();
  }, [isOpen, activeIndex]);

  const handleWheel = (e) => {
    e.preventDefault();

    setZoom((z) => {
      const nextZoom = Math.min(
        Math.max(z + (e.deltaY < 0 ? 0.2 : -0.2), MIN_ZOOM),
        MAX_ZOOM
      );

      if (nextZoom === 1) setTranslate({ x: 0, y: 0 });
      return nextZoom;
    });
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;

    e.preventDefault();
    setDragging(true);

    startRef.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging || zoom <= 1) return;

    setTranslate({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
    });
  };

  const stopDrag = () => setDragging(false);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
      pinchZoomStartRef.current = zoom;
      return;
    }

    if (e.touches.length === 1 && zoom > 1) {
      const touch = e.touches[0];
      setDragging(true);
      startRef.current = {
        x: touch.clientX - translate.x,
        y: touch.clientY - translate.y,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();

      const distance = getDistance(e.touches[0], e.touches[1]);
      if (!pinchDistanceRef.current) return;

      const factor = distance / pinchDistanceRef.current;
      const nextZoom = Math.min(
        Math.max(pinchZoomStartRef.current * factor, MIN_ZOOM),
        MAX_ZOOM
      );

      setZoom(nextZoom);
      if (nextZoom === 1) setTranslate({ x: 0, y: 0 });
      return;
    }

    if (e.touches.length === 1 && dragging && zoom > 1) {
      e.preventDefault();

      const touch = e.touches[0];
      setTranslate({
        x: touch.clientX - startRef.current.x,
        y: touch.clientY - startRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    pinchDistanceRef.current = null;
    setDragging(false);
  };

  const handleImageClick = () => {
    const now = Date.now();

    if (now - lastTapRef.current < 280) {
      setZoom((z) => {
        if (z > 1) {
          setTranslate({ x: 0, y: 0 });
          return 1;
        }
        return 2;
      });
    }

    lastTapRef.current = now;
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] bg-black/90 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed left-4 top-4 z-[2147483647] text-sm font-semibold text-white">
        {activeIndex + 1} / {safeImages.length}
      </div>

      <div
        className="fixed right-4 top-4 z-[2147483647] flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={zoomOut} className="rounded-full bg-black/70 px-4 py-2 text-white hover:bg-black">
          −
        </button>

        <button onClick={resetZoom} className="rounded-full bg-black/70 px-4 py-2 text-white hover:bg-black">
          {Math.round(zoom * 100)}%
        </button>

        <button onClick={zoomIn} className="rounded-full bg-black/70 px-4 py-2 text-white hover:bg-black">
          +
        </button>

        <button onClick={close} className="rounded-full bg-black/70 px-4 py-2 text-xl font-bold text-white hover:bg-black">
          ×
        </button>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden p-4 md:p-8"
        onWheel={handleWheel}
      >
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 z-[2147483647] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-3xl text-white hover:bg-black"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 z-[2147483647] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-3xl text-white hover:bg-black"
            >
              ›
            </button>
          </>
        )}

        <div
          className="flex h-full w-full items-center justify-center overflow-hidden"
          style={{ touchAction: "none" }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleImageClick}
        >
          <img
            src={currentImage}
            alt={title}
            draggable={false}
            onClick={handleImageClick}
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
            className="max-h-[82vh] max-w-[92vw] select-none object-contain transition-transform duration-150"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
            }}
          />
        </div>
      </div>

      {safeImages.length > 1 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-[2147483647] border-t border-white/10 bg-black/50 px-3 py-3 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-3 overflow-x-auto">
            {safeImages.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => {
                  onChangeIndex?.(idx);
                  resetView();
                }}
                className={`overflow-hidden rounded-xl border ${
                  idx === activeIndex
                    ? "border-blue-400 ring-2 ring-blue-400/40"
                    : "border-white/20"
                }`}
              >
                <img
                  src={img}
                  alt={`${title}-${idx + 1}`}
                  className="h-16 w-24 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}