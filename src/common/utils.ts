
export class Utils {
    // eslint-disable-next-line @typescript-eslint/ban-types
    static DeepMerge(toObj: {}, fromObj: {}): {} {
        toObj = toObj || {};
        fromObj = fromObj || {};
        if (typeof toObj !== "object" || typeof fromObj !== "object")
            return toObj;

        Object.keys(fromObj).forEach(key => {
            let toValue = toObj[key];
            const fromValue = fromObj[key];
            const type = typeof fromValue;
            if (type !== "function") {
                if (type === "object" && fromValue !== null) {
                    toValue = (typeof toValue === "object") ? toValue: {};
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