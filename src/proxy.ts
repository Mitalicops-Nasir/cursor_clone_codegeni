import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/api/inngest(.*)"]);

// This is a middleware that will protect all routes except public routes and below
// the code will be executed if the route is not public it will redirect to the sign in page
// you can use tradtional warning to user if they arent
// logged in by giving em a button to go tot sign in page or u can use this below approach of reidrecting

//export default clerkMiddleware(async (auth, req) => {
//if (!isPublicRoute(req)) {
//await auth.protect();
//}
//});

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
