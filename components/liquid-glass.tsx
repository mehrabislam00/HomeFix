"use client";

import {
  useEffect,
  useId,
  useState,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

/**
 * <LiquidGlass /> — real edge refraction for a rounded-rectangle surface.
 *
 * How it works
 *  1. We draw a *displacement map* on a canvas: a signed-distance field of the
 *     rounded rectangle. Inside a thin "bezel" along the edge, each pixel
 *     encodes (in its R and G channels) a vector pointing toward the middle.
 *  2. An SVG <feDisplacementMap> uses that map to bend whatever is behind the
 *     glass, and `backdrop-filter: url(#filter)` applies it to the backdrop.
 *     Result: the page content visibly warps around the rim like a thick lens.
 *  3. Colour, highlights, rim light and shadows come from the `.liquid-glass`
 *     CSS class in globals.css (HomeFix ivory/sage tint).
 *
 * `backdrop-filter: url()` only works in Chromium (Chrome, Edge, Brave,
 * Android). Safari and Firefox automatically keep the CSS-only glass.
 */

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Corner radius in px — must match the visual shape. */
  radius?: number;
  /** Width in px of the refracting rim along the edge. */
  bezel?: number;
  /** Max pixels the rim bends the background. */
  strength?: number;
  /** Extra blur in px applied after refraction. */
  blur?: number;
};

function buildDisplacementMap(w: number, h: number, radius: number, bezel: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const img = ctx.createImageData(w, h);
  const px = img.data;
  const hx = w / 2;
  const hy = h / 2;
  const r = Math.min(radius, hx, hy);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x + 0.5 - hx;
      const dy = y + 0.5 - hy;

      // signed distance to the rounded rectangle (negative inside)
      const qx = Math.abs(dx) - (hx - r);
      const qy = Math.abs(dy) - (hy - r);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const outer = Math.hypot(ox, oy);
      const sdf = outer + Math.min(Math.max(qx, qy), 0) - r;
      const dist = -sdf; // distance from the edge, positive inside

      let red = 128;
      let green = 128;

      if (dist > 0 && dist < bezel) {
        // strongest at the very edge, easing to zero at the inner bezel line
        const m = Math.pow(1 - dist / bezel, 2.2);

        // outward normal
        let nx: number;
        let ny: number;
        if (outer > 0) {
          nx = (Math.sign(dx) * ox) / outer;
          ny = (Math.sign(dy) * oy) / outer;
        } else if (qx > qy) {
          nx = Math.sign(dx);
          ny = 0;
        } else {
          nx = 0;
          ny = Math.sign(dy);
        }

        // sample from *inside* the glass so we never read outside the backdrop
        red = 128 + 127 * (-nx * m);
        green = 128 + 127 * (-ny * m);
      }

      const i = (y * w + x) * 4;
      px[i] = red;
      px[i + 1] = green;
      px[i + 2] = 128;
      px[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

export function LiquidGlass({
  children,
  className,
  style,
  radius = 28,
  bezel = 26,
  strength = 16,
  blur = 8,
  ...rest
}: Props) {
  const id = "lg" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<{ url: string; w: number; h: number } | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isChromium = /Chrome\//.test(ua) && !/CriOS|FxiOS/.test(ua);
    const reduce = window.matchMedia?.("(prefers-reduced-transparency: reduce)").matches;
    const el = ref.current;
    if (!isChromium || reduce || !el) return;

    let raf = 0;
    const build = () => {
      const { width, height } = el.getBoundingClientRect();
      const w = Math.round(width);
      const h = Math.round(height);
      if (!w || !h) return;
      const url = buildDisplacementMap(w, h, radius, bezel);
      if (url) setMap({ url, w, h });
    };
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    });
    ro.observe(el);
    build();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [radius, bezel]);

  return (
    <>
      {map && (
        <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
          <defs>
            <filter
              id={id}
              filterUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={map.w}
              height={map.h}
              colorInterpolationFilters="sRGB"
            >
              <feImage
                href={map.url}
                x="0"
                y="0"
                width={map.w}
                height={map.h}
                preserveAspectRatio="none"
                result="map"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="map"
                scale={strength * 2}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
      <div
        ref={ref}
        className={className}
        style={{
          borderRadius: radius,
          ...(map
            ? {
                backdropFilter: `url(#${id}) blur(${blur}px) saturate(1.8) brightness(1.05)`,
              }
            : null),
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    </>
  );
}