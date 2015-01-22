"use strict";

var modelPiano ={

    init : function(){
        Piano.keySignature = [];
        Piano.notes = {};
        Piano.blackKeys = {
            1: !0,
            4: !0,
            6: !0,
            9: !0,
            11: !0
        };
        Piano.tempo = 250;
        Piano.octave = 3;
        Piano.keys = [];
        Piano.offsetLeft = -14;

        this.socket = io.connect('http://37.187.122.232:3000');
        console.log('mobile connecté');
        this.socket.emit('mobile');

        modelPiano.listen();
    },

    listen : function () {
        this.socket.on('addTouchesMob', function (data) {
            UIPiano.drawKeyLabel(data.notes, true);
        });
        this.socket.on('removeTouchesMob', function (data) {
            UIPiano.drawKeyLabel(data.notes, false);
        });
    },

    play : function () {
        this.socket.emit('play');
        this.socket.on('playD', function(){
            console.log('mobile playD');
        });
    },

    pause : function () {
        this.socket.emit('pause');
    },

    loadPlugin : function() {

        Piano.loadPlugin = function() {
            // Piano.play();
            document.getElementById("control-play").onclick = MIDI.UI.togglePlayer;
        };
    },

    touchPlay : function(notes, event) {
        var key = notes;

        modelPiano.mouseIsActive = !0;
        Piano.clearNotes();

        if(event.shiftKey){
        }else{
            Piano.noteOn(key);
        }
        this.socket.emit('touch', {key : key});
    },

    touchStop : function(notes, event) {
        var key = notes;

        if(event.shiftKey){
            Piano.clearNotes();
        }else{
            Piano.noteOff(key);
        }
    },

    mouseUp : function(event) {
        var self = this.name || getNote(this, event);
        modelPiano.mouseIsActive = !1;
        modelPiano.touchStop(self, event);
    },

    mouseDown : function(event) {
        var self = this.name || getNote(this, event);
        modelPiano.touchPlay(self, event);
    },

    mouseOver : function(event) {
        if (modelPiano.mouseIsActive != !1){
            if (typeof this.name == "undefined") {
                var self = getNote(this, event);
                this.currentNote !== self;
                this.currentNote = self;
                modelPiano.touchStop(event, this.currentNote);
                modelPiano.touchPlay(self, self);
            }else{
                modelPiano.touchPlay(this.name, event);
            }
        }
    },

    mouseOut : function(event) {
        if (modelPiano.mouseIsActive) {
            var self = this.name || getNote(this, event);
            modelPiano.touchStop(event, self);
        }
    },

};

var modelB = {

    init : function(modelB) {
        modelB.notesPlaying = 0;

        modelB.trackNote = function(a, notes, bolean) {
            if(this.notesPlaying += bolean){
                bolean = 1;
            }else{
                bolean = -1;
            };

            this.notes[notes] = {
                isOn: bolean
            };
        };

        modelB.calculNote = function(value) {
            return this.key + 12 * this.octave + (value || 0);
        };

        modelB.noteOn = function(noteOn) {

            "undefined" == typeof noteOn && (noteOn = this.key + 12 * this.octave);
            UIPiano.drawKeyLab(noteOn, !0);
            this.trackNote(this.channel, noteOn, !0);
            MIDI.noteOn && MIDI.noteOn(this.channel, noteOn + MIDI.pianoKeyOffset, 64);
        };

        modelB.noteOff = function(noteOn) {
            UIPiano.drawKeyLab(noteOn, !1);
            this.trackNote(this.channel, noteOn, !1);
            MIDI.noteOff && MIDI.noteOff(this.channel, noteOn + MIDI.pianoKeyOffset);
        };

        modelB.clearNotes = function() {
            if (this.notes) {
                for (var note in this.notes){
                    UIPiano.drawKeyLab(note, !1);
                    UIPiano.drawKeyLabel(note, !1);
                }
                modelB.trackNote(this.channel, note, !1);
            };
        };

        modelB.play = function(data) {
            data && (MIDI.Player.currentData = data);
            MIDI.Player.loadMidiFile();
        };

        modelB.resume = function() {
            delete this.Animation.timeCurrent;
            MIDI.Player.playing = !0;
            this.clearNotes();
            MIDI.Player.resume();
        };
    },


}