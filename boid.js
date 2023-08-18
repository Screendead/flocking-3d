class Boid {
  constructor(x, y, width, height) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector();
    this.width = width;
    this.height = height;
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
      const distance = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );

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
      const distance = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );

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
      const distance = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );

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

  // Wrap Boid around the screen
  edges() {
    if (this.position.x > this.width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = this.width;
    if (this.position.y > this.height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = this.height;
  }

  // Display Boid on the screen
  show(c) {
    // if (c) stroke(c);
    // else stroke(255);
    // point(this.position.x, this.position.y);
    
    // Draw Boid as an isosceles triangle
    const triangleHeight = 16;
    const triangleWidth = 6;
    const vAngle = this.velocity.heading() + radians(90);
    const aAngle = this.acceleration.heading() + radians(90);

    push();
    noFill();
    if (c) stroke(c);
    else stroke(255); // stroke(256, 0, 128);
    translate(this.position.x, this.position.y);
    rotate(vAngle);
    beginShape(TRIANGLES);
    vertex(0, -triangleHeight / 2);
    vertex(-triangleWidth / 2, triangleHeight / 2);
    vertex(triangleWidth / 2, triangleHeight / 2);
    endShape(CLOSE);
    pop();
  }
}
