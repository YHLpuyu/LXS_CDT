"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CDT_LXS = void 0;
var delaunator_1 = __importDefault(require("delaunator"));
var Box = /** @class */ (function () {
    function Box(pts) {
        var _this = this;
        this.xMax = Number.MIN_VALUE;
        this.xMin = Number.MAX_VALUE;
        this.yMax = Number.MIN_VALUE;
        this.yMin = Number.MAX_VALUE;
        pts.forEach(function (pt) {
            if (pt.x > _this.xMax)
                _this.xMax = pt.x;
            if (pt.x < _this.xMin)
                _this.xMin = pt.x;
            if (pt.y > _this.yMax)
                _this.yMax = pt.y;
            if (pt.y < _this.yMin)
                _this.yMin = pt.y;
        });
    }
    Box.prototype.ContainsPoint = function (pt) {
        if (pt.x > this.xMax || pt.x < this.xMin)
            return false;
        if (pt.y > this.yMax || pt.y < this.yMin)
            return false;
        return true;
    };
    return Box;
}());
var CDT_LXS = /** @class */ (function () {
    function CDT_LXS(pts, mask) {
        this.points = pts;
        this.boundary = mask;
        this.box = new Box(this.points);
        this.checkpts();
        this.unionMask();
        this.delaunator = delaunator_1.default.from(this.points, function (p) { return p.x; }, function (p) { return p.y; });
    }
    /**
     * 检查点数量
     */
    CDT_LXS.prototype.checkpts = function () {
        if (this.points.length < 3) {
            throw ("至少需要三个点");
        }
    };
    /**
     * 多边形顶点添加到点集合中
    */
    CDT_LXS.prototype.unionMask = function () {
        var _this = this;
        this.boundary.forEach(function (p) {
            _this.points.push(p);
        });
    };
    /**
     * 排除mask之外的Tri
     */
    CDT_LXS.prototype.GetTriangles = function () {
        if (this.boundary.length < 3)
            return;
        var tris = [];
        var triangles = this.delaunator.triangles;
        for (var i = 0; i < triangles.length - 1; i += 3) {
            var p0 = this.points[triangles[i]];
            var p1 = this.points[triangles[i + 1]];
            var p2 = this.points[triangles[i + 2]];
            var triCentre = {
                x: p0.x / 3 + p1.x / 3 + p2.x,
                y: p0.y / 3 + p1.y / 3 + p2.y,
                z: 0
            };
            if (this.containsPoint(triCentre) == true) {
                tris.push.apply(tris, [p0, p1, p2]);
            }
        }
        return tris;
    };
    CDT_LXS.prototype.GetIndies = function () {
        var indies = [];
        var triangles = this.delaunator.triangles;
        for (var i = 0; i < triangles.length; i += 3) {
            indies.push.apply(indies, [triangles[i], triangles[i + 1], triangles[i + 2]]);
        }
        return indies;
    };
    /**
     * 点是否包含在mask中
     * @param p 点
     */
    CDT_LXS.prototype.containsPoint = function (p) {
        if (this.box.ContainsPoint(p) === false)
            return false;
        var ring = this.boundary;
        var result = false;
        for (var i = 0, j = ring.length - 1; i < ring.length - 1; j = i++) {
            var xi = ring[i].x;
            var yi = ring[i].y;
            var xj = ring[j].x;
            var yj = ring[j].y;
            var intersect = yi > p.y !== yj > p.y &&
                p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
            if (intersect) {
                result = !result;
            }
        }
        return result;
    };
    return CDT_LXS;
}());
exports.CDT_LXS = CDT_LXS;
