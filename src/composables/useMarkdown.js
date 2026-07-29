import { marked } from "marked";

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderer = new marked.Renderer();
renderer.code = ({ text }) =>
  `<pre class="code-block" dir="ltr"><code>${escapeHtml(text)}</code></pre>`;
renderer.link = ({ href, title, text }) =>
  `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(title)}">${text}</a>`;

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
});

const blockedTags = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "textarea",
  "select",
  "meta",
  "link",
  "base",
];

const sanitizeUrl = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized.startsWith("javascript:") && !normalized.startsWith("data:text/html");
};

const sanitizeHtml = (html) => {
  if (typeof DOMParser === "undefined") return html;

  const documentNode = new DOMParser().parseFromString(html, "text/html");
  documentNode.querySelectorAll(blockedTags.join(",")).forEach((node) => node.remove());

  documentNode.body.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (
        name.startsWith("on") ||
        name === "srcdoc" ||
        (["href", "src", "xlink:href"].includes(name) && !sanitizeUrl(attribute.value))
      ) {
        element.removeAttribute(attribute.name);
      }
    });

    if (element.tagName === "A") {
      element.setAttribute("rel", "noopener noreferrer");
      if (!element.getAttribute("target")) element.setAttribute("target", "_blank");
    }
  });

  return documentNode.body.innerHTML;
};

export function useMarkdown() {
  const parseMarkdown = (text) => {
    if (!text) return "";
    return sanitizeHtml(marked.parse(text));
  };

  return { parseMarkdown };
}
