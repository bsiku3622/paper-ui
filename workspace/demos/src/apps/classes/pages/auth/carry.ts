// One parameter of the address follows a visitor through the sign-in redirect: ?google=, which says what the Google step
// starts in. Nothing else is carried; an ordinary sign-in goes to the app's home with a clean address.

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
