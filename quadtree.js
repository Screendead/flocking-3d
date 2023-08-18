class QuadTree {
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
    const w = this.boundary.w / 2;
    const h = this.boundary.h / 2;

    const ne = new Rectangle(x + w, y - h, w, h);
    this.northeast = new QuadTree(ne, this.capacity, this.level + 1);
    const nw = new Rectangle(x - w, y - h, w, h);
    this.northwest = new QuadTree(nw, this.capacity, this.level + 1);
    const se = new Rectangle(x + w, y + h, w, h);
    this.southeast = new QuadTree(se, this.capacity, this.level + 1);
    const sw = new Rectangle(x - w, y + h, w, h);
    this.southwest = new QuadTree(sw, this.capacity, this.level + 1);

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
      this.northeast.insert(point) ||
      this.northwest.insert(point) ||
      this.southeast.insert(point) ||
      this.southwest.insert(point)
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
      this.northeast.query(range, found);
      this.northwest.query(range, found);
      this.southeast.query(range, found);
      this.southwest.query(range, found);
      
      if (this.statistics && this.divided) {
        this.checksPerformed =
          this.northeast.checksPerformed +
          this.northwest.checksPerformed +
          this.southeast.checksPerformed +
          this.southwest.checksPerformed;
        
        this.found = this.northeast.found +
          this.northwest.found +
          this.southeast.found +
          this.southwest.found;
      }
    }

    return found;
  }
  
  clear() {
    this.points = [];
    this.checksPerformed = 0;
    this.found = 0;

    if (this.divided) {
      this.divided = false;
      
      this.northeast.clear();
      this.northwest.clear();
      this.southeast.clear();
      this.southwest.clear();
    }
  }
  
  show() {
    if (this.divided) {
      this.northeast.show();
      this.northwest.show();
      this.southeast.show();
      this.southwest.show();
      return;
    }
    
    stroke(51);
    strokeWeight(1);
    noFill();
    rectMode(CENTER);
    rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);

    // Print checks & found
    textAlign(CENTER, CENTER);
    noStroke();

    if (this.checksPerformed > 0) {
      push();
      fill(255, 0, 0);
      translate(this.boundary.x, this.boundary.y - 10)
      text(this.checksPerformed, 0, 0);
      pop();
    }

    if (this.found > 0) {
      push();
      fill(0, 255, 0);
      translate(this.boundary.x, this.boundary.y + 10)
      text(this.found, 0, 0);
      pop();
    }
  }
}