import { createContext, useContext } from "react";

import type { ControlShape } from "../../tokens";

export const ControlShapeContext = createContext<ControlShape | undefined>(undefined);

export const useControlShape = (shape: ControlShape | undefined, fallback: ControlShape): ControlShape => {
  const app = useContext(ControlShapeContext);
  return shape ?? app ?? fallback;
};
