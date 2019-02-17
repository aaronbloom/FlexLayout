import * as React from "react";
import * as ReactDOM from "react-dom";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import Rect from "../Rect";
import Layout from "./Layout";

export interface IBorderButtonProps {
    readonly layout: Layout;
    readonly node: TabNode;
    readonly selected: boolean;
    readonly border: string;
}

export class BorderButton extends React.Component<IBorderButtonProps, {}> {
    public selfRef?: HTMLDivElement;
    public contentsRef?: HTMLDivElement;

    public componentDidMount() {
        this.updateRect();
    }

    public componentDidUpdate() {
        this.updateRect();
    }

    public render() {
        const cm = this.props.layout.getClassName;
        let classNames = cm("flexlayout__border_button") + " " +
            cm("flexlayout__border_button_" + this.props.border);
        const node = this.props.node;

        if (this.props.selected) {
            classNames += " " + cm("flexlayout__border_button--selected");
        } else {
            classNames += " " + cm("flexlayout__border_button--unselected");
        }

        if (this.props.node.getClassName() !== undefined) {
            classNames += " " + this.props.node.getClassName();
        }

        let leadingContent;

        if (node.getIcon() !== undefined) {
            leadingContent = <img src={node.getIcon()} />;
        }

        const content = (
            <div
                ref={(ref) => this.contentsRef = (ref === null) ? undefined : ref}
                className={cm("flexlayout__border_button_content")}
            >
                {node.getName()}
            </div>
        );

        let closeButton;
        if (this.props.node.isEnableClose()) {
            closeButton = (
                <div
                    className={cm("flexlayout__border_button_trailing")}
                    onMouseDown={this.onCloseMouseDown.bind(this)}
                    onClick={this.onClose.bind(this)}
                    onTouchStart={this.onCloseMouseDown.bind(this)}
                />
            );
        }

        return (
            <div
                ref={(ref) => this.selfRef = (ref === null) ? undefined : ref}
                style={{}}
                className={classNames}
                onMouseDown={this.onMouseDown.bind(this)}
                onTouchStart={this.onMouseDown.bind(this)}
            >
                {leadingContent}
                {content}
                {closeButton}
            </div>
        );
    }

    private onMouseDown(event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
        this.props.layout.dragStart(
            event,
            "Move: " + this.props.node.getName(),
            this.props.node,
            this.props.node.isEnableDrag(),
            this.onClick.bind(this),
            () => undefined,
        );
    }

    private onClick() {
        const node = this.props.node;
        this.props.layout.doAction(Actions.selectTab(node.getId()));
    }

    private onClose() {
        const node = this.props.node;
        this.props.layout.doAction(Actions.deleteTab(node.getId()));
    }

    private onCloseMouseDown(event: React.SyntheticEvent<HTMLDivElement>) {
        event.stopPropagation();
    }

    private updateRect() {
        // record position of tab in border
        const clientRect = (ReactDOM.findDOMNode(this.props.layout) as Element).getBoundingClientRect();
        const r = (this.selfRef as Element).getBoundingClientRect();
        this.props.node._setTabRect(new Rect(r.left - clientRect.left, r.top - clientRect.top, r.width, r.height));
    }
}
