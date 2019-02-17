import AttributeDefinitions from "../AttributeDefinitions";
import Model from "./Model";
import Node from "./Node";

class SplitterNode extends Node {

    public static readonly TYPE: string = "splitter";

    constructor(model: Model) {
        super(model);
        this._fixed = true;
        this._attributes.type = SplitterNode.TYPE;
        model._addNode(this);
    }

    public getWidth() {
        return this._model.getSplitterSize();
    }

    public getHeight() {
        return this._model.getSplitterSize();
    }

    public getWeight(): number {
        return 0;
    }

    // tslint:disable-next-line:no-empty
    public _setWeight(): void {}

    public _getPrefSize(): number {
        return this._model.getSplitterSize();
    }

    // tslint:disable-next-line:no-empty
    public _updateAttrs(): void {}

    public _getAttributeDefinitions(): AttributeDefinitions {
        return new AttributeDefinitions();
    }

    public _toJson(): any {
        return undefined;
    }
}

export default SplitterNode;
