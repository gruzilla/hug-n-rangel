export default class PlayScene extends Phaser.Scene {
	constructor() {
		super('play');

		this.me = null;
		this.cursors = null;
		this.halos = null;
		this.korpi = null;

		this.D_ACCELERATION = 400;
		this.D_MAXSPEED = 400;
		this.D_DRAG = 500;
		this.D_ACTION_RADIUS = 100;
		this.D_HALO_RADIUS = 100;

		this.keyH = null;
		this.keyR = null;

		this.inAction = false;

		this.hugScore = 0;
		this.hugScoreBox = null;
		this.ranglScore = 0;
		this.ranglScoreBox = null;
	}

	create() {
		this.halos = this.add.graphics();

		this.me = this.makeMe(this.createKorpus(200, 200, 0xff0000));

		this.korpi = this.add.group();
		let theOtherGuy = this.createKorpus(100, 100, 0x00ff00);
		let theOtherOtherGuy = this.createKorpus(300, 300, 0x0000ff);
		this.korpi.add(theOtherGuy);
		this.korpi.add(theOtherOtherGuy);

		this.cursors = this.input.keyboard.createCursorKeys();
		this.keyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
		this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);


		this.hugScoreBox = this.add.text(15, 15, "Hug: 0", {
			color: 'white'
		});
		this.hugScoreBox.setOrigin(0, 0);
		this.ranglScoreBox = this.add.text(15, 30, "Rangl: 0", {
			color: 'white'
		});
		this.ranglScoreBox.setOrigin(0, 0);
	}

	update() {
		if(this.inAction) return;

		if(this.cursors.up.isDown) this.me.body.setAccelerationY(-this.D_ACCELERATION);
		else if(this.cursors.down.isDown) this.me.body.setAccelerationY(this.D_ACCELERATION);
		else this.me.body.setAccelerationY(0);

		if(this.cursors.left.isDown) this.me.body.setAccelerationX(-this.D_ACCELERATION);
		else if(this.cursors.right.isDown) this.me.body.setAccelerationX(this.D_ACCELERATION);
		else this.me.body.setAccelerationX(0);

		let actionable = false, closest = null, closestDist = 5000;

		for(let i = 0; i < this.korpi.getLength(); i++) {
			let dist = this.me.body.center.distance(this.korpi.getChildren()[i].body.center)
			if(dist <= this.D_ACTION_RADIUS && dist < closestDist) {
				actionable = true;
				closest = this.korpi.getChildren()[i];
				closestDist = dist;
			}
		}

		if(closest && closestDist <= this.D_HALO_RADIUS) {
			this.halo(this.me, closest, closestDist);
		}

		if(actionable) {
			if(Phaser.Input.Keyboard.JustDown(this.keyH))
				this.hug(this.me, closest);
			if(Phaser.Input.Keyboard.JustDown(this.keyR))
				this.rangel(this.me, closest);
		}
	}

	halo(a, b, d) {

		this.halos.clear();
		this.halos
			.fillStyle(0x555555, 1 - d / this.D_HALO_RADIUS)
			.fillCircle(a.body.center.x, a.body.center.y, d/2)
			.fillCircle(b.body.center.x, b.body.center.y, d/2)
		;
	}

	hug(a, b) {
		a.body.stop();
		b.body.stop();

		this.inAction = true;

		var tween = this.tweens.add({
			targets: [a, b],
			x: (a.body.center.x + b.body.center.x) / 2 + Math.random() * 8 - 4,
			y: (a.body.center.y + b.body.center.y) / 2 + Math.random() * 8 - 4,
			ease: 'Power1',
			duration: 500,
			hold: 1000,
			yoyo: true,
			repeat: 0,
			onComplete: function() {
				this.inAction = false;
			},
			callbackScope: this
		});

		this.hugScore = this.hugScore + 1;
		this.hugScoreBox.setText("Hug: " + this.hugScore);
	}

	rangel(a, b) {
		a.body.stop();
		b.body.stop();

		this.inAction = true;

		var tween = this.tweens.add({
			targets: [a, b],
			x: (a.body.center.x + b.body.center.x) / 2 + Math.random() * 8 - 4,
			y: (a.body.center.y + b.body.center.y) / 2 + Math.random() * 8 - 4,
			ease: 'Power1',
			duration: 100,
			hold: 0,
			yoyo: true,
			repeat: 6,
			onComplete: function() {
				this.inAction = false;
			},
			callbackScope: this
		});

		this.ranglScore = this.ranglScore + 1;
		this.ranglScoreBox.setText("Rangl: " + this.ranglScore);
	}

	createKorpus(x, y, color, love = 1, rage = 0) {
		let c = this.add.graphics({ x: x, y:y });

		this.paintKorpus(c, color, love, rage);

		this.physics.add.existing(c);

		this.input.enableDebug(c);

		c.body.setCircle(12, -12);


		return c;
	}

	paintKorpus(c, color, love, rage) {
		c.clear();
		c.fillStyle(color);

		c.beginPath();
		c.arc(0, 0, 12, 0, Math.PI * 2);
		c.closePath();
		c.fill();
	}

	makeMe(c) {
		c.body.collideWorldBounds = true;
		c.body.setMaxSpeed(this.D_MAXSPEED);
		c.body.setDrag(this.D_DRAG, this.D_DRAG);
		return c;
	}
}
