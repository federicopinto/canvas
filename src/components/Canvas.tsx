import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useCanvasStore } from '../store/canvasStore';
import { VIEWPORT, CANVAS as CANVAS_CONST } from '../utils/constants';
import { Grid } from './Grid';
import { ClassNode } from './ClassNode';
import { Arrow, ArrowMarkers } from './Arrow';

interface CanvasProps {
  width: number;
  height: number;
}

export const Canvas = ({ width, height }: CanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Store state
  const nodes = useCanvasStore((state) => state.nodes);
  const arrows = useCanvasStore((state) => state.arrows);
  const viewport = useCanvasStore((state) => state.viewport);
  const setViewport = useCanvasStore((state) => state.setViewport);
  const selectedNodeIds = useCanvasStore((state) => state.selectedNodeIds);
  const dragState = useCanvasStore((state) => state.dragState);
  const isPanning = useCanvasStore((state) => state.isPanning);
  const setIsPanning = useCanvasStore((state) => state.setIsPanning);
  const startDrag = useCanvasStore((state) => state.startDrag);
  const updateDrag = useCanvasStore((state) => state.updateDrag);
  const endDrag = useCanvasStore((state) => state.endDrag);
  const setSelectedNodeIds = useCanvasStore((state) => state.setSelectedNodeIds);
  const toggleSelectedNodeId = useCanvasStore((state) => state.toggleSelectedNodeId);
  const clearSelection = useCanvasStore((state) => state.clearSelection);

  // D3 zoom behavior
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([VIEWPORT.minScale, VIEWPORT.maxScale])
      .filter((event) => {
        // Allow zoom with mouse wheel
        if (event.type === 'wheel') {
          return true;
        }
        // Allow pan with middle mouse or spacebar + left mouse
        if (event.type === 'mousedown') {
          return event.button === 1 || (event.button === 0 && isSpacePressed);
        }
        // Allow drag if panning is active
        if (event.type === 'mousemove' || event.type === 'mouseup') {
          return isPanning;
        }
        return false;
      })
      .on('start', (event) => {
        if (event.sourceEvent?.type === 'mousedown') {
          setIsPanning(true);
          if (svgRef.current) {
            svgRef.current.style.cursor = 'grabbing';
          }
        }
      })
      .on('zoom', (event) => {
        const transform = event.transform;
        g.attr('transform', transform);
        setViewport({
          scale: transform.k,
          translateX: transform.x,
          translateY: transform.y,
        });
      })
      .on('end', () => {
        setIsPanning(false);
        if (svgRef.current) {
          svgRef.current.style.cursor = isSpacePressed ? 'grab' : 'default';
        }
      });

    svg.call(zoom);

    // Apply initial transform
    const initialTransform = d3.zoomIdentity
      .translate(viewport.translateX, viewport.translateY)
      .scale(viewport.scale);
    svg.call(zoom.transform, initialTransform);

    // Store zoom behavior for programmatic use
    (svgRef.current as any).__zoom = zoom;

    return () => {
      svg.on('.zoom', null);
    };
  }, [isSpacePressed, isPanning, setIsPanning, setViewport, viewport.scale, viewport.translateX, viewport.translateY]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
        if (svgRef.current) {
          svgRef.current.style.cursor = 'grab';
        }
      }

      if (e.key === 'Escape') {
        clearSelection();
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeIds.length > 0) {
        // TODO: Implement node deletion
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        if (svgRef.current) {
          svgRef.current.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed, selectedNodeIds, clearSelection]);

  // Mouse event handlers for dragging
  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();

      if (isSpacePressed || isPanning) return;

      const svg = svgRef.current;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Handle selection
      if (e.shiftKey) {
        toggleSelectedNodeId(nodeId);
      } else if (!selectedNodeIds.includes(nodeId)) {
        setSelectedNodeIds([nodeId]);
      }

      // Start drag
      const offset = {
        x: svgP.x - node.position.x,
        y: svgP.y - node.position.y,
      };
      startDrag(nodeId, { x: svgP.x, y: svgP.y }, offset);
    },
    [
      isSpacePressed,
      isPanning,
      nodes,
      selectedNodeIds,
      setSelectedNodeIds,
      startDrag,
      toggleSelectedNodeId,
    ]
  );

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;

      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      updateDrag({ x: svgP.x, y: svgP.y });
    };

    const handleMouseUp = () => {
      endDrag();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging, endDrag, updateDrag]);

  // Handle background click (deselect)
  const handleBackgroundClick = useCallback(() => {
    if (!isSpacePressed && !isPanning) {
      clearSelection();
    }
  }, [isSpacePressed, isPanning, clearSelection]);

  return (
    <>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{
          backgroundColor: CANVAS_CONST.background,
          cursor: isSpacePressed ? 'grab' : 'default',
          touchAction: 'none',
        }}
        onClick={handleBackgroundClick}
      >
        <Grid scale={viewport.scale} />
        <ArrowMarkers />

        {/* Background grid */}
        <rect width={width} height={height} fill="url(#grid-pattern)" />

        {/* Main group with zoom/pan transform */}
        <g ref={gRef}>
          {/* Arrows layer */}
          <g>
            {arrows.map((arrow) => {
              const sourceNode = nodes.find((n) => n.id === arrow.source);
              const targetNode = nodes.find((n) => n.id === arrow.target);
              return (
                <Arrow
                  key={arrow.id}
                  arrow={arrow}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                  isSelected={false}
                />
              );
            })}
          </g>

          {/* Nodes layer */}
          <g>
            {nodes.map((node) => (
              <ClassNode
                key={node.id}
                node={node}
                isSelected={selectedNodeIds.includes(node.id)}
                isDragging={dragState.isDragging && dragState.nodeId === node.id}
                onMouseDown={handleNodeMouseDown}
              />
            ))}
          </g>
        </g>
      </svg>
    </>
  );
};
