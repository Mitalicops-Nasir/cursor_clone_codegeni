"use client";

import ConversationSidebar from "@/features/conversations/components/ConversationSidebar";
import { Id } from "../../../../convex/_generated/dataModel";
import Navbar from "./Navbar";



import { Allotment } from "allotment";

const MIN_SIDEBAR_WIDTH = 300;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 400;
const DEFAULT_MAIN_SIZE = 1000;

const ProjectIdLayout = ({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: Id<"projects">;
}) => {
  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar projectId={projectId} />

      <div className="flex flex-1 overflow-hidden">
        <Allotment
          className="flex flex-1"
          defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
        >
          <Allotment.Pane
            snap
            minSize={MIN_SIDEBAR_WIDTH}
            maxSize={MAX_SIDEBAR_WIDTH}
            preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
          >
            <ConversationSidebar projectId={projectId} />
          </Allotment.Pane>

          <Allotment.Pane>{children}</Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
};

export default ProjectIdLayout;
