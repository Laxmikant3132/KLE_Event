import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  applyPageCustomization,
  postPageCustomization,
  splitTypographyProps,
  usePageTypography,
  type LandingPageCustomization,
  type PageTypographyProps,
} from "./pageTypography";
import { KAGE_TYPOGRAPHY } from "./pageRecipes";

export type LandingPageFrameProps = {
  backgroundCanvasSelector?: string;
  backgroundVisualSelector?: string;
  className?: string;
  sourceUrl: string;
  srcDoc?: string;
  style?: CSSProperties;
  title: string;
  customization?: LandingPageCustomization;
  applyScene?: (frame: HTMLIFrameElement) => void;
  onMessage?: (data: unknown) => void;
};

export type LandingPageProps = Omit<
  LandingPageFrameProps,
  "sourceUrl" | "title" | "customization" | "backgroundCanvasSelector" | "backgroundVisualSelector"
>;

const URL_FRAME_SANDBOX = "allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts";
const SRCDOC_FRAME_SANDBOX = "allow-downloads allow-forms allow-modals allow-popups allow-scripts";

export function LandingPageFrame({
  applyScene,
  className = "",
  customization,
  sourceUrl,
  srcDoc,
  style,
  title,
  onMessage,
}: LandingPageFrameProps) {
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    applyPageCustomization(frameRef.current, customization);
    postPageCustomization(frameRef.current, customization);
    if (frameRef.current) applyScene?.(frameRef.current);
  }, [applyScene, customization]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === "object") {
        onMessage?.(event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onMessage]);

  return (
    <div
      className={`threeui-background landing-page-frame ${className}`}
      data-state={ready ? "ready" : "loading"}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#05070a", pointerEvents: "auto", ...style }}
    >
      <iframe
        ref={frameRef}
        title={title}
        {...(srcDoc ? { srcDoc } : { src: sourceUrl })}
        sandbox={srcDoc ? SRCDOC_FRAME_SANDBOX : URL_FRAME_SANDBOX}
        loading="eager"
        onLoad={(event) => {
          applyPageCustomization(event.currentTarget, customization);
          postPageCustomization(event.currentTarget, customization);
          applyScene?.(event.currentTarget);
          setReady(true);
        }}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          border: 0,
          background: "#05070a",
          opacity: ready ? 1 : 0.95,
        }}
      />
    </div>
  );
}

export function KageLandingPage(props: LandingPageProps & PageTypographyProps & { onMessage?: (data: unknown) => void }) {
  const [type, frame] = splitTypographyProps(props);
  const customization = usePageTypography(KAGE_TYPOGRAPHY, type);
  return (
    <LandingPageFrame
      {...frame}
      customization={customization}
      title="NEXUS 2026 — Where Ideas Become Experiences"
      sourceUrl="/landing-pages/kage.html"
      onMessage={props.onMessage}
    />
  );
}
