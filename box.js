class Box {
  constructor(x, y, z, w, h, d) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.h = h;
    this.d = d;
  }

  contains(point) {
    return (
      point.x >= this.x - this.w &&
      point.x <= this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y <= this.y + this.h &&
      point.z >= this.z - this.d &&
      point.z <= this.z + this.d
    );
  }

  intersects(range) {
    return (
      range.x - range.w <= this.x + this.w &&
      range.x + range.w >= this.x - this.w &&
      range.y - range.h <= this.y + this.h &&
      range.y + range.h >= this.y - this.h &&
      range.z - range.d <= this.z + this.d &&
      range.z + range.d >= this.z - this.d
    );
  }
}