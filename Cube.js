"use strict";
function Cube(x, y, z, w, h, d) {
    this.x = x;
    this.y = y;
    this.z = z;
    var size = new Vector3(w, h, d);
    this.rotation = new Vector3(0, 0, 0);
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
    //this.color = new Color(208, 165, 93);
    this.color = Color.White;
}

function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.toString = function () {
        return "rgb(" + r + "," + g + "," + b + ")";
    }
    this.shade = function (factor) {
        return new Color(Math.floor(this.r * (1 - factor)), Math.floor(this.g * (1 - factor)), Math.floor(this.b * (1 - factor)));
    };
    this.invert = function() {
        return new Color(255-this.r,255-this.g,255-this.b);
    }
}
Color.Red = new Color(255, 0, 0);
Color.Green = new Color(0, 255, 0);
Color.Blue = new Color(0, 0, 255);
Color.Black = new Color(0, 0, 0);
Color.White = new Color(255, 255, 255);
Color.Random = function () {
    return new Color(Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
}
function Vector3(x, y, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.rotateX = function (angle) {
        var rad, cosa, sina, y, z
        rad = angle * Math.PI / 180
        cosa = Math.cos(rad)
        sina = Math.sin(rad)
        y = this.y * cosa - this.z * sina
        z = this.y * sina + this.z * cosa
        return new Vector3(this.x, y, z)
    }

    this.rotateY = function (angle) {
        var rad, cosa, sina, x, z
        rad = angle * Math.PI / 180
        cosa = Math.cos(rad)
        sina = Math.sin(rad)
        z = this.z * cosa - this.x * sina
        x = this.z * sina + this.x * cosa
        return new Vector3(x, this.y, z)
    }

    this.rotateZ = function (angle) {
        var rad, cosa, sina, x, y
        rad = angle * Math.PI / 180
        cosa = Math.cos(rad)
        sina = Math.sin(rad)
        x = this.x * cosa - this.y * sina
        y = this.x * sina + this.y * cosa
        return new Vector3(x, y, this.z)
    }

    this.project = function (viewWidth, viewHeight, fov, viewDistance) {
        var factor, x, y
        factor = fov / (viewDistance + this.z)
        x = this.x * factor + viewWidth / 2
        y = this.y * factor + viewHeight / 2
        return new Vector3(x, y, this.z)
    }
}
Vector3.zero = new Vector3(0, 0, 0);
Vector3.distance = function (vec1, vec2) {
    return Math.sqrt(Math.pow(vec2.x - vec1.x, 2) + Math.pow(vec2.y - vec1.y, 2) + Math.pow(vec2.z - vec1.z, 2));
}

Math.clamp = function (value, min, max) {
    return Math.max(Math.min(value, max), min);
}
