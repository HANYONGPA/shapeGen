function preload() {
  supernormale = loadFont("./fonts/SupernormaleEigSta W00 Bold.ttf");
  playIcon = loadImage("./icons/playIcon.png");
  pauseIcon = loadImage("./icons/pauseIcon.png");
}

let frame;
let interface;
let frameThreshold = 90;
let count = 0;
let debugMode = false;
let playMode = true;
let randPos;
let theta = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  frame = new Frame(width / 2, height / 2, width / 1, height / 1);
  interface = new Interface();
}

function draw() {
  background(255);
  if (playMode && frameCount % frameThreshold == 0) {
    count++;
    randPos = createVector(
      random(frame.pos.x - frame.sizeW / 2, frame.pos.x + frame.sizeW / 2),
      random(frame.pos.y - frame.sizeH / 2, frame.pos.y + frame.sizeH / 2)
    );
  }
  frame.display();
  interface.display();
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    frame.pointNum += 1;
    frame.rays.push(
      new Ray(frame.rays[0].targetPos.x, frame.rays[0].targetPos.y, radians(0))
    );
    frame.shape.generatePoint(
      frame.shape.points[0].pos.x,
      frame.shape.points[0].pos.y,
      frame.pointNum - 1
    );
  }
  if (keyCode === DOWN_ARROW && frame.pointNum > 1) {
    frame.pointNum -= 1;
    frame.rays.pop();
    frame.shape.removePoint();
  }

  if (keyCode === 32) {
    let randPos = createVector(
      random(frame.pos.x - frame.sizeW / 2, frame.pos.x + frame.sizeW / 2),
      random(frame.pos.y - frame.sizeH / 2, frame.pos.y + frame.sizeH / 2)
    );
    for (let ray of frame.rays) {
      ray.ease.update(randPos);
    }
    theta += random(0.15, 0.3);
    frame.targetAngle = map(noise(theta), -1, 1, -TWO_PI, TWO_PI);
    frame.ease.update_f();

    for (let point of frame.shape.points) {
      theta += random(0.8, 0.9);
      //덜 변화
      // point.randRatio = map(noise(theta), -1, 1, 0.0, 1.0);
      //더 변화
      point.randRatio = map(noise(theta), -1, 1, -1.0, 1.2);
    }

    for (let point of frame.shape.points) {
      // point.targetPos = p5.Vector.lerp(
      //   frame.rays[point.id].targetPos,
      //   point.targetPos,
      //   point.randRatio
      // );
      // point.ease.update(point.targetPos);
    }
  }
  if (keyCode === 48) {
    //초기화
    for (let point of frame.shape.points) {
      point.randRatio = 1;
      // point.ease.update(point.targetPos);
    }
    for (let ray of frame.rays) {
      ray.ease.update(createVector(width / 2, height / 2));
    }
    frame.targetAngle = 0;
  }
  if (keyCode === 49) {
    let randPos = createVector(
      random(frame.pos.x - frame.sizeW / 2, frame.pos.x + frame.sizeW / 2),
      random(frame.pos.y - frame.sizeH / 2, frame.pos.y + frame.sizeH / 2)
    );
    for (let ray of frame.rays) {
      ray.ease.update(randPos);
    }
  }
  if (keyCode === 50) {
    theta += random(0.15, 0.3);
    frame.targetAngle = map(noise(theta), -1, 1, -TWO_PI, TWO_PI);
    frame.ease.update_f();
  }
  if (keyCode === 51) {
    for (let point of frame.shape.points) {
      theta += random(0.8, 0.9);
      point.randRatio = map(noise(theta), -1, 1, -1.0, 1.2);
    }
  }

  if (keyCode === 68) {
    debugMode = !debugMode;
  }
  if (keyCode === 80) {
    playMode = !playMode;
  }
  if (keyCode === ENTER) {
    for (let point of frame.shape.points) {
      point.targetPos = p5.Vector.lerp(
        frame.rays[point.id].targetPos,
        point.targetPos,
        point.randRatio
      );
      point.ease.update(point.targetPos);
    }
  }
}

class Ray {
  constructor(x, y, angle) {
    this.pos = createVector(x, y);
    this.angle = angle;
    this.dir = p5.Vector.fromAngle(this.angle);
    this.dir.setMag(height / 10);

    this.targetPos = new p5.Vector(this.pos.x, this.pos.y);
    this.ease = new EaseVec2(this.pos, this.targetPos);
  }

  update() {
    this.dir = p5.Vector.fromAngle(this.angle);
    this.dir.setMag(height / 6);

    if (playMode && frameCount % frameThreshold == 0) {
      this.ease.update(randPos);
    }
    this.ease.easeVec2_2(1);
  }

  display() {
    this.update();
    push();
    translate(this.pos.x, this.pos.y);
    if (debugMode) {
      line(0, 0, this.dir.x * 10, this.dir.y * 10);
    }
    pop();
  }

  cast(wall) {
    const x1 = wall.posA.x;
    const y1 = wall.posA.y;
    const x2 = wall.posB.x;
    const y2 = wall.posB.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) {
      return;
    }
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;
    if (t > 0 && t < 1 && u > 0) {
      const point = createVector();
      point.x = x1 + t * (x2 - x1);
      point.y = y1 + t * (y2 - y1);
      return point;
    } else {
      return;
    }
  }
}

class Frame {
  constructor(x, y, sizeW, sizeH) {
    this.pos = createVector(x, y);
    this.sizeW = sizeW;
    this.sizeH = sizeH;
    this.posA = createVector(this.pos.x - sizeW / 2, this.pos.y - sizeH / 2);
    this.posB = createVector(this.pos.x + sizeW / 2, this.pos.y - sizeH / 2);
    this.posC = createVector(this.pos.x + sizeW / 2, this.pos.y + sizeH / 2);
    this.posD = createVector(this.pos.x - sizeW / 2, this.pos.y + sizeH / 2);

    this.wall_1 = { posA: this.posA, posB: this.posB };
    this.wall_2 = { posA: this.posB, posB: this.posC };
    this.wall_3 = { posA: this.posC, posB: this.posD };
    this.wall_4 = { posA: this.posD, posB: this.posA };

    this.rays = [];
    this.pointNum = 10;

    this.ease = new EaseFloat(0, 0);
    this.angle = 0;
    this.targetAngle = 0;

    this.shape = new Shape();

    //레이 생성
    this.generateRays(this.pointNum);
  }

  generateRays(pointNum) {
    for (let i = 0; i < pointNum; i++) {
      this.rays.push(new Ray(this.pos.x, this.pos.y, radians(0)));
      this.shape.generatePoint(this.pos.x, this.pos.y, i);
    }
  }

  rayAngleCtrl() {
    //레이 각도 조절 함수
    this.angle = this.ease.easeFloat(1, this.targetAngle);
    if (playMode && frameCount % frameThreshold == 0) {
      theta += 1;
      this.targetAngle = map(noise(theta), -1, 1, 0, TWO_PI);
      this.ease.update_f();
    }
    for (let i = 0; i < this.pointNum; i++) {
      this.rays[i].angle = this.angle + radians((360 / this.pointNum) * i);
      //레이 그리기
      this.rays[i].display();
      //레이 캐스팅
      for (let wall of [this.wall_1, this.wall_2, this.wall_3, this.wall_4]) {
        const point = this.rays[i].cast(wall);
        if (point) {
          if (debugMode) {
            push();
            fill(0);
            ellipse(point.x, point.y, 5);
            pop();
          }
          this.shape.points[i].targetPos = point;
        }
      }
    }
  }

  display() {
    //벽 그리기
    if (debugMode) {
      stroke(0);
    } else {
      noStroke();
    }
    line(this.posA.x, this.posA.y, this.posB.x, this.posB.y);
    line(this.posB.x, this.posB.y, this.posC.x, this.posC.y);
    line(this.posC.x, this.posC.y, this.posD.x, this.posD.y);
    line(this.posD.x, this.posD.y, this.posA.x, this.posA.y);
    //레이 각도 조절
    this.rayAngleCtrl();
    //셰입 그리기
    this.shape.display();
  }
}

class Shape {
  constructor() {
    this.points = [];
    this.pointNum = 4;
  }

  generatePoint(x, y, id) {
    this.points.push(new Point(x, y, id));
  }

  removePoint() {
    this.points.pop();
  }

  display() {
    beginShape();
    for (let point of this.points) {
      point.update();
      if (debugMode) {
        point.display();
        fill(0, 180, 0, 0);
      } else {
        fill(0, 180, 0);
      }
      vertex(point.pos.x, point.pos.y);
    }
    endShape(CLOSE);
  }
}

class Point {
  constructor(x, y, id) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.size = 10;

    this.targetPos = new p5.Vector();
    this.ease = new EaseVec2(this.pos, this.targetPos);
    this.randRatio = 1;

    this.id = id;
  }

  update() {
    if (debugMode && !playMode) {
      this.targetPos = p5.Vector.lerp(
        frame.rays[this.id].targetPos,
        this.targetPos,
        this.randRatio
      );
      this.acc = p5.Vector.sub(this.targetPos, this.pos);
      this.acc.mult(0.05);
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.vel.mult(0.85);
      this.acc.mult(0);
    } else if (playMode) {
      this.ease.easeVec2(1.2);
      if (frameCount % (frameThreshold / 9) == 0) {
        this.targetPos = p5.Vector.lerp(
          frame.rays[this.id].targetPos,
          this.targetPos,
          this.randRatio
        );
        this.ease.update(this.targetPos);
      }
      if (frameCount % frameThreshold == 0) {
        theta += random(0.8, 0.9);
        this.randRatio = map(noise(theta), -1, 1, -1.0, 1.2);
      }
    }
  }

  display() {
    push();
    fill(0);
    ellipse(this.pos.x, this.pos.y, this.size);
    fill(255, 0, 0);
    text(this.id, this.pos.x, this.pos.y);
    pop();
  }
}

class Interface {
  constructor() {}

  display() {
    push();
    noStroke();
    fill(0);
    textSize(42);
    textFont(supernormale);
    textAlign(LEFT, CENTER);
    text(`${frame.pointNum}`, 15, 40);
    if (debugMode) {
      text(`${frame.pointNum}_${count}`, 15, 40);
      textAlign(RIGHT, CENTER);
      textSize(18);
      text("DEBUG", width - 30, 38);
      text("Angle: " + frame.angle.toFixed(2), width - 30, 65);
      image(playMode ? pauseIcon : playIcon, 60, height - 60, 40, 50);
    }
    !playMode ? image(playIcon, 60, height - 60, 40, 50) : null;
    pop();
  }
}
