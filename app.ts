class DrawingApp {
    private canvas: HTMLCanvasElement; //info at https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement
    private ctx: CanvasRenderingContext2D; //info at https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
    private drawing = false;
    private color = "#000000";
    private tool = "pencil";
    private history: { 
        x: number, 
        y: number, 
        dragging: boolean, 
        color: string, 
        tool: string} [] = [];

    constructor() {
        this.canvas = document.getElementById("drawingCanvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        this.setupListeners();
        console.log("App is ready to go");
    }

    //set up listeners for when user clicks, holds down to draw, and save/load
    setupListeners() {
        const colorPicker = document.getElementById("colorPicker") as HTMLInputElement;
        const pencilBtn = document.getElementById("pencilBtn")!;
        const eraserBtn = document.getElementById("eraserBtn")!;
        const saveBtn = document.getElementById("saveBtn")!;
        const loadBtn = document.getElementById("loadBtn")!;

        colorPicker.addEventListener("input", (e) => {
            this.color = colorPicker.value;
            console.log(`Color changed to ${this.color}`);
        });

        pencilBtn.addEventListener("click", () => {
            this.tool = "pencil";
            console.log("You have selected the pencil");
        });

        eraserBtn.addEventListener("click", () => {
            this.tool = "eraser";
            console.log("You have selected the eraser");
        });

        saveBtn.addEventListener("click", () => this.saveDrawing());
        loadBtn.addEventListener("click", () => this.loadDrawing());

        this.canvas.addEventListener("mousedown", (e) => this.startDraw(e));
        this.canvas.addEventListener("mouseup", () => this.stopDraw());
        this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    }

    //functions for drawing
    startDraw(e: MouseEvent) {
        this.drawing = true;
        this.addStroke(e, false);
    }

    stopDraw() {
        this.drawing = false;
        this.ctx.beginPath();
    }

    draw(e: MouseEvent) {
        if (!this.drawing) return;
        this.addStroke(e, true);
    }

    addStroke(e: MouseEvent, dragging: boolean) {
        const x = e.offsetX;
        const y = e.offsetY;
        const currentColor = this.tool === "eraser" ? "#FFFFFF" : this.color;

        this.ctx.strokeStyle = currentColor;
        this.ctx.lineWidth = 2;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);

        this.history.push({ x, y, dragging, color: currentColor, tool: this.tool })
    }

    async saveDrawing() {
        await new Promise((resolve) => setTimeout(resolve, 1000)); //simulate timed delay
        localStorage.setItem("drawing", JSON.stringify(this.history));
        console.log("Your drawing has been saved");
    }

    async loadDrawing() {
        await new Promise((resolve) => setTimeout(resolve, 1000)); //simulate timed delay
        const data = localStorage.getItem("drawing");
        if (!data || data === "[]") {
            try {
                throw new Error("That drawing doesn't exist");
            } catch (err) {
                const error = err as Error;
                console.error(error.message);
                alert(error.message);
                return;
            } 
        }

        this.clearCanvas();
        const strokes = JSON.parse(data);
        this.replayDrawing(strokes, 0);
        console.log("Drawing ready to go!");
    }

    //reset canvas
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
    }

    replayDrawing(strokes: any[], index: number) {
        if (index >= strokes.length) return;
        const stroke = strokes[index];

        this.ctx.beginPath();
        this.ctx.moveTo(stroke.x, stroke.y);
        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = 2;
        this.ctx.lineTo(stroke.x, stroke.y);

        setTimeout(() => this.replayDrawing(strokes, index + 1), 5);
    }
}

window.onload = () => {
    new DrawingApp();
};