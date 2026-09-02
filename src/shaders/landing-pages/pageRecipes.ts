import {
  GEIST,
  INSTRUMENT_SERIF,
  NEWSREADER,
  type PageFont,
  type PageTypographyRecipe,
} from "./pageTypography";

const n = (value: number) => Number(value.toFixed(3));
const px = (value: number) => `${n(value)}px`;

const ONEST: PageFont = {
  value: "onest",
  label: "Onest",
  stack: "'Onest', system-ui, -apple-system, 'Helvetica Neue', sans-serif",
  google: "Onest:wght@300;400;500;600;700;800",
};

const PLUS_JAKARTA: PageFont = {
  value: "plus-jakarta-sans",
  label: "Plus Jakarta Sans",
  stack: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  google: "Plus+Jakarta+Sans:wght@300;400;500;600;700;800",
};

const INTER_TIGHT: PageFont = {
  value: "inter-tight",
  label: "Inter Tight",
  stack: "'Inter Tight', -apple-system, BlinkMacSystemFont, sans-serif",
  google: "Inter+Tight:wght@300;400;500;600;700",
};

const SPACE_GROTESK: PageFont = {
  value: "space-grotesk",
  label: "Space Grotesk",
  stack: '"Space Grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif',
  google: "Space+Grotesk:wght@400;500;600;700",
};

export const KAGE_TYPOGRAPHY: PageTypographyRecipe = {
  headingFonts: [ONEST, PLUS_JAKARTA, SPACE_GROTESK, GEIST, INSTRUMENT_SERIF, NEWSREADER],
  bodyFonts: [ONEST, PLUS_JAKARTA, GEIST, INTER_TIGHT, NEWSREADER],
  headingWeights: ["400", "500", "600", "700", "800"],
  headingWeight: "400",
  bodyWeights: ["300", "400", "500", "600"],
  bodyWeight: "500",
  primaryColor: "#e0231c",
  headingSize: [30, 46, 72],
  bodySize: [13, 17, 24],
  headingLetterSpacing: [-0.06, -0.012, 0.12],
  css: (type) => `
:root {
  --vermilion: ${type.primary};
  --ember: ${type.retone("#ff5a3c")};
}
body { font-family: ${type.body}; }
body, .body, .body-lg, .num { font-weight: ${type.bodyWeight}; }
h1, h2, h3, h4, .display {
  font-family: ${type.heading};
  font-weight: ${type.headingWeight};
}
.display { letter-spacing: ${type.headingLetterSpacing}em; }
.h-hero { font-size: clamp(28px, 3.2vw, ${px(type.headingSize)}); }
.h-sec { font-size: clamp(30px, 4vw, ${px((type.headingSize * 60) / 46)}); }
.body-lg { font-size: clamp(14px, 1.02vw, ${px(type.bodySize)}); }
.body { font-size: ${px(Math.max(11, type.bodySize - 3))}; }
.btn-primary, .cta-primary { background: ${type.primary} !important; border-color: ${type.primary} !important; }
.accent-glow { text-shadow: 0 0 20px ${type.retoneRgba("rgba(224,35,28,0.6)")}; }
`,
};
