const CARRIED = ["google"] as const;

export const carried = (params: URLSearchParams) => {
  const out = new URLSearchParams();
  for (const key of CARRIED) {
    const value = params.get(key);
    if (value !== null) out.set(key, value);
  }
  const text = out.toString();
  return text ? `?${text}` : "";
};
