import type { Metadata } from "next"
import { WorkTree } from "@/components/work/WorkTree"

export const metadata: Metadata = {
  title: "Work — Manuel David",
  description:
    "The roles that filled the hours: Founding Engineer at Configure, founder of Paradigm, and the freelance years before.",
}

export default function WorkPage() {
  return (
    <div className="mt-8 sm:mt-12">
      <WorkTree />
    </div>
  )
}
