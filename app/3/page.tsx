import type { Metadata } from "next";
import { PlaygroundHero } from "@/components/hero-play/PlaygroundHero";

export const metadata: Metadata = {
  title: "Manuel David",
  description:
    "Founding engineer at Configure. Dropped out, moved to San Francisco, and builds the context infrastructure AI agents will run on. Two companies of his own and thirty-plus things he built because he wanted them to exist.",
};

export default function Page() {
  return <PlaygroundHero />;
}
