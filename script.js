"use strict";
var canvas;
var ctx;
var cubes = [];
var MousePosition;
var currentZoom = 3;
var zoom = 3;
var Rotation = new Vector3(0, 0, 0);
var Debug = {
    DrawOrder: false
}

function ZoomView(evt) {
    zoom = Math.max(2, zoom + evt.deltaY * 0.01);
}

function Clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}

function Onload() {
    canvas = document.getElementsByTagName("canvas")[0];
    canvas.addEventListener("mousedown", OnMouseDown);
    canvas.addEventListener("mouseup", function () {
        MousePosition = undefined;
    });
    for (var x = -2; x <= 2; x++) {
        for (var y = -2; y <= 2; y++) {
            for (var z = -2; z <= 2; z++) {
                if (Math.abs(x) == 2 || Math.abs(y) == 2 || Math.abs(z) == 2) {
                    cubes.push(new Cube(x, y, z, 1, 1, 1));
                    cubes[cubes.length - 1].rotation = new Vector3(x * 90, 0, 0);
                    cubes[cubes.length - 1].color = Color.Random;
                }
            }
        }
    }
    document.addEventListener("keydown", KeyDown);
    canvas.addEventListener("mousemove", MouseMove);
    canvas.onmousewheel = function (evt) {
        ZoomView(evt);
    };
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    document.Resize += Resize;
    Resize();
    Redraw();
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function OnMouseDown(event) {
    if (MousePosition != undefined) return;
    MousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function KeyDown(event) {
    if (event.code == "ArrowUp") {
        Rotation.x++;
    }
    if (event.code == "ArrowDown") {
        Rotation.x--;
    }
    if (event.code == "ArrowLeft") {
        Rotation.y--;
    }
    if (event.code == "ArrowRight") {
        Rotation.y++;
    }
    if (event.code == "z") {
        Rotation.z++;
    }
    if (event.code == "x") {
        Rotation.z--;
    }
}

function MouseMove(event) {
    if (MousePosition == undefined) return;
    Rotation.y = lerp(Rotation.y, (MousePosition.x - event.clientX) * 0.25, 0.2);
    Rotation.x = lerp(Rotation.x, (MousePosition.y - event.clientY) * -0.25, 0.2);
}

function Resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function CameraPosition() {
    return new Vector3(currentZoom, 0, 0).rotateX(Rotation.x).rotateY(-Rotation.y + 90).rotateZ(Rotation.x);
}
var t;

function Redraw(framerate) {
    currentZoom = lerp(currentZoom, zoom, 0.1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var color = Color.White;
    var drawOrder = cubes.sort(function (a, b) {
        return Vector3.distance(new Vector3(b.x, b.y, b.z), CameraPosition()) - Vector3.distance(new Vector3(a.x, a.y, a.z), CameraPosition())
    });
    for (var c = 0; c < drawOrder.length; c++) {
        t = [];
        var cube = drawOrder[c];
        for (var i = 0; i < cube.vertices.length; i++) {
            //get current vertice
            var v = cube.vertices[i];
            //apply rotation
            var r = v.rotateX(Rotation.x + cube.rotation.x).rotateY(Rotation.y + cube.rotation.y).rotateZ(Rotation.z + cube.rotation.z);
            //apply 3d transformations
            var p = r.project(canvas.width, canvas.height, 700, currentZoom);
            //add this vertice to the drawingqueue
            t.push(p);
        }
        //get the avg Z position
        var avg_z = [];

        for (var i = 0; i < cube.faces.length; i++) {
            var f = cube.faces[i];
            avg_z[i] = {
                "index": i,
                "z": (t[f[0]].z + t[f[1]].z + t[f[2]].z + t[f[3]].z) / 4.0
            };
        }
        //And sort them on their Z value
        avg_z.sort(function (a, b) {
            return b.z - a.z;
        });
        //go trough each face in the cube
        for (var i = 0; i < cube.faces.length; i++) {
            var f = cube.faces[avg_z[i].index];
            ctx.beginPath();
            if (Debug.DrawOrder) {
                ctx.strokeStyle = color.shade(0.01 * c).invert().toString();
                ctx.fillStyle = color.shade(0.01 * c).toString();
            } else {
                ctx.fillStyle = cube.color.shade(0.05 * i).toString();
                ctx.strokeStyle = cube.color.invert();
            }
            ctx.moveTo(t[f[0]].x, t[f[0]].y);
            ctx.lineTo(t[f[1]].x, t[f[1]].y);
            ctx.lineTo(t[f[2]].x, t[f[2]].y);
            ctx.lineTo(t[f[3]].x, t[f[3]].y);
            ctx.closePath();
            // ctx.stroke();
            ctx.fill();
        }
    }
    document.getElementById("info").innerText = "CAMPOS:" + CameraPosition().toString() + " CAMROT:" + Rotation.toString();
    requestAnimationFrame(Redraw);
}