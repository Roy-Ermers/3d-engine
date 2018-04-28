class Cube {
    constructor(x, y, z, w, h, d) {
        this.x = x;
        this.y = y;
        this.z = z;
        var size = this.size = new Vector3(w, h, d);
        this.rotation = Vector3.zero.toQuaternion();
        this.vertices = [
            new Vector3(-size.x / 2 + x, size.y / 2 + y, -size.z / 2 + z),
            new Vector3(size.x / 2 + x, size.y / 2 + y, -size.z / 2 + z),
            new Vector3(size.x / 2 + x, -size.y / 2 + y, -size.z / 2 + z),
            new Vector3(-size.x / 2 + x, -size.y / 2 + y, -size.z / 2 + z),
            new Vector3(-size.x / 2 + x, size.y / 2 + y, size.z / 2 + z),
            new Vector3(size.x / 2 + x, size.y / 2 + y, size.z / 2 + z),
            new Vector3(size.x / 2 + x, -size.y / 2 + y, size.z / 2 + z),
            new Vector3(-size.x / 2 + x, -size.y / 2 + y, size.z / 2 + z)
        ];
        this.faces = [
            [0, 1, 2, 3],
            [1, 5, 6, 2],
            [5, 4, 7, 6],
            [4, 0, 3, 7],
            [0, 4, 5, 1],
            [3, 2, 6, 7]
        ];
        this.color = Color.White;
    }
}

class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static get Red() {
        return new Color(255, 0, 0);
    }

    static get Green() {
        return new Color(0, 255, 0);
    }

    static get Blue() {
        return new Color(0, 0, 255);
    }

    static get Black() {
        return new Color(0, 0, 0);
    }

    static get White() {
        return new Color(255, 255, 255);
    }

    static get Random() {
        return new Color(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
    }

    shade(factor) {
        return new Color(Math.floor(this.r * (1 - factor)), Math.floor(this.g * (1 - factor)), Math.floor(this.b * (1 - factor)));
    }

    invert() {
        return new Color(255 - this.r, 255 - this.g, 255 - this.b);
    }

    toString() {
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    }

}
// #region Units
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z ? z : 1;
    }
    static distance(vec1, vec2) {
        return Math.sqrt(Math.pow(vec2.x - vec1.x, 2) + Math.pow(vec2.y - vec1.y, 2) + Math.pow(vec2.z - vec1.z, 2));
    }
    static get zero() {
        return new Vector3(0, 0, 0);
    }
    rotateX(angle) {
        let rad, cosa, sina, y, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        y = this.y * cosa - this.z * sina;
        z = this.y * sina + this.z * cosa;
        return new Vector3(this.x, y, z);
    }

    rotateY(angle) {
        let rad, cosa, sina, x, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        z = this.z * cosa - this.x * sina;
        x = this.z * sina + this.x * cosa;
        return new Vector3(x, this.y, z);
    }

    rotateZ(angle) {
        let rad, cosa, sina, x, y;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        x = this.x * cosa - this.y * sina;
        y = this.x * sina + this.y * cosa;
        return new Vector3(x, y, this.z);
    }
    /**
     * Converts 3d points to 2d
     * @param {Number} viewWidth 
     * @param {Number} viewHeight 
     * @param {Number} fov 
     * @param {Number} viewDistance
     * @returns the 2d point
     */
    project(viewWidth, viewHeight, fov, viewDistance) {
        let factor, x, y;
        factor = fov / (viewDistance + this.z);
        x = this.x * factor + viewWidth / 2;
        y = this.y * factor + viewHeight / 2;
        return new Vector3(x, y, this.z);
    }
    toQuaternion() {
        let cy = Math.cos(this.z * 0.5);
        let sy = Math.sin(this.z * 0.5);
        let cr = Math.cos(this.y * 0.5);
        let sr = Math.sin(this.y * 0.5);
        let cp = Math.cos(this.x * 0.5);
        let sp = Math.sin(this.x * 0.5);

        let w = cy * cr * cp + sy * sr * sp;
        let x = cy * sr * cp - sy * cr * sp;
        let y = cy * cr * sp + sy * sr * cp;
        let z = sy * cr * cp - cy * sr * sp;
        return new Quaternion(x, y, z, w);
    }
    toString() {
        return "(" + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.z.toFixed(2) + ")";
    }
}

class Quaternion {
    constructor(x, y, z, w) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    }
    toEulerAngles() {
        let roll, pitch, yaw;
        let sinr = 2 * (this.w * this.x + this.y * this.z);
        let cosr = 1 - 2 * (this.x * this.x + this.y * this.y);
        roll = Math.atan2(sinr, cosr);

        // pitch (y-axis rotation)
        let sinp = 2 * (this.w * this.y - this.z * this.x);
        if (Math.abs(sinp) >= 1)
            pitch = Math.copysign(M_PI / 2, sinp);
        else
            pitch = Math.asin(sinp);

        // yaw (z-axis rotation)
        let siny = 2 * (this.w * this.z + this.x * this.y);
        let cosy = 1 - 2 * (this.y * this.y + this.z * this.z);
        yaw = Math.atan2(siny, cosy);
    }
}
//  #endregion
Math.clamp = function (value, min, max) {
    return Math.max(Math.min(value, max), min);
}
Math.copysign = function (value, sign) {
    if (sign < 0) {
        return -value;
    } else
        return value;
}