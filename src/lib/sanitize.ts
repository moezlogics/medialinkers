import sanitizeHtml from "sanitize-html";

/** Clean HTML coming from the rich text editor before it is stored. */
export function cleanHtml(html = "") {
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img", "h1", "h2", "h3", "h4", "h5", "h6", "span", "mark", "u", "s", "sub", "sup",
      "iframe", "figure", "figcaption", "label", "input", "colgroup", "col", "div", "br", "hr",
    ],
    allowedAttributes: {
      "*": ["style", "class", "id", "data-type", "data-checked", "colspan", "rowspan", "colwidth"],
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title"],
      input: ["type", "checked", "disabled"],
      ol: ["start", "type"],
      td: ["colspan", "rowspan", "colwidth", "style"],
      th: ["colspan", "rowspan", "colwidth", "style"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^var\(--[\w-]+\)$/],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i],
        "text-align": [/^(left|right|center|justify)$/],
        "font-family": [/^[\w\s,'"-]+$/],
        "font-size": [/^\d+(\.\d+)?(px|em|rem|%)$/],
        width: [/^\d+(\.\d+)?(px|%)$/],
        "min-width": [/^\d+(\.\d+)?(px|%)$/],
      },
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com", "www.google.com"],
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href || "") && !attribs.href?.includes("medialinkers.pk");
        return {
          tagName,
          attribs: external && attribs.target === "_blank" ? { ...attribs, rel: "noopener noreferrer" } : attribs,
        };
      },
    },
  });
}

/** Strip everything but text. */
export function cleanText(s = "") {
  return sanitizeHtml(String(s), { allowedTags: [], allowedAttributes: {} }).trim();
}
