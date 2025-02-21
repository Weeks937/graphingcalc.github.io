function plotGraph() {
    const expression = document.getElementById('expression').value;
    const canvas = document.getElementById('graph');
    const ctx = canvas.getContext('2d');
  
    // Clear previous graph
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Set graph style
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
  
    const scaleX = 20; // Number of pixels per unit on the x-axis
    const scaleY = 20; // Number of pixels per unit on the y-axis
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
  
    // Create the mathematical function to graph
    const f = math.compile(expression.replace("^", "**")); // Replace ^ with ** for compatibility with math.js
  
    // Loop over x values and plot the corresponding y values
    let firstPoint = true;
    for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
      try {
        const xValue = x / scaleX;
        const yValue = f.evaluate({ x: xValue }); // Evaluate the function for each x
  
        // Convert the y value to pixels
        const yPixel = -yValue * scaleY + centerY;
  
        // Plot the point on the canvas
        if (firstPoint) {
          ctx.moveTo(centerX + x, yPixel);
          firstPoint = false;
        } else {
          ctx.lineTo(centerX + x, yPixel);
        }
      } catch (e) {
        // Handle errors like invalid math expressions
        console.error(e);
      }
    }
  
    ctx.stroke();
  }