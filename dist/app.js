"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class DrawingApp {
    // constructor to setup for canvas
    constructor() {
        this.drawing = false;
        this.color = "#000000";
        this.tool = "pencil";
        this.history = [];
        this.canvas = document.getElementById("drawingCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.setupListeners();
        console.log("App is ready to go");
    }
    //set up listeners for when user clicks, holds down to draw, and save/load
    setupListeners() {
        const colorPicker = document.getElementById("colorPicker");
        const pencilBtn = document.getElementById("pencilBtn");
        const eraserBtn = document.getElementById("eraserBtn");
        const saveBtn = document.getElementById("saveBtn");
        const loadBtn = document.getElementById("loadBtn");
        const drawingSelect = document.getElementById("loadDrawing");
        const drawingName = document.getElementById("inputName");
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
            }
            else {
                alert("What would you like to name your drawing?");
            }
        });
        loadBtn.addEventListener("click", () => {
            const selected = drawingSelect.value;
            if (selected) {
                this.loadDrawing(selected);
            }
            else {
                alert("Please select a drawing to load");
            }
        });
        this.canvas.addEventListener("mousedown", (e) => this.startDraw(e));
        this.canvas.addEventListener("mouseup", () => this.stopDraw());
        this.canvas.addEventListener("mousemove", (e) => this.draw(e));
        this.showList();
    }
    //functions for actual drawing
    //when mouse is clicked 
    startDraw(e) {
        this.drawing = true;
        this.addStroke(e, false);
    }
    //when mouse button is let go
    stopDraw() {
        this.drawing = false;
        this.ctx.beginPath();
    }
    //when mouse is held down and moved
    draw(e) {
        if (!this.drawing)
            return;
        this.addStroke(e, true);
    }
    //have system record user adding strokes and record for replay later
    addStroke(e, dragging) {
        const x = e.offsetX;
        const y = e.offsetY;
        const currentColor = this.tool === "eraser" ? "#FFFFFF" : this.color;
        this.ctx.strokeStyle = currentColor;
        this.ctx.lineWidth = 5;
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.history.push({ x, y, dragging, color: currentColor, tool: this.tool });
    }
    //async function to save drawing to local storage
    saveDrawing(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => setTimeout(resolve, 1000)); //simulate timed delay
            localStorage.setItem(`Drawing: ${name}`, JSON.stringify(this.history));
            console.log(`Your drawing "${name}has been saved`);
        });
    }
    //async function to load drawing from list
    loadDrawing(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve) => setTimeout(resolve, 1000)); //simulate timed delay
            this.clearCanvas();
            const data = localStorage.getItem(`Drawing: ${name}`);
            if (!data || data === "[]") {
                try {
                    throw new Error("That drawing doesn't exist");
                }
                catch (err) {
                    const error = err;
                    console.error(error.message);
                    alert(error.message);
                    return;
                }
            }
            const strokes = JSON.parse(data);
            this.replayDrawing(strokes, 0);
            console.log("Drawing ready to go!");
        });
    }
    //reset canvas
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
    }
    //recursive function
    replayDrawing(strokes, index) {
        if (index >= strokes.length)
            return;
        const stroke = strokes[index];
        this.ctx.beginPath();
        this.ctx.moveTo(stroke.x, stroke.y);
        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = 2;
        this.ctx.lineTo(stroke.x, stroke.y);
        setTimeout(() => this.replayDrawing(strokes, index + 1), 5);
    }
    //function to show list of saved drawings
    showList() {
        const drawingSelect = document.getElementById("loadDrawing");
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
