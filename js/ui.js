'use strict';

var UIPiano = {

	MIDIPlayerPercentage : function() {
	        function timeLenght(second) {
	            var min = second / 60 >> 0;
	            second = String(second - 60 * min >> 0);
	            return -min + ":" + second;
	        }

	        //Selection pour le timer
	        var midiPlayer = MIDI.Player,
	            capsule    = document.getElementById("capsule"),
	            cursor     = document.getElementById("cursor"),
	            time       = document.getElementById("time");

	        //Le temps
	        UIPiano.genTimeCursor = function() {
	            var endTime = MIDI.Player.endTime,
	                currentTime = MIDI.Player.currentTime,
	                startTime = currentTime / 1 * Math.pow(10,3),
	                totalTime = startTime / 60;

	            cursor.style.width = 100 * (currentTime / endTime) + "%"; //k
	            time.innerHTML = timeLenght(endTime / 1 * Math.pow(10,3) - (60 * totalTime + (startTime - 60 * totalTime)))
	        };

	        //Animate en fonction de la musique
	        UIPiano.setAnimation = function() {
	            midiPlayer.clearAnimation();
	            midiPlayer.setAnimation(function(valueCusor) {
	                var started = valueCusor.now >> 0,
	                    finished = valueCusor.end >> 0;

	                cursor.style.width = 100 * (valueCusor.now / valueCusor.end) + "%";
	                time.innerHTML = timeLenght(finished - started);
	            })
	        };
	},

	animationBoot : function () {
	    this.boot = function() {
	        window.clearInterval(Piano.Animation.animateInterval);
	    };
	},

	createKeysDemo : function() {

	    UIPiano.keyGlyphs();

	    var white = Piano.keyGlyphs(function(self) {
	            self.save();
	            self.beginPath();

	            self.closePath();

	            self.fillStyle = "";
	            self.fill();

	            // Taille touche blanche
	            return [0, 40, 25, 200]
	        });

	    var black = Piano.keyGlyphs(function(self) {
	            self.save();
	            self.beginPath();

	            self.closePath();

	            self.fillStyle = "";
	            self.fill();

	            // Taille touche blanche
	            return [0, 40, 25, 200]
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
	    var note2 = document.getElementById("note0" + notes);

		if(Piano.domKeys[notes] && 0 <= notes && 59 >= notes) {
 			var color = Piano.colorMap[notes].hsl;

	        if (active) {
	            note2.className += " forced";
	            note2.style.backgroundColor = color;
	    		modelPiano.addTouche(notes);

	    		totalNote = totalNote + 1;

	        }else{
	            note2 = document.getElementById("note0" + notes);
	            note2.className = note2.className.replace("forced", "");
	            note2.style.background = "";
	            note2.style.color = "rgba(0,0,0,0)";
	            modelPiano.removeTouche(notes);
	        }

	    }
	},

	drawKeyLab : function(notes, active) {
  	    var keys1     = document.getElementById('keys1');
	    var childrens = keys1.children;
		if(Piano.domKeys[notes] && 0 <= notes && 59 >= notes) {
	        var color = Piano.colorMap[notes].hsl;

	    }
	},

	drawKeyboard1 : function() {

	    var blackGlyphs = Piano.Demo.blackKey.canvas,
	        whiteGlyphs = Piano.Demo.whiteKey.canvas,
	        e = whiteGlyphs.width + 1;

	    UIPiano.draw = function (nbKeys, keys, color, space) {

	        var f = {
	            0: !0,
	            2: !0,
	            6: !0
	        };

	        var widthKeys = keys.length;
	        n = 0;

	        for (var k = 0; k < nbKeys; k++) {

	            var keyboard = k,
	                div = document.createElement("div"),
	                defaultColor = "black" === color,
	                n = keys[keyboard % widthKeys] + 12 * Math.floor(keyboard / widthKeys);

	            var pianoColor = Piano.colorMap,
	                size = space + Piano.offsetLeft;

	            if (defaultColor){
	              var canvasColor = canvas.black,
	              drawKeys = blackGlyphs;
	            }else{
	              canvasColor = canvas.white,
	              drawKeys = whiteGlyphs;
	            }

	            canvasColor.drawImage(drawKeys, size, 7);
	            canvasColor.fillStyle = pianoColor;
	            canvasColor.fillRect(size, 0, drawKeys.width, 7);

	            div.style.width =  "14px";
	            div.style.height = "21px";
	            div.style.paddingTop = drawKeys.height - 26 + 3.5 + "px";

	            var gammesNotes = Piano.keySignature[n % 12];

	            if(gammesNotes = "solfege" === Piano.labelType){
	              MusicTheory.Solfege[gammesNotes].syllable;
	            }else{
	                gammesNotes;
	            }

	            div.style.marginTop = "7px";
	            div.style.left = n*16 + "px";
	            div.className = color;
	            div.name = n;
	            div.id = "note0" + n;

	            div.addEventListener('mousedown', Piano.mouseDown, false);
	            div.addEventListener('mouseup', Piano.mouseUp, false);
	            div.addEventListener('mouseout', Piano.mouseOut, false);

	            Piano.domKeys[n] = div;
	            document.getElementById("keys1").appendChild(div);
	            space = "white" !== color && f[keyboard % widthKeys] ? space + 2 * e : space + e;

	        }

	    }

	    //Touche Totale clavier
	    UIPiano.draw(31, [0, 2, 3, 5, 7, 8, 10], "white", 14);//31 Touches blanc
	    UIPiano.draw(28, [1, 4, 6, 9, 11], "black", 14) //28 Touches noir
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
	            Piano.clearNotes();
	            Piano.resume();
	            UIPiano.setAnimation();
	        }else{
	            controlPlay.setAttribute("toggled", !0);
	            MIDI.Player.pause();
	        }
	    };
	},
}