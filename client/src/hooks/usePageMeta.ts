import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
}

const DEFAULT_OG_IMAGE = "/opengraph.jpg";

function setMetaContent(nameAttr: string, name: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${nameAttr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(nameAttr, name);
    document.head.appendChild(el);
  }
  el.content = value;
}

function setLinkHref(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function usePageMeta({ title, description, ogImage }: PageMeta) {
  useEffect(() => {
    document.title = title;

    const image = ogImage ?? DEFAULT_OG_IMAGE;
    const canonical = window.location.origin + window.location.pathname;

    setMetaContent("name", "description", description);
    setMetaContent("property", "og:title", title);
    setMetaContent("property", "og:description", description);
    setMetaContent("property", "og:image", image);
    setMetaContent("property", "og:url", canonical);
    setMetaContent("property", "og:type", "website");
    setMetaContent("name", "twitter:card", "summary_large_image");
    setMetaContent("name", "twitter:title", title);
    setMetaContent("name", "twitter:description", description);
    setMetaContent("name", "twitter:image", image);
    setLinkHref("canonical", canonical);
  }, [title, description, ogImage]);
}
