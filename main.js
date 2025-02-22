let points = []; // Stores points as [{x: 2, y: 3}, {x: -1, y: 4}]

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// Initial graph settings
let scale = 40; // Pixels per unit
let centerX, centerY; // To store the center of the canvas
let equations = [];

// Ensure canvas size adjusts to the container and update center values
function resizeCanvas() {
    // Resize canvas to match its container's width and height
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    // Update the center values based on the new size
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;

    console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
    drawGraph();  // Redraw the graph after resizing
}

// Resize canvas on page load and window resize
window.addEventListener("resize", resizeCanvas);
resizeCanvas();  // Initial resize on load

// Draw the Graph
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawAxes();
    drawEquations();
    drawAllPoints();

}

// Draw Grid and Labels
function drawGrid() {
    const step = dynamicStep();
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";

    // Vertical lines (X-axis grid)
    for (let x = centerX % scale; x < canvas.width; x += scale) {
        const graphX = Math.round((x - centerX) / scale);
        if (graphX % step === 0) {
            ctx.fillText(graphX, x + 2, centerY - 5);
        }
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Horizontal lines (Y-axis grid)
    for (let y = centerY % scale; y < canvas.height; y += scale) {
        const graphY = Math.round((centerY - y) / scale);
        if (graphY % step === 0) {
            ctx.fillText(graphY, centerX + 5, y - 2);
        }
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Adjust Label Steps Dynamically
function dynamicStep() {
    if (scale < 20) return 5;
    if (scale < 10) return 10;
    if (scale < 5) return 20;
    return 1;
}

// Draw Axes
function drawAxes() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();
}

// Parse and Plot Equations
function drawEquations() {
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    equations.forEach(eq => {
        ctx.beginPath();
        for (let px = 0; px < canvas.width; px++) {
            const x = (px - centerX) / scale;
            try {
                const y = eval(eq.replace(/x/g, `(${x})`));
                const py = centerY - y * scale;
                if (px === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            } catch (e) {
                console.error("Error plotting:", eq);
            }
        }
        ctx.stroke();
    });
}

// Add a new input box for equations or points
function addEquation() {
    const list = document.getElementById("equationList");
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "equation-input";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter equation (e.g., x*x) or point (e.g., (2,3))";

    input.onchange = () => {
        const value = input.value.trim();
        if (value.match(/^\(\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*\)$/)) {
            // Handle points like (2, 3)
            const point = value
                .replace(/[()]/g, "")
                .split(",")
                .map(Number);
            drawPoint(point[0], point[1]);
        } else {
            // Handle equations
            equations.push(value);
            drawGraph();
        }
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => {
        equations = equations.filter(e => e !== input.value);
        list.removeChild(inputWrapper);
        drawGraph();
    };

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(removeBtn);
    list.appendChild(inputWrapper);
}

// Store and draw a point on the graph
function drawPoint(x, y) {
    points.push({ x, y }); // Save point to the array
    drawGraph(); // Redraw to ensure the point stays with panning/zooming
}

// Draw all stored points (called inside drawGraph)
function drawAllPoints() {
    ctx.fillStyle = "red";
    points.forEach(point => {
        const px = centerX + point.x * scale;
        const py = centerY - point.y * scale;

        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2); // Draw point
        ctx.fill();
    });
}



// Zoom Logic (Keep Axes Centered)
function zoom(factor) {
    const oldScale = scale;
    scale *= factor;

    centerX = (centerX - canvas.width / 2) * (scale / oldScale) + canvas.width / 2;
    centerY = (centerY - canvas.height / 2) * (scale / oldScale) + canvas.height / 2;
    drawGraph();
}

// Mouse Wheel Zoom
canvas.addEventListener("wheel", (e) => {
    zoom(e.deltaY > 0 ? 0.9 : 1.1);
});

// Pan Logic (Mouse Drag)
let isDragging = false;
let startX, startY;

canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    centerX += e.clientX - startX;
    centerY += e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    drawGraph();
});

canvas.addEventListener("mouseup", () => isDragging = false);

function applyTransformation(type) {
    console.log(`Applying transformation: ${type}`);  // Debugging log

    switch (type) {
        case 'dilate':
            const dilationFactor = prompt("Enter dilation factor (e.g., 2 for double):");
            if (dilationFactor && !isNaN(dilationFactor)) {
                console.log(`Dilation factor: ${dilationFactor}`);
                equations = equations.map(eq => applyDilation(eq, parseFloat(dilationFactor)));
            }
            break;
        case 'translate':
            const translateX = prompt("Enter translation on X (e.g., 2):");
            const translateY = prompt("Enter translation on Y (e.g., 3):");
            if (translateX && translateY && !isNaN(translateX) && !isNaN(translateY)) {
                console.log(`Translation values: X = ${translateX}, Y = ${translateY}`);
                equations = equations.map(eq => applyTranslation(eq, parseFloat(translateX), parseFloat(translateY)));
            }
            break;
        case 'rotate':
            const angle = prompt("Enter rotation angle (in degrees):");
            if (angle && !isNaN(angle)) {
                console.log(`Rotation angle: ${angle} degrees`);
                equations = equations.map(eq => applyRotation(eq, parseFloat(angle)));
            }
            break;
        case 'reflectX':
            console.log("Reflecting over X-axis");
            equations = equations.map(eq => applyReflectionX(eq));
            break;
        case 'reflectY':
            console.log("Reflecting over Y-axis");
            equations = equations.map(eq => applyReflectionY(eq));
            break;
    }

    drawGraph();  // Redraw after transformation
}

// Example for Dilation
function applyDilation(eq, factor) {
    console.log(`Dilating equation: ${eq} by factor: ${factor}`);
    return eq.replace(/x/g, `(${factor}*x)`).replace(/y/g, `(${factor}*y)`);
}

// Example for Translation
function applyTranslation(eq, tx, ty) {
    console.log(`Translating equation: ${eq} by tx: ${tx}, ty: ${ty}`);
    return eq.replace(/x/g, `x - ${tx}`).replace(/y/g, `y - ${ty}`);
}

// Example for Rotation
function applyRotation(eq, angle) {
    const radian = angle * Math.PI / 180;
    console.log(`Rotating equation: ${eq} by ${angle} degrees`);
    return eq.replace(/x/g, `(x * Math.cos(${radian}) - y * Math.sin(${radian}))`)
             .replace(/y/g, `(x * Math.sin(${radian}) + y * Math.cos(${radian}))`);
}

// Reflection across X-axis
function applyReflectionX(eq) {
    console.log(`Reflecting equation: ${eq} over X-axis`);
    return eq.replace(/y/g, `-y`);
}

// Reflection across Y-axis
function applyReflectionY(eq) {
    console.log(`Reflecting equation: ${eq} over Y-axis`);
    return eq.replace(/x/g, `-x`);
}
// Automatically add an input box on page load
window.onload = () => {
    addEquation();
};


drawGraph();
