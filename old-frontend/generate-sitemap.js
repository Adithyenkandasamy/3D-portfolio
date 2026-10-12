import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import { resolve } from 'path';

async function generateSitemap() {
  const sitemap = new SitemapStream({ hostname: 'https://adhii-portfolio.netlify.app' });
  
  // Add your routes here
  const routes = [
    { url: '/', changefreq: 'monthly', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.8 },
    { url: '/projects', changefreq: 'monthly', priority: 0.8 },
    { url: '/contact', changefreq: 'monthly', priority: 0.8 },
  ];

  // Write sitemap
  const writeStream = createWriteStream(resolve('./public/sitemap.xml'));
  sitemap.pipe(writeStream);

  routes.forEach(route => {
    sitemap.write(route);
  });

  sitemap.end();

  await streamToPromise(sitemap);
  console.log('✅ Sitemap generated successfully!');
}

generateSitemap().catch(console.error);
