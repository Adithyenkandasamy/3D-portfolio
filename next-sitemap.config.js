const nextConfig = {
  // Other configurations...
  async head() {
    return [
      {
        key: 'google-site-verification',
        value: 'google3642497c24a7cca8.html',
      },
    ];
  },
  siteUrl: 'https://adhii-portfolio.netlify.app',
  generateRobotsTxt: true,
};

export default nextConfig;
