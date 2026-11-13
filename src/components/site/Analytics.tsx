import Script from "next/script";
import * as cheerio from "cheerio";
import type { SiteSettings } from "@/lib/types";

/** Renders admin-pasted HTML snippets (meta, link, script tags) in a way that actually executes. */
function CustomCode({ html, id }: { html: string; id: string }) {
  if (!html?.trim()) return null;
  const $ = cheerio.load(html, null, false);
  const nodes: React.ReactNode[] = [];
  $.root()
    .children()
    .each((i, el) => {
      const tag = (el as unknown as { tagName: string }).tagName?.toLowerCase();
      const attrs = { ...$(el).attr() } as Record<string, string>;
      if (tag === "script") {
        const src = attrs.src;
        if (src) nodes.push(<Script key={i} id={`${id}-${i}`} src={src} strategy="afterInteractive" />);
        else nodes.push(<Script key={i} id={`${id}-${i}`} strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: $(el).html() || "" }} />);
      } else if (tag === "noscript") {
        nodes.push(<noscript key={i} dangerouslySetInnerHTML={{ __html: $(el).html() || "" }} />);
      } else {
        nodes.push(<div key={i} hidden dangerouslySetInnerHTML={{ __html: $.html(el) }} />);
      }
    });
  return <>{nodes}</>;
}

export default function Analytics({ settings }: { settings: SiteSettings }) {
  const { ga4Id, gtmId, metaPixelId, headCode, bodyCode } = settings.scripts;
  const safe = (v: string) => v.replace(/[^\w-]/g, "");
  return (
    <>
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${safe(gtmId)}');`}
        </Script>
      )}
      {ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${safe(ga4Id)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${safe(ga4Id)}');`}
          </Script>
        </>
      )}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${safe(metaPixelId)}');fbq('track','PageView');`}
        </Script>
      )}
      <CustomCode html={headCode} id="head-code" />
      <CustomCode html={bodyCode} id="body-code" />
    </>
  );
}
