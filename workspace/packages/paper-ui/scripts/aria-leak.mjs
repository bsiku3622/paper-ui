// A bundled declaration must not name React Aria, React Stately or their shared types: the public types are Paper's own.
const LEAK = /@react-(?:aria|stately|types)\b|\breact-(?:aria|stately)(?:-components)?\b/;

// The lines of a declaration file that name one, as `file:line: text`.
export const ariaLeaks = (file, code) =>
  code.split("\n").flatMap((line, index) => (LEAK.test(line) ? [`${file}:${index + 1}: ${line.trim()}`] : []));
