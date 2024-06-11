class EndScene extends Phaser.Scene {
    constructor() {
        super("endScene");
    }

    preload() {
        this.load.setPath("./assets/");
    }

    create() {
        let endText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "You Win!\n\nPress SPACE to Restart", {
            fontSize: "32px",
            fill: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start("startScene");
        });
    }
}
