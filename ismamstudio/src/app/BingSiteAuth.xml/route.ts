export const dynamic = "force-static";

export function GET() {
  const xml = `<?xml version="1.0"?>
<users>
	<user>B530E188B235862A751ADC8F22E93CB2</user>
</users>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
