import * as PIXI from 'pixi.js';
import type { ArrowData, Point } from '../../types';
import { ARROW_STYLES } from '../../utils/arrowStyles';
import { ArrowRouter, type NodeBounds } from '../../engine/ArrowRouter';

export class ArrowRenderer extends PIXI.Container {
  private arrowData: ArrowData;
  private pathGraphics: PIXI.Graphics;
  private headGraphics: PIXI.Graphics;
  private tailGraphics: PIXI.Graphics;
  private hitArea: PIXI.Graphics;

  private isSelected: boolean = false;
  private isHovered: boolean = false;

  constructor(data: ArrowData) {
    super();
    this.arrowData = data;

    // Create graphics layers
    this.pathGraphics = new PIXI.Graphics();
    this.headGraphics = new PIXI.Graphics();
    this.tailGraphics = new PIXI.Graphics();
    this.hitArea = new PIXI.Graphics();

    this.addChild(this.hitArea);      // Bottom - invisible hit detection
    this.addChild(this.pathGraphics); // Middle - main path
    this.addChild(this.tailGraphics); // Tail marker
    this.addChild(this.headGraphics); // Top - arrowhead

    // Make interactive
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerover', () => this.setHovered(true));
    this.on('pointerout', () => this.setHovered(false));
  }

  render(fromNode: NodeBounds, toNode: NodeBounds) {
    const style = ARROW_STYLES[this.arrowData.type];

    // Auto-select best anchors if not specified
    const [fromAnchor, toAnchor] = ArrowRouter.findBestAnchors(fromNode, toNode);

    const startPoint = ArrowRouter.getAnchorPoint(fromNode, fromAnchor);
    const endPoint = ArrowRouter.getAnchorPoint(toNode, toAnchor);

    // Generate path
    const waypoints = ArrowRouter.routeOrthogonal(startPoint, endPoint, 12);

    // Clear previous
    this.pathGraphics.clear();
    this.headGraphics.clear();
    this.tailGraphics.clear();
    this.hitArea.clear();

    // Draw path
    this.drawPath(waypoints, style);

    // Draw markers
    if (waypoints.length >= 2) {
      const start = waypoints[0];
      const end = waypoints[waypoints.length - 1];
      const secondLast = waypoints[waypoints.length - 2];
      const second = waypoints[1];

      // Draw head
      if (style.headType !== 'none') {
        const angle = Math.atan2(end.y - secondLast.y, end.x - secondLast.x);
        this.drawHead(end, angle, style);
      }

      // Draw tail
      if (style.tailType !== 'none') {
        const angle = Math.atan2(second.y - start.y, second.x - start.x);
        this.drawTail(start, angle, style);
      }
    }

    // Draw hit area (wider invisible area for easier clicking)
    this.drawHitArea(waypoints);
  }

  private drawPath(waypoints: Point[], style: any) {
    const lineWidth = this.isHovered ? style.lineWidth + 1 : style.lineWidth;
    const alpha = this.isSelected ? 1.0 : 0.8;

    this.pathGraphics.lineStyle({
      width: lineWidth,
      color: style.color,
      alpha,
      cap: PIXI.LINE_CAP.ROUND,
      join: PIXI.LINE_JOIN.ROUND,
    });

    if (style.dashPattern) {
      // Draw dashed line manually
      this.drawDashedPath(waypoints, style.dashPattern);
    } else {
      // Draw solid line
      if (waypoints.length > 0) {
        this.pathGraphics.moveTo(waypoints[0].x, waypoints[0].y);
        for (let i = 1; i < waypoints.length; i++) {
          this.pathGraphics.lineTo(waypoints[i].x, waypoints[i].y);
        }
      }
    }
  }

  private drawDashedPath(waypoints: Point[], dashPattern: number[]) {
    const [dashLength, gapLength] = dashPattern;
    let totalDist = 0;
    let isDash = true;
    let remainingInSegment = dashLength;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const segmentLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const dx = (p2.x - p1.x) / segmentLength;
      const dy = (p2.y - p1.y) / segmentLength;

      let distCovered = 0;

      while (distCovered < segmentLength) {
        const distToGo = segmentLength - distCovered;
        const drawDist = Math.min(remainingInSegment, distToGo);

        const x = p1.x + dx * distCovered;
        const y = p1.y + dy * distCovered;

        if (isDash) {
          if (distCovered === 0 && i > 0) {
            // Continue from previous segment
          } else {
            this.pathGraphics.moveTo(x, y);
          }
          this.pathGraphics.lineTo(x + dx * drawDist, y + dy * drawDist);
        }

        distCovered += drawDist;
        remainingInSegment -= drawDist;

        if (remainingInSegment <= 0) {
          isDash = !isDash;
          remainingInSegment = isDash ? dashLength : gapLength;
        }
      }
    }
  }

  private drawHead(point: Point, angle: number, style: any) {
    this.headGraphics.position.set(point.x, point.y);
    this.headGraphics.rotation = angle;

    if (style.headType === 'triangle') {
      // Hollow triangle (inheritance)
      this.headGraphics.lineStyle(2, style.color);
      this.headGraphics.beginFill(0xFFFFFF);
      this.headGraphics.moveTo(0, 0);
      this.headGraphics.lineTo(-12, -6);
      this.headGraphics.lineTo(-12, 6);
      this.headGraphics.closePath();
      this.headGraphics.endFill();
    } else if (style.headType === 'arrow') {
      // Simple arrowhead
      this.headGraphics.lineStyle(2, style.color);
      this.headGraphics.moveTo(0, 0);
      this.headGraphics.lineTo(-8, -4);
      this.headGraphics.moveTo(0, 0);
      this.headGraphics.lineTo(-8, 4);
    }
  }

  private drawTail(point: Point, angle: number, style: any) {
    this.tailGraphics.position.set(point.x, point.y);
    this.tailGraphics.rotation = angle;

    if (style.tailType === 'filled-diamond') {
      // Filled diamond (composition)
      this.tailGraphics.lineStyle(2, style.color);
      this.tailGraphics.beginFill(style.color);
      this.tailGraphics.moveTo(0, 0);
      this.tailGraphics.lineTo(-10, -5);
      this.tailGraphics.lineTo(-20, 0);
      this.tailGraphics.lineTo(-10, 5);
      this.tailGraphics.closePath();
      this.tailGraphics.endFill();
    } else if (style.tailType === 'hollow-diamond') {
      // Hollow diamond (aggregation)
      this.tailGraphics.lineStyle(2, style.color);
      this.tailGraphics.beginFill(0xFFFFFF);
      this.tailGraphics.moveTo(0, 0);
      this.tailGraphics.lineTo(-10, -5);
      this.tailGraphics.lineTo(-20, 0);
      this.tailGraphics.lineTo(-10, 5);
      this.tailGraphics.closePath();
      this.tailGraphics.endFill();
    }
  }

  private drawHitArea(waypoints: Point[]) {
    // Invisible wider hit area for easier clicking
    this.hitArea.lineStyle(10, 0x000000, 0.01);
    if (waypoints.length > 0) {
      this.hitArea.moveTo(waypoints[0].x, waypoints[0].y);
      for (let i = 1; i < waypoints.length; i++) {
        this.hitArea.lineTo(waypoints[i].x, waypoints[i].y);
      }
    }
  }

  setSelected(selected: boolean) {
    this.isSelected = selected;
  }

  setHovered(hovered: boolean) {
    this.isHovered = hovered;
  }

  getArrowData(): ArrowData {
    return this.arrowData;
  }
}
