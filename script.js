var canvas;
var ctx;
var cubes = [new Cube(-.25,0,0,.5,.5,.5),new Cube(.25,0,0,.5,.5,.5),new Cube(-.25,.5,0,.5,.5,.5),new Cube(.25,.5,0,.5,.5,.5),
    new Cube(-.25,0,-.5,.5,.5,.5),new Cube(.25,0,-.5,.5,.5,.5),new Cube(-.25,.5,-.5,.5,.5,.5),new Cube(.25,.5,-.5,.5,.5,.5)
];
var MousePosition;
var currentZoom = 3;
var zoom =  3;
var Rotation = new Vector3(0,0,0);
function ZoomView(evt) {
    zoom = Math.max(2, zoom + evt.deltaY * 0.01);
}
function Onload() {
    canvas = document.getElementsByTagName("canvas")[0];
    canvas.addEventListener("mousedown", OnMouseDown);
    canvas.addEventListener("mouseup", function() {
        MousePosition = undefined;
    });
    cubes[0].color = Color.Random();
    cubes[1].color = Color.Random();
    cubes[2].color = Color.Random();
    cubes[3].color = Color.Random();
    cubes[4].color = Color.Random();
    cubes[5].color = Color.Random();
    cubes[6].color = Color.Random();
    cubes[7].color = Color.Random();
    canvas.addEventListener("mousemove", MouseMove);
    canvas.onmousewheel = function(evt) { ZoomView(evt); };
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    document.Resize += Resize;
    Resize();
    Redraw();
}
function lerp (start, end, amt){
    return (1-amt)*start+amt*end;
  }
function OnMouseDown(event) {
    if(MousePosition!=undefined) return;
    MousePosition = { x: event.clientX, y: event.clientY };
}

function MouseMove(event) {
    if (MousePosition == undefined) return;
    Rotation.y = lerp(Rotation.y,(MousePosition.x - event.clientX) * 0.25,0.2);
}

function Resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function Redraw(framerate) {
    currentZoom = lerp(currentZoom,zoom,0.1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var c = 0; c < cubes.length; c++) {
        var t = new Array();
        var cube = cubes[c];
        for (var i = 0; i < cube.vertices.length; i++) {
            //get current vertice
            var v = cube.vertices[i];
            //apply rotation
            var r = v.rotateX(Rotation.x + cube.rotation.x).rotateY(Rotation.y + cube.rotation.y);
            //apply 3d transformations
            var p = r.project(canvas.width, canvas.height, 500, currentZoom);
            //add this vertice to the drawingqueue
            t.push(p);
        }
        //go trough each face in the cube
        for (var i = 0; i < cube.faces.length; i++) {
            var f = cube.faces[i];
            ctx.beginPath();
            ctx.strokeStyle = cube.color.toString();

            ctx.moveTo(t[f[0]].x, t[f[0]].y);
            ctx.lineTo(t[f[1]].x, t[f[1]].y);
            ctx.lineTo(t[f[2]].x, t[f[2]].y);
            ctx.lineTo(t[f[3]].x, t[f[3]].y);
            ctx.closePath();
            ctx.stroke();
        }
    }
    requestAnimationFrame(Redraw);
}