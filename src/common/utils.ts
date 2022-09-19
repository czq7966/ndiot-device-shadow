
export class Utils {
    static DeepMerge(toObj: {}, fromObj: {}): {} {
        toObj = toObj || {};
        fromObj = fromObj || {};
        if (typeof toObj !== "object" || typeof fromObj !== "object")
            return toObj;

        Object.keys(fromObj).forEach(key => {
            let toValue = toObj[key];
            let fromValue = fromObj[key];
            let type = typeof fromValue;
            if (type !== "function") {
                if (type === "object") {
                    toValue = (typeof toValue === "object") ? toValue: {}
                    toValue = this.DeepMerge(toValue, fromValue);
                } else {
                    toValue = fromValue;
                }

                toObj[key] = toValue
            }
        })

        return toObj;
    }
}