// Small text helpers: a LaTeX-to-plain-characters converter (there is no KaTeX here) and the document statistics the
// status bar shows, counted as the original counts them (document.ts).

const GREEK: Record<string, string> = {
  alpha: "α", beta: "β", gamma: "γ", delta: "δ", epsilon: "ε", varepsilon: "ε", zeta: "ζ", eta: "η", theta: "θ", iota: "ι", kappa: "κ", lambda: "λ", mu: "μ", nu: "ν", xi: "ξ",
  pi: "π", rho: "ρ", sigma: "σ", tau: "τ", upsilon: "υ", phi: "φ", varphi: "φ", chi: "χ", psi: "ψ", omega: "ω",
  Gamma: "Γ", Delta: "Δ", Theta: "Θ", Lambda: "Λ", Xi: "Ξ", Pi: "Π", Sigma: "Σ", Phi: "Φ", Psi: "Ψ", Omega: "Ω",
};

const SYMBOLS: Record<string, string> = {
  times: "×", cdot: "·", pm: "±", mp: "∓", div: "÷", le: "≤", leq: "≤", ge: "≥", geq: "≥", ne: "≠", neq: "≠", approx: "≈", sim: "∼", equiv: "≡", propto: "∝",
  to: "→", rightarrow: "→", leftarrow: "←", Rightarrow: "⇒", Leftarrow: "⇐", leftrightarrow: "↔", infty: "∞", partial: "∂", nabla: "∇", sum: "∑", prod: "∏", int: "∫",
  hbar: "ℏ", degree: "°", circ: "°", in: "∈", cdots: "⋯", ldots: "…", dots: "…", quad: "  ", qquad: "    ", ",": " ", ";": " ", "!": "", forall: "∀", exists: "∃", cup: "∪", cap: "∩",
};

// Combining marks: \dot{x} is x with a dot over it.
const ACCENTS: Record<string, string> = { dot: "̇", ddot: "̈", hat: "̂", bar: "̅", vec: "⃗", tilde: "̃" };

const SUPER: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", n: "ⁿ", i: "ⁱ" };
const SUB: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎", a: "ₐ", e: "ₑ", o: "ₒ", x: "ₓ", i: "ᵢ", j: "ⱼ", n: "ₙ", m: "ₘ", k: "ₖ", p: "ₚ", s: "ₛ", t: "ₜ" };

const group = (src: string, at: number): { body: string; end: number } => {
  if (src[at] !== "{") return { body: src[at] ?? "", end: at + 1 };
  let depth = 0;
  for (let j = at; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}" && --depth === 0) return { body: src.slice(at + 1, j), end: j + 1 };
  }
  return { body: src.slice(at + 1), end: src.length };
};

const script = (body: string, table: Record<string, string>, mark: string): string => {
  const chars = Array.from(body);
  return chars.every((c) => table[c] !== undefined) ? chars.map((c) => table[c]!).join("") : body.length === 1 ? `${mark}${body}` : `${mark}(${body})`;
};

// \frac{a}{b} becomes a/b, x^2 becomes x², \sqrt{L/g} becomes √(L/g), \alpha becomes α.
export const tex = (src: string): string => {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i]!;
    if (c === "\\") {
      const m = /^\\([A-Za-z]+|.)/.exec(src.slice(i));
      const name = m?.[1] ?? "";
      i += 1 + name.length;
      // TeX drops the spaces after a command word; here they go only where a letter or a brace follows ("\Delta V" is ΔV),
      // and stay before an operator ("\theta = 0").
      if (/^[A-Za-z]+$/.test(name)) {
        const spaces = /^ +(?=[A-Za-z0-9\\{])/.exec(src.slice(i));
        if (spaces) i += spaces[0].length;
      }
      if (name === "frac" || name === "dfrac") {
        const top = group(src, i);
        const bottom = group(src, top.end);
        const wrap = (s: string) => (/^[\p{L}\p{N}.]+$/u.test(s) ? s : `(${s})`);
        out += `${wrap(tex(top.body))}/${wrap(tex(bottom.body))}`;
        i = bottom.end;
        // A thin space keeps "g/L" apart from the letter that follows it.
        if (/[\p{L}\p{N}\\(]/u.test(src[i] ?? "")) out += " ";
      } else if (name === "sqrt") {
        const body = group(src, i);
        const inner = tex(body.body);
        out += /^[\p{L}\p{N}]$/u.test(inner) ? `√${inner}` : `√(${inner})`;
        i = body.end;
      } else if (name === "text" || name === "mathrm" || name === "mathbf" || name === "operatorname" || name === "mathit" || name === "textbf") {
        const body = group(src, i);
        out += body.body;
        i = body.end;
      } else if (name === "left" || name === "right") {
        if (src[i] === ".") i++;
      } else if (name === "\\") {
        out += " ";
      } else if (ACCENTS[name]) {
        const body = group(src, i);
        out += tex(body.body) + ACCENTS[name];
        i = body.end;
      } else if (GREEK[name]) out += GREEK[name];
      else if (SYMBOLS[name] !== undefined) out += SYMBOLS[name];
      else out += name;
      continue;
    }
    if (c === "^" || c === "_") {
      const body = group(src, i + 1);
      out += script(tex(body.body), c === "^" ? SUPER : SUB, c);
      i = body.end;
      continue;
    }
    if (c === "{" || c === "}") {
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
};

// Words, lines, characters with and without spaces, of a text whose blocks are told apart by a line break.
export const statistics = (text: string) => {
  const chars = Array.from(text);
  return {
    words: text.trim() ? text.trim().split(/\s+/u).length : 0,
    lines: text ? text.split("\n").length : 0,
    chars: chars.length,
    compact: chars.filter((c) => !/\s/u.test(c)).length,
  };
};
