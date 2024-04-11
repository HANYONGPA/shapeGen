//easing함수를 황용할 수 있는 클래스입니다.
//https://easings.net/ko에서 원하는 함수를 집어 넣어 사용 가능합니다.
//기본 easeInOutSine 적용.

class Ease {
  constructor(aPos, bPos) {
    this.pos = aPos;
    this.aPos = this.pos.copy();
    this.bPos = bPos;
    this.v = 0;
    this.elapsed = 0;
    this.elapsed_f = 0;
  }

  easeFloat(duration, v) {
    this.duration_f = duration;
    this.dt_f = deltaTime * 0.001;
    this.elapsed_f += this.dt_f;
    this.t_f = this.elapsed_f / this.duration_f;

    this.v = v;

    if (this.elapsed_f > this.duration_f) {
      this.elapsed_f = this.duration_f;
    }

    return this.easeInOutSine(this.t_f) * this.v;
  }

  easeVec2(duration) {
    this.duration = duration;
    this.dt = deltaTime * 0.001;
    this.elapsed += this.dt;
    this.t = this.elapsed / this.duration;

    this.pos.set(
      p5.Vector.lerp(this.aPos, this.bPos, this.easeOutElastic(this.t))
    );

    if (this.elapsed > duration) {
      this.aPos.set(this.bPos);
      this.elapsed = duration;
    }
  }

  update(bPos) {
    this.aPos.set(this.pos);
    this.elapsed = 0;
    this.bPos.set(bPos);
  }

  update_f() {
    this.elapsed_f = 0;
  }

  easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }

  display() {
    fill(0);
    for (let x = 0; x < width; x += 3) {
      let y = this.easeInOutSine(map(x, 0, 400, 0, 1)) * 100;
      ellipse(x, 150 + y, 2);
    }
    text(`dt: ${this.dt.toFixed(2)}`, 20, 20);
    text(`elapsed: ${this.elapsed.toFixed(2)}`, 20, 40);
    text(`elapsed_f: ${this.elapsed_f.toFixed(2)}`, 20, 60);
    text(`t: ${this.t.toFixed(2)}`, 20, 80);
    text(`t_f: ${this.t_f.toFixed(2)}`, 20, 100);
  }
}
