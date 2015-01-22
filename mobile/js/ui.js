'use strict';

var UIPiano = {

    animationBoot : function () {
        this.boot = function() {
            window.clearInterval(Piano.Animation.animateInterval);
        };
    },

    createKeys : function() {

        UIPiano.keyGlyphs();

        var white = Piano.keyGlyphs(function(self) {
                self.save();
                self.beginPath();

                self.moveTo(50.4, 235.4);
                self.bezierCurveTo(50.4, 238.3, 48, 240.7, 45.1, 240.7);
                self.lineTo(5, 240.7);
                self.bezierCurveTo(2.3, 240.7, 0, 238.3, 0, 235.4);
                self.lineTo(0, 34.1);
                self.bezierCurveTo(0, 31.2, 2.3, 28.9, 5.2, 28.9);
                self.lineTo(45.1, 28.9);
                self.bezierCurveTo(48, 28.9, 50.4, 31.2, 50.4, 34.1);
                self.lineTo(50.4, 235.4);
                self.closePath();

                self.fillStyle = "rgb(255, 255, 255)";
                self.fill();

                // Taille touche blanche
                return [0, 40, 30, 200]
            }),

            black = Piano.keyGlyphs(function(self) {
                self.save();
                self.beginPath();

                self.moveTo(67.2, 162.7);

                self.lineTo(39.7, 166.4);
                self.lineTo(36.1, 3.7);
                self.lineTo(63.7, 0);
                self.lineTo(67.2, 162.7);
                self.closePath();

                self.fillStyle = "rgb(1, 1, 1)";
                self.fill();

                // Taille touche noir
                return [30, 10, 30, 100]
            });

        return {
            whiteKey: white,
            blackKey: black
        }
    },

    keyGlyphs : function (keyTable) {

        Piano.keyGlyphs = function (keyTable) {
            var createCanvas = document.createElement("canvas"),
                canvas = createCanvas.getContext("2d"),
                //Tableau taille clavier noir & blanc
                keyArray = keyTable(canvas),
                first  = keyArray[0] * scale,
                second = keyArray[1] * scale,
                third  = keyArray[3] * scale;

            createCanvas.width = keyArray[2] * 0.95;
            createCanvas.height = third;

            canvas.scale(scale, scale);
            canvas.translate(-first / scale, -second / scale - 3);

            keyTable(canvas);

            return {
                src: createCanvas.toDataURL(),
                canvas: createCanvas
            }
        };

        return keyTable;
    },

    drawKeyLabel : function(notes, active) {
        var note = document.getElementById("note" + notes);

        if(Piano.domKeys[notes] && 0 <= notes && 59 >= notes) {
            var color = Piano.colorMap[notes].hsl;


            if (active) {
                note.className += " force";
                note.style.backgroundColor = color;


            }else{
                note = document.getElementById("note" + notes);
                note.className = note.className.replace("force", "");
                note.style.background = "";
                note.style.color = "rgba(0,0,0,0)";
            }

        }
    },

    drawKeyLab : function(notes, active) {
        var note = document.getElementById("note" + notes);

        if(Piano.domKeys[notes] && 0 <= notes && 59 >= notes) {
            var color = Piano.colorMap[notes].hsl;

            if(active){
                note.className += " touch";
                note.style.color = "";
                note.style.textShadow = "";
                note.style.backgroundColor = color;

            }else{
                note.className = note.className.replace("touch", " ");
                note.style.background = "";
                note.style.color = "rgba(0,0,0,0)";
                note.style.textShadow = "none";
            }
        }
    },

    drawKeyboard : function() {

        var blackGlyphs = Piano.Glyphs.blackKey.canvas,
            whiteGlyphs = Piano.Glyphs.whiteKey.canvas,
            e = whiteGlyphs.width + 1;


        UIPiano.draw = function (nbKeys, keys, color, space) {

            var f = {
                0: !0,
                2: !0,
                6: !0
            };

            var widthKeys = keys.length;

            n = 0;

            var lastNote = 27;

            var spaces = -67;

            var spacing = 0;

            for (var k = 0; k < nbKeys; k++) {

                var keyboard = k,
                    div = document.createElement("div"),
                    defaultColor = "black" === color,
                    n = keys[keyboard % widthKeys] + 12 * Math.floor(keyboard / widthKeys);

                var pianoColor = Piano.colorMap,
                    size = space + Piano.offsetLeft;

                if (defaultColor){
                  var canvasColor = canvasBlack,
                  drawKeys = blackGlyphs;
                }else{
                  canvasColor = canvasWhite,
                  drawKeys = whiteGlyphs;
                }

                if (color=='black') {
                    if ( n >= 28) {
                        var ecartNote = n - lastNote ;
                        if (ecartNote == 3) {
                            var leftMaring = spaces + 67 +"px";
                            div.style.left = leftMaring;
                            var spaces = spaces + 134;
                            lastNote = n;
                        } else {
                            var leftM = spaces  +"px";
                            div.style.left = leftM;
                            lastNote = n;
                            var spaces = spaces + 67;
                        }
                    }
                    div.style.zIndex = 200;
                    div.style.height = "127px";
                    div.style.width = drawKeys.width + 10 + "px";
                } else {
                    var spacing = spacing + 67;
                    div.style.height = "255px";
                    div.style.width = drawKeys.width + 50 + "px";
                    div.style.left = spacing + Piano.offsetLeft -1245 +"px";
                    div.style.zIndex = 150;
                }
                div.style.paddingTop = drawKeys.height - 26 + 3.5 + "px";

                var gammesNotes = Piano.keySignature[n % 12];

                if(gammesNotes = "solfege" === Piano.labelType){
                  MusicTheory.Solfege[gammesNotes].syllable;
                }else{
                    gammesNotes;
                }

                div.style.marginTop = "244px";
                div.className = color;
                div.name = n;
                div.id = "note" + n;

                Piano.domKeys[n] = div;
                document.getElementById("keys").appendChild(div);
                space = "white" !== color && f[keyboard % widthKeys] ? space + 2 * e : space + e;

                if(n <= 26) {
                    var test = document.getElementById('note' + n);
                    test.parentNode.removeChild(test);
                } else {
                    canvasColor.drawImage(drawKeys, size, 7);
                    canvasColor.fillStyle = pianoColor;
                    canvasColor.fillRect(size, 0, drawKeys.width, 7);
                }

                div.addEventListener('mousedown', modelPiano.mouseDown, false);
                div.addEventListener('mouseup', modelPiano.mouseUp, false);
                div.addEventListener('mouseout', modelPiano.mouseOut, false);

            }

            canvasBlack.canvas.addEventListener('mousedown', modelPiano.mouseDown, false);
            canvasBlack.canvas.addEventListener('mouseup', modelPiano.mouseUp, false);
            canvasBlack.canvas.addEventListener('mousemove', modelPiano.mouseOver, false);
        }

        //Touche Totale clavier
        UIPiano.draw(31, [0, 2, 3, 5, 7, 8, 10], "white", 14);//31 Touches blanc
        UIPiano.draw(22, [1, 4, 6, 9, 11], "black", 14 + whiteGlyphs.width - blackGlyphs.width / 2) //28 Touches noir
    },
}

var UIB = {
    init : function(UIB) {
        //Switcher entre le bouton Play & Pause
        UIB.togglePlayer = function(event) {
            var controlPlay = document.getElementById("control-play"),
                launch = "boolean" !== typeof event;
                launch || controlPlay.setAttribute("toggled", event);
                var togglePlay = controlPlay.getAttribute("toggled");

            if(togglePlay === "true"){
                controlPlay.setAttribute("toggled", !1);
                controlPlay.src = "../img/paus.png";
                Piano.clearNotes();
                Piano.resume();
                modelPiano.play();

            }else{
                controlPlay.setAttribute("toggled", !0);
                controlPlay.src = "../img/play.png";
                MIDI.Player.pause();
                modelPiano.pause();
            }
        };
    },
}