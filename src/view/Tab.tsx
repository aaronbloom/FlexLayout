import * as React from "react";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import { Dictionary } from "../Types";
import Layout from "./Layout";

/** @hidden @internal */
export interface ITabProps {
    layout: Layout;
    selected: boolean;
    node: TabNode;
    factory: (node: TabNode) => React.ReactNode;
}

/** @hidden @internal */
export class Tab extends React.Component<ITabProps, any> {

    constructor(props: ITabProps) {
        super(props);
        this.state = { renderComponent: !props.node.isEnableRenderOnDemand() || props.selected };
    }

    public componentWillReceiveProps(newProps: ITabProps) {
        if (!this.state.renderComponent && newProps.selected) {
            // load on demand
            this.setState({ renderComponent: true });
        }
    }

    public onMouseDown(event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
        const parent = this.props.node.getParent() as TabSetNode;
        if (parent.getType() === TabSetNode.TYPE && !parent.isActive()) {
            this.props.layout.doAction(Actions.setActiveTabset(parent.getId()));
        }
    }

    public render() {
        const cm = this.props.layout.getClassName;

        const node = this.props.node;
        const parentNode = node.getParent() as TabSetNode;
        const style: Dictionary<any> = node._styleWithPosition({
            display: this.props.selected ? "block" : "none",
        });

        if (parentNode.isMaximized()) {
            style.zIndex = 100;
        }

        let child;
        if (this.state.renderComponent) {
            child = this.props.factory(node);
        }

        return (
            <div
                className={cm("flexlayout__tab")}
                onMouseDown={this.onMouseDown.bind(this)}
                onTouchStart={this.onMouseDown.bind(this)}
                style={style}
            >
                {child}
            </div>
        );
    }
}
