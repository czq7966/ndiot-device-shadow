export interface ITable {
    head: number
    len: number
    cmd: number
    data: Array<number>
    sum: number
    end: number
}

export class Table implements ITable {
    head: number = 0
    len: number = 0
    cmd: number = 0
    data: Array<number> = []
    sum: number = 0
    end: number = 0    
}