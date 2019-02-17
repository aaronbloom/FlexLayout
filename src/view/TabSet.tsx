import * as React from "react";
import Actions from "../model/Actions";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import PopupMenu from "../PopupMenu";
import Layout from "./Layout";
import { TabButton } from "./TabButton";

/** @hidden @internal */
export interface ITabSetProps {
    layout: Layout;
    node: TabSetNode;
}

/** @hidden @internal */
export class TabSet extends React.Component<ITabSetProps, any> {
    public headerRef?: HTMLDivElement;
    public overflowbuttonRef?: Element;
    public toolbarRef?: HTMLDivElement;

    public recalcVisibleTabs: boolean;
    public showOverflow: boolean;
    public showToolbar: boolean;

    constructor(props: ITabSetProps) {
        super(props);
        this.recalcVisibleTabs = true;
        this.showOverflow = false;
        this.showToolbar = true;
        this.state = { hideTabsAfter: 999 };
    }

    public componentDidMount() {
        this.updateVisibleTabs();
    }

    public componentDidUpdate() {
        this.updateVisibleTabs();
    }

    public componentWillReceiveProps(nextProps: ITabSetProps) {
        this.showToolbar = true;
        this.showOverflow = false;
        this.recalcVisibleTabs = true;
        this.setState({ hideTabsAfter: 999 });
    }

    public updateVisibleTabs() {
        const node = this.props.node;

        if (node.isEnableTabStrip() && this.recalcVisibleTabs) {
            const toolbarWidth = (this.toolbarRef as Element).getBoundingClientRect().width;
            let hideTabsAfter = 999;
            for (let i = 0; i < node.getChildren().length; i++) {
                const child = node.getChildren()[i] as TabNode;
                if (child.getTabRect()!.getRight() > node.getRect().getRight() - (20 + toolbarWidth)) {
                    hideTabsAfter = Math.max(0, i - 1);
                    this.showOverflow = node.getChildren().length > 1;

                    if (i === 0) {
                        this.showToolbar = false;
                        if (child.getTabRect()!.getRight() > node.getRect().getRight() - 20) {
                            this.showOverflow = false;
                        }
                    }

                    break;
                }
            }
            if (this.state.hideTabsAfter !== hideTabsAfter) {
                this.setState({ hideTabsAfter });
            }
            this.recalcVisibleTabs = false;
        }
    }

    public render() {
        const cm = this.props.layout.getClassName;

        const node = this.props.node;
        const style = node._styleWithPosition();

        if (this.props.node.isMaximized()) {
            style.zIndex = 100;
        }

        const tabs = [];
        const hiddenTabs: Array<{ name: string, node: TabNode, index: number }> = [];
        if (node.isEnableTabStrip()) {
            for (let i = 0; i < node.getChildren().length; i++) {
                let isSelected = this.props.node.getSelected() === i;
                const showTab = this.state.hideTabsAfter >= i;

                let child = node.getChildren()[i] as TabNode;

                if (this.state.hideTabsAfter === i && this.props.node.getSelected() > this.state.hideTabsAfter) {
                    hiddenTabs.push({ name: child.getName(), node: child, index: i });
                    child = node.getChildren()[this.props.node.getSelected()] as TabNode;
                    isSelected = true;
                } else if (!showTab && !isSelected) {
                    hiddenTabs.push({ name: child.getName(), node: child, index: i });
                }
                if (showTab) {
                    tabs.push(
                        <TabButton
                            layout={this.props.layout}
                            node={child}
                            key={child.getId()}
                            selected={isSelected}
                            show={showTab}
                            height={node.getTabStripHeight()}
                        />,
                    );
                }
            }
        }

        let buttons: any[] = [];

        // allow customization of header contents and buttons
        const renderState = { headerContent: node.getName(), buttons };
        this.props.layout.customizeTabSet(this.props.node, renderState);
        const headerContent = renderState.headerContent;
        buttons = renderState.buttons;

        let toolbar;
        if (this.showToolbar === true) {
            if (this.props.node.isEnableMaximize()) {
                buttons.push(
                    <button
                        key="max"
                        className={cm("flexlayout__tab_toolbar_button-" + (node.isMaximized() ? "max" : "min"))}
                        onClick={this.onMaximizeToggle.bind(this)}
                    />,
                );
            }
            toolbar = (
                <div
                    key="toolbar"
                    ref={(ref) => this.toolbarRef = (ref === null) ? undefined : ref}
                    className={cm("flexlayout__tab_toolbar")}
                    onMouseDown={this.onInterceptMouseDown.bind(this)}
                >
                    {buttons}
                </div>
            );
        }

        if (this.showOverflow === true) {
            tabs.push(
                <button
                    key="overflowbutton"
                    ref={(ref) => this.overflowbuttonRef = (ref === null) ? undefined : ref}
                    className={cm("flexlayout__tab_button_overflow")}
                    onClick={this.onOverflowClick.bind(this, hiddenTabs)}
                    onMouseDown={this.onInterceptMouseDown.bind(this)}
                >
                    {hiddenTabs.length}
                </button>,
            );
        }

        const showHeader = node.getName() !== undefined;
        let header;
        let tabStrip;

        let tabStripClasses = cm("flexlayout__tab_header_outer");
        if (this.props.node.getClassNameTabStrip() !== undefined) {
            tabStripClasses += " " + this.props.node.getClassNameTabStrip();
        }
        if (node.isActive() && !showHeader) {
            tabStripClasses += " " + cm("flexlayout__tabset-selected");
        }

        if (node.isMaximized() && !showHeader) {
            tabStripClasses += " " + cm("flexlayout__tabset-maximized");
        }

        if (showHeader) {
            let tabHeaderClasses = cm("flexlayout__tabset_header");
            if (node.isActive()) {
                tabHeaderClasses += " " + cm("flexlayout__tabset-selected");
            }
            if (node.isMaximized()) {
                tabHeaderClasses += " " + cm("flexlayout__tabset-maximized");
            }
            if (this.props.node.getClassNameHeader() !== undefined) {
                tabHeaderClasses += " " + this.props.node.getClassNameHeader();
            }

            header = (
                <div
                    className={tabHeaderClasses}
                    style={{ height: node.getHeaderHeight() + "px" }}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onTouchStart={this.onMouseDown.bind(this)}
                >
                    {headerContent}
                    {toolbar}
                </div>
            );
            tabStrip = (
                <div
                    className={tabStripClasses}
                    style={{ height: node.getTabStripHeight() + "px", top: node.getHeaderHeight() + "px" }}
                >
                    <div
                        ref={(ref) => this.headerRef = (ref === null) ? undefined : ref}
                        className={cm("flexlayout__tab_header_inner")}
                    >
                        {tabs}
                    </div>
                </div>
            );
        } else {
            tabStrip = (
                <div
                    className={tabStripClasses}
                    style={{ top: "0px", height: node.getTabStripHeight() + "px" }}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onTouchStart={this.onMouseDown.bind(this)}
                >
                    <div
                        ref={(ref) => this.headerRef = (ref === null) ? undefined : ref}
                        className={cm("flexlayout__tab_header_inner")}
                    >
                        {tabs}
                    </div>
                    {toolbar}
                </div>
            );
        }

        return (
            <div style={style} className={cm("flexlayout__tabset")}>
                {header}
                {tabStrip}
            </div>
        );
    }

    public onOverflowClick(hiddenTabs: Array<{ name: string, node: TabNode, index: number }>) {
        const element = this.overflowbuttonRef as Element;
        PopupMenu.show(element, hiddenTabs, this.onOverflowItemSelect.bind(this), this.props.layout.getClassName);
    }

    public onOverflowItemSelect(item: { name: string, node: TabNode, index: number }) {
        this.props.layout.doAction(Actions.selectTab(item.node.getId()));
    }

    public onMouseDown(event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
        const name = this.props.node.getName();
        const newName = (name === undefined) ? "" : ": " + name;
        this.props.layout.doAction(Actions.setActiveTabset(this.props.node.getId()));
        this.props.layout.dragStart(
            event,
            "Move tabset" + newName,
            this.props.node,
            this.props.node.isEnableDrag(),
            () => undefined,
            this.onDoubleClick.bind(this),
        );
    }

    public onInterceptMouseDown(event: React.SyntheticEvent<HTMLElement>) {
        event.stopPropagation();
    }

    public onMaximizeToggle() {
        if (this.props.node.isEnableMaximize()) {
            this.props.layout.maximize(this.props.node);
        }
    }

    public onDoubleClick() {
        this.onMaximizeToggle();
    }
}
