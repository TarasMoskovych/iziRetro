import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import * as p2 from 'p2';

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;
let ppm = 24; // pixels per meter
let viewWidth = 768;
let viewHeight = 768;
let physicsWidth = viewWidth / ppm;
let physicsHeight = viewHeight / ppm;
let world: any;
let wheel: any;
let pinMaterial: any;
let arrowMaterial: any;
let ctx: any;
let timeStep = (1 / 60);

let cubeBezier = (p0: any, c0: any, c1: any, p1: any, t: any) => {
  var p = new Point();
  let nt = (1 - t);

  p.x = nt * nt * nt * p0.x + 3 * nt * nt * t * c0.x + 3 * nt * t * t * c1.x + t * t * t * p1.x;
  p.y = nt * nt * nt * p0.y + 3 * nt * nt * t * c0.y + 3 * nt * t * t * c1.y + t * t * t * p1.y;

  return p;
};

let Ease = {
  inCubic: (t: any, b: any, c: any, d: any) => {
    t /= d;
    return c * t * t * t + b;
  },
  outCubic: (t: any, b: any, c: any, d: any) => {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
  },
  inOutCubic: (t: any, b: any, c: any, d: any) => {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
  },
  inBack: (t: any, b: any, c: any, d: any, s: any) => {
    s = s || 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  }
};

class Wheel {
  x: any;
  y: any;
  radius: any;
  segments: any;
  pinRadius: any;
  pinDistance: any;
  pX: number;
  pY: number;
  pRadius: number;
  pPinRadius: number;
  pPinPositions: any[];
  deltaPI: number;
  body: any;

  constructor(x: any, y: any, radius: any, segments: any, pinRadius: any, pinDistance:any) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.segments = segments;
    this.pinRadius = pinRadius;
    this.pinDistance = pinDistance;

    this.pX = this.x * ppm;
    this.pY = (physicsHeight - this.y) * ppm;
    this.pRadius = this.radius * ppm;
    this.pPinRadius = this.pinRadius * ppm;
    this.pPinPositions = [];

    this.deltaPI = TWO_PI / this.segments;

    this.createBody();
    this.createPins();
  }

  createBody() {
    this.body = new p2.Body({ mass:1, position:[this.x, this.y] });
    this.body.angularDamping = 0.0;
    this.body.addShape(new p2.Circle(this.radius));
    this.body.shapes[0].sensor = true; //TODO use collision bits instead

    var axis = new p2.Body({ position:[this.x, this.y] });
    var constraint = new p2.LockConstraint(this.body, axis);
    constraint.collideConnected = false;

    world.addBody(this.body);
    world.addBody(axis);
    world.addConstraint(constraint);
  };

  createPins() {
    let l = this.segments;
    let pin = new p2.Circle(this.pinRadius);

    pin.material = pinMaterial;

    for (let i = 0; i < l; i++) {
      let x = Math.cos(i / l * TWO_PI) * this.pinDistance;
      let y = Math.sin(i / l * TWO_PI) * this.pinDistance;

      console.log(this.body);

      this.body.addShape(pin, [x, y]);
      this.pPinPositions[i] = [x * ppm, -y * ppm];
    }
  };

  gotLucky() {
    let currentRotation = wheel.body.angle % TWO_PI;
    let currentSegment = Math.floor(currentRotation / this.deltaPI);

    return (currentSegment % 2 === 0);
  };

  draw() {
    // TODO this should be cached in a canvas, and drawn as an image
    // also, more doodads
    ctx.save();
    ctx.translate(this.pX, this.pY);

    ctx.beginPath();
    ctx.fillStyle = '#DB9E36';
    ctx.arc(0, 0, this.pRadius + 24, 0, TWO_PI);
    ctx.fill();
    ctx.fillRect(-12, 0, 24, 400);

    ctx.rotate(-this.body.angle);

    for (let i = 0; i < this.segments; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#BD4932' : '#FFFAD5';
      ctx.beginPath();
      ctx.arc(0, 0, this.pRadius, i * this.deltaPI, (i + 1) * this.deltaPI);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#401911';

    this.pPinPositions.forEach(p => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], this.pPinRadius, 0, TWO_PI);
      ctx.fill();
    }, this);

    ctx.restore();
  };
};

class Arrow {
  x: any;
  y: any;
  w: any;
  h: any;
  verts: any;
  pX: number;
  pY: number;
  pVerts: any[];
  body: any;

  constructor(x: any, y: any, w: any, h: any) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.verts = [];

    this.pX = this.x * ppm;
    this.pY = (physicsHeight - this.y) * ppm;
    this.pVerts = [];

    this.createBody();
  }

  createBody() {
    this.body = new p2.Body({ mass:1, position:[this.x, this.y] });
    this.body.addShape(this.createArrowShape());

    let axis = new p2.Body({position:[this.x, this.y]});
    let constraint = new p2.RevoluteConstraint(this.body, axis, {
        worldPivot:[this.x, this.y]
    });
    constraint.collideConnected = false;

    let left = new p2.Body({position:[this.x - 2, this.y]});
    let right = new p2.Body({position:[this.x + 2, this.y]});
    let leftConstraint = new p2.DistanceConstraint(this.body, left, {
        localAnchorA:[-this.w * 2, this.h * 0.25],
        collideConnected:false
    });
    let rightConstraint = new p2.DistanceConstraint(this.body, right, {
        localAnchorA:[this.w * 2, this.h * 0.25],
        collideConnected:false
    });
    let s = 32,
        r = 4;

    leftConstraint.setStiffness(s);
    leftConstraint.setRelaxation(r);
    rightConstraint.setStiffness(s);
    rightConstraint.setRelaxation(r);

    world.addBody(this.body);
    world.addBody(axis);
    world.addConstraint(constraint);
    world.addConstraint(leftConstraint);
    world.addConstraint(rightConstraint);
  };

  createArrowShape() {
    this.verts[0] = [0, this.h * 0.25];
    this.verts[1] = [-this.w * 0.5, 0];
    this.verts[2] = [0, -this.h * 0.75];
    this.verts[3] = [this.w * 0.5, 0];

    this.pVerts[0] = [this.verts[0][0] * ppm, -this.verts[0][1] * ppm];
    this.pVerts[1] = [this.verts[1][0] * ppm, -this.verts[1][1] * ppm];
    this.pVerts[2] = [this.verts[2][0] * ppm, -this.verts[2][1] * ppm];
    this.pVerts[3] = [this.verts[3][0] * ppm, -this.verts[3][1] * ppm];

    let shape = new p2.Convex(this.verts);
    shape.material = arrowMaterial;

    return shape;
  };

  hasStopped() {
    let angle = Math.abs(this.body.angle % TWO_PI);
    return (angle < 1e-3 || (TWO_PI - angle) < 1e-3);
  };

  update() {}

  draw() {
    ctx.save();
    ctx.translate(this.pX, this.pY);
    ctx.rotate(-this.body.angle);

    ctx.fillStyle = '#401911';

    ctx.beginPath();
    ctx.moveTo(this.pVerts[0][0], this.pVerts[0][1]);
    ctx.lineTo(this.pVerts[1][0], this.pVerts[1][1]);
    ctx.lineTo(this.pVerts[2][0], this.pVerts[2][1]);
    ctx.lineTo(this.pVerts[3][0], this.pVerts[3][1]);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };
};

class Particle {
  p0: any;
  p1: any;
  p2: any;
  p3: any;
  time: number;
  duration: number;
  color: string;
  w: number;
  h: number;
  complete: boolean;
  x: any;
  y: any;
  r: number;
  sy: number;

  constructor(p0: any, p1: any, p2: any, p3: any) {
    this.p0 = p0;
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;

    this.time = 0;
    this.duration = 3 + Math.random() * 2;
    this.color =  'hsl(' + Math.floor(Math.random() * 360) + ',100%,50%)';

    this.w = 10;
    this.h = 7;

    this.complete = false;
  }

  update() {
    this.time = Math.min(this.duration, this.time + timeStep);

    var f = Ease.outCubic(this.time, 0, 1, this.duration);
    var p = cubeBezier(this.p0, this.p1, this.p2, this.p3, f);

    var dx = p.x - this.x;
    var dy = p.y - this.y;

    this.r =  Math.atan2(dy, dx) + HALF_PI;
    this.sy = Math.sin(Math.PI * f * 10);
    this.x = p.x;
    this.y = p.y;

    this.complete = this.time === this.duration;
  };

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.r);
    ctx.scale(1, this.sy);

    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w * 0.5, -this.h * 0.5, this.w, this.h);

    ctx.restore();
  };
};

class Point {
  x: number;
  y: number;

  constructor(x: any = 0, y: any = 0) {
    this.x = x;
    this.y = y;
  }
};

@Component({
  selector: 'app-fortune',
  templateUrl: './fortune.component.html',
  styleUrls: ['./fortune.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FortuneComponent implements OnInit {
  @ViewChild('drawingCanvas', { static: true })
  drawingCanvas: ElementRef<HTMLCanvasElement>;

  // Canvas settings
  viewCenterX = viewWidth * 0.5;
  viewCenterY = viewHeight * 0.5;

  time = 0;

  physicsCenterX = physicsWidth * 0.5;
  physicsCenterY = physicsHeight * 0.5;

  arrow: any;
  mouseBody: any;
  mouseConstraint: any;

  contactMaterial: any;

  wheelSpinning = false;
  wheelStopped = true;

  particles: any;

  @ViewChild('statusLabel', { static: true })
  statusLabel: ElementRef<HTMLCanvasElement>;
  timeStep: number;

  constructor() { }

  ngOnInit(): void {
    this.initDrawingCanvas();
    this.initPhysics();

    requestAnimationFrame(this.loop);

    this.statusLabel.nativeElement.innerHTML = 'Give it a good spin!';
  }

  initDrawingCanvas() {
    this.drawingCanvas.nativeElement.width = viewWidth;
    this.drawingCanvas.nativeElement.height = viewHeight;
    ctx = this.drawingCanvas.nativeElement.getContext('2d');

    this.drawingCanvas.nativeElement.addEventListener('mousemove', this.updateMouseBodyPosition);
    this.drawingCanvas.nativeElement.addEventListener('mousedown', this.checkStartDrag);
    this.drawingCanvas.nativeElement.addEventListener('mouseup', this.checkEndDrag);
    this.drawingCanvas.nativeElement.addEventListener('mouseout', this.checkEndDrag);
  }

  updateMouseBodyPosition(e: any) {
    let p = this.getPhysicsCoord(e);
    this.mouseBody.position[0] = p.x;
    this.mouseBody.position[1] = p.y;
  }

  checkStartDrag(e: any) {
    if (world.hitTest(this.mouseBody.position, [wheel.body])[0]) {
      this.mouseConstraint = new p2.RevoluteConstraint(this.mouseBody, wheel.body, {
        worldPivot: this.mouseBody.position,
        collideConnected: false
      });

      world.addConstraint(this.mouseConstraint);
    }

    if (this.wheelSpinning === true) {
        this.wheelSpinning = false;
        this.wheelStopped = true;
        this.statusLabel.nativeElement.innerHTML = "Impatience will not be rewarded.";
    }
  }

  checkEndDrag(e: any) {
    if (this.mouseConstraint) {
      world.removeConstraint(this.mouseConstraint);
      this.mouseConstraint = null;

      if (this.wheelSpinning === false && this.wheelStopped === true) {
          if (Math.abs(wheel.body.angularVelocity) > 7.5) {
              this.wheelSpinning = true;
              this.wheelStopped = false;
              console.log('good spin');
              this.statusLabel.nativeElement.innerHTML = '...clack clack clack clack clack clack...'
          }
          else {
              console.log('sissy');
              this.statusLabel.nativeElement.innerHTML = 'Come on, you can spin harder than that.'
          }
      }
    }
  }

  getPhysicsCoord(e: any) {
    let rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
    console.log(rect);
    let x = (e.clientX - rect.left) / ppm;
    let y = physicsHeight - (e.clientY - rect.top) / ppm;

    return {x, y};
  }

  initPhysics() {
    world = new p2.World();
    world.solver.iterations = 100;
    world.solver.tolerance = 0;

    arrowMaterial = new p2.Material();
    pinMaterial = new p2.Material();
    this.contactMaterial = new p2.ContactMaterial(arrowMaterial, pinMaterial, {
      friction: 0.0,
      restitution: 0.1
    });
    world.addContactMaterial(this.contactMaterial);

    let wheelRadius = 8;
    let wheelX = this.physicsCenterX;
    let wheelY = wheelRadius + 4;
    let arrowX = wheelX;
    let arrowY = wheelY + wheelRadius + 0.625;

    wheel = new Wheel(wheelX, wheelY, wheelRadius, 32, 0.25, 7.5);
    wheel.body.angle = (Math.PI / 32.5);
    wheel.body.angularVelocity = 5;
    this.arrow = new Arrow(arrowX, arrowY, 0.5, 1.5);
    this.mouseBody = new p2.Body();

    world.addBody(this.mouseBody);
  }

  spawnPartices() {
    for (let i = 0; i < 200; i++) {
      let p0 = new Point(this.viewCenterX, this.viewCenterY - 64);
      let p1 = new Point(this.viewCenterX, 0);
      let p2 = new Point(Math.random() * viewWidth, Math.random() * this.viewCenterY);
      let p3 = new Point(Math.random() * viewWidth, viewHeight + 64);

      this.particles.push(new Particle(p0, p1, p2, p3));
    }
  }

  update() {
    this.particles.forEach((p: any) => {
      p.update();
      if (p.complete) {
        this.particles.splice(this.particles.indexOf(p), 1);
      }
    });

    // p2 does not support continuous collision detection :(
    // but stepping twice seems to help
    // considering there are only a few bodies, this is ok for now.
    world.step(this.timeStep * 0.5);
    world.step(this.timeStep * 0.5);

    if (this.wheelSpinning === true && this.wheelStopped === false &&
      wheel.body.angularVelocity < 1 && this.arrow.hasStopped()) {

      let win = wheel.gotLucky();

      this.wheelStopped = true;
      this.wheelSpinning = false;

      wheel.body.angularVelocity = 0;

      if (win) {
        this.spawnPartices();
        this.statusLabel.nativeElement.innerHTML = 'Woop woop!'
      }
      else {
        this.statusLabel.nativeElement.innerHTML = 'Too bad! Invite a Facebook friend to try again!';
      }
    }
  }

  draw() {
    // ctx.fillStyle = '#fff';
    ctx.clearRect(0, 0, viewWidth, viewHeight);

    wheel.draw();
    this.arrow.draw();

    this.particles.forEach((p: any) => {
      p.draw();
    });
  }

  loop() {
    this.update();
    this.draw();

    requestAnimationFrame(this.loop);
  }

  // /////////////////////////////
  // // your reward
  // /////////////////////////////



  /////////////////////////////
  // math
  /////////////////////////////
  /**
   * easing equations from http://gizma.com/easing/
   * t = current time
   * b = start value
   * c = delta value
   * d = duration
   */

}
