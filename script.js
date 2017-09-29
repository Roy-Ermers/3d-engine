"use strict";
var canvas;
var ctx;
var cubes = [];
var MousePosition;
var currentZoom = 3;
var zoom = 3;
var Rotation = new Vector3(0, 0, 0);
function ZoomView(evt) {
    zoom = Math.max(2, zoom + evt.deltaY * 0.01);
}
function Onload() {
    canvas = document.getElementsByTagName("canvas")[0];
    canvas.addEventListener("mousedown", OnMouseDown);
    canvas.addEventListener("mouseup", function () {
        MousePosition = undefined;
    });
    cubes.push(new Cube(0, 0, 0, 1, 1, 1));
    // for (var x = -5; x < 5; x++) {
    //     for (var z = -5; z < 5; z++) {
    //         cubes.push(new Cube(x, 2 - x * .5 * (z * .5), z, 1, 1, 1));
    //         cubes[cubes.length - 1].color = new Color(Math.sin(x / 10) * 255, Math.sin(x / 10 * z / 10) * 255, Math.sin(z / 10) * 255);
    //     }
    // }

    canvas.addEventListener("mousemove", MouseMove);
    canvas.onmousewheel = function (evt) { ZoomView(evt); };
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
    MousePosition = { x: event.clientX, y: event.clientY };
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
    var x = currentZoom * Math.sin(Rotation.x);
    var y = currentZoom * Math.sin(Rotation.y);
    var z = currentZoom * Math.sin(Rotation.z);
    return new Vector3(x, y, z);
}
var t;
function Redraw(framerate) {
    currentZoom = lerp(currentZoom, zoom, 0.1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cubes = cubes.sort(function (a, b) { return Vector3.distance(CameraPosition(), new Vector3(b.x, b.y, b.z)) - Vector3.distance(CameraPosition(), new Vector3(a.x, a.y, a.z)) });
    for (var c = 0; c < cubes.length; c++) {
        t = new Array();
        var cube = cubes[c];
        ctx.strokeStyle = cube.color.toString();
        for (var i = 0; i < cube.vertices.length; i++) {
            //get current vertice
            var v = cube.vertices[i];
            //apply rotation
            var r = v.rotateX(Rotation.x + cube.rotation.x).rotateY(Rotation.y + cube.rotation.y);
            //apply 3d transformations
            var p = r.project(canvas.width, canvas.height, 500, currentZoom);
            //add this vertice to the drawingqueue
            if (p.x >= 0 && p.y >= 0 && p.x <= canvas.width && p.y <= canvas.height)
                t.push(p);
            else {
                t.splice(t.length - i, t.length);
                continue;
            }
        }
        //get the avg Z position
        var avg_z = new Array();

        for (var i = 0; i < cube.faces.length; i++) {
            var f = cube.faces[i];
            avg_z[i] = { "index": i, "z": (t[f[0]].z + t[f[1]].z + t[f[2]].z + t[f[3]].z) / 4.0 };
        }
        //And sort them on their Z value
        avg_z.sort(function (a, b) {
            return b.z - a.z;
        });
        //go trough each face in the cube
        for (var i = 0; i < cube.faces.length; i++) {
            var f = cube.faces[avg_z[i].index];
            ctx.beginPath();
            ctx.strokeStyle = Color.White;
            ctx.fillStyle = cube.color.shade(0.05 * avg_z[i].index).toString();

            ctx.moveTo(t[f[0]].x, t[f[0]].y);
            ctx.lineTo(t[f[1]].x, t[f[1]].y);
            ctx.lineTo(t[f[2]].x, t[f[2]].y);
            ctx.lineTo(t[f[3]].x, t[f[3]].y);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }
    requestAnimationFrame(Redraw);
}