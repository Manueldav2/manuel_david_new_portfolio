import type { Metadata } from "next";
import { SpecSheet } from "@/components/hero-spec/SpecSheet";

export const metadata: Metadata = {
  title: "Manuel David · Spec sheet",
  description:
    "Founding Engineer at Configure, building context infrastructure for AI agents. A homepage set as a technical specification document.",
};

export default function SpecSheetPage() {
  return <SpecSheet />;
}
