import { marked } from "marked";

const renderer = new marked.Renderer();
renderer.code = ({ text, lang }) => {
  return `<pre class="code-block" dir="ltr"><code>${text}</code></pre>`;
};
renderer.link = ({ href, title, text }) => {
  return `<a href="${href}" target="_blank" title="${title || ""}">${text}</a>`;
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  breaks: true,
});

export function useMarkdown() {
  const parseMarkdown = (text) => {
    if (!text) return "";
    return marked(text);
  };
  return { parseMarkdown };
}
