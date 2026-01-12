import ProjectIdView from "@/features/projects/components/ProjectIdView";
import React from "react";
import { Id } from "../../../../convex/_generated/dataModel";

const page = async ({ params }: { params: Promise<{ projectId: Id<"projects"> }> }) => {
  const { projectId } = await params;
  return(
    <div>
        <ProjectIdView projectId={projectId}/>
    </div>
  ) 
};

export default page;
