"use strict";

var canvas;
var ctx;
var MousePosition;

/**
 * @type {Cube[]}
 */
var cubes = [];
var camera = new Camera(0, 0, 10, 50);
var Debug = {
    DrawOrder: false
};
let scene = {
    drag: 0.1,
    cubes: []
};
function Onload() {
    canvas = document.getElementsByTagName("canvas")[0];
    canvas.addEventListener("mousedown", OnMouseDown);
    canvas.addEventListener("mouseup", function () {
        MousePosition = undefined;
    });
    for (var x = -5; x < 5; x++) {
        for (var z = -5; z < 5; z++) {
            let cube = new Cube(x * 1.5, 0, z * 1.5, 1, 1, 1);
            cube.color = new Color(128 + Math.sin(x / 10) * 128, 128 + Math.sin(x / 10 * z / 10) * 128, 128 + Math.sin(z / 10) * 128);;
            scene.cubes.push(cube);
        }
    }

    document.addEventListener("keydown", KeyDown);
    canvas.addEventListener("mousemove", MouseMove);
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    document.addEventListener("resize", resize);
    resize();
    redraw();
}


function OnMouseDown(event) {
    if (MousePosition != undefined) return;
    MousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function KeyDown(event) {
    if (event.code == "ArrowLeft")
        camera.rotation.x -= 1;
    if (event.code == "ArrowRight")
        camera.rotation.x += 1;
    if (event.code == "KeyW") {
        camera.velocity = camera.velocity.add(Vector3.forward);
    }
    if (event.code == "KeyA") {
        camera.velocity = camera.velocity.add(Vector3.left);

    }
    if (event.code == "KeyS") {
        camera.velocity = camera.velocity.add(Vector3.backward);

    }
    if (event.code == "KeyD") {
        camera.velocity = camera.velocity.add(Vector3.right);

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
    camera.rotation.y = GameMath.lerp(camera.rotation.y, (MousePosition.x - event.clientX) * 0.25, 0.2);
    camera.rotation.x = GameMath.lerp(camera.rotation.x, (MousePosition.y - event.clientY) * -0.25, 0.2);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

var VertexQueue;

function redraw(framerate) {
    camera.tick();
    document.getElementById("info").textContent = `CUBE: (${scene.cubes[0].x},${scene.cubes[0].y},${scene.cubes[0].z}) CAMPOS: ${camera.position.toString()} CAMROT: ${camera.rotation.toString()} CAMVEL: ${camera.velocity}`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    var drawOrder = scene.cubes.sort((a, b) => Vector3.distance(b, camera.position) - Vector3.distance(a, camera.position));

    for (let CubeIndex = 0; CubeIndex < drawOrder.length; CubeIndex++) {
        VertexQueue = [];
        let cube = drawOrder[drawOrder.length - CubeIndex - 1];
        // cube.rotation.x++;
        // cube.rotation.y++;
        for (let i = 0; i < cube.vertices.length; i++) {
            //get current vertice
            let vertex = cube.vertices[i];
            //apply rotation
            let VertexRotation = vertex.add(new Vector3(-cube.x, -cube.y, -cube.z)).rotate(cube.rotation).add(new Vector3(cube.x, cube.y, cube.z));
            //apply 3d transformations
            var Projection = VertexRotation.add(camera.position).rotate(camera.rotation).project(canvas.width, canvas.height, camera.FieldOfView * 10, 3);
            //add this vertice to the drawingqueue
            VertexQueue.push(Projection);
        }
        //get the avg Z position
        var AvgZ = [];

        for (let i = 0; i < cube.faces.length; i++) {
            var faces = cube.faces[i];
            AvgZ[i] = {
                index: i,
                z: (VertexQueue[faces[0]].z + VertexQueue[faces[1]].z + VertexQueue[faces[2]].z + VertexQueue[faces[3]].z) / 4.0
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
                ctx.strokeStyle = Color.White.shade(0.01 * CubeIndex).toString();
                ctx.fillStyle = Color.White.shade(0.01 * CubeIndex).invert().toString();
            } else {
                ctx.fillStyle = cube.color.shade(0.05 * i).toString();
                ctx.strokeStyle = cube.color.shade(0.5 * i);
            }
            ctx.moveTo(VertexQueue[faces[0]].x, VertexQueue[faces[0]].y);
            ctx.lineTo(VertexQueue[faces[1]].x, VertexQueue[faces[1]].y);
            ctx.lineTo(VertexQueue[faces[2]].x, VertexQueue[faces[2]].y);
            ctx.lineTo(VertexQueue[faces[3]].x, VertexQueue[faces[3]].y);
            ctx.closePath();
            //ctx.stroke();
            ctx.fill();
        }
    }
    requestAnimationFrame(redraw);
}