/**
 * LaTeX 인라인 구분자 \\( … \\) 를 $ … $ 로 바꿉니다 (AutoMathRenderer 분기와 호환).
 */
export function convertLatexParenDelimiters(str) {
  const s = String(str);
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && s[i + 1] === "(") {
      let depth = 1;
      let j = i + 2;
      while (j < s.length && depth > 0) {
        if (s[j] === "\\" && j + 1 < s.length) {
          if (s[j + 1] === "(") {
            depth += 1;
            j += 2;
          } else if (s[j + 1] === ")") {
            depth -= 1;
            j += 2;
          } else {
            j += 1;
          }
        } else {
          j += 1;
        }
      }
      if (depth === 0) {
        const inner = s.slice(i + 2, j - 2);
        out += `$${inner}$`;
        i = j;
        continue;
      }
      out += s.slice(i);
      break;
    }
    out += s[i];
    i += 1;
  }
  return out;
}

export function normalizeLatexText(text) {
  if (!text) return "";
  const strText = String(text);
  if (!/\$\$|\\\[|\$/.test(strText) && strText.includes("\\text{")) {
    const parts = strText.split(/\\text{([^}]+)}/g);
    let result = "";
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        const mathPart = parts[i].trim();
        if (mathPart) result += ` $${mathPart}$ `;
      } else {
        result += parts[i];
      }
    }
    return result.replace(/\s+/g, " ").trim();
  }
  return strText;
}
