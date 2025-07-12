class DrawingApp {
    private canvas: HTMLCanvasElement; 
    private ctx: CanvasRenderingContext2D; 
    private drawing = false;
    private color = "#000000";
    private tool = "pencil";
    private history: { 
        x: number, 
        y: number, 
        dragging: boolean, 
        color: string, 
        tool: string} [] = [];

    // constructor to setup for canvas
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
        const drawingSelect = document.getElementById("loadDrawing") as HTMLSelectElement;
        const drawingName = document.getElementById("inputName") as HTMLInputElement;

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

        saveBtn.addEventListener("click", () => {
            const name = drawingName.value.trim();
            if (name) {
                this.saveDrawing(name);
                this.showList();
                drawingName.value = "";
            } else {
                alert("What would you like to name your drawing?")
            }
        });

        loadBtn.addEventListener("click", () => {
            const selected = drawingSelect.value;
            if (selected) {
                this.loadDrawing(selected);
            } else {
                alert("Please select a drawing to load")
            }
        });

        this.canvas.addEventListener("mousedown", (e) => this.startDraw(e));
        this.canvas.addEventListener("mouseup", () => this.stopDraw());
        this.canvas.addEventListener("mousemove", (e) => this.draw(e));

        this.showList();
    }

    //functions for actual drawing

    //when mouse is clicked then held down
    startDraw(e: MouseEvent) {
        this.drawing = true;
        this.addStroke(e, false);
    }

    //when mouse button is let go
    stopDraw() {
        this.drawing = false;
        this.ctx.beginPath();
    }

    //when mouse is held down and moved
    draw(e: MouseEvent) {
        if (!this.drawing) return;
        this.addStroke(e, true);
    }

    //have system record user adding strokes and record for replay later
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

    //async function to save drawing to local storage
    async saveDrawing(name: string) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); //simulate timed delay
        localStorage.setItem(`Drawing: ${name}`, JSON.stringify(this.history));
        console.log(`Your drawing "${name}has been saved`);
    }

    //async function to load drawing from list
    async loadDrawing(name: string) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); //simulate timed delay
        this.clearCanvas();
        const data = localStorage.getItem(`Drawing: ${name}`);
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


        const strokes = JSON.parse(data);
        this.replayDrawing(strokes, 0);
        console.log("Drawing ready to go!");
    }

    //reset canvas
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
    }

    //recursive function
    replayDrawing(strokes: any[], index: number) {
        if (index >= strokes.length) return;
        const stroke = strokes[index];

        this.ctx.beginPath();
        this.ctx.moveTo(stroke.x, stroke.y);
        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = 2;
        this.ctx.lineTo(stroke.x, stroke.y);

        setTimeout(() => this.replayDrawing(strokes, index + 1), 5); //recursive
    }

    //function to show list of saved drawings
    showList() {
        const drawingSelect = document.getElementById("loadDrawing") as HTMLSelectElement;
        drawingSelect.innerHTML = '<option disabled selected>Select saved drawing</option>';

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("Drawing:")) {
                const name = key.replace("Drawing:", "");
                const option = document.createElement("option");
                option.value = name;
                option.textContent = name;
                drawingSelect.appendChild(option);
            }
        }
    }
}

window.onload = () => {
    new DrawingApp();
};