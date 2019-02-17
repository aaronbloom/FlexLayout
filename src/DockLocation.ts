import Orientation from "./Orientation";
import Rect from "./Rect";

export type DockLocationType =
    "top" |
    "bottom" |
    "left" |
    "right" |
    "center";

export interface DockLocation {
    readonly name: DockLocationType;
    readonly orientation: Orientation;
    readonly indexPlus: number;
}

export const TOP: DockLocation = {
    name: "top",
    orientation: Orientation.VERT,
    indexPlus: 0,
};

export const BOTTOM: DockLocation = {
    name: "bottom",
    orientation: Orientation.VERT,
    indexPlus: 1,
};

export const LEFT: DockLocation = {
    name: "left",
    orientation: Orientation.HORZ,
    indexPlus: 0,
};

export const RIGHT: DockLocation = {
    name: "right",
    orientation: Orientation.HORZ,
    indexPlus: 1,
};

export const CENTER: DockLocation = {
    name: "center",
    orientation: Orientation.VERT,
    indexPlus: 0,
};

export const DockLocations: Record<DockLocationType, DockLocation> = {
    top: TOP,
    bottom: BOTTOM,
    left: LEFT,
    right: RIGHT,
    center: CENTER,
};

export const getByName = (name: DockLocationType): DockLocation => {
    return DockLocations[name];
};

export const getLocation = (rect: Rect, x: number, y: number): DockLocation => {
    if (x < rect.x + rect.width / 4) {
        return LEFT;
    }
    if (x > rect.getRight() - rect.width / 4) {
        return RIGHT;
    }
    if (y < rect.y + rect.height / 4) {
        return TOP;
    }
    if (y > rect.getBottom() - rect.height / 4) {
        return BOTTOM;
    }
    return CENTER;
};

export const getDockRect = (location: DockLocationType, r: Rect): Rect => {
    if (location === "top") {
        return new Rect(r.x, r.y, r.width, r.height / 2);
    }
    if (location === "bottom") {
        return new Rect(r.x, r.getBottom() - r.height / 2, r.width, r.height / 2);
    }
    if (location === "left") {
        return new Rect(r.x, r.y, r.width / 2, r.height);
    }
    if (location === "right") {
        return new Rect(r.getRight() - r.width / 2, r.y, r.width / 2, r.height);
    }
    return r.clone();
};

export const split = (location: DockLocationType, rect: Rect, size: number) => {
    if (location === "top") {
        return {
            start: new Rect(rect.x, rect.y, rect.width, size),
            end: new Rect(rect.x, rect.y + size, rect.width, rect.height - size),
        };
    }
    if (location === "left") {
        return {
            start: new Rect(rect.x, rect.y, size, rect.height),
            end: new Rect(rect.x + size, rect.y, rect.width - size, rect.height),
        };
    }
    if (location === "right") {
        return {
            start: new Rect(rect.getRight() - size, rect.y, size, rect.height),
            end: new Rect(rect.x, rect.y, rect.width - size, rect.height),
        };
    }
    return {
        start: new Rect(rect.x, rect.getBottom() - size, rect.width, size),
        end: new Rect(rect.x, rect.y, rect.width, rect.height - size),
    };
};

export const reflect = (location: DockLocationType): DockLocation => {
    if (location === "top") {
        return BOTTOM;
    }
    if (location === "left") {
        return RIGHT;
    }
    if (location === "right") {
        return LEFT;
    } else {
        return TOP;
    }
};
