import { DockLocation } from "../DockLocation";
import DropInfo from "../DropInfo";
import IDraggable from "./IDraggable";
import Node from "./Node";

export default interface IDropTarget {
    canDrop(dragNode: (Node & IDraggable), x: number, y: number): DropInfo | undefined;
    drop(dragNode: (Node & IDraggable), location: DockLocation, index: number): void;
    isEnableDrop(): boolean;
}
