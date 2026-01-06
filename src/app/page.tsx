"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

const page = () => {
  const projects = useQuery(api.projects.get);
  const createProject = useMutation(api.projects.create)

  return (
    <div className="flex flex-col gap-2 items-center">
      <Button onClick={() => createProject({
        name: "New Project"

      })}>
        Add new
      </Button>
      {projects?.map((project) => (
        <div
          className="border-2 p-3 rounded-lg flex justify-center"
          key={project._id}
        >
          <p> {project.name}</p>

          <p>OwnerId: {project.ownerId}</p>
        </div>
      ))}
    </div>
  );
};

export default page;
