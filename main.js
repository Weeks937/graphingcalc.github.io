// main.js
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

let points = [];
let lines = [];
let shapes = [];

const canvasSize = 600;
const axisOffset = canvasSize / 2; // To center the origin (0,0) in the middle of the canvas

// Plot a point
function plotPoint() {
    let x = prompt('Enter X coordinate:');
    let y = prompt('Enter Y coordinate:');
    points.push({ x: parseFloat(x), y: parseFloat(y) });
    draw();
}

// Draw a line
function drawLine() {
    let x1 = prompt('Enter X1 coordinate:');
    let y1 = prompt('Enter Y1 coordinate:');
    let x2 = prompt('Enter X2 coordinate:');
    let y2 = prompt('Enter Y2 coordinate:');
    lines.push({ x1: parseFloat(x1), y1: parseFloat(y1), x2: parseFloat(x2), y2: parseFloat(y2) });
    draw();
}

// Draw a shape (e.g., polygon or circle)
function drawShape() {
    let vertices = [];
    let numVertices = prompt('Enter number of vertices:');
    for (let i = 0; i < numVertices; i++) {
        let x = prompt(`Enter X coordinate for vertex ${i + 1}:`);
        let y = prompt(`Enter Y coordinate for vertex ${i + 1}:`);
        vertices.push({ x: parseFloat(x), y: parseFloat(y) });
    }
    shapes.push(vertices);
    draw();
}

// Reflect across the X or Y axis
function reflect(axis) {
    if (axis === 'x') {
        points.forEach(p => p.y = -p.y);
        lines.forEach(l => {
            l.y1 = -l.y1;
            l.y2 = -l.y2;
        });
        shapes.forEach(shape => shape.forEach(v => v.y = -v.y));
    } else if (axis === 'y') {
        points.forEach(p => p.x = -p.x);
        lines.forEach(l => {
            l.x1 = -l.x1;
            l.x2 = -l.x2;
        });
        shapes.forEach(shape => shape.forEach(v => v.x = -v.x));
    }
    draw();
}

// Rotate points, lines, and shapes by a certain angle
function rotate() {
    let angle = prompt('Enter angle in degrees:');
    angle = (parseFloat(angle) * Math.PI) / 180; // Convert to radians
    points = points.map(p => rotatePoint(p, angle));
    lines = lines.map(l => rotateLine(l, angle));
    shapes = shapes.map(shape => shape.map(v => rotatePoint(v, angle)));
    draw();
}

function rotatePoint(p, angle) {
    let x = p.x * Math.cos(angle) - p.y * Math.sin(angle);
    let y = p.x * Math.sin(angle) + p.y * Math.cos(angle);
    return { x, y };
}

function rotateLine(l, angle) {
    return {
        x1: l.x1 * Math.cos(angle) - l.y1 * Math.sin(angle),
        y1: l.x1 * Math.sin(angle) + l.y1 * Math.cos(angle),
        x2: l.x2 * Math.cos(angle) - l.y2 * Math.sin(angle),
        y2: l.x2 * Math.sin(angle) + l.y2 * Math.cos(angle)
    };
}

// Dilate (scale) points, lines, and shapes
function dilate() {
    let factor = prompt('Enter dilation factor:');
    points = points.map(p => ({ x: p.x * factor, y: p.y * factor }));
    lines = lines.map(l => ({
        x1: l.x1 * factor, y1: l.y1 * factor,
        x2: l.x2 * factor, y2: l.y2 * factor
    }));
    shapes = shapes.map(shape => shape.map(v => ({ x: v.x * factor, y: v.y * factor })));
    draw();
}

// Translate points, lines, and shapes
function translate() {
    let dx = prompt('Enter translation distance for X axis:');
    let dy = prompt('Enter translation distance for Y axis:');
    points = points.map(p => ({ x: p.x + parseFloat(dx), y: p.y + parseFloat(dy) }));
    lines = lines.map(l => ({
        x1: l.x1 + parseFloat(dx), y1: l.y1 + parseFloat(dy),
        x2: l.x2 + parseFloat(dx), y2: l.y2 + parseFloat(dy)
    }));
    shapes = shapes.map(shape => shape.map(v => ({ x: v.x + parseFloat(dx), y: v.y + parseFloat(dy) })));
    draw();
}

// Draw the grid, axes, and labels
function drawGrid() {
    ctx.beginPath();

    // Draw vertical grid lines
    for (let i = -axisOffset; i <= axisOffset; i += 50) {
        ctx.moveTo(i + axisOffset, 0);
        ctx.lineTo(i + axisOffset, canvasSize);
    }

    // Draw horizontal grid lines
    for (let i = -axisOffset; i <= axisOffset; i += 50) {
        ctx.moveTo(0, i + axisOffset);
        ctx.lineTo(canvasSize, i + axisOffset);
    }

    // Draw axes (X and Y)
    ctx.moveTo(0, axisOffset);
    ctx.lineTo(canvasSize, axisOffset); // X axis
    ctx.moveTo(axisOffset, 0);
    ctx.lineTo(axisOffset, canvasSize); // Y axis

    ctx.strokeStyle = '#ccc'; // Light gray for grid and axes
    ctx.stroke();
    
    // Draw numbers on X axis
    for (let i = -axisOffset; i <= axisOffset; i += 50) {
        if (i !== 0) {
            ctx.fillText(i / 50, i + axisOffset, axisOffset + 20); // X axis labels
        }
    }

    // Draw numbers on Y axis
    for (let i = -axisOffset; i <= axisOffset; i += 50) {
        if (i !== 0) {
            ctx.fillText(i / 50, axisOffset + 10, i + axisOffset); // Y axis labels
        }
    }
}

// Draw all elements (points, lines, and shapes) on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    drawGrid(); // Draw the grid and axes
    
    // Draw points
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x * 50 + axisOffset, -p.y * 50 + axisOffset, 5, 0, 2 * Math.PI); // Adjust for canvas origin
        ctx.fillStyle = 'blue';
        ctx.fill();
    });

    // Draw lines
    lines.forEach(l => {
        ctx.beginPath();
        ctx.moveTo(l.x1 * 50 + axisOffset, -l.y1 * 50 + axisOffset);
        ctx.lineTo(l.x2 * 50 + axisOffset, -l.y2 * 50 + axisOffset);
        ctx.strokeStyle = 'green';
        ctx.stroke();
    });

    // Draw shapes
    shapes.forEach(shape => {
        ctx.beginPath();
        ctx.moveTo(shape[0].x * 50 + axisOffset, -shape[0].y * 50 + axisOffset);
        shape.forEach(v => {
            ctx.lineTo(v.x * 50 + axisOffset, -v.y * 50 + axisOffset);
        });
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();
    });
}

draw(); // Initial draw to render everything