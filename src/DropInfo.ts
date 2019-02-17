import { DockLocation } from "./DockLocation";
import Rect from "./Rect";

interface DropInfoNode {
    isEnableDrop(): boolean;
    isEnableDivide(): boolean;
}

class DropInfo {
    public node: DropInfoNode;
    public rect: Rect;
    public location: DockLocation;
    public index: number;
    public className: string;

    constructor(node: DropInfoNode, rect: Rect, location: DockLocation, index: number, className: string) {
        this.node = node;
        this.rect = rect;
        this.location = location;
        this.index = index;
        this.className = className;
    }
}
export default DropInfo;
