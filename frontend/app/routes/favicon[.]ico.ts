import { readFileSync } from 'fs';
import { join } from 'path';

export function loader() {
  try {
    const faviconPath = join(process.cwd(), 'public/favicon.ico');
    const favicon = readFileSync(faviconPath);
    return new Response(favicon, {
      headers: {
        'Content-Type': 'image/x-icon',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
