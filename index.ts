import Delaunator from 'delaunator';
/**
 * 点结构
 */
export interface Point {
    x: number,   //x of coord
    y: number,   //y of coord
    z: number    //z of coord
}
/**
 * 三角形,存储三个顶点，三个顶点所在集合的索引
 */
interface Triangle {
    a: Point,
    b: Point,
    c: Point,
    aidx: number,
    bidx: number,
    cidx: number
}

class Box {
    private xMax: number = Number.MIN_VALUE;
    private xMin: number = Number.MAX_VALUE;
    private yMax: number = Number.MIN_VALUE;
    private yMin: number = Number.MAX_VALUE;

    constructor(pts: Point[]) {
        pts.forEach(pt => {
            if (pt.x > this.xMax) this.xMax = pt.x;
            if (pt.x < this.xMin) this.xMin = pt.x;
            if (pt.y > this.yMax) this.yMax = pt.y;
            if (pt.y < this.yMin) this.yMin = pt.y;
        })
    }

    ContainsPoint(pt: Point): boolean {
        if (pt.x > this.xMax || pt.x < this.xMin) return false;
        if (pt.y > this.yMax || pt.y < this.yMin) return false;
        return true;
    }
}

export class CDT_LXS {
    //private fields
    private points: Point[];
    private boundary: Point[];
    private delaunator: Delaunator<Point>;
    private box: Box;

    constructor(pts: Point[], mask: Point[]) {
        this.points = pts;
        this.boundary = mask;
        this.box = new Box(this.points);

        this.checkpts();
        this.unionMask();


        this.delaunator = Delaunator.from<Point>(
            this.points,
            (p) => p.x,
            (p) => p.y);
    }
    /**
     * 检查点数量
     */
    private checkpts(): void {
        if (this.points.length < 3) {
            throw ("至少需要三个点");
        }
    }
    /**
     * 多边形顶点添加到点集合中
    */
    private unionMask(): void {
        this.boundary.forEach(p => {
            this.points.push(p);
        });
    }
    /**
     * 排除mask之外的Tri
     */
    GetTriangles():Point[] {
        if (this.boundary.length < 3) return;
        let tris:Point[]=[];
        let triangles = this.delaunator.triangles;
        for (let i = 0; i <triangles.length - 1; i += 3) {
            let p0 = this.points[triangles[i]];
            let p1 = this.points[triangles[i + 1]];
            let p2 = this.points[triangles[i + 2]];
            let triCentre:Point={
                x:p0.x/3+p1.x/3+p2.x,
                y:p0.y/3+p1.y/3+p2.y,
                z:0
            }
            if(this.containsPoint(triCentre)==true){
                tris.push(...[p0,p1,p2]);
            }
        }
        return tris;
    }

    GetIndies():number[]{
        let indies:number[]=[];
        let triangles=this.delaunator.triangles;
        for(let i=0;i<triangles.length;i+=3){
            indies.push(...[triangles[i],triangles[i+1],triangles[i+2]]);
        }
        return indies;
    }
    /**
     * 点是否包含在mask中
     * @param p 点
     */
    private containsPoint(p: Point): boolean {
        if (this.box.ContainsPoint(p) === false) return false;
        let ring: Point[] = this.boundary;
        let result = false;
        for (let i = 0, j = ring.length-1; i < ring.length - 1; j = i++) {
            const xi = ring[i].x;
            const yi = ring[i].y;
            const xj = ring[j].x;
            const yj = ring[j].y;

            const intersect =
                yi > p.y !== yj > p.y &&
                p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
            if (intersect) {
                result = !result;
            }
        }
        return result;
    }
}

