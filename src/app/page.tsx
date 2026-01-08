"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import ProjectsView from "@/features/projects/components/projects-view";

const Home = () => {
  return (
    <div>
      <ProjectsView />
    </div>
  );
};

export default Home;
