import { LandingHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <LandingFooter />
    </>
  );
}
