export interface ITable {
    head: number
    len: number
    cmd: number
    data: Array<number>
    sum: number
    end: number
}

export class Table implements ITable {
    head = 0
    len = 0
    cmd = 0
    data: Array<number> = []
    sum = 0
    end = 0    
}