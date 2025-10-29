import { useState } from 'react';

const ResumeButton = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const googleDriveLink = "https://drive.google.com/file/d/1KC1MhrBlyxFwA-NPox5NU3a_MKSD51vj/view?usp=sharing";
  const fileName = "Adithyen_Resume.pdf";

  const getDirectDownloadLink = (driveLink) => {
    const fileIdMatch = driveLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return driveLink;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const directLink = getDirectDownloadLink(googleDriveLink);
      const link = document.createElement('a');
      link.href = directLink;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <a
      href={getDirectDownloadLink(googleDriveLink)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        handleDownload();
      }}
      className="text-black hover:text-gray-700 cursor-pointer transition-colors font-medium"
    >
      {isDownloading ? 'Opening...' : 'View my Resume'}
    </a>
  );
};

export default ResumeButton;
