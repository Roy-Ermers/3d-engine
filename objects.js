class GameObject {
    rotation = new Quaternion(0, 0, 0, 0);
    position = new Vector3();
    velocity = new Vector3();

    tick() {
        this.velocity = this.velocity.lerp(Vector3.zero, scene.drag);
        let rot = this.rotation.toEulerAngles();
        let relativeForce = rot.multiply(this.velocity);

        this.position = this.position.add(relativeForce);
    }
}

class Camera extends GameObject {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} fov
     */
    constructor(x, y, z, fov) {
        super();
        this.position = new Vector3(x, y, z);
        this.FieldOfView = fov;
        this.rotation = new Quaternion(0, 0, 0, 0);
        this.velocity = new Vector3(0, 0, 0);
    }
}
class Cube {
    /**
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @param {number} z the z coordinate
     * @param {number} w the width of the cube
     * @param {number} h the height of the cube
     * @param {number} d the depth of the cube
     */
    constructor(x, y, z, w, h, d) {
        this.x = x;
        this.y = y;
        this.z = z;
        let size = this.size = new Vector3(w, h, d);
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
    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     */
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

    /**
     * @param {number} factor
     */
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
    /**
     * @param {number} [x]
     * @param {number} [y]
     * @param {number} [z]
     */
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
    /**
     * @param {Vector3} vec1
     * @param {Vector3} vec2
     */
    static distance(vec1, vec2) {
        return Math.sqrt(Math.pow(vec2.x - vec1.x, 2) + Math.pow(vec2.y - vec1.y, 2) + Math.pow(vec2.z - vec1.z, 2));
    }
    static get zero() {
        return new Vector3(0, 0, 0);
    }
    static get one() {
        return new Vector3(1, 1, 1);
    }
    static get forward() {
        return new Vector3(0, 0, -1);
    }
    static get backward() {
        return new Vector3(0, 0, 1);
    }
    static get left() {
        return new Vector3(1, 0, 0);
    }
    static get right() {
        return new Vector3(-1, 0, 0);
    }
    /**
     * @param {Vector3} vector
     */
    rotate(vector) {
        return new Vector3(this.x, this.y, this.z).rotateX(vector.x).rotateY(vector.y).rotateZ(vector.z);
    }
    /**
     * @param {number} angle
     */
    rotateX(angle) {
        let rad, cosa, sina, y, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        y = this.y * cosa - this.z * sina;
        z = this.y * sina + this.z * cosa;
        return new Vector3(this.x, y, z);
    }

    /**
     * @param {number} angle
     */
    rotateY(angle) {
        let rad, cosa, sina, x, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        z = this.z * cosa - this.x * sina;
        x = this.z * sina + this.x * cosa;
        return new Vector3(x, this.y, z);
    }

    /**
     * @param {number} angle
     */
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

    /**
     * @param {Vector3} vector
     */
    add(vector) {
        return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }
    /**
     * @param {number|Vector3} factor
     */
    multiply(factor) {
        if (factor instanceof Vector3)
            return new Vector3(this.x * factor.x, this.y * factor.y, this.z * factor.z);
        else
            return new Vector3(this.x * factor, this.y * factor, this.z * factor);
    }
    /**
     * @param {Vector3} vector
     * @param {number} time
     */
    lerp(vector, time) {
        return new Vector3(
            GameMath.lerp(this.x, vector.x, time),
            GameMath.lerp(this.y, vector.y, time),
            GameMath.lerp(this.z, vector.z, time)
        );
    }
    get average() {
        return (this.x + this.y + this.z) / 3;
    }
    toString() {
        return "(" + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.z.toFixed(2) + ")";
    }
}


class Quaternion {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     */
    constructor(x, y, z, w) {
        this.w = w || 0;
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }
    toEulerAngles() {
        let roll, pitch, yaw;
        let sinr = 2 * (this.w * this.x + this.y * this.z);
        let cosr = 1 - 2 * (this.x * this.x + this.y * this.y);
        roll = Math.atan2(sinr, cosr);

        let sinp = 2 * (this.w * this.y - this.z * this.x);
        if (Math.abs(sinp) >= 1)
            pitch = GameMath.sign(Math.PI / 2, sinp);
        else
            pitch = Math.asin(sinp);

        let siny = 2 * (this.w * this.z + this.x * this.y);
        let cosy = 1 - 2 * (this.y * this.y + this.z * this.z);
        yaw = Math.atan2(siny, cosy);

        return new Vector3(roll, pitch, yaw);
    }
    toString() {
        return "(" + this.x.toFixed(2) + ", " + this.y.toFixed(2) + ", " + this.z.toFixed(2) + ", " + this.w.toFixed(2) + ")";
    }

}
//  #endregion

/**
 * @static
 */
class GameMath {
    /**
     *  @param {number} value
     * @param {number} min
     * @param {number} max
     */
    static clamp(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }

    /**
     * @param {number} value
     * @param {number} sign
     */
    static sign(value, sign) {
        if (sign < 0) {
            return -value;
        } else
            return value;
    }

    /**
        * @param {number} start
        * @param {number} end
        * @param {number} amt
        */
    static lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
}

