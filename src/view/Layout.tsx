import * as React from "react";
import * as ReactDOM from "react-dom";
import DragDrop from "../DragDrop";
import Action from "../model/Action";
import Actions from "../model/Actions";
import BorderNode from "../model/BorderNode";
import BorderSet from "../model/BorderSet";
import IDraggable from "../model/IDraggable";
import Model from "../model/Model";
import Node from "../model/Node";
import RowNode from "../model/RowNode";
import SplitterNode from "../model/SplitterNode";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import Rect from "../Rect";
import { Dictionary } from "../Types";
import { BorderTabSet } from "./BorderTabSet";
import { Splitter } from "./Splitter";
import { Tab } from "./Tab";
import { TabSet } from "./TabSet";

export interface ILayoutProps {
    model: Model;
    factory: (node: TabNode) => React.ReactNode;
    onAction?: (action: Action) => void;
    onRenderTab?: (node: TabNode, renderValues: { leading: React.ReactNode, content: React.ReactNode }) => void;
    onRenderTabSet?: (
        tabSetNode: (TabSetNode | BorderNode),
        renderValues: { headerContent?: React.ReactNode, buttons: React.ReactNode[] },
    ) => void;
    onModelChange?: (model: Model) => void;
    classNameMapper?: (defaultClassName: string) => string;
}

/**
 * A React component that hosts a multi-tabbed layout
 */
export class Layout extends React.Component<ILayoutProps, any> {
    private selfRef?: HTMLDivElement;

    private model: Model;
    private rect: Rect;
    private centerRect?: Rect;

    private tabIds: string[];
    private newTabJson: any;
    private firstMove: boolean = false;
    private dragNode?: (Node & IDraggable);
    private dragDiv?: HTMLDivElement;
    private dragDivText: string = "";
    private dropInfo: any;
    private outlineDiv?: HTMLDivElement;

    private edgeRightDiv?: HTMLDivElement;
    private edgeBottomDiv?: HTMLDivElement;
    private edgeLeftDiv?: HTMLDivElement;
    private edgeTopDiv?: HTMLDivElement;
    private fnNewNodeDropped?: (() => void);

    public constructor(props: ILayoutProps) {
        super(props);
        this.model = this.props.model;
        this.rect = new Rect(0, 0, 0, 0);
        this.model._setChangeListener(this.onModelChange.bind(this));
        this.updateRect = this.updateRect.bind(this);
        this.getClassName = this.getClassName.bind(this);
        this.tabIds = [];
    }

    public doAction(action: Action): void {
        if (this.props.onAction !== undefined) {
            this.props.onAction(action);
        } else {
            this.model.doAction(action);
        }
    }

    public componentWillReceiveProps(newProps: ILayoutProps) {
        if (this.model !== newProps.model) {
            if (this.model !== undefined) {
                this.model._setChangeListener(undefined); // stop listening to old model
            }
            this.model = newProps.model;
            this.model._setChangeListener(this.onModelChange.bind(this));
            this.forceUpdate();
        }
    }

    public componentDidMount() {
        this.updateRect();

        // need to re-render if size changes
        window.addEventListener("resize", this.updateRect);
    }

    public componentDidUpdate() {
        this.updateRect();
    }

    public getClassName(defaultClassName: string) {
        if (this.props.classNameMapper === undefined) {
            return defaultClassName;
        } else {
            return this.props.classNameMapper(defaultClassName);
        }
    }

    public componentWillUnmount() {
        window.removeEventListener("resize", this.updateRect);
    }

    public render() {
        const borderComponents: React.ReactNode[] = [];
        const tabSetComponents: React.ReactNode[] = [];
        const tabComponents: Dictionary<React.ReactNode> = {};
        const splitterComponents: React.ReactNode[] = [];

        this.centerRect = this.model._layout(this.rect);

        this.renderBorder(this.model.getBorderSet(), borderComponents, tabComponents, splitterComponents);
        this.renderChildren(this.model.getRoot(), tabSetComponents, tabComponents, splitterComponents);

        const nextTopIds: string[] = [];
        const nextTopIdsMap: Dictionary<string> = {};

        // Keep any previous tabs in the same DOM order as before, removing any that have been deleted
        this.tabIds.forEach((t) => {
            if (tabComponents[t]) {
                nextTopIds.push(t);
                nextTopIdsMap[t] = t;
            }
        });
        this.tabIds = nextTopIds;

        // Add tabs that have been added to the DOM
        Object.keys(tabComponents).forEach((t) => {
            if (!nextTopIdsMap[t]) {
                this.tabIds.push(t);
            }
        });

        return (
            <div
                ref={(self) => this.selfRef = (self === null) ? undefined : self}
                className={this.getClassName("flexlayout__layout")}
            >
                {tabSetComponents}
                {this.tabIds.map((t) => tabComponents[t])}
                {borderComponents}
                {splitterComponents}
            </div>
        );
    }

    public dragStart(
        event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement> | undefined,
        dragDivText: string,
        node: (Node & IDraggable),
        allowDrag: boolean,
        onClick?: (event: React.SyntheticEvent<HTMLElement> | Event) => void,
        onDoubleClick?: (event: React.SyntheticEvent<HTMLElement> | Event) => void) {
        if (this.model.getMaximizedTabset() !== undefined || !allowDrag) {
            DragDrop.instance.startDrag(event, undefined, undefined, undefined, undefined, onClick, onDoubleClick);
        } else {
            this.dragNode = node;
            this.dragDivText = dragDivText;
            DragDrop.instance.startDrag(
                event,
                this.onDragStart.bind(this),
                this.onDragMove.bind(this),
                this.onDragEnd.bind(this),
                this.onCancelDrag.bind(this),
                onClick,
                onDoubleClick,
            );
        }
    }

    public maximize(tabsetNode: TabSetNode) {
        this.doAction(Actions.maximizeToggle(tabsetNode.getId()));
    }

    public customizeTab(tabNode: TabNode, renderValues: { leading: React.ReactNode, content: React.ReactNode }) {
        if (this.props.onRenderTab) {
            this.props.onRenderTab(tabNode, renderValues);
        }
    }

    public customizeTabSet(
        tabSetNode: (TabSetNode | BorderNode),
        renderValues: { headerContent?: React.ReactNode, buttons: React.ReactNode[] }) {
        if (this.props.onRenderTabSet) {
            this.props.onRenderTabSet(tabSetNode, renderValues);
        }
    }

    private onModelChange() {
        this.forceUpdate();
        if (this.props.onModelChange) {
            this.props.onModelChange(this.model);
        }
    }

    private updateRect() {
        const domRect = this.selfRef!.getBoundingClientRect();
        const rect = new Rect(0, 0, domRect.width, domRect.height);
        if (!rect.equals(this.rect)) {
            this.rect = rect;
            this.forceUpdate();
        }
    }

    private renderBorder(
        borderSet: BorderSet,
        borderComponents: React.ReactNode[],
        tabComponents: Dictionary<React.ReactNode>,
        splitterComponents: React.ReactNode[]) {
        for (const border of borderSet.getBorders()) {
            if (border.isShowing()) {
                borderComponents.push(
                    <BorderTabSet
                        key={"border_" + border.getLocation().name}
                        border={border}
                        layout={this}
                    />,
                );
                const drawChildren = border._getDrawChildren();
                for (let i = 0; i < drawChildren.length; i++) {
                    const child = drawChildren[i];

                    if (child instanceof SplitterNode) {
                        splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child} />);
                    } else if (child instanceof TabNode) {
                        tabComponents[child.getId()] = (
                            <Tab
                                key={child.getId()}
                                node={child}
                                selected={i === border.getSelected()}
                                onAction={this.doAction}
                                factory={this.props.factory}
                            />
                        );
                    }
                }
            }
        }
    }

    private renderChildren(
        node: (RowNode | TabSetNode),
        tabSetComponents: React.ReactNode[],
        tabComponents: Dictionary<React.ReactNode>,
        splitterComponents: React.ReactNode[]) {
        const drawChildren = node._getDrawChildren();
        if (drawChildren === undefined) {
            return;
        }

        for (const child of drawChildren) {
            if (child instanceof SplitterNode) {
                splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child} />);
            } else if (child instanceof TabSetNode) {
                tabSetComponents.push(<TabSet key={child.getId()} layout={this} node={child} />);
                this.renderChildren(child, tabSetComponents, tabComponents, splitterComponents);
            } else if (child instanceof TabNode) {
                const selectedTab = child.getParent()!.getChildren()[(child.getParent() as TabSetNode).getSelected()];
                if (selectedTab === undefined) {
                    // tslint:disable-next-line:no-console
                    console.error("this should not happen");
                }
                tabComponents[child.getId()] = (
                    <Tab
                        key={child.getId()}
                        node={child}
                        selected={child === selectedTab}
                        onAction={this.doAction}
                        factory={this.props.factory}
                    />
                );
            } else {// is row
                this.renderChildren(child as RowNode, tabSetComponents, tabComponents, splitterComponents);
            }
        }
    }

    private onCancelDrag(wasDragging: boolean) {
        if (wasDragging) {
            const rootdiv = ReactDOM.findDOMNode(this) as HTMLDivElement;

            try {
                rootdiv.removeChild(this.outlineDiv!);
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.error(e);
            }

            try {
                rootdiv.removeChild(this.dragDiv!);
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.error(e);
            }

            this.dragDiv = undefined;
            this.hideEdges(rootdiv);
            if (this.fnNewNodeDropped !== undefined) {
                this.fnNewNodeDropped();
                this.fnNewNodeDropped = undefined;
            }
            DragDrop.instance.hideGlass();
            this.newTabJson = undefined;
        }
    }

    private onDragStart() {
        this.dropInfo = undefined;
        const rootdiv = ReactDOM.findDOMNode(this) as HTMLElement;
        this.outlineDiv = document.createElement("div");
        this.outlineDiv.className = this.getClassName("flexlayout__outline_rect");
        rootdiv.appendChild(this.outlineDiv);

        if (this.dragDiv === undefined) {
            this.dragDiv = document.createElement("div");
            this.dragDiv.className = this.getClassName("flexlayout__drag_rect");
            this.dragDiv.innerHTML = this.dragDivText;
            rootdiv.appendChild(this.dragDiv);
        }
        // add edge indicators
        this.showEdges(rootdiv);

        if (this.dragNode instanceof TabNode && this.dragNode.getTabRect() !== undefined) {
            this.dragNode.getTabRect()!.positionElement(this.outlineDiv);
        }
        this.firstMove = true;

        return true;
    }

    private onDragMove(event: React.SyntheticEvent<HTMLElement> | Event) {
        if (this.firstMove === false) {
            const speed = this.model._getAttribute("tabDragSpeed") as number;
            this.outlineDiv!.style.transition = `top ${speed}s, left ${speed}s, width ${speed}s, height ${speed}s`;
        }
        this.firstMove = false;
        const clientRect = this.selfRef!.getBoundingClientRect();
        const pos = {
            x: (event as any).clientX - clientRect.left,
            y: (event as any).clientY - clientRect.top,
        };

        this.dragDiv!.style.left = (pos.x - this.dragDiv!.getBoundingClientRect().width / 2) + "px";
        this.dragDiv!.style.top = pos.y + 5 + "px";

        const dropInfo = this.model._findDropTargetNode(this.dragNode!, pos.x, pos.y);
        if (dropInfo) {
            this.dropInfo = dropInfo;
            this.outlineDiv!.className = this.getClassName(dropInfo.className);
            dropInfo.rect.positionElement(this.outlineDiv!);
        }
    }

    private onDragEnd() {
        const rootdiv = ReactDOM.findDOMNode(this) as HTMLElement;
        rootdiv.removeChild(this.outlineDiv!);
        rootdiv.removeChild(this.dragDiv!);
        this.dragDiv = undefined;
        this.hideEdges(rootdiv);
        DragDrop.instance.hideGlass();

        if (this.dropInfo) {
            if (this.newTabJson !== undefined) {
                const action = Actions.addNode(
                    this.newTabJson,
                    this.dropInfo.node.getId(),
                    this.dropInfo.location,
                    this.dropInfo.index,
                );
                this.doAction(action);
                if (this.fnNewNodeDropped !== undefined) {
                    this.fnNewNodeDropped();
                    this.fnNewNodeDropped = undefined;
                }
                this.newTabJson = undefined;
            } else if (this.dragNode !== undefined) {
                const action = Actions.moveNode(
                    this.dragNode.getId(),
                    this.dropInfo.node.getId(),
                    this.dropInfo.location,
                    this.dropInfo.index,
                );
                this.doAction(action);
            }

        }
    }

    private showEdges(rootdiv: HTMLElement) {
        if (this.model.isEnableEdgeDock()) {
            const domRect = rootdiv.getBoundingClientRect();
            const r = this.centerRect!;
            const size = 100;
            const length = size + "px";
            const radius = "50px";
            const width = "10px";

            this.edgeTopDiv = document.createElement("div");
            this.edgeTopDiv.className = this.getClassName("flexlayout__edge_rect");
            this.edgeTopDiv.style.top = r.y + "px";
            this.edgeTopDiv.style.left = r.x + (r.width - size) / 2 + "px";
            this.edgeTopDiv.style.width = length;
            this.edgeTopDiv.style.height = width;
            this.edgeTopDiv.style.borderBottomLeftRadius = radius;
            this.edgeTopDiv.style.borderBottomRightRadius = radius;

            this.edgeLeftDiv = document.createElement("div");
            this.edgeLeftDiv.className = this.getClassName("flexlayout__edge_rect");
            this.edgeLeftDiv.style.top = r.y + (r.height - size) / 2 + "px";
            this.edgeLeftDiv.style.left = r.x + "px";
            this.edgeLeftDiv.style.width = width;
            this.edgeLeftDiv.style.height = length;
            this.edgeLeftDiv.style.borderTopRightRadius = radius;
            this.edgeLeftDiv.style.borderBottomRightRadius = radius;

            this.edgeBottomDiv = document.createElement("div");
            this.edgeBottomDiv.className = this.getClassName("flexlayout__edge_rect");
            this.edgeBottomDiv.style.bottom = (domRect.height - r.getBottom()) + "px";
            this.edgeBottomDiv.style.left = r.x + (r.width - size) / 2 + "px";
            this.edgeBottomDiv.style.width = length;
            this.edgeBottomDiv.style.height = width;
            this.edgeBottomDiv.style.borderTopLeftRadius = radius;
            this.edgeBottomDiv.style.borderTopRightRadius = radius;

            this.edgeRightDiv = document.createElement("div");
            this.edgeRightDiv.className = this.getClassName("flexlayout__edge_rect");
            this.edgeRightDiv.style.top = r.y + (r.height - size) / 2 + "px";
            this.edgeRightDiv.style.right = (domRect.width - r.getRight()) + "px";
            this.edgeRightDiv.style.width = width;
            this.edgeRightDiv.style.height = length;
            this.edgeRightDiv.style.borderTopLeftRadius = radius;
            this.edgeRightDiv.style.borderBottomLeftRadius = radius;

            rootdiv.appendChild(this.edgeTopDiv);
            rootdiv.appendChild(this.edgeLeftDiv);
            rootdiv.appendChild(this.edgeBottomDiv);
            rootdiv.appendChild(this.edgeRightDiv);
        }
    }

    private hideEdges(rootdiv: HTMLElement) {
        if (this.model.isEnableEdgeDock()) {
            try {
                rootdiv.removeChild(this.edgeTopDiv!);
                rootdiv.removeChild(this.edgeLeftDiv!);
                rootdiv.removeChild(this.edgeBottomDiv!);
                rootdiv.removeChild(this.edgeRightDiv!);
            } catch (e) {
                // tslint:disable-next-line:no-console
                console.error(e);
            }
        }
    }
}

export default Layout;
