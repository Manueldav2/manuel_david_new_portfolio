import type { Metadata } from "next";
import { PlaygroundHero } from "@/components/hero-play/PlaygroundHero";

export const metadata: Metadata = {
  title: "Playground / Manuel David",
  description:
    "Redesign experiment 3: his name as eleven physical blocks you can grab, throw and knock over.",
};

export default function Page() {
  return <PlaygroundHero />;
}
