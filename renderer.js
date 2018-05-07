"use strict";
var canvas;
var ctx;
var MousePosition;
var cubes = [];
var camera = new Camera(0, 0, 10, 70);
var currentZoom = 3;
var zoom = 3;
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
                    cubes[cubes.length - 1].color = Color.Random;
                }
            }
        }
    }
    cubes.push(new Cube(0, 0, 0, .5, .5, 1));
    cubes[cubes.length - 1].color = Color.Red;
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
        camera.rotation.x++;
    }
    if (event.code == "ArrowDown") {
        camera.rotation.x--;
    }
    if (event.code == "ArrowLeft") {
        camera.rotation.y--;
    }
    if (event.code == "ArrowRight") {
        camera.rotation.y++;
    }
    if (event.code == "KeyZ") {
        camera.rotation.z++;
    }
    if (event.code == "KeyX") {
        camera.rotation.z--;
    }
}

function MouseMove(event) {
    if (MousePosition == undefined) return;
    camera.rotation.y = lerp(camera.rotation.y, (MousePosition.x - event.clientX) * 0.25, 0.2);
    camera.rotation.x = lerp(camera.rotation.x, (MousePosition.y - event.clientY) * -0.25, 0.2);
}

function Resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

var VertexQueue;

function Redraw(framerate) {
    document.getElementById("info").innerText = "CAMPOS:" + camera.position.toString() + " CAMROT:" + camera.rotation.toString();

    currentZoom = lerp(currentZoom, zoom, 0.1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cubes[cubes.length - 1].x = camera.position.x;
    cubes[cubes.length - 1].y = camera.position.y;
    cubes[cubes.length - 1].z = camera.position.z;
    cubes[cubes.length - 1].color = new Color(framerate % 255, 0, 0);
    var color = Color.Black;
    var drawOrder = cubes.sort(function (a, b) {
        return Vector3.distance(new Vector3(b.x, b.y, b.z), camera.position) - Vector3.distance(new Vector3(a.x, a.y, a.z), camera.position);
    });
    for (let CubeIndex = 0; CubeIndex < drawOrder.length; CubeIndex++) {
        VertexQueue = [];
        let cube = drawOrder[CubeIndex];
        for (let i = 0; i < cube.vertices.length; i++) {
            //get current vertice
            let vertex = cube.vertices[i];
            //apply rotation
            let VertexRotation = vertex.rotateX(camera.rotation.x + cube.rotation.x).rotateY(camera.rotation.y + cube.rotation.y).rotateZ(camera.rotation.z + cube.rotation.z);
            //apply 3d transformations
            var Projection = VertexRotation.project(canvas.width, canvas.height, Camera.FieldOfView * 10, 100);
            //add this vertice to the drawingqueue
            VertexQueue.push(Projection);
        }
        //get the avg Z position
        var AvgZ = [];

        for (let i = 0; i < cube.faces.length; i++) {
            var faces = cube.faces[i];
            AvgZ[i] = {
                "index": i,
                "z": (VertexQueue[faces[0]].z + VertexQueue[faces[1]].z + VertexQueue[faces[2]].z + VertexQueue[faces[3]].z) / 4.0
            };
        }
        //And sort them on their Z value
        AvgZ.sort(function (a, b) {
            return b.z - a.z;
        });
        //go trough each face in the cube
        for (var i = 0; i < cube.faces.length; i++) {
            var faces = cube.faces[AvgZ[i].index];
            ctx.beginPath();
            if (Debug.DrawOrder) {
                ctx.strokeStyle = color.shade(0.01 * CubeIndex).invert().toString();
                ctx.fillStyle = color.shade(0.01 * CubeIndex).toString();
            } else {
                ctx.fillStyle = cube.color.shade(0.05 * i).toString();
                ctx.strokeStyle = cube.color.invert();
            }
            ctx.moveTo(VertexQueue[faces[0]].x, VertexQueue[faces[0]].y);
            ctx.lineTo(VertexQueue[faces[1]].x, VertexQueue[faces[1]].y);
            ctx.lineTo(VertexQueue[faces[2]].x, VertexQueue[faces[2]].y);
            ctx.lineTo(VertexQueue[faces[3]].x, VertexQueue[faces[3]].y);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }
    }
    requestAnimationFrame(Redraw);
}