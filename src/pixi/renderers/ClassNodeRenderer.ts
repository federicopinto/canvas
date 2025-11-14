import * as PIXI from 'pixi.js';
import type { NodeData } from '../../types';
import { NODE_STYLES } from '../../utils/nodeStyles';
import { SectionRenderer } from './SectionRenderer';

export class ClassNodeRenderer extends PIXI.Container {
  public nodeData: NodeData;  // Public for arrow access
  private shadow: PIXI.Graphics;
  private background: PIXI.Graphics;
  private headerGraphics: PIXI.Graphics;
  private nameText: PIXI.Text;
  private typeText: PIXI.Text;
  private sections: SectionRenderer[] = [];
  private sectionsContainer: PIXI.Container;

  constructor(data: NodeData) {
    super();
    this.nodeData = data;

    // Set position
    this.position.set(data.x, data.y);

    // Create graphics components
    this.shadow = new PIXI.Graphics();
    this.background = new PIXI.Graphics();
    this.headerGraphics = new PIXI.Graphics();

    // Create text elements
    this.nameText = new PIXI.Text(data.name, {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 14,
      fontWeight: 'bold',
      fill: 0x24292E, // Primary text color
    });

    const style = NODE_STYLES[data.type];
    this.typeText = new PIXI.Text(style.typeLabel, {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 9,
      fontStyle: 'italic',
      fill: style.typeLabelColor,
    });

    // Add to container
    this.addChild(this.shadow);
    this.addChild(this.background);
    this.addChild(this.headerGraphics);
    this.addChild(this.nameText);
    this.addChild(this.typeText);

    // Sections container
    this.sectionsContainer = new PIXI.Container();
    this.sectionsContainer.position.set(0, 44); // Below header
    this.addChild(this.sectionsContainer);

    // Initial render
    this.render();

    // Render sections
    this.renderSections();
  }

  render() {
    const { width, height, type } = this.nodeData;
    const style = NODE_STYLES[type];

    // Clear previous drawings
    this.shadow.clear();
    this.background.clear();
    this.headerGraphics.clear();

    // Draw shadow
    this.shadow.beginFill(0x000000, 0.12);
    this.shadow.drawRoundedRect(0, 2, width, height, 8);
    this.shadow.endFill();
    this.shadow.filters = [new PIXI.filters.BlurFilter(4)];

    // Draw body background
    this.background.beginFill(style.bodyBg);
    this.background.drawRoundedRect(0, 0, width, height, 8);
    this.background.endFill();

    // Draw body border
    this.background.lineStyle(2, style.bodyBorder, 1, 0.5);

    if (style.borderDashed) {
      // Draw dashed border for protocol
      this.drawDashedRect(this.background, 0, 0, width, height, 8);
    } else {
      this.background.drawRoundedRect(0, 0, width, height, 8);
    }

    // Draw header background
    this.headerGraphics.beginFill(style.headerBg);
    this.headerGraphics.drawRoundedRect(0, 0, width, 44, 8);
    this.headerGraphics.endFill();

    // Draw header border (top, left, right)
    this.headerGraphics.lineStyle(2, style.headerBorder, 1, 0.5);

    if (style.borderDashed) {
      this.drawDashedRoundedRect(this.headerGraphics, 0, 0, width, 44, 8, true);
    } else {
      // Draw top arc
      this.headerGraphics.moveTo(8, 0);
      this.headerGraphics.lineTo(width - 8, 0);
      this.headerGraphics.quadraticCurveTo(width, 0, width, 8);
      this.headerGraphics.lineTo(width, 44);
      this.headerGraphics.moveTo(0, 44);
      this.headerGraphics.lineTo(0, 8);
      this.headerGraphics.quadraticCurveTo(0, 0, 8, 0);
    }

    // Position text
    this.nameText.position.set(16, 14);
    this.typeText.position.set(width - this.typeText.width - 16, 18);
  }

  /**
   * Draw dashed rectangle (for protocol nodes)
   */
  private drawDashedRect(graphics: PIXI.Graphics, x: number, y: number, w: number, h: number, radius: number) {
    const dashLength = 5;
    const gapLength = 4;

    // Calculate the four sides with rounded corners
    const sides = [
      { start: { x: x + radius, y: y }, end: { x: x + w - radius, y: y } }, // Top
      { start: { x: x + w, y: y + radius }, end: { x: x + w, y: y + h - radius } }, // Right
      { start: { x: x + w - radius, y: y + h }, end: { x: x + radius, y: y + h } }, // Bottom
      { start: { x: x, y: y + h - radius }, end: { x: x, y: y + radius } }, // Left
    ];

    // Draw dashed lines on each side
    for (const side of sides) {
      const dx = side.end.x - side.start.x;
      const dy = side.end.y - side.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(length / (dashLength + gapLength));

      for (let i = 0; i < steps; i++) {
        const t1 = i * (dashLength + gapLength) / length;
        const t2 = (i * (dashLength + gapLength) + dashLength) / length;

        const x1 = side.start.x + dx * t1;
        const y1 = side.start.y + dy * t1;
        const x2 = side.start.x + dx * t2;
        const y2 = side.start.y + dy * t2;

        graphics.moveTo(x1, y1);
        graphics.lineTo(x2, y2);
      }
    }

    // Draw corner arcs (simplified as dashed)
    const corners = [
      { center: { x: x + w - radius, y: y + radius }, startAngle: -Math.PI / 2, endAngle: 0 }, // Top-right
      { center: { x: x + w - radius, y: y + h - radius }, startAngle: 0, endAngle: Math.PI / 2 }, // Bottom-right
      { center: { x: x + radius, y: y + h - radius }, startAngle: Math.PI / 2, endAngle: Math.PI }, // Bottom-left
      { center: { x: x + radius, y: y + radius }, startAngle: Math.PI, endAngle: Math.PI * 1.5 }, // Top-left
    ];

    for (const corner of corners) {
      const arcLength = radius * Math.PI / 2;
      const steps = Math.floor(arcLength / (dashLength + gapLength));

      for (let i = 0; i < steps; i++) {
        const angle1 = corner.startAngle + (corner.endAngle - corner.startAngle) * (i * (dashLength + gapLength) / arcLength);
        const angle2 = corner.startAngle + (corner.endAngle - corner.startAngle) * ((i * (dashLength + gapLength) + dashLength) / arcLength);

        const x1 = corner.center.x + radius * Math.cos(angle1);
        const y1 = corner.center.y + radius * Math.sin(angle1);
        const x2 = corner.center.x + radius * Math.cos(angle2);
        const y2 = corner.center.y + radius * Math.sin(angle2);

        graphics.moveTo(x1, y1);
        graphics.lineTo(x2, y2);
      }
    }
  }

  private drawDashedRoundedRect(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    headerOnly: boolean
  ) {
    const dashLength = 5;
    const gapLength = 4;

    // For header, only draw top and sides down to header height
    const sides = [
      { start: { x: x + r, y: y }, end: { x: x + w - r, y: y } }, // Top
      { start: { x: x + w, y: y + r }, end: { x: x + w, y: h } }, // Right (to header bottom)
      { start: { x: x, y: y + r }, end: { x: x, y: h } }, // Left (to header bottom)
    ];

    // Draw dashed lines
    for (const side of sides) {
      const dx = side.end.x - side.start.x;
      const dy = side.end.y - side.start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(length / (dashLength + gapLength));

      for (let i = 0; i < steps; i++) {
        const t1 = i * (dashLength + gapLength) / length;
        const t2 = (i * (dashLength + gapLength) + dashLength) / length;

        const x1 = side.start.x + dx * t1;
        const y1 = side.start.y + dy * t1;
        const x2 = side.start.x + dx * t2;
        const y2 = side.start.y + dy * t2;

        graphics.moveTo(x1, y1);
        graphics.lineTo(x2, y2);
      }
    }

    // Draw top corners
    const corners = [
      { center: { x: x + w - r, y: y + r }, startAngle: -Math.PI / 2, endAngle: 0 }, // Top-right
      { center: { x: x + r, y: y + r }, startAngle: Math.PI, endAngle: Math.PI * 1.5 }, // Top-left
    ];

    for (const corner of corners) {
      const arcLength = r * Math.PI / 2;
      const steps = Math.floor(arcLength / (dashLength + gapLength));

      for (let i = 0; i < steps; i++) {
        const angle1 = corner.startAngle + (corner.endAngle - corner.startAngle) * (i * (dashLength + gapLength) / arcLength);
        const angle2 = corner.startAngle + (corner.endAngle - corner.startAngle) * ((i * (dashLength + gapLength) + dashLength) / arcLength);

        const x1 = corner.center.x + r * Math.cos(angle1);
        const y1 = corner.center.y + r * Math.sin(angle1);
        const x2 = corner.center.x + r * Math.cos(angle2);
        const y2 = corner.center.y + r * Math.sin(angle2);

        graphics.moveTo(x1, y1);
        graphics.lineTo(x2, y2);
      }
    }
  }

  private renderSections() {
    // Clear existing
    this.sections.forEach(s => s.destroy());
    this.sections = [];
    this.sectionsContainer.removeChildren();

    let yOffset = 0;

    this.nodeData.sections.forEach(sectionData => {
      const section = new SectionRenderer(sectionData, this.nodeData.width);
      section.position.set(0, yOffset);
      section.on('collapse-changed', () => this.onSectionCollapsed());

      this.sectionsContainer.addChild(section);
      this.sections.push(section);

      yOffset += section.getCurrentHeight();
    });

    // Update node height
    this.nodeData.height = 44 + yOffset;
  }

  private onSectionCollapsed() {
    // Recalculate total height
    let totalHeight = 44;
    this.sections.forEach((section, index) => {
      section.position.y = totalHeight - 44;
      totalHeight += section.getTargetHeight();
    });

    this.nodeData.height = totalHeight;
    this.render(); // Redraw background
  }

  updateData(data: Partial<NodeData>) {
    Object.assign(this.nodeData, data);

    if (data.x !== undefined || data.y !== undefined) {
      this.position.set(this.nodeData.x, this.nodeData.y);

      // Emit event for arrow updates
      this.emit('position-changed', this.nodeData.id, {
        x: this.nodeData.x,
        y: this.nodeData.y,
        width: this.nodeData.width,
        height: this.nodeData.height,
      });
    }

    if (data.name || data.type || data.width || data.height) {
      this.render();
    }
  }

  setSelected(selected: boolean) {
    if (selected) {
      // Enhanced shadow for selection
      this.shadow.clear();
      this.shadow.beginFill(0x000000, 0.24);
      this.shadow.drawRoundedRect(0, 4, this.nodeData.width, this.nodeData.height, 8);
      this.shadow.endFill();
      this.shadow.filters = [new PIXI.filters.BlurFilter(8)];
    } else {
      // Normal shadow
      this.shadow.clear();
      this.shadow.beginFill(0x000000, 0.12);
      this.shadow.drawRoundedRect(0, 2, this.nodeData.width, this.nodeData.height, 8);
      this.shadow.endFill();
      this.shadow.filters = [new PIXI.filters.BlurFilter(4)];
    }
  }

  setDragging(isDragging: boolean) {
    if (isDragging) {
      this.shadow.clear();
      this.shadow.beginFill(0x000000, 0.24);
      this.shadow.drawRoundedRect(0, 4, this.nodeData.width, this.nodeData.height, 8);
      this.shadow.endFill();
      this.shadow.filters = [new PIXI.filters.BlurFilter(16)];
      this.scale.set(1.02); // Slight scale up
    } else {
      this.shadow.clear();
      this.shadow.beginFill(0x000000, 0.12);
      this.shadow.drawRoundedRect(0, 2, this.nodeData.width, this.nodeData.height, 8);
      this.shadow.endFill();
      this.shadow.filters = [new PIXI.filters.BlurFilter(4)];
      this.scale.set(1.0);
    }
  }
}
