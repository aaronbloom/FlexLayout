import * as React from "react";
import * as DockLocation from "../DockLocation";
import Border from "../model/BorderNode";
import TabNode from "../model/TabNode";
import { BorderButton } from "./BorderButton";
import Layout from "./Layout";

export interface IBorderTabSetProps {
    readonly border: Border;
    readonly layout: Layout;
}

export const BorderTabSet = (props: IBorderTabSetProps) => {
    const cm = props.layout.getClassName;

    const border = props.border;
    const style = border.getTabHeaderRect()!.styleWithPosition({});
    const tabs = [];
    if (border.getLocation() !== DockLocation.LEFT) {
        for (let i = 0; i < border.getChildren().length; i++) {
            const isSelected = border.getSelected() === i;
            const child = border.getChildren()[i] as TabNode;
            const borderButton = (
                <BorderButton
                    layout={props.layout}
                    border={border.getLocation().name}
                    node={child}
                    key={child.getId()}
                    selected={isSelected}
                />
            );
            tabs.push(borderButton);
        }
    } else {
        for (let i = border.getChildren().length - 1; i >= 0; i--) {
            const isSelected = border.getSelected() === i;
            const child = border.getChildren()[i] as TabNode;
            const borderButton = (
                <BorderButton
                    layout={props.layout}
                    border={border.getLocation().name}
                    node={child}
                    key={child.getId()}
                    selected={isSelected}
                />
            );
            tabs.push(borderButton);
        }
    }

    let borderClasses = cm("flexlayout__border_" + border.getLocation().name);
    if (props.border.getClassName() !== undefined) {
        borderClasses += " " + props.border.getClassName();
    }

    // allow customization of tabset right/bottom buttons
    let buttons: React.ReactNode[] = [];
    const renderState = { headerContent: {}, buttons };
    props.layout.customizeTabSet(border, renderState);
    buttons = renderState.buttons;

    const toolbar = (
        <div
            key="toolbar"
            className={cm("flexlayout__border_toolbar_" + border.getLocation().name)}
        >
            {buttons}
        </div>
    );

    return (
        <div
            style={style}
            className={borderClasses}
        >
            <div className={cm("flexlayout__border_inner_" + border.getLocation().name)}>
                {tabs}
            </div>
            {toolbar}
        </div>
    );
};
