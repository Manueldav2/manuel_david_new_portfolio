import type { Metadata } from "next"
import { ProjectsWall } from "@/components/projects/ProjectsWall"

export const metadata: Metadata = {
  title: "Projects — Manuel David",
  description:
    "The things I build when no one asks: shipped products, open-source tools, and live experiments. A filterable wall of everything Manuel David has made.",
}

export default function ProjectsPage() {
  return (
    <div className="mt-8 sm:mt-12">
      <ProjectsWall />
    </div>
  )
}
