import * as React from "react";
import Border from "../model/BorderNode";
import { BorderButton } from "./BorderButton";
import * as DockLocation from "../DockLocation";
import Layout from "./Layout";
import TabNode from "../model/TabNode";

export interface IBorderTabSetProps {
    border: Border,
    layout: Layout
}

export const BorderTabSet = (props: IBorderTabSetProps) => {
    let cm = props.layout.getClassName;

    const border = props.border;
    const style = border.getTabHeaderRect()!.styleWithPosition({});
    const tabs = [];
    if (border.getLocation() !== DockLocation.LEFT) {
        for (let i = 0; i < border.getChildren().length; i++) {
            let isSelected = border.getSelected() === i;
            let child = border.getChildren()[i] as TabNode;
            tabs.push(<BorderButton layout={props.layout}
                border={border.getLocation().name}
                node={child}
                key={child.getId()}
                selected={isSelected} />);
        }
    }
    else {
        for (let i = border.getChildren().length - 1; i >= 0; i--) {
            let isSelected = border.getSelected() === i;
            let child = border.getChildren()[i] as TabNode;
            tabs.push(<BorderButton layout={props.layout}
                border={border.getLocation().name}
                node={child}
                key={child.getId()}
                selected={isSelected} />);
        }
    }

    let borderClasses = cm("flexlayout__border_" + border.getLocation().name);
    if (props.border.getClassName() !== undefined) {
        borderClasses += " " + props.border.getClassName();
    }

    // allow customization of tabset right/bottom buttons
    let buttons: Array<any> = [];
    const renderState = { headerContent: {}, buttons: buttons };
    props.layout.customizeTabSet(border, renderState);
    buttons = renderState.buttons;

    const toolbar = <div
        key="toolbar"
        className={cm("flexlayout__border_toolbar_" + border.getLocation().name)}>
        {buttons}
    </div>;

    return <div
        style={style}
        className={borderClasses}>
        <div className={cm("flexlayout__border_inner_" + border.getLocation().name)}>
            {tabs}
        </div>
        {toolbar}
    </div>;
};
