import { Dictionary } from "../Types";

class Action {
    type: string;
    data: Dictionary<any>;

    constructor(type: string, data:Dictionary<any>) {
        this.type = type;
        this.data = data;
    }
}

export default Action;