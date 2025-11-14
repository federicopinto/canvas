/**
 * Export SVG to PNG
 */
export const exportToPNG = (svgElement: SVGSVGElement, filename: string = 'canvas.png') => {
  try {
    // Clone the SVG
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

    // Get SVG dimensions
    const bbox = svgElement.getBoundingClientRect();
    const width = bbox.width;
    const height = bbox.height;

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);

    // Create blob from SVG string
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Create image from SVG blob
    const img = new Image();
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x for better quality
      canvas.height = height * 2;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scale for better quality
      ctx.scale(2, 2);

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Convert canvas to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = pngUrl;
        link.click();

        // Cleanup
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };

    img.src = url;
  } catch (error) {
    console.error('Failed to export PNG:', error);
  }
};
