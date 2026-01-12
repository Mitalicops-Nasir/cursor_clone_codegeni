import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

export const useProject = (projectId: Id<"projects">) => {
  return useQuery(api.projects.getById, { id: projectId });
};

export const useProjects = () => {
  return useQuery(api.projects.get);
};

export const useProjectsPartial = (limit: number) => {
  return useQuery(api.projects.getPartial, { limit: limit });
};

export const useCreateProject = () => {
  //const { userId } = useAuth();

  // So this "withOptimisticUpdate" Optimitically updates UI immediately before server comfirms -
  // adds the new message to local state so it appears instantly while mutation processes
  return useMutation(api.projects.create).withOptimisticUpdate(
    (localStore, args) => {
      const existingProjects = localStore.getQuery(api.projects.get);

      if (existingProjects !== undefined) {
        const now = Date.now();

        const newProject = {
          _id: crypto.randomUUID() as Id<"projects">,
          _creationTime: now,
          name: args.name,
          ownerId: "anonymous",
          updatedAt: now,
        };

        localStore.setQuery(api.projects.get, {}, [
          newProject,
          ...existingProjects,
        ]);
      }
    }
  );
};

export const useRenameProject = (projectId: Id<"projects">) => {
  //const { userId } = useAuth();

  // So this "withOptimisticUpdate" Optimitically updates UI immediately before server comfirms -
  // adds the new message to local state so it appears instantly while mutation processes
  return useMutation(api.projects.rename).withOptimisticUpdate(
    (localStore, args) => {
      const existingProject = localStore.getQuery(api.projects.getById, {
        id: projectId,
      });

      if (existingProject !== undefined && existingProject !== null) {
        const now = Date.now();
        localStore.setQuery(
          api.projects.getById,
          { id: projectId },
          {
            ...existingProject,
            name: args.name,
            updatedAt: now,
          }
        );
      }

      const existingProjects = localStore.getQuery(api.projects.get);

      if (existingProjects !== undefined) {
        localStore.setQuery(
          api.projects.get,
          {},
          existingProjects.map((project) => {
            if (project._id === args.id) {
              return {
                ...project,
                name: args.name,
                updatedAt: Date.now(),
              };
            }
            return project;
          })
        );
      }
    }
  );
};
