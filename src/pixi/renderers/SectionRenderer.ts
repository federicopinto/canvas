import * as PIXI from 'pixi.js';
import type { SectionData } from '../../types';

export class SectionRenderer extends PIXI.Container {
  private sectionData: SectionData;
  private headerBg: PIXI.Graphics;
  private headerText: PIXI.Text;
  private collapseIcon: PIXI.Text;
  private contentContainer: PIXI.Container;
  private contentItems: PIXI.Text[] = [];

  // Animation state
  private targetHeight: number = 0;
  private currentHeight: number = 0;

  constructor(data: SectionData, width: number) {
    super();
    this.sectionData = data;

    // Header background
    this.headerBg = new PIXI.Graphics();
    this.addChild(this.headerBg);

    // Collapse icon
    this.collapseIcon = new PIXI.Text(
      data.collapsed ? '▶' : '▼',
      {
        fontFamily: 'monospace',
        fontSize: 10,
        fill: 0x6A737D,
      }
    );
    this.collapseIcon.position.set(12, 10);
    this.addChild(this.collapseIcon);

    // Header text
    this.headerText = new PIXI.Text(data.title, {
      fontFamily: '-apple-system, "Segoe UI", sans-serif',
      fontSize: 11,
      fontWeight: '600',
      fill: 0x24292E,
    });
    this.headerText.position.set(32, 10);
    this.addChild(this.headerText);

    // Content container
    this.contentContainer = new PIXI.Container();
    this.contentContainer.position.set(0, 32);
    this.addChild(this.contentContainer);

    // Make header interactive
    this.headerBg.eventMode = 'static';
    this.headerBg.cursor = 'pointer';
    this.headerBg.on('pointerdown', () => this.toggleCollapse());
    this.headerBg.on('pointerover', () => this.onHeaderHover(true));
    this.headerBg.on('pointerout', () => this.onHeaderHover(false));

    // Initial render
    this.redraw(width);
  }

  redraw(width: number) {
    // Draw header background
    this.headerBg.clear();
    this.headerBg.beginFill(0xF8F9FA);
    this.headerBg.drawRect(0, 0, width, 32);
    this.headerBg.endFill();

    // Render content items
    this.renderContent(width);

    // Calculate heights
    this.targetHeight = this.sectionData.collapsed ? 32 : this.calculateContentHeight() + 32;
    if (this.currentHeight === 0) {
      this.currentHeight = this.targetHeight; // First render, no animation
    }
  }

  private renderContent(width: number) {
    // Clear existing content
    this.contentItems.forEach(item => item.destroy());
    this.contentItems = [];
    this.contentContainer.removeChildren();

    if (this.sectionData.collapsed) {
      this.contentContainer.visible = false;
      return;
    }

    this.contentContainer.visible = true;

    let yOffset = 0;

    // Render each content item
    this.sectionData.items.forEach((item, index) => {
      const text = new PIXI.Text(item, {
        fontFamily: '"SF Mono", "Consolas", monospace',
        fontSize: 10,
        fill: 0x24292E,
      });
      text.position.set(16, yOffset);
      this.contentContainer.addChild(text);
      this.contentItems.push(text);

      yOffset += 24; // 24px per line
    });
  }

  private calculateContentHeight(): number {
    if (this.sectionData.collapsed) return 0;
    return this.sectionData.items.length * 24 + 8; // 8px bottom padding
  }

  toggleCollapse() {
    this.sectionData.collapsed = !this.sectionData.collapsed;
    this.collapseIcon.text = this.sectionData.collapsed ? '▶' : '▼';
    this.contentContainer.visible = !this.sectionData.collapsed;
    this.targetHeight = this.sectionData.collapsed ? 32 : this.calculateContentHeight() + 32;

    // Trigger parent node to recalculate height
    this.emit('collapse-changed', this);
  }

  private onHeaderHover(isHovering: boolean) {
    this.headerBg.clear();
    this.headerBg.beginFill(isHovering ? 0xE9ECEF : 0xF8F9FA);
    this.headerBg.drawRect(0, 0, this.headerBg.width, 32);
    this.headerBg.endFill();
  }

  /**
   * Animate height with spring physics
   * Called from parent node's update loop
   */
  updateAnimation(deltaTime: number): boolean {
    if (Math.abs(this.currentHeight - this.targetHeight) < 0.5) {
      this.currentHeight = this.targetHeight;
      return false; // Animation complete
    }

    // Simple spring-like lerp
    const diff = this.targetHeight - this.currentHeight;
    this.currentHeight += diff * deltaTime * 8; // Adjust speed

    return true; // Still animating
  }

  getCurrentHeight(): number {
    return this.currentHeight;
  }

  getTargetHeight(): number {
    return this.targetHeight;
  }
}
