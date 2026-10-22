import "server-only";

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

export default function ServerQueryHydration({
  queryKey,
  data,
  children,
}: {
  queryKey: QueryKey;
  data: unknown;
  children: ReactNode;
}) {
  const client = new QueryClient();
  if (data !== undefined) client.setQueryData(queryKey, data);
  return (
    <HydrationBoundary state={dehydrate(client)}>{children}</HydrationBoundary>
  );
}
