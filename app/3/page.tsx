import type { Metadata } from "next";
import { PlaygroundHero } from "@/components/hero-play/PlaygroundHero";

export const metadata: Metadata = {
  title: "Playground / Manuel David",
  description:
    "Redesign experiment 3: one physical table you scroll down. His name lands as eleven blocks, then his work and his projects fall onto the mats after it, and all of it stays throwable.",
};

export default function Page() {
  return <PlaygroundHero />;
}
