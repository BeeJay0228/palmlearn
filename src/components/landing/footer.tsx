"use client";

import Link from "next/link";
import { APP_NAME, COMPANY_NAME, APP_TAGLINE } from "@/constants";
import { GraduationCap } from "lucide-react";
import { MotionDiv } from "@/components/shared/motion-div";

const footerLinks = {
  Product: ["Features", "Pricing", "Integrations", "Changelog"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Documentation", "API Reference", "Help Center", "Community"],
  Legal: ["Privacy", "Terms", "Security", "Cookies"],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface-secondary/50">
      <div className="container-site py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <MotionDiv animation="fadeIn">
              <Link href="/" className="flex items-center gap-3 group mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-content">
                  {APP_NAME}
                </span>
              </Link>
              <p className="text-sm text-content-secondary leading-relaxed max-w-xs">
                {APP_TAGLINE}. Built for {COMPANY_NAME}.
              </p>
            </MotionDiv>
          </div>

          {Object.entries(footerLinks).map(([category, links], index) => (
            <div key={category}>
              <MotionDiv animation="fadeIn" delay={0.1 * index}>
                <h4 className="text-sm font-semibold text-content mb-4">
                  {category}
                </h4>
                <ul className="flex flex-col gap-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-content-secondary hover:text-content transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </MotionDiv>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-content-tertiary">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-content-tertiary hover:text-content transition-colors">
              Twitter
            </a>
            <a href="#" className="text-sm text-content-tertiary hover:text-content transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-sm text-content-tertiary hover:text-content transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
