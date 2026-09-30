# Artes de identidade e compartilhamento

Criadas com a ferramenta integrada `imagegen`, usando o ícone colorido oficial de `img/new` como referência. Os arquivos gerados foram convertidos para os tamanhos de uso no site.

## Ícone

Arquivos: `icon-40plus.png` (512 × 512), `apple-touch-icon.png` (180 × 180), `favicon-32.png` (32 × 32) e `/favicon.ico` (16, 32, 48 e 64 pixels).

Prompt utilizado:

> Use case: logo-brand. Asset type: website favicon and app touch icon for Empreender 40+. Create a square 1024x1024 production icon, flat graphic artwork, full bleed very dark background #101013. Center the exact text "40+" in bold filled geometric sans-serif numerals, large enough to occupy around 84% of the width with generous edge safety. Thick clear strokes for legibility at 16 and 32 pixels. Use a clean cyan-to-royal-blue-to-violet gradient across the filled text. The plus sign must be distinct and legible. Use the supplied official 40+ icon as brand inspiration for the shape and gradient, while simplifying for tiny favicon legibility. Crisp edges. No other words, no outline-only thin strokes, no people, no mockup, no 3D, no shadows, no watermark. Output one square icon only.

## Banner

Arquivo: `../social/empreender40plus-share.jpg` (1200 × 630).

Prompt utilizado:

> Use case: ads-marketing. Asset type: Open Graph social sharing banner for the Brazilian website Movimento Empreender 40+, usable on WhatsApp and social networks. Create one polished flat editorial banner, wide 1.905:1 aspect ratio, ideally 1280x672 pixels, designed to downsample to 1200x630. Style: premium contemporary typographic brand graphic following the site's black #101013 background, bright cyan #20cfff, royal blue #3152e9 and violet/purple #b000f8. Use supplied official 40+ logo as brand reference, keeping recognizable 40+ form. Composition: left half has a white brand line "empreender" above a dominant bold solid gradient "40+". Beneath, a generously readable white tagline split naturally into two lines: "Experiência é" / "ponto de partida.". Bottom left small readable label "MOVIMENTO EMPREENDER 40+". Right third is abstract restrained large outline 40+ geometry, subtle blue and purple ambient glow and a few small plus-sign motifs. Use confident geometric sans-serif typography similar to Montserrat. Keep all meaningful text in a central safe area with at least 8% padding from each edge. Exact text only: "empreender", "40+", "Experiência é", "ponto de partida.", "MOVIMENTO EMPREENDER 40+". Crisp and highly readable, no extra claims, no website URL, no phone numbers, no people or fabricated event photos, no mockup, no watermark, no 3D. Output just the finished banner.

## Publicação

As referências ao favicon e à imagem de compartilhamento estão no `index.html`. O endereço público da página ainda precisa ser informado para trocar `og:image` e `twitter:image` por URLs absolutas e acrescentar `og:url` e a URL canônica.
