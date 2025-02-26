
let points = []; // Stores points as [{x: 2, y: 3}, {x: -1, y: 4}]

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

// Initial graph settings
let scale = 40; // Pixels per unit
let centerX, centerY; // To store the center of the canvas
let equations = [];

// Resize the canvas and update the center
function resizeCanvas() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    // Keep the center aligned with the canvas size
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;

    drawGraph();
}

// Resize on load and window resize
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // Initial call on page load

// Redraw the entire graph (grid, axes, points, and lines)
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawGrid();
    drawAxes();
    drawEquations();
    drawAllPoints(); // Ensure connected points are drawn
    console.log("Redrawing graph...");

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

function dynamicStep() {
    if (scale < 20) return 5; // Show grid lines every 5 units when zoomed in
    if (scale < 50) return 10; // Show grid lines every 10 units
    if (scale < 100) return 20; // Show grid lines every 20 units
    return 50; // Show grid lines every 50 units for large scale
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

// Ensure the input box is always present and handles points & equations
function addEquation() {
    const list = document.getElementById("equationList");

    // Check if the input box already exists
    if (!document.querySelector(".main-input")) {
        // Create the wrapper for the input
        const inputWrapper = document.createElement("div");
        inputWrapper.className = "equation-input";

        // ✅ Ensure the input is properly defined
        const input = document.createElement("input");
        input.type = "text";
        input.className = "main-input";
        input.placeholder = "Enter equation (e.g., x*x) or point (e.g., (2,3))";

        // Handle input changes
        input.addEventListener("change", () => handleInput(input.value.trim()));

        // Append the input to the wrapper and the wrapper to the list
        inputWrapper.appendChild(input);
        list.appendChild(inputWrapper);
    }
}





    
// Handle input for points, lines, and equations
function handleInput(value) {
    if (!value) return; // Ignore empty input

    // Handle points input (e.g., (2,3);(4,5))
    if (value.match(/^\(\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*\)$/) || value.includes(";")) {
        const pointPairs = value.split(";");

        pointPairs.forEach(pair => {
            const [x, y] = pair.replace(/[()]/g, "").split(",").map(Number);
            if (!isNaN(x) && !isNaN(y)) {
                drawPoint(x, y);    // Draw the point
                displayPoint(x, y); // Display the point in the sidebar
            }
        });

        if (pointPairs.length > 1) {
            displayLine(value); // Display line information
        }
    } else {
        // Handle equations (e.g., "x*x")
        equations.push(value);
        displayEquation(value); // Display the equation
    }

    // Clear the input and update the graph
    const input = document.querySelector(".main-input");
    if (input) input.value = "";
    drawGraph(); // Refresh the graph
}





// Display a line based on multiple points
function displayLine(value) {
    const list = document.getElementById("lineList");

    // Create a new entry for the line
    const lineItem = document.createElement("div");
    lineItem.className = "line-item";
    lineItem.textContent = `Line: ${value}`;

    // Create a remove button for the line
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";

    // Handle line removal
    removeBtn.onclick = () => {
        // Clear points connected to this line
        const pointPairs = value.split(";").map(pair =>
            pair.replace(/[()]/g, "").split(",").map(Number)
        );
        points = points.filter(p =>
            !pointPairs.some(([x, y]) => p.x === x && p.y === y)
        );

        // Remove from the UI
        list.removeChild(lineItem);
        drawGraph(); // Update the graph
    };

    lineItem.appendChild(removeBtn);
    list.appendChild(lineItem);
}

// Display an equation below the points box
function displayEquation(equation) {
    const list = document.getElementById("lineList");

    // Create a new entry for the equation
    const equationItem = document.createElement("div");
    equationItem.className = "equation-item";
    equationItem.textContent = `Equation: ${equation}`;

    // Create a remove button for the equation
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";

    // Handle equation removal
    removeBtn.onclick = () => {
        // Remove from the equation list
        equations = equations.filter(e => e !== equation);

        // Remove from the UI
        list.removeChild(equationItem);
        drawGraph(); // Update the graph
    };

    equationItem.appendChild(removeBtn);
    list.appendChild(equationItem);
}




// Display points in a list with a delete button
function displayPoint(x, y) {
    const list = document.getElementById("pointList");
    const pointItem = document.createElement("div");
    pointItem.className = "point-item";

    // Display point coordinates
    pointItem.textContent = `(${x}, ${y})`;

    // Create a remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";

    // Handle point removal
    removeBtn.onclick = () => {
        points = points.filter(p => p.x !== x || p.y !== y); // Remove from the array
        list.removeChild(pointItem); // Remove from the DOM
        drawGraph(); // Redraw the graph
    };

    pointItem.appendChild(removeBtn);
    list.appendChild(pointItem);
}




    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => {
        const value = input.value.trim();
        if (value.match(/^\(\s*-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?\s*\)$/)) {
            // Remove corresponding point from array
            const [x, y] = value.replace(/[()]/g, "").split(",").map(Number);
            points = points.filter(p => p.x !== x || p.y !== y);
        } else {
            // Remove equation from array
            equations = equations.filter(e => e !== value);
        }
        input.value = ""; // Clear the input instead of removing it

        drawGraph();
    };
    




// Store and draw a point on the graph (connects points if there are multiple)
function drawPoint(x, y) {
    points.push({ x, y });
    drawGraph();
}



// Draw all stored points and connect them with lines
function drawAllPoints() {
    if (points.length === 0) return;

    ctx.fillStyle = "red";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    ctx.beginPath();

    points.forEach((point, index) => {
        // Convert graph coordinates to canvas coordinates
        const px = centerX + point.x * scale;  // X-axis mapping
        const py = centerY - point.y * scale;  // Y-axis mapping (inverted)

        // Draw the point itself
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2); // Draw point
        ctx.fill();

        // Draw a line connecting points
        if (index === 0) {
            ctx.moveTo(px, py); // Start from the first point
        } else {
            ctx.lineTo(px, py); // Draw line to the next point
        }
        console.log(`Drawing: (${point.x}, ${point.y}) → (${px}, ${py})`);

    });

    // Only draw the line if there are multiple points
    if (points.length > 1) {
        ctx.stroke();
    }
    console.log("Current points:", points);

}



// Ensure input box is always present on load
window.onload = () => {
    addEquation();
    drawGraph();
};




window.onload = function () {
    // Your code to add equations or any other logic here


// Zoom Logic (Keep Axes Centered)
function zoom(factor) {
    const oldScale = scale;
    scale *= factor;

    // Recalculate the center to ensure zooming is relative to the center of the canvas
    centerX = (centerX - canvas.width / 2) * (scale / oldScale) + canvas.width / 2;
    centerY = (centerY - canvas.height / 2) * (scale / oldScale) + canvas.height / 2;

    drawGraph();
    console.log(centerX);
    console.log(centerY);
    console.log(scale);
}

// Mouse Wheel Zoom
canvas.addEventListener("wheel", (e) => {
    e.preventDefault(); // Prevent page scroll
    zoom(e.deltaY > 0 ? 0.9 : 1.1); // Zoom in or out based on wheel direction
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

};

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

// Display each point in a separate section with a delete button
function displayPoint(x, y) {
    const list = document.getElementById("pointList");
    const pointItem = document.createElement("div");
    pointItem.className = "point-item";

    // Display point coordinates
    pointItem.textContent = `(${x}, ${y})`;

    // Create a remove button for each point
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";

    // Remove point from the list and graph
    removeBtn.onclick = () => {
        points = points.filter(p => p.x !== x || p.y !== y);
        list.removeChild(pointItem);
        drawGraph(); // Update the graph
    };

    pointItem.appendChild(removeBtn);
    list.appendChild(pointItem);
}

// Dilate points, lines, and equations by a factor
function applyDilation(factor) {
    // Scale all points relative to the origin
    points = points.map(p => ({
        x: p.x * factor,
        y: p.y * factor
    }));

    // Scale all equations (modify "x" and "y" in the expression)
    equations = equations.map(eq =>
        eq.replace(/x/g, `(x / ${factor})`).replace(/y/g, `(y / ${factor})`)
    );

    drawGraph(); // Redraw the graph with transformed data
}


// Translate (shift) points and equations
function applyTranslation(shiftX, shiftY) {
    // Shift all points
    points = points.map(p => ({
        x: p.x + shiftX,
        y: p.y + shiftY
    }));

    // Adjust equations (shift in function notation)
    equations = equations.map(eq =>
        eq.replace(/x/g, `(x - ${shiftX})`).replace(/y/g, `(y - ${shiftY})`)
    );

    drawGraph(); // Redraw the graph
}


// Rotate points and equations around the origin
function applyRotation(angle) {
    const radians = (angle * Math.PI) / 180; // Convert degrees to radians

    // Rotate all points using a 2D rotation matrix
    points = points.map(p => ({
        x: p.x * Math.cos(radians) - p.y * Math.sin(radians),
        y: p.x * Math.sin(radians) + p.y * Math.cos(radians)
    }));

    // Modify equations for rotation (x and y transformations)
    equations = equations.map(eq =>
        eq
            .replace(/x/g, `(x * Math.cos(${radians}) + y * Math.sin(${radians}))`)
            .replace(/y/g, `(-x * Math.sin(${radians}) + y * Math.cos(${radians}))`)
    );

    drawGraph(); // Update the graph
}


// Reflect points and equations across the X-axis
function applyReflectionX() {
    points = points.map(p => ({ x: p.x, y: -p.y }));

    // Adjust equations for X-axis reflection
    equations = equations.map(eq => eq.replace(/y/g, `(-y)`));

    drawGraph();
}


// Reflect points and equations across the Y-axis
function applyReflectionY() {
    points = points.map(p => ({ x: -p.x, y: p.y }));

    // Adjust equations for Y-axis reflection
    equations = equations.map(eq => eq.replace(/x/g, `(-x)`));

    drawGraph();
}


// Ask for and apply dilation
function promptDilation() {
    const factor = parseFloat(prompt("Enter dilation factor (e.g., 2 for double size):"));
    if (!isNaN(factor)) applyDilation(factor);
}

// Ask for and apply translation
function promptTranslation() {
    const shiftX = parseFloat(prompt("Enter X shift:"));
    const shiftY = parseFloat(prompt("Enter Y shift:"));
    if (!isNaN(shiftX) && !isNaN(shiftY)) applyTranslation(shiftX, shiftY);
}

// Ask for and apply rotation
function promptRotation() {
    const angle = parseFloat(prompt("Enter rotation angle (in degrees):"));
    if (!isNaN(angle)) applyRotation(angle);
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawGrid();
    drawAxes();
    drawEquations();
    drawAllPoints(); // Ensure all elements are drawn after zooming
}


document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');

    // ✅ Declare global variables for axis and scale
    let centerX, centerY, scale;

    // Ensure the canvas fits its container and initialize graph
    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        // Update the center of the graph and scale
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        scale = 40; // Pixels per unit

        drawGraph(); // Redraw the graph on resize
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Ensure it's properly sized on load

    // ✅ Main function to draw the grid, axes, and numbers
    function drawGraph() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

        drawGrid();
        drawAxes();
    }

    // ✅ Draw the grid (background lines)
    function drawGrid() {
        ctx.strokeStyle = "#ddd"; // Light gray grid
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let x = centerX % scale; x < canvas.width; x += scale) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let y = centerY % scale; y < canvas.height; y += scale) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // ✅ Draw the X and Y axes and their numbers
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

        // Axis numbers
        ctx.fillStyle = "black";
        ctx.font = "14px Arial";

        // X-axis labels
        for (let x = centerX; x < canvas.width; x += scale) {
            const label = Math.round((x - centerX) / scale);
            if (label !== 0) ctx.fillText(label, x + 2, centerY - 5);
        }
        for (let x = centerX; x > 0; x -= scale) {
            const label = Math.round((x - centerX) / scale);
            if (label !== 0) ctx.fillText(label, x - 10, centerY - 5);
        }

        // Y-axis labels
        for (let y = centerY; y < canvas.height; y += scale) {
            const label = Math.round((centerY - y) / scale);
            if (label !== 0) ctx.fillText(label, centerX + 5, y - 2);
        }
        for (let y = centerY; y > 0; y -= scale) {
            const label = Math.round((centerY - y) / scale);
            if (label !== 0) ctx.fillText(label, centerX + 5, y + 14);
        }
    }

        // ✅ Zoom Function
        function zoom(event) {
            const zoomFactor = 1.1;
    
            // Check direction of the wheel
            if (event.deltaY < 0) {
                // Zoom in (increase scale)
                scale *= zoomFactor;
            } else {
                // Zoom out (decrease scale)
                scale /= zoomFactor;
            }
    
            // Clamp scale to reasonable limits
            scale = Math.max(10, Math.min(scale, 300));
    
            drawGraph(); // Redraw with new scale
        }
    
        // Add event listener for mouse wheel zooming
        canvas.addEventListener('wheel', zoom);
    
        // ✅ Initialize scale and draw graph
        scale = 40; // 40 pixels = 1 unit
});





drawGraph();
