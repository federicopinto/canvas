import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './styles/global.css';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { ZoomIndicator } from './components/ZoomIndicator';
import { useCanvasStore } from './store/canvasStore';
import { calculateLayout, calculateFitToScreen } from './utils/layout';
import { exportToPNG } from './utils/export';
import { VIEWPORT, ANIMATION } from './utils/constants';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Store state
  const nodes = useCanvasStore((state) => state.nodes);
  const arrows = useCanvasStore((state) => state.arrows);
  const viewport = useCanvasStore((state) => state.viewport);
  const setNodes = useCanvasStore((state) => state.setNodes);
  const reset = useCanvasStore((state) => state.reset);
  const loadData = useCanvasStore((state) => state.loadData);

  // Load demo data on mount
  useEffect(() => {
    fetch('/demo-data.json')
      .then((res) => res.json())
      .then((data) => {
        loadData(data);
      })
      .catch((err) => {
        console.error('Failed to load demo data:', err);
      });
  }, [loadData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toolbar actions
  const handleAutoArrange = () => {
    if (nodes.length === 0) return;

    const layoutedNodes = calculateLayout(nodes, arrows);

    // Animate to new positions
    const startPositions = nodes.map((n) => n.position);
    const targetPositions = layoutedNodes.map((n) => n.position);
    const duration = ANIMATION.choreographed;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = d3.easeCubicInOut(progress);

      const interpolatedNodes = layoutedNodes.map((node, i) => ({
        ...node,
        position: {
          x: startPositions[i].x + (targetPositions[i].x - startPositions[i].x) * eased,
          y: startPositions[i].y + (targetPositions[i].y - startPositions[i].y) * eased,
        },
      }));

      setNodes(interpolatedNodes);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  const handleZoomIn = () => {
    const newScale = Math.min(viewport.scale + VIEWPORT.scaleStep, VIEWPORT.maxScale);
    animateZoom(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(viewport.scale - VIEWPORT.scaleStep, VIEWPORT.minScale);
    animateZoom(newScale);
  };

  const handleZoomReset = () => {
    animateZoom(VIEWPORT.defaultScale);
  };

  const animateZoom = (targetScale: number) => {
    const svg = document.querySelector('svg');
    if (!svg || !(svg as any).__zoom) return;

    const zoom = (svg as any).__zoom;
    const currentTransform = d3.zoomIdentity
      .translate(viewport.translateX, viewport.translateY)
      .scale(viewport.scale);

    // Zoom to center
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const scale = targetScale / viewport.scale;

    const newTransform = currentTransform
      .translate(centerX / viewport.scale, centerY / viewport.scale)
      .scale(scale)
      .translate(-centerX / targetScale, -centerY / targetScale);

    d3.select(svg)
      .transition()
      .duration(VIEWPORT.zoomDuration)
      .call(zoom.transform, newTransform);
  };

  const handleFitToScreen = () => {
    if (nodes.length === 0) return;

    const { scale, translateX, translateY } = calculateFitToScreen(
      nodes,
      dimensions.width,
      dimensions.height
    );

    const svg = document.querySelector('svg');
    if (!svg || !(svg as any).__zoom) return;

    const zoom = (svg as any).__zoom;
    const newTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

    d3.select(svg)
      .transition()
      .duration(ANIMATION.slow)
      .call(zoom.transform, newTransform);
  };

  const handleExportPNG = () => {
    const svg = document.querySelector('svg');
    if (!svg) return;
    exportToPNG(svg, 'canvas-diagram.png');
  };

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the canvas?')) {
      reset();
    }
  };

  const zoomPercentage = Math.round(viewport.scale * 100);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Canvas width={dimensions.width} height={dimensions.height} />
      <Toolbar
        onAutoArrange={handleAutoArrange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onFitToScreen={handleFitToScreen}
        onExportPNG={handleExportPNG}
        onClearCanvas={handleClearCanvas}
        zoomPercentage={zoomPercentage}
      />
      <ZoomIndicator percentage={zoomPercentage} />
    </div>
  );
}

export default App;
