export const APP_NAME = "PalmLearn";
export const APP_TAGLINE = "Enterprise Learning Platform";
export const APP_DESCRIPTION =
  "PalmLearn empowers organizations to create, deliver, and track learning experiences at scale. Built for PalmPay and designed for the modern enterprise.";

export const APP_URL = "https://palmlearn.io";
export const COMPANY_NAME = "PalmPay";

export const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Platform", href: "#platform" },
  { label: "Enterprise", href: "#enterprise" },
] as const;

export const FEATURES = [
  {
    title: "Course Authoring",
    description:
      "Drag-and-drop course builder with rich media support. Create engaging learning experiences in minutes, not weeks.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Smart Assessments",
    description:
      "Adaptive assessments that measure true comprehension. AI-powered grading with instant feedback loops.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Learning Paths",
    description:
      "Structured learning journeys with milestones and achievements. Guide learners from novice to expert.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Analytics Dashboard",
    description:
      "Real-time insights into learner progress, engagement metrics, and content effectiveness across your organization.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Certification Engine",
    description:
      "Automated certificate generation with blockchain verification. Industry-standard compliance tracking.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    title: "Enterprise SSO",
    description:
      "Seamless integration with your identity provider. SAML, OAuth, OpenID Connect — we support them all.",
    gradient: "from-cyan-500 to-sky-500",
  },
] as const;

export const THEME_STORAGE_KEY = "palmlearn-theme";

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;
