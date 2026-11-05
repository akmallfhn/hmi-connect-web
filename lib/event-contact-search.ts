export async function loadEventContactUserOptions(query: string, page: number) {
  try {
    const params = new URLSearchParams({ q: query, page: String(page) });
    const response = await fetch(`/api/users/search?${params}`);
    if (!response.ok) return { options: [], hasMore: false };
    const result = await response.json() as {
      data?: { id: string; full_name: string; username?: string; avatar?: string }[];
      hasMore?: boolean;
    };
    return {
      options: (result.data ?? []).map((user) => ({
        label: user.username ? `${user.full_name} (@${user.username})` : user.full_name,
        value: user.id,
        image: user.avatar,
      })),
      hasMore: Boolean(result.hasMore),
    };
  } catch {
    return { options: [], hasMore: false };
  }
}
