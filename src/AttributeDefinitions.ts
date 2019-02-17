import Attribute from "./Attribute";
import { Dictionary } from "./Types";

/** @hidden @internal */
class AttributeDefinitions {

    public attributes: Attribute[];
    public nameToAttribute: Dictionary<Attribute>;

    constructor() {
        this.attributes = [];
        this.nameToAttribute = {};
    }

    public addWithAll(
        name: string,
        modelName: string | undefined,
        defaultValue: any,
        alwaysWriteJson: boolean = false,
    ) {
        const attr = new Attribute(name, modelName, defaultValue, alwaysWriteJson);
        this.attributes.push(attr);
        this.nameToAttribute[name] = attr;
        return attr;
    }

    public addInherited(name: string, modelName: string) {
        return this.addWithAll(name, modelName, undefined, false);
    }

    public add(name: string, defaultValue: any, alwaysWriteJson: boolean = false) {
        return this.addWithAll(name, undefined, defaultValue, alwaysWriteJson);
    }

    public getAttributes() {
        return this.attributes;
    }

    public getModelName(name: string) {
        const conversion = this.nameToAttribute[name];
        if (conversion !== undefined) {
            return conversion.modelName;
        }
        return undefined;
    }

    public toJson(jsonObj: any, obj: any) {
        this.attributes.forEach((attr) => {
            const fromValue = obj[attr.name];
            if (attr.alwaysWriteJson || fromValue !== attr.defaultValue) {
                jsonObj[attr.name] = fromValue;
            }
        });
    }

    public fromJson(jsonObj: any, obj: any) {
        this.attributes.forEach((attr) => {
            const fromValue = jsonObj[attr.name];
            obj[attr.name] = (fromValue === undefined)
                ? obj[attr.name] = attr.defaultValue
                : obj[attr.name] = fromValue;
        });
    }

    public update(jsonObj: any, obj: any) {
        this.attributes.forEach((attr) => {

            const fromValue = jsonObj[attr.name];
            if (fromValue !== undefined) {
                obj[attr.name] = fromValue;
            }
        });
    }

    public setDefaults(obj: any) {
        this.attributes.forEach((attr) => {
            obj[attr.name] = attr.defaultValue;
        });
    }

}

/** @hidden @internal */
export default AttributeDefinitions;
