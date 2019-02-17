import Orientation from "./Orientation";
import { Dictionary } from "./Types";

class Rect {

    public static empty() {
        return new Rect(0, 0, 0, 0);
    }

    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public clone() {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    public equals(rect: Rect) {
        if (this.x === rect.x
            && this.y === rect.y
            && this.width === rect.width
            && this.height === rect.height) {
            return true;
        } else {
            return false;
        }
    }

    public getBottom() {
        return this.y + this.height;
    }

    public getRight() {
        return this.x + this.width;
    }

    public positionElement(element: HTMLElement) {
        this.styleWithPosition(element.style);
    }

    public styleWithPosition(style: Dictionary<any>) {
        style.left = this.x + "px";
        style.top = this.y + "px";
        style.width = Math.max(0, this.width) + "px"; // need Math.max to prevent -ve, cause error in IE
        style.height = Math.max(0, this.height) + "px";
        style.position = "absolute";
        return style;
    }

    public contains(x: number, y: number) {
        if (this.x <= x && x <= this.getRight()
            && this.y <= y && y <= this.getBottom()) {
            return true;
        } else {
            return false;
        }
    }

    public removeInsets(insets: {top: number, left: number, bottom: number, right: number}) {
        return new Rect(
            this.x + insets.left,
            this.y + insets.top,
            Math.max(0, this.width - insets.left - insets.right),
            Math.max(0, this.height - insets.top - insets.bottom));
    }

    public centerInRect(outerRect: Rect) {
        this.x = (outerRect.width - this.width) / 2;
        this.y = (outerRect.height - this.height) / 2;
    }

    /** @hidden @internal */
    public _getSize(orientation: Orientation) {
        let prefSize = this.width;
        if (orientation === Orientation.VERT) {
            prefSize = this.height;
        }
        return prefSize;
    }

    public toString() {
        return "(Rect: x=" + this.x + ", y=" + this.y + ", width=" + this.width + ", height=" + this.height + ")";
    }
}

export default Rect;
