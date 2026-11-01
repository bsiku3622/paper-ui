// The Shape inspector's view of the source — every authored number and the recipes built from them.
// The Playground reads it as @paper-ui/inspect/shape and shows it; nothing in the package imports this
// directory.

export { CONTROL_ICON, SHAPE, SHAPE_SOURCE } from "../shape";
export { SHAPE_RECIPES } from "../shape-recipes";
// A role in dp over what the stylesheet emits, for the roles built on another system's variables (the control insets).
export { resolveRole } from "../resolve-dp";
