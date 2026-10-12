  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App.jsx';
  import './index.css';
  import { Helmet } from 'react-helmet-async';
  import { LazyLoadImage } from 'react-lazy-load-image-component';

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

  function PortfolioPage() {
    return (
      <>
        <Helmet>
          {/* Title and Meta Tags for SEO */}
          <title>Adithyen | Full Stack Developer Portfolio</title>
          <meta name="description" content="Portfolio of Adithyen, a full stack developer skilled in modern web technologies." />
          <meta name="keywords" content="Full Stack Developer, Adithyen, Adithyen Portfolio, Web Developer" />

          {/* Open Graph Tags for Social Media */}
          <meta property="og:title" content="Adithyen | Full Stack Developer Portfolio" />
          <meta property="og:description" content="Portfolio of Adithyen, showcasing full-stack development skills." />
          <meta property="og:image" content="URL_of_Your_Portfolio_Image" />
          <meta property="og:url" content="https://adhii-portfolio.netlify.app/" />

          {/* JSON-LD Structured Data for SEO */}
          <script type="application/ld+json">
          {`
            {
              "@context": "http://schema.org",
              "@type": "Person",
              "name": "Adithyen",
              "jobTitle": "Full Stack Developer",
              "url": "https://adhii-portfolio.netlify.app/",
              "sameAs": [
                "https://www.linkedin.com/in/adithyen",
                "https://github.com/adithyen"
              ]
            }
          `}
          </script>
        </Helmet>

        <LazyLoadImage src="your-image.jpg" alt="portfolio image" effect="blur" />

        
        <h1>Adithyen - Full Stack Developer</h1>
        <h2>Portfolio</h2>
        <p>Hi, I'm Adithyen, a full-stack developer with expertise in front-end and back-end technologies...</p>
      </>
    );
  }

  export default PortfolioPage;
