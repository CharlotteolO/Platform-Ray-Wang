class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION = 300;
        this.DRAG = 1200;
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -500;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.keyCount = 0;
        this.totalKeys = 2;
        this.canDoubleJump = false;
        this.doubleJumped = false;
        this.canTripleJump = false;
        this.canWallJump = false;
        this.wallJumpDirection = 0;
        this.isCrouching = false;
        this.CROUCH_SPEED = 100;
        this.platformSpeed = 100;
        this.score = this.registry.get('score');
    }
    preload() {
        this.load.setPath("./assets/");
        this.load.audio('jumps', 'sound1.mp3'); 
    }
    

    create() {
        this.jumpSound = this.sound.add('jumps');
        this.map = this.add.tilemap("plat1", 18, 18, 75, 25);
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        this.tilesetback = this.map.addTilesetImage("tilemap-backgrounds_packed", "tilemap_backgrounds");

        this.groundLayer = this.map.createLayer("ground", [this.tileset, this.tilesetback], 0, 0);
        this.backgroundLayer = this.map.createLayer("background", [this.tileset, this.tilesetback], 0, 0);
        this.waterLayer = this.map.createLayer("water", this.tileset, 0, 0);

        this.groundLayer.setDepth(1);
        this.backgroundLayer.setDepth(0);

        this.groundLayer.setCollisionByProperty({ collides: true });

        this.scoreText = this.add.text(10, 10, "Score: 0", {
            fontSize: "24px",
            fill: "#ffffff"
        });

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.keys = this.map.createFromObjects("keys", {
            name: "key",
            key: "tilemap_sheet",
            frame: 27
        });

        this.flag = this.map.createFromObjects("flags", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 111
        });

        this.levers = this.map.createFromObjects('lever', {
            name: 'lever',
            key: 'tilemap_sheet',
            frame: 64
        });




        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.keys, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.flag, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.levers, Phaser.Physics.Arcade.STATIC_BODY);

        this.coinGroup = this.add.group(this.coins);
        this.keyGroup = this.add.group(this.keys);
        this.leverGroup = this.add.group(this.levers);
        this.interactKey = this.input.keyboard.addKey('E');

        this.leverGroup.children.each((lever) => {
            lever.setDepth(2);
        });

        my.sprite.player = this.physics.add.sprite(30, 100, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        this.physics.add.collider(my.sprite.player, this.groundLayer);

        
        this.physics.add.collider(my.sprite.player, this.movingPlatformGroup);

        this.physics.add.overlap(my.sprite.player, this.leverGroup, (player, lever) => {
            if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                lever.setFrame(66);
                this.canTripleJump = true;
            }
        });

        
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (obj1, obj2) => {
            obj2.destroy();
            this.keyCount++;
        });

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            this.score += 10;
            this.registry.set('score', this.score);
            this.scoreText.setText('Score: ' + this.score);
        });

        this.physics.add.overlap(my.sprite.player, this.flag, () => {
            if (this.keyCount >= this.totalKeys) {
                this.scene.start("endScene");
            }
        });

        this.physics.add.collider(my.sprite.player, this.waterLayer, () => {
            this.resetPlayerPosition();
        });

        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }, this);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: true,
            scale: { start: 0.01, end: 0.04 },
            maxAliveParticles: 8,
            lifespan: 350,
            gravityY: -400,
            alpha: { start: 1, end: 0.1 },
        });

        my.vfx.walking.stop();

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.movingPlatforms = [];
        const platformProperties = [
            { x: 150, y: 220, minX: 140, maxX: 600 },
            { x: 800, y: 350, minX: 700, maxX: 900 },
        ];

        platformProperties.forEach(props => {
            let container = this.add.container(props.x, props.y);
            const platform1 = this.add.image(9, 9, "tilemap_sheet", "48");
            const platform2 = this.add.image(27, 9, "tilemap_sheet", "49");
            const platform3 = this.add.image(45, 9, "tilemap_sheet", "50");
            
            container.add([platform1, platform2, platform3]);
            this.physics.world.enable(container);
            container.body.setImmovable(true);
            container.body.allowGravity = false;
            container.body.setVelocityX(50);
            container.body.setSize(54, 18);
            this.physics.add.collider(my.sprite.player, container);

            this.movingPlatforms.push({
                container: container,
                minX: props.minX,
                maxX: props.maxX
            });
        });
    }

    

    update() {
        if (cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else if (cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / (-2) - (-10), my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        if (my.sprite.player.body.blocked.down) {
            this.canDoubleJump = true;
            this.doubleJumped = false;
            this.tripleJumped = false;
            
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (my.sprite.player.body.blocked.down) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.jumpSound.play();
            } else if (this.canDoubleJump && !this.doubleJumped) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.doubleJumped = true;
                this.jumpSound.play();
            } else if (this.canTripleJump && !this.tripleJumped) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.tripleJumped = true;
                this.jumpSound.play();
            }
        }

        if (my.sprite.player.body.blocked.left || my.sprite.player.body.blocked.right) {
            this.canWallJump = true;
            this.wallJumpDirection = my.sprite.player.body.blocked.left ? 1 : -1;
        } else {
            this.canWallJump = false;
        }

        if (this.canWallJump && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.sprite.player.body.setVelocityX(this.wallJumpDirection * this.ACCELERATION);
            this.jumpSound.play();
        }

        if (cursors.down.isDown) {
            this.isCrouching = true;
            my.sprite.player.setVelocityX(0);
            my.sprite.player.body.setSize(my.sprite.player.width, my.sprite.player.height / 2, true);
            my.sprite.player.anims.play('idle', true);
        } else {
            if (this.isCrouching) {
                my.sprite.player.body.setSize(my.sprite.player.width, my.sprite.player.height, true);
            }
            this.isCrouching = false;
        }

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        if (my.sprite.player.y > this.map.heightInPixels) {
            this.resetPlayerPosition();
        }
        

        this.movingPlatforms.forEach(platform => {
            if (platform.container.x >= platform.maxX) {
                platform.container.body.setVelocityX(-50);
            } else if (platform.container.x <= platform.minX) {
                platform.container.body.setVelocityX(50);
            }
        });

        
    }

    resetPlayerPosition() {
        my.sprite.player.setPosition(30, 100);
        my.sprite.player.setVelocity(0, 0);
    }
}
