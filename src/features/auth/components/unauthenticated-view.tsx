import React from "react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ShieldAlertIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const UnauthenticatedView = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="bg-muted max-w-lg w-full">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <ShieldAlertIcon />
          </ItemMedia>

          <ItemContent>
            <ItemTitle>Unautorized Access</ItemTitle>

            <ItemDescription>
              You are not authorized to access this page. Please login to
              continue.
            </ItemDescription>
          </ItemContent>

          <ItemActions>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </ItemActions>
        </Item>
      </div>
    </div>
  );
};

export default UnauthenticatedView;
