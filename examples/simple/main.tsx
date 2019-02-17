import * as React from "react";
import * as ReactDOM from "react-dom";
import * as FlexLayout from "../../src/index";

const json = {
    global: {},
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                selected: 0,
                children: [
                    {
                        type: "tab",
                        name: "FX",
                        component: "button",
                    },
                ],
            },
            {
                type: "tabset",
                weight: 50,
                selected: 0,
                children: [
                    {
                        type: "tab",
                        name: "FI",
                        component: "button",
                    },
                ],
            },
        ],
    },
};

interface MainProps { }

interface MainState {
    model: FlexLayout.Model;
}

class Main extends React.Component<MainProps, MainState> {

    constructor(props: MainProps) {
        super(props);
        this.state = { model: FlexLayout.Model.fromJson(json) };
    }

    public render() {
        return (
            <FlexLayout.Layout
                model={this.state.model}
                factory={this.factory.bind(this)}
            />
        );
    }

    private factory(node: FlexLayout.TabNode) {
        const component = node.getComponent();
        if (component === "button") {
            return <button>{node.getName()}</button>;
        }
        return null;
    }
}

ReactDOM.render(<Main />, document.getElementById("container"));
