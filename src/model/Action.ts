import { Dictionary } from "../Types";

class Action {
    public type: string;
    public data: Dictionary<any>;

    constructor(type: string, data: Dictionary<any>) {
        this.type = type;
        this.data = data;
    }
}

export default Action;
