import * as React from "react";
import Action from "../model/Action";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";

export interface ITabProps {
    selected: boolean;
    node: TabNode;
    onAction: (action: Action) => void;
    factory: (node: TabNode) => React.ReactNode;
}

interface TabState {
    readonly renderComponent: boolean;
}

export class Tab extends React.Component<ITabProps, TabState> {

    constructor(props: ITabProps) {
        super(props);
        this.state = {
            renderComponent: !props.node.isEnableRenderOnDemand() || props.selected,
        };
    }

    public componentWillReceiveProps(newProps: ITabProps) {
        if (!this.state.renderComponent && newProps.selected) {
            // load on demand
            this.setState({ renderComponent: true });
        }
    }

    public onMouseDown() {
        const parent = this.props.node.getParent() as TabSetNode;
        if (parent.getType() === TabSetNode.TYPE && !parent.isActive()) {
            this.props.onAction(Actions.setActiveTabset(parent.getId()));
        }
    }

    public render() {
        const node = this.props.node;
        const parentNode = node.getParent() as TabSetNode;
        const style: React.CSSProperties = node._styleWithPosition({
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
                className="flexlayout__tab"
                onMouseDown={this.onMouseDown.bind(this)}
                onTouchStart={this.onMouseDown.bind(this)}
                style={style}
            >
                {child}
            </div>
        );
    }
}
