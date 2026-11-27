export const moduleQueryKeys = {
  root: ["modules"] as const,
  forOrganization: (organizationId: string) =>
    [...moduleQueryKeys.root, organizationId] as const,
};
