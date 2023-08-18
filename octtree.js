class OctTree {
  constructor(boundary, capacity, level) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
    this.checksPerformed = 0;
    this.found = 0;
    this.statistics = true;
    this.level = level || 0;
  }

  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const z = this.boundary.z;
    const w = this.boundary.w / 2;
    const h = this.boundary.h / 2;
    const d = this.boundary.d / 2;

    const upFrontLeft = new Box(x - w, y - h, z + d, w, h, d);
    this.upFrontLeft = new OctTree(upFrontLeft, this.capacity, this.level + 1);
    const upFrontRight = new Box(x + w, y - h, z + d, w, h, d);
    this.upFrontRight = new OctTree(upFrontRight, this.capacity, this.level + 1);
    const upBackLeft = new Box(x - w, y - h, z - d, w, h, d);
    this.upBackLeft = new OctTree(upBackLeft, this.capacity, this.level + 1);
    const upBackRight = new Box(x + w, y - h, z - d, w, h, d);
    this.upBackRight = new OctTree(upBackRight, this.capacity, this.level + 1);
    const downFrontLeft = new Box(x - w, y + h, z + d, w, h, d);
    this.downFrontLeft = new OctTree(downFrontLeft, this.capacity, this.level + 1);
    const downFrontRight = new Box(x + w, y + h, z + d, w, h, d);
    this.downFrontRight = new OctTree(downFrontRight, this.capacity, this.level + 1);
    const downBackLeft = new Box(x - w, y + h, z - d, w, h, d);
    this.downBackLeft = new OctTree(downBackLeft, this.capacity, this.level + 1);
    const downBackRight = new Box(x + w, y + h, z - d, w, h, d);
    this.downBackRight = new OctTree(downBackRight, this.capacity, this.level + 1);

    this.divided = true;
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.upFrontLeft.insert(point) ||
      this.upFrontRight.insert(point) ||
      this.upBackLeft.insert(point) ||
      this.upBackRight.insert(point) ||
      this.downFrontLeft.insert(point) ||
      this.downFrontRight.insert(point) ||
      this.downBackLeft.insert(point) ||
      this.downBackRight.insert(point)
    );
  }

  query(range, found = []) {
    if (!this.boundary.intersects(range)) {
      return found;
    }

    for (const point of this.points) {
      if (this.statistics && !this.divided) this.checksPerformed++;

      if (range.contains(point)) {
        if (this.statistics && !this.divided) this.found++;
        found.push(point);
      }
    }

    if (this.divided) {
      this.upFrontLeft.query(range, found);
      this.upFrontRight.query(range, found);
      this.upBackLeft.query(range, found);
      this.upBackRight.query(range, found);
      this.downFrontLeft.query(range, found);
      this.downFrontRight.query(range, found);
      this.downBackLeft.query(range, found);
      this.downBackRight.query(range, found);

      if (this.statistics && this.divided) {
        this.checksPerformed =
          this.upFrontLeft.checksPerformed +
          this.upFrontRight.checksPerformed +
          this.upBackLeft.checksPerformed +
          this.upBackRight.checksPerformed +
          this.downFrontLeft.checksPerformed +
          this.downFrontRight.checksPerformed +
          this.downBackLeft.checksPerformed +
          this.downBackRight.checksPerformed;

        this.found = this.upFrontLeft.found +
          this.upFrontRight.found +
          this.upBackLeft.found +
          this.upBackRight.found +
          this.downFrontLeft.found +
          this.downFrontRight.found +
          this.downBackLeft.found +
          this.downBackRight.found;
      }
    }

    return found;
  }

  clear() {
    this.points = [];
    this.resetStatistics();

    if (this.divided) {
      this.divided = false;

      this.upFrontLeft.clear();
      this.upFrontRight.clear();
      this.upBackLeft.clear();
      this.upBackRight.clear();
      this.downFrontLeft.clear();
      this.downFrontRight.clear();
      this.downBackLeft.clear();
      this.downBackRight.clear();
    }
  }
  
  resetStatistics() {
    this.checksPerformed = 0;
    this.found = 0;
  }

  show() {
    if (this.divided) {
      this.upFrontLeft.show();
      this.upFrontRight.show();
      this.upBackLeft.show();
      this.upBackRight.show();
      this.downFrontLeft.show();
      this.downFrontRight.show();
      this.downBackLeft.show();
      this.downBackRight.show();
      return;
    }

    stroke(51);
    strokeWeight(1);
    noFill();
    push();
    translate(this.boundary.x, this.boundary.y, this.boundary.z);
    box(this.boundary.w * 2, this.boundary.h * 2, this.boundary.d * 2);
    pop();

    // Print checks & found
    textAlign(CENTER, CENTER);
    textSize(18);
    noStroke();

    if (this.checksPerformed > 0) {
      push();
      fill(255, 0, 0, 128);
      translate(this.boundary.x, this.boundary.y - 10, this.boundary.z)
      text(this.checksPerformed, 0, 0);
      pop();
    }

    if (this.found > 0) {
      push();
      fill(0, 256, 0, 128);
      translate(this.boundary.x, this.boundary.y + 10, this.boundary.z)
      text(this.found, 0, 0);
      pop();
    }
  }
}
