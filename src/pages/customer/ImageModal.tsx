import { useState, useEffect } from 'react';

interface ImageModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const ImageModal = ({ images, initialIndex = 0, isOpen, onClose, title }: ImageModalProps) => {
  images = images.slice(0, images.length);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setCurrentIndex(initialIndex);
      setImageLoaded(false);
    }
  }, [isOpen, initialIndex]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMounted(false);
      setImageLoaded(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setImageLoaded(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setImageLoaded(false);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    setImageLoaded(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen 
          ? 'bg-black/90 backdrop-blur-sm opacity-100' 
          : 'bg-black/0 backdrop-blur-0 opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-all duration-200 hover:scale-110"
      >
        <i className="fas fa-times text-2xl"></i>
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
          >
            <i className="fas fa-chevron-left text-xl"></i>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
          >
            <i className="fas fa-chevron-right text-xl"></i>
          </button>
        </>
      )}

      {/* Main Content */}
      <div 
        className={`relative max-w-7xl max-h-full w-full h-full flex flex-col transition-all duration-300 ${
          isOpen 
            ? 'scale-100 opacity-100' 
            : 'scale-95 opacity-0'
        }`}
      >
        {/* Image Counter */}
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Title */}
        {title && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 text-white px-4 py-2 rounded-lg text-sm max-w-md text-center">
            {title}
          </div>
        )}

        {/* Main Image */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-white text-2xl"></i>
              </div>
            )}
            <img
              src={images[currentIndex]}
              alt={`Property image ${currentIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-2">
            <div className="flex space-x-2 max-w-full overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 cursor-pointer w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === currentIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Download Button */}
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = images[currentIndex];
            link.download = `property-image-${currentIndex + 1}.jpg`;
            link.click();
          }}
          className="absolute bottom-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
        >
          <i className="fas fa-download"></i>
        </button>
      </div>
    </div>
  );
};

export default ImageModal;