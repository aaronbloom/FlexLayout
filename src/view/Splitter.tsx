import * as React from "react";
import * as ReactDOM from "react-dom";
import DragDrop from "../DragDrop";
import Actions from "../model/Actions";
import BorderNode from "../model/BorderNode";
import Node from "../model/Node";
import RowNode from "../model/RowNode";
import SplitterNode from "../model/SplitterNode";
import Orientation from "../Orientation";
import Layout from "./Layout";

export interface ISplitterProps {
    readonly layout: Layout;
    readonly node: SplitterNode;
}

export class Splitter extends React.Component<ISplitterProps, {}> {

    private pBounds?: number[];
    private outlineDiv?: HTMLDivElement;

    public render() {
        const cm = this.props.layout.getClassName;

        const node = this.props.node;
        const style = node._styleWithPosition(
            {
                cursor: this.props.node.getOrientation() === Orientation.HORZ ? "ns-resize" : "ew-resize",
            },
        );

        return (
            <div
                style={style}
                onTouchStart={this.onMouseDown.bind(this)}
                onMouseDown={this.onMouseDown.bind(this)}
                className={cm("flexlayout__splitter")}
            />
        );
    }

    private onMouseDown(event: React.SyntheticEvent<HTMLElement>) {
        DragDrop.instance.startDrag(
            event,
            this.onDragStart.bind(this),
            this.onDragMove.bind(this),
            this.onDragEnd.bind(this),
            this.onDragCancel.bind(this),
        );
        const parentNode = this.props.node.getParent() as RowNode;
        this.pBounds = parentNode._getSplitterBounds(this.props.node);
        const rootdiv = ReactDOM.findDOMNode(this.props.layout) as Element;
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.style.position = "absolute";
        this.outlineDiv.className = this.props.layout.getClassName("flexlayout__splitter_drag");
        this.outlineDiv.style.cursor = this.props.node.getOrientation() === Orientation.HORZ
            ? "ns-resize" : "ew-resize";
        this.props.node.getRect().positionElement(this.outlineDiv);
        rootdiv.appendChild(this.outlineDiv);
    }

    private onDragCancel() {
        const rootdiv = ReactDOM.findDOMNode(this.props.layout) as Element;
        rootdiv.removeChild(this.outlineDiv as Element);
    }

    private onDragStart() {
        return true;
    }

    private onDragMove(event: any) {
        const clientRect = (ReactDOM.findDOMNode(this.props.layout) as Element).getBoundingClientRect();
        if ("clientX" in event && "clientY" in event) {
            const pos = {
                x: event.clientX - clientRect.left,
                y: event.clientY - clientRect.top,
            };

            const outlineDiv = this.outlineDiv as HTMLDivElement;

            if (this.props.node.getOrientation() === Orientation.HORZ) {
                outlineDiv.style.top = this.getBoundPosition(pos.y - 4) + "px";
            } else {
                outlineDiv.style.left = this.getBoundPosition(pos.x - 4) + "px";
            }
        }
    }

    private onDragEnd() {
        const node = this.props.node;
        const parentNode = node.getParent() as RowNode;
        const outlineDiv = this.outlineDiv as HTMLDivElement;
        const value = node.getOrientation() === Orientation.HORZ ? outlineDiv.offsetTop : outlineDiv.offsetLeft;

        if (parentNode instanceof BorderNode) {
            const pos = (parentNode as BorderNode)._calculateSplit(node, value);
            this.props.layout.doAction(Actions.adjustBorderSplit((node.getParent() as Node).getId(), pos));
        } else {
            const splitSpec = parentNode._calculateSplit(this.props.node, value);
            if (splitSpec !== undefined) {
                this.props.layout.doAction(Actions.adjustSplit(splitSpec));
            }
        }

        const rootdiv = ReactDOM.findDOMNode(this.props.layout) as Element;
        rootdiv.removeChild(this.outlineDiv as HTMLDivElement);
    }

    private getBoundPosition(p: number) {
        const bounds = this.pBounds as number[];
        let rtn = p;
        if (p < bounds[0]) {
            rtn = bounds[0];
        }
        if (p > bounds[1]) {
            rtn = bounds[1];
        }

        return rtn;
    }
}
