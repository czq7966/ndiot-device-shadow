
export class UUID {
    static Guid(len?: number, start?: number): string {
        const result = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c){
            const r = Math.random()*16|0;
            const v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        })
        len = len ? len : result.length;
        start = start ? start : 0;
        return result.substring(start, start + len);
    }
}