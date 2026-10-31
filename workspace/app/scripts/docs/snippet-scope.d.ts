// The sample values a docs snippet may use without declaring them. Each one is a stand-in for a value the text
// of the docs names, so a snippet that uses a name the docs never state fails to compile.
declare const close: () => void;
declare const invalid: boolean;
declare const save: () => void;
declare const selected: boolean;
declare const setSelected: (value: boolean) => void;
declare const alignment: string[];
declare const setAlignment: (values: string[]) => void;
declare const dialogClass: string;
declare const pressProps: Record<string, unknown>;
declare const focusProps: Record<string, unknown>;
declare const localRef: import("react").RefObject<HTMLElement | null>;
declare const forwardedRef: import("react").Ref<HTMLElement>;
declare const PanelContents: import("react").ComponentType;
declare const log: () => void;
declare const saved: boolean;
declare const current: string;
declare const id: string;
declare const dialogHost: HTMLElement;
type PinProps = import("react").ComponentProps<"input"> & { status?: import("@studio-baeks/paper-ui/tokens").Status };
