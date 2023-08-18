const NUM_BOIDS = 512;
const STAGGER_TREE_GENERATION = false;
const STAGGER_AMOUNT = 5; // Frames to wait before recalculating tree
const flock = [];
const capacity = 4;
const boidRange = 80;
let tree;
let guiFontRegular;
let guiFontBold;
let paused = false;
let treeVisualisation = false;
let boidVisualisation = true;
let boidFOVVisualisation = false;
let fps = 0;
let idx = 0;
let npb = 0; // neighbours/boid
let cpf = 0; // checks/frame
let cps = 0; // checks/second
let interval;
let three = true; // Must start out `true`
let depth;
let cam;

function preload() {
  guiFontRegular = loadFont("SourceCodePro-Regular.ttf")
  guiFontBold = loadFont("SourceCodePro-Bold.ttf");
}

function setup() {
  createCanvas(innerWidth, innerHeight, three ? WEBGL : P2D);
  for (let i = 0; i < NUM_BOIDS; i++) {
    flock.push(new Boid2(random(width), random(height), random(width), width, height, width));
  }
  frameRate(60);
  
  interval = setInterval(() => {
    fps = `${frameRate().toFixed(2)} FPS`;
    
    if (!tree) return;
    
    npb = `${numberWithCommas((tree.found / flock.length).toFixed(0))} neighbours/boid`;
    cpf = `${numberWithCommas(tree.checksPerformed)} checks/frame`;
    cps = `${numberWithCommas((tree.checksPerformed * frameRate()).toFixed(0))} checks/second`;
  }, 1000);
  
  textFont(guiFontRegular);
  cam = createVector(width / 2, height / 2, three ? depth * 2 : 0)
}

function draw() {
  background(0);
  
  depth = width;
  // translate(-cam.x, -cam.y, -cam.z);
  translate(-width / 2, -height / 2, three ? -depth : 0)
  
  if (!tree) {
    if (three) {
      const boundary = new Box(
        // sin(frameCount * 0.01) * width,
        // cos(frameCount * 0.01) * height,
        width / 2,
        height / 2,
        depth / 2,
        width / 2,
        height / 2,
        depth / 2
      );
      const octtree = new OctTree(boundary, capacity);
      tree = octtree;
    } else {
      const boundary = new Rectangle(0, 0, innerWidth, innerHeight);
      const quadtree = new QuadTree(boundary, capacity);
      tree = quadtree;
    }
  }
  
  lights();
  
  if (three) {
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    push();
    translate(width / 2, height / 2, depth / 2);
    box(width, height, depth);
    pop();
    noStroke();
  }
  
  if (paused) {
    if (!three) {
      rectMode(CORNERS)
      fill(0, 0, 0, 128);
      rect(0, 0, width, height);
    }
    
    fill(255);
    noStroke(255);
    textAlign(CENTER, CENTER);
    textSize(100);
    textFont(guiFontBold);
    text("PAUSED", width / 2, height / 2 - 35);
    textSize(25);
    text("Press SPACE to continue...", width / 2, height / 2 + 35);
    
    noLoop();
    return;
  }

  if (!STAGGER_TREE_GENERATION || frameCount % STAGGER_AMOUNT === 0) {
    tree.clear();
    for (const boid of flock) {
      const p = new Point(boid.position.x, boid.position.y, boid.position.z, boid);
      tree.insert(p);
    }
    tree.statistics = true;
  } else {
    tree.statistics = false;
  }

  for (const boid of flock) {
    const range = three ? new Box(boid.position.x, boid.position.y, boid.position.z, boidRange, boidRange, boidRange)
      : new Rectangle(boid.position.x, boid.position.y, boidRange, boidRange);
    const nearbyBoids = tree.query(range).map((point) => point.userData);

    boid.flock(nearbyBoids);
    boid.update();
    boid.edges(three);
  }
  
  if (treeVisualisation) {
    tree.show();
  }
  
  if (boidVisualisation) {
    for (const boid of flock) {
      boid.show();
    }
  }
  
  if (boidFOVVisualisation) {
    // Show the range
    const { x, y } = flock[idx].position;
    push();
    noFill();
    stroke(255, 255, 0);
    translate(x, y);
    rectMode(RADIUS);
    rect(0, 0, boidRange);
    pop();
    flock[idx].show(color(255, 255, 0));
    const range = new Rectangle(x, y, boidRange, boidRange);
    tree.statistics = false;
    const nearbyBoids = tree.query(range).map((point) => point.userData);
    tree.statistics = true;
    for (let nb of nearbyBoids) {
      stroke(255, 0, 0);
      strokeWeight(6);
      point(nb.position.x, nb.position.y, nb.position.z);
    }
  }
  
  showGUI();
}

function keyPressed() {
  switch (keyCode) {
    case 32: // SPACE
      paused = !paused;
      if (!paused) loop();
      break;
    case 75: // K
      idx++;
      idx %= flock.length;
      break;
    case 81: // Q
      treeVisualisation = !treeVisualisation;
      break;
    case 66: // B
      boidVisualisation = !boidVisualisation;
      break;
    case 70: // F
      boidFOVVisualisation = !boidFOVVisualisation;
      break;
    case 50: // 2
      three = false;
      resetCanvas();
      break;
    case 51: // 3
      three = true;
      resetCanvas();
      break;
  }
}

function resetCanvas() {
  // Update the positions and dimensions of the boids in flock based on the updated dimensionality
  for (let boid of flock) {
    if (three) {
      boid.position.z = random(depth);
      boid.setDimensions(width, height, depth);
    } else {
      boid.position.z = 0;
      boid.setDimensions(width, height);
    }
  }
  tree = null;
}

function showGUI() {
  if (three) {
    push();
    // translate(0, 0, depth * (sin(frameCount * 0.03) / 2 + 0.5));
    translate(0, 0, depth);
  }
  
  // Display the current FPS
  textSize(16);
  textAlign(RIGHT, TOP);
  fill(255);
  stroke(0);
  strokeWeight(1);
  textFont(guiFontBold);
  text(fps, width - 10, 10);
  
  // Display current flock size
  textAlign(LEFT, TOP);
  textFont(guiFontBold);
  text(`${numberWithCommas(flock.length)} Boids`, 10, 10);
  
  // Display number of checks performed
  textAlign(LEFT, TOP);
  text(npb, 10, 30);
  text(cpf, 10, 50);
  text(cps, 10, 70);
  
  if (treeVisualisation) {
    // Display legend
    textAlign(LEFT, BOTTOM);
    rectMode(RADIUS);
    textFont(guiFontRegular);
    fill(255, 0, 0);
    rect(15, height - 40, 8);
    fill(0, 255, 0);
    rect(15, height - 20, 8);
    fill(255);
    text("  = checks performed", 15, height - 30);
    text("  = neighbours found", 15, height - 10);
  }
  
  // Display hotkeys
  textAlign(RIGHT, BOTTOM);
  textFont(guiFontRegular);
  fill(255);
  text("Play/pause: SPACE", width - 10, height - 90)
  text(`Toggle ${three ? 'Oct' : 'Quad'}Tree visualisation: Q`, width - 10, height - 70)
  text("Toggle Boid visualisation: B", width - 10, height - 50)
  text("Toggle Boid FOV visualisation: F", width - 10, height - 30)
  text("Next Boid's FOV: K", width - 10, height - 10)
  
  if (three) pop();
}

function numberWithCommas(integer) {
  const intString = integer.toString();
  const digits = intString.split('');
  const reversedDigits = digits.reverse();
  
  const groupedDigits = reversedDigits.reduce((acc, digit, index) => {
    if (index % 3 === 0 && index !== 0) {
      acc.push(',');
    }
    acc.push(digit);
    return acc;
  }, []);
  
  const result = groupedDigits.reverse().join('');
  return result;
}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
// }