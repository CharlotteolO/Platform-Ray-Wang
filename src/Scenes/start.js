class StartScene extends Phaser.Scene {
    constructor() {
        super("startScene");
    }

    preload() {
        this.load.setPath("./assets/");
        
    }

    create() {

        let title = this.add.text(this.cameras.main.centerX + 75, this.cameras.main.centerY - 50, "Uwanna", {
            fontSize: "48px",
            fill: "#ffffff",
            align: "center"
        }).setOrigin(1);

        let startText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Press SPACE to Start", {
            fontSize: "32px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        let instructionsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 50, "Press 'I' for Instructions", {
            fontSize: "24px",
            fill: "#ffffff"
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start("platformerScene");
        });

        this.input.keyboard.on('keydown-I', () => {
            
            alert("Use arrow keys to move, double jump and wall jump enabled. Collect coins and keys to win!");
        });

        let score = this.registry.get('score');
        this.add.text(10, 10, "Score: " + score, {
            fontSize: "24px",
            fill: "#ffffff"
        });
    }
}
