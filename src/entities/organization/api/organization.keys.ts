export const organizationQueryKeys = {
  root: ["organizations"] as const,
  mine: () => [...organizationQueryKeys.root, "mine"] as const,
  bySlug: (slug: string) => [...organizationQueryKeys.root, "slug", slug] as const,
};
