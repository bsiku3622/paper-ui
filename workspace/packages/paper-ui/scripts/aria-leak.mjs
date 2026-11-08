const LEAK = /@react-(?:aria|stately|types)\b|\breact-(?:aria|stately)(?:-components)?\b/;

export const ariaLeaks = (file, code) =>
  code.split("\n").flatMap((line, index) => (LEAK.test(line) ? [`${file}:${index + 1}: ${line.trim()}`] : []));
