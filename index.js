(function () { 
    let canvas = document.querySelector('#test'),
        drawer = canvas.getContext('2d');    
    let myTest = {
        canvas: document.querySelector('#test'),
        drawer: document.querySelector('#test').getContext('2d'),
        init() {
            let winHeight = window.innerHeight,
                winWidth = window.innerWidth;
  
            myTest.width = winWidth;
            myTest.height = winHeight;
            myTest.canvas.width = winWidth;
            myTest.canvas.height = winHeight;
            myTest.drawer.rect(0, 0, myTest.width, myTest.height);
            myTest.drawer.fillStyle = 'cyan';
            myTest.drawer.fill();
        },
        divide(numInX, numInY) {
            if (!numInY) {
                numInY = numInX;
            }
            let width = Math.ceil(myTest.width / numInX),
                height = Math.ceil(myTest.height / numInY);
                myTest.squares = [];
            let index = 0;
            for (let x = 0; x < numInX; x ++) {
                for (let y = 0; y < numInY; y++) {
                    myTest.makeSquare(y * width, x * height, width, height, index);
                    index++;
                }
            }
        },
        makeSquare(startX, startY, width, height, index) {
            let square = new MySquare(startX, startY, width, height, index);
            myTest.squares.push(square);
        },
        drawMask(text, fontSize = 380) {
            if (text) {
                myTest.maskText = text;
            } else {
                text = myTest.maskText;
            }
            drawer.globalCompositeOperation = "destination-in";
            drawer.textAlign = "center";
            drawer.textBaseline = 'middle';
            drawer.font = `${fontSize}px '楷体'`;
            console.log(text);
            drawer.fillText(text, myTest.width / 2, myTest.height / 2);
            drawer.save();
        },
        getAllVisibleSquare() {
            myTest.visibleSquares = [];
            for (let square of myTest.squares) {
                if (square.getVisiblity()) {
                    myTest.visibleSquares.push(square);
                }
            }
        },
        sign(arr) {
            let squares = myTest.visibleSquares,
                len = squares.length,
                arrLen = arr.length,
                imgIndex = rand(arrLen),
                squareIndex = rand(len);
            // squares[squareIndex].drawImageByUrl(arr[imgIndex]);
            if (squares.length) {
                let square = squares.shift();
                square.drawImageByUrl(arr[imgIndex]);
                setTimeout(function () {
                    myTest.sign(arr);
                }, 500);
            } else {
                console.log('end');
            }
        }
    }
    class MySquare{
        constructor(x, y, w, h, i) {
            this.startX = x;
            this.startY = y;
            this.width = w;
            this.height = h;
            this.index = i;
            this.draw();
        }
        draw() {
            let square = this;
            drawer.beginPath();
            drawer.rect(square.startX, square.startY, square.width, square.height);
            drawer.strokeStyle = "darkred";
            drawer.stroke();
            drawer.beginPath();
            drawer.fillStyle = "black";
            drawer.fillText(square.index, square.startX + square.width / 2, square.height / 2 + square.startY, square.width);
        }
        getPixelData() {
            let square = this;
            return drawer.getImageData(square.startX, square.startY, square.width, square.height);
        }
        getVisiblity() {
            let imgData = this.getPixelData().data,
                total = 0,
                visiblePixel = 0;
            this.visible = false;
            for (let i = 3; i < imgData.length; i += 4) {
                if (imgData[i] == 255) {                   
                    visiblePixel++;
                }
                total++;
            }
            if (visiblePixel / total > 0.75) {
                this.visible = true;
            }
            return this.visible;
        }
        drawImageByUrl(url) {
            let img = new Image(),
                square = this;
            img.onload = function () {
                drawer.beginPath();
                drawer.drawImage(img, square.startX, square.startY, square.width, square.height);
            }
            img.src = url;
        }
    }
    function rand(min, max = 0) {
        if (min > max) {
            let tmp = min;
            min = max;
            max = tmp;
        }
        return Math.floor(Math.random() * (max - min) + min);
    }
    myTest.init();
    myTest.divide(50);
    myTest.drawMask('江苏徐州', 300);
    myTest.getAllVisibleSquare();
    drawer.globalCompositeOperation = "source-atop";
    myTest.sign([
        'http://imgsrc.baidu.com/imgad/pic/item/d53f8794a4c27d1ee4899ce711d5ad6eddc43861.jpg',
        'http://imgsrc.baidu.com/image/c0%3Dpixel_huitu%2C0%2C0%2C294%2C40/sign=a927d5082a3fb80e18dc69975fa94a42/35a85edf8db1cb13e19ae52ad654564e92584b1c.jpg',
        'http://pic.58pic.com/58pic/16/60/45/41E58PIC4Tb_1024.jpg',
        'http://gb.cri.cn/mmsource/images/2010/11/29/b904a8d9653f4e20a2f0df904b5bb498.jpg',
    ]);
})()