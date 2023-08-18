class Boid2 {
  constructor(x, y, z, width, height, depth) {
    this.position = createVector(x, y, z);
    this.velocity = p5.Vector.random3D();
    this.acceleration = createVector();
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.maxForce = 0.25;
    this.maxSpeed = 5;
  }

  // Flocking behavior implementation
  flock(boids) {
    const separationForce = this.separation(boids);
    const alignmentForce = this.alignment(boids);
    const cohesionForce = this.cohesion(boids);

    // Adjust the weights for each force (increase the weight for separation)
    separationForce.mult(1.5);
    alignmentForce.mult(1.0);
    cohesionForce.mult(1.0);

    this.acceleration.add(separationForce);
    this.acceleration.add(alignmentForce);
    this.acceleration.add(cohesionForce);
  }

  // Separation rule
  separation(boids) {
    const perceptionRadius = 50;
    const steering = createVector();
    let total = 0;

    for (const other of boids) {
      const distance = p5.Vector.dist(this.position, other.position);

      if (other !== this && distance < perceptionRadius) {
        const difference = p5.Vector.sub(this.position, other.position);
        difference.div(distance);
        steering.add(difference);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }

  // Alignment rule
  alignment(boids) {
    const perceptionRadius = 100;
    const steering = createVector();
    let total = 0;

    for (const other of boids) {
      const distance = p5.Vector.dist(this.position, other.position);

      if (other !== this && distance < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }

  // Cohesion rule
  cohesion(boids) {
    const perceptionRadius = 100;
    const steering = createVector();
    let total = 0;

    for (const other of boids) {
      const distance = p5.Vector.dist(this.position, other.position);

      if (other !== this && distance < perceptionRadius) {
        steering.add(other.position);
        total++;
      }
    }

    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }

    return steering;
  }

  // Update Boid's position and velocity
  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.acceleration.mult(0);
  }
  
  setDimensions(w, h, d = 0) {
    this.width = w;
    this.height = h;
    this.depth = d;
  }

  // Wrap Boid around the screen in 3D
  edges() {
    if (this.position.x > this.width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = this.width;
    if (this.position.y > this.height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = this.height;
    if (this.position.z > this.depth) this.position.z = 0;
    else if (this.position.z < 0) this.position.z = this.depth;
  }

  // Display Boid in 3D space
  show(c) {
    const coneHeight = 12; // height of the cone
    const coneBase = 4; // radius of the cone base
    
    push();
    noFill();
    specularMaterial(c || 255);
    ambientMaterial(0, 0, 0);
    translate(this.position.x, this.position.y, this.position.z);
    const { x, y, z } = calculateRotationAngles(this.velocity);
    rotateX(x);
    rotateY(y);
    rotateZ(z);
    cone(coneBase, coneHeight, 60, 1);
    pop();
  }
}

function calculateRotationAngles(v) {
  // Normalize the input vector
  let normV = v.copy().normalize();

  // Calculate the rotation angle around the x-axis (pitch)
  let pitch = Math.asin(normV.z);

  // Rotate the normalized vector around the x-axis using the calculated angle
  let rotatedV = createVector(normV.x, normV.y * Math.cos(pitch) - normV.z * Math.sin(pitch), normV.y * Math.sin(pitch) + normV.z * Math.cos(pitch));

  // Calculate the rotation angle around the z-axis (yaw)
  let yaw = Math.atan2(rotatedV.y, rotatedV.x) - 90;

  // Return the rotation angles
  return {x: pitch, y: 0, z: yaw};
}