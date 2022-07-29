
export class UUID {
    static Guid(len?: number, start?: number): string {
        let result = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c){
            let r = Math.random()*16|0;
            let v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        })
        len = len ? len : result.length;
        start = start ? start : 0;
        return result.substring(start, start + len);
    }
}