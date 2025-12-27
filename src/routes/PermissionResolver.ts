import { RoutePermissionMap } from "./RoutePermissionMap";

export const resolveRequiredModule = (pathname: string): string | null => {
  const matchedRoute = Object.keys(RoutePermissionMap)
    .sort((a, b) => b.length - a.length) // longest match first
    .find(route => pathname.startsWith(route));

  return matchedRoute ? RoutePermissionMap[matchedRoute] : null;
};
