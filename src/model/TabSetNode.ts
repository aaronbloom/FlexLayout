import Attribute from "../Attribute";
import AttributeDefinitions from "../AttributeDefinitions";
import * as DockLocation from "../DockLocation";
import Orientation from "../Orientation";
import Rect from "../Rect";
import DropInfo from "./../DropInfo";
import BorderNode from "./BorderNode";
import IDraggable from "./IDraggable";
import IDropTarget from "./IDropTarget";
import Model from "./Model";
import Node from "./Node";
import RowNode from "./RowNode";
import TabNode from "./TabNode";

class TabSetNode extends Node implements IDraggable, IDropTarget {
    public static readonly TYPE = "tabset";

    /** @hidden @internal */
    public static _fromJson(json: any, model: Model) {
        const newLayoutNode = new TabSetNode(model, json);

        if (json.children !== undefined) {
            json.children.forEach((jsonChild: any) => {
                const child = TabNode._fromJson(jsonChild, model);
                newLayoutNode._addChild(child);
            });
        }

        if (json.maximized && json.maximized === true) {
            model._setMaximizedTabset(newLayoutNode);
        }

        if (json.active && json.active === true) {
            model._setActiveTabset(newLayoutNode);
        }

        return newLayoutNode;
    }
    /** @hidden @internal */
    private static _attributeDefinitions: AttributeDefinitions = TabSetNode._createAttributeDefinitions();

    /** @hidden @internal */
    private static _createAttributeDefinitions(): AttributeDefinitions {

        const attributeDefinitions = new AttributeDefinitions();
        attributeDefinitions.add("type", TabSetNode.TYPE, true);
        attributeDefinitions.add("id", undefined).setType(Attribute.ID);

        attributeDefinitions.add("weight", 100);
        attributeDefinitions.add("width", undefined);
        attributeDefinitions.add("height", undefined);
        attributeDefinitions.add("selected", 0);
        attributeDefinitions.add("name", undefined).setType(Attribute.STRING);

        attributeDefinitions.addInherited("enableDeleteWhenEmpty", "tabSetEnableDeleteWhenEmpty");
        attributeDefinitions.addInherited("enableDrop", "tabSetEnableDrop");
        attributeDefinitions.addInherited("enableDrag", "tabSetEnableDrag");
        attributeDefinitions.addInherited("enableDivide", "tabSetEnableDivide");
        attributeDefinitions.addInherited("enableMaximize", "tabSetEnableMaximize");
        attributeDefinitions.addInherited("classNameTabStrip", "tabSetClassNameTabStrip");
        attributeDefinitions.addInherited("classNameHeader", "tabSetClassNameHeader");
        attributeDefinitions.addInherited("enableTabStrip", "tabSetEnableTabStrip");
        attributeDefinitions.addInherited("borderInsets", "tabSetBorderInsets");
        attributeDefinitions.addInherited("marginInsets", "tabSetMarginInsets");

        attributeDefinitions.addInherited("headerHeight", "tabSetHeaderHeight");
        attributeDefinitions.addInherited("tabStripHeight", "tabSetTabStripHeight");
        return attributeDefinitions;
    }

    /** @hidden @internal */
    private _contentRect?: Rect;
    /** @hidden @internal */
    private _tabHeaderRect?: Rect;

    /** @hidden @internal */
    constructor(model: Model, json: any) {
        super(model);

        TabSetNode._attributeDefinitions.fromJson(json, this._attributes);
        model._addNode(this);
    }

    public getName() {
        return this._getAttributeAsStringOrUndefined("name");
    }

    public getSelected() {
        const selected = this._attributes.selected;
        if (selected !== undefined) {
            return selected as number;
        }
        return -1;
    }

    public getSelectedNode() {
        const selected = this.getSelected();
        if (selected !== -1) {
            return this._children[selected];
        }
        return undefined;
    }

    public getWeight(): number {
        return this._attributes.weight as number;
    }

    public getWidth() {
        return this._getAttributeAsNumberOrUndefined("width");
    }

    public getHeight() {
        return this._getAttributeAsNumberOrUndefined("height");
    }

    public isMaximized() {
        return this._model.getMaximizedTabset() === this;
    }

    public isActive() {
        return this._model.getActiveTabset() === this;
    }

    public isEnableDeleteWhenEmpty() {
        return this._getAttr("enableDeleteWhenEmpty") as boolean;
    }

    public isEnableDrop() {
        return this._getAttr("enableDrop") as boolean;
    }

    public isEnableDrag() {
        return this._getAttr("enableDrag") as boolean;
    }

    public isEnableDivide() {
        return this._getAttr("enableDivide") as boolean;
    }

    public isEnableMaximize() {
        return this._getAttr("enableMaximize") as boolean;
    }

    public isEnableTabStrip() {
        return this._getAttr("enableTabStrip") as boolean;
    }

    public getClassNameTabStrip() {
        return this._getAttributeAsStringOrUndefined("classNameTabStrip");
    }

    public getClassNameHeader() {
        return this._getAttributeAsStringOrUndefined("classNameHeader");
    }

    public getHeaderHeight() {
        return this._getAttr("headerHeight") as number;
    }

    public getTabStripHeight() {
        return this._getAttr("tabStripHeight") as number;
    }

    /** @hidden @internal */
    public _setWeight(weight: number) {
        this._attributes.weight = weight;
    }

    /** @hidden @internal */
    public _setSelected(index: number) {
        this._attributes.selected = index;
    }

    /** @hidden @internal */
    public canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
        let dropInfo;

        if (dragNode === this) {
            const dockLocation = DockLocation.CENTER;
            const outlineRect = this._tabHeaderRect;
            dropInfo = new DropInfo(this, outlineRect!, dockLocation, -1, "flexlayout__outline_rect");
        } else if (this._contentRect!.contains(x, y)) {
            const dockLocation = DockLocation.getLocation(this._contentRect!, x, y);
            const outlineRect = DockLocation.getDockRect(dockLocation.name, this._rect);
            dropInfo = new DropInfo(this, outlineRect, dockLocation, -1, "flexlayout__outline_rect");
        } else if (this._children.length > 0 &&
            this._tabHeaderRect !== undefined &&
            this._tabHeaderRect.contains(x, y)) {
            let child = this._children[0] as TabNode;
            let r = child.getTabRect()!;
            const yy = r.y;
            const h = r.height;
            let p = this._tabHeaderRect.x;
            let childCenter = 0;
            for (let i = 0; i < this._children.length; i++) {
                child = this._children[i] as TabNode;
                r = child.getTabRect()!;
                childCenter = r.x + r.width / 2;
                if (x >= p && x < childCenter) {
                    const dockLocation = DockLocation.CENTER;
                    const outlineRect = new Rect(r.x - 2, yy, 3, h);
                    dropInfo = new DropInfo(this, outlineRect, dockLocation, i, "flexlayout__outline_rect");
                    break;
                }
                p = childCenter;
            }
            if (dropInfo === undefined) {
                const dockLocation = DockLocation.CENTER;
                const outlineRect = new Rect(r.getRight() - 2, yy, 3, h);
                dropInfo = new DropInfo(
                    this,
                    outlineRect,
                    dockLocation,
                    this._children.length,
                    "flexlayout__outline_rect",
                );
            }
        }

        if (!dragNode._canDockInto(dragNode, dropInfo)) {
            return undefined;
        }

        return dropInfo;
    }

    /** @hidden @internal */
    public _layout(rect: Rect) {

        if (this.isMaximized()) {
            rect = this._model.getRoot().getRect();
        }

        rect = rect.removeInsets(this._getAttr("marginInsets"));
        this._rect = rect;
        rect = rect.removeInsets(this._getAttr("borderInsets"));

        const showHeader = (this.getName() !== undefined);
        let y = 0;
        if (showHeader) {
            y += this.getHeaderHeight();
        }
        if (this.isEnableTabStrip()) {
            this._tabHeaderRect = new Rect(rect.x, rect.y + y, rect.width, this.getTabStripHeight());
            y += this.getTabStripHeight();
        }
        this._contentRect = new Rect(rect.x, rect.y + y, rect.width, rect.height - y);

        this._children.forEach((child, i) => {
            child._layout(this._contentRect!);
            child._setVisible(i === this.getSelected());
        });
    }

    /** @hidden @internal */
    public _remove(node: TabNode) {
        this._removeChild(node);
        this._model._tidy();
        this._setSelected(Math.max(0, this.getSelected() - 1));
    }

    /** @hidden @internal */
    public drop(dragNode: (Node & IDraggable), location: DockLocation.DockLocation, index: number) {
        const dockLocation = location;

        if (this === dragNode) { // tabset drop into itself
            return; // dock back to itself
        }

        const dragParent = dragNode.getParent() as (BorderNode | TabSetNode);
        let fromIndex = 0;
        if (dragParent !== undefined) {
            fromIndex = dragParent._removeChild(dragNode);
        }

        // if dropping a tab back to same tabset and moving to forward position then reduce insertion index
        if (dragNode.getType() === TabNode.TYPE && dragParent === this && fromIndex < index && index > 0) {
            index--;
        }

        // for the tabset/border being removed from set the selected index
        if (dragParent !== undefined) {
            if (dragParent.getType() === TabSetNode.TYPE) {
                dragParent._setSelected(0);
            } else if (dragParent.getType() === BorderNode.TYPE && dragParent.getSelected() !== -1) {
                if (fromIndex === dragParent.getSelected() && dragParent.getChildren().length > 0) {
                    dragParent._setSelected(0);
                } else if (fromIndex < dragParent.getSelected()) {
                    dragParent._setSelected(dragParent.getSelected() - 1);
                } else if (fromIndex > dragParent.getSelected()) {
                    // leave selected index as is
                } else {
                    dragParent._setSelected(-1);
                }
            }
        }

        // simple_bundled dock to existing tabset
        if (dockLocation === DockLocation.CENTER) {
            let insertPos = index;
            if (insertPos === -1) {
                insertPos = this._children.length;
            }

            if (dragNode.getType() === TabNode.TYPE) {
                this._addChild(dragNode, insertPos);
                this._setSelected(insertPos);
            } else {
                dragNode.getChildren().forEach((child, i) => {
                    this._addChild(child, insertPos);
                    insertPos++;
                });
            }
            this._model._setActiveTabset(this);

        } else {
            let tabSet: TabSetNode | undefined;
            if (dragNode instanceof TabNode) {
                // create new tabset parent
                // console.log("create a new tabset");
                tabSet = new TabSetNode(this._model, {});
                tabSet._addChild(dragNode);
            } else {
                tabSet = dragNode as TabSetNode;
            }

            const parentRow = this._parent as Node;
            const pos = parentRow.getChildren().indexOf(this);

            if (parentRow.getOrientation() === dockLocation.orientation) {
                tabSet._setWeight(this.getWeight() / 2);
                this._setWeight(this.getWeight() / 2);
                parentRow._addChild(tabSet, pos + dockLocation.indexPlus);
            } else {
                // create a new row to host the new tabset (it will go in the opposite direction)
                // console.log("create a new row");
                const newRow = new RowNode(this._model, {});
                newRow._setWeight(this.getWeight());
                newRow._addChild(this);
                this._setWeight(50);
                tabSet._setWeight(50);
                newRow._addChild(tabSet, dockLocation.indexPlus);

                parentRow._removeChild(this);
                parentRow._addChild(newRow, pos);
            }
            this._model._setActiveTabset(tabSet);

        }
        this._model._tidy();

    }

    /** @hidden @internal */
    public _toJson(): any {
        const json: any = {};
        TabSetNode._attributeDefinitions.toJson(json, this._attributes);
        json.children = this._children.map((child) => child._toJson());

        if (this.isActive()) {
            json.active = true;
        }

        if (this.isMaximized()) {
            json.maximized = true;
        }

        return json;
    }

    /** @hidden @internal */
    public _updateAttrs(json: any) {
        TabSetNode._attributeDefinitions.update(json, this._attributes);
    }

    /** @hidden @internal */
    public _getAttributeDefinitions() {
        return TabSetNode._attributeDefinitions;
    }

    /** @hidden @internal */
    public _getPrefSize(orientation: Orientation) {
        let prefSize = this.getWidth();
        if (orientation === Orientation.VERT) {
            prefSize = this.getHeight();
        }
        return prefSize;
    }
}

export default TabSetNode;
