import { CSSProperties } from "react";
import AttributeDefinitions from "../AttributeDefinitions";
import * as DockLocation from "../DockLocation";
import DropInfo from "../DropInfo";
import Orientation from "../Orientation";
import Rect from "../Rect";
import { Dictionary } from "../Types";
import IDraggable from "./IDraggable";
import Model from "./Model";

abstract class Node {

    protected _model: Model;
    protected _attributes: Dictionary<any>;
    protected _parent?: Node;
    protected _children: Node[];
    protected _fixed: boolean;
    protected _rect: Rect;
    protected _visible: boolean;
    protected _listeners: Dictionary<(params: any) => void>;
    protected _dirty: boolean = false;
    protected _tempSize: number = 0;

    protected constructor(model: Model) {
        this._model = model;
        this._attributes = {};
        this._children = [];
        this._fixed = false;
        this._rect = Rect.empty();
        this._visible = false;
        this._listeners = {};
    }

    public getId() {
        let id = this._attributes.id;
        if (id !== undefined) {
            return id as string;
        }

        id = this._model._nextUniqueId();
        this._setId(id);

        return id as string;
    }

    public getModel() {
        return this._model;
    }

    public getType() {
        return this._attributes.type as string;
    }

    public getParent() {
        return this._parent;
    }

    public getChildren() {
        return this._children;
    }

    public getRect() {
        return this._rect;
    }

    public isVisible() {
        return this._visible;
    }

    public getOrientation(): Orientation {
        if (this._parent === undefined) {
            return Orientation.HORZ;
        } else {
            return Orientation.flip(this._parent.getOrientation());
        }
    }

    // event can be: resize, visibility, maximize (on tabset), close
    public setEventListener(event: string, callback: (params: any) => void) {
        this._listeners[event] = callback;
    }

    public removeEventListener(event: string) {
        delete this._listeners[event];
    }

    public _setId(id: string) {
        this._attributes.id = id;
    }

    public _fireEvent(event: string, params: any) {
        const listener = this._listeners[event];
        if (listener !== undefined) {
            listener(params);
        }
    }

    public _getAttr(name: string) {
        let val = this._attributes[name];

        if (val === undefined) {
            const modelName = this._getAttributeDefinitions().getModelName(name);
            if (modelName !== undefined) {
                val = this._model._getAttribute(modelName);
            }
        }

        return val;
    }

    public _forEachNode(fn: (node: Node, level: number) => void, level: number) {
        fn(this, level);
        level++;
        this._children.forEach((node) => {
            node._forEachNode(fn, level);
        });
    }

    public _setVisible(visible: boolean) {
        if (visible !== this._visible) {
            this._fireEvent("visibility", { visible });
            this._visible = visible;
        }
    }

    public _getDrawChildren(): Node[] | undefined {
        return this._children;
    }

    public _setParent(parent: Node) {
        this._parent = parent;
    }

    public _setRect(rect: Rect) {
        this._rect = rect;
    }

    public _setWeight(weight: number) {
        this._attributes.weight = weight;
    }

    public _setSelected(index: number) {
        this._attributes.selected = index;
    }

    public _isFixed() {
        return this._fixed;
    }

    public _layout(rect: Rect) {
        this._rect = rect;
    }

    public _findDropTargetNode(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
        let rtn: DropInfo | undefined;
        if (this._rect.contains(x, y)) {
            rtn = this.canDrop(dragNode, x, y);
            if (rtn === undefined && this._children.length !== 0) {
                for (const child of this._children) {
                    rtn = child._findDropTargetNode(dragNode, x, y);
                    if (rtn !== undefined) {
                        break;
                    }
                }
            }
        }

        return rtn;
    }

    public canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined {
        return undefined;
    }

    public _canDockInto(dragNode: (Node & IDraggable), dropInfo: DropInfo | undefined): boolean {
        if (dropInfo !== undefined) {
            if (dropInfo.location === DockLocation.CENTER && dropInfo.node.isEnableDrop() === false) {
                return false;
            }

            // prevent named tabset docking into another tabset, since this would lose the header
            if (dropInfo.location === DockLocation.CENTER &&
                dragNode.getType() === "tabset" &&
                dragNode.getName() !== undefined) {
                return false;
            }

            if (dropInfo.location !== DockLocation.CENTER && dropInfo.node.isEnableDivide() === false) {
                return false;
            }

            // finally check model callback to check if drop allowed
            const canDock = this._model._getOnAllowDrop();
            if (canDock !== undefined) {
                return canDock(dragNode, dropInfo);
            }
        }
        return true;
    }

    public _removeChild(childNode: Node) {
        const pos = this._children.indexOf(childNode);
        if (pos !== -1) {
            this._children.splice(pos, 1);
        }
        this._dirty = true;
        return pos;
    }

    public _addChild(childNode: Node, pos?: number) {
        if (pos !== undefined) {
            this._children.splice(pos, 0, childNode);
        } else {
            this._children.push(childNode);
            pos = this._children.length - 1;
        }
        childNode._parent = this;
        this._dirty = true;
        return pos;
    }

    public _removeAll() {
        this._children = [];
        this._dirty = true;
    }

    public _styleWithPosition(style?: CSSProperties): CSSProperties {
        if (style === undefined) {
            style = {};
        }
        return this._rect.styleWithPosition(style);
    }

    public _getTempSize() {
        return this._tempSize;
    }

    public _setTempSize(value: number) {
        this._tempSize = value;
    }

    public isEnableDivide() {
        return true;
    }

    public _toAttributeString() {
        return JSON.stringify(this._attributes, undefined, "\t");
    }

    // implemented by subclasses
    public abstract _updateAttrs(json: any): void;
    public abstract _getAttributeDefinitions(): AttributeDefinitions;
    public abstract _toJson(): any;

    protected _getAttributeAsStringOrUndefined(attr: string) {
        const value = this._attributes[attr];
        if (value !== undefined) {
            return value as string;
        }
        return undefined;
    }

    protected _getAttributeAsNumberOrUndefined(attr: string) {
        const value = this._attributes[attr];
        if (value !== undefined) {
            return value as number;
        }
        return undefined;
    }

}

export default Node;
