'use strict';

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

        this.socket = io.connect('http://37.187.122.232:3000');
        console.log('desktop connecté');
        this.socket.emit('desktop');
        modelPiano.listen();
    },

    listen : function () {
       this.socket.on('desk', function(){
            console.log('ordinateur');
        });
        this.socket.on('playD', function() {
            console.log('play');
            MIDI.UI.togglePlayer();
        });
        this.socket.on('pauseD', function() {
            console.log('pause');
            MIDI.UI.togglePlayer();
        });

        this.socket.on('touched', function(data){
            var notes = data.key;
            var note2 = document.getElementById("note0" + notes),
            result    = document.getElementById('score');

           if(note2.className.match('forced')){
                score = score+10;
                total = total+1;
                result.innerHTML = score;
            }else{
                score = score-10;
                result.innerHTML = score;
            }
        });
    },

    addTouche : function (notes) {
        this.socket.emit('addTouche', {notes : notes});
    },

    removeTouche : function(notes) {
        this.socket.emit('removeTouche', {notes : notes});
    },

    loadPlugin : function() {
        Piano.loadPlugin = function() {
            MIDI.loadPlugin(function() {
                Piano.midifile = songMidi;
                Piano.loadFile(Piano.midifile, function() {
                    Piano.play();
                    UIPiano.MIDIPlayerPercentage(MIDI.Player);
                });
            });
        };
    },

    loadFile : function() {
        Piano.loadFile = function(midiFile, callback) {
            if(midiFile){
                Piano.loadExternalMIDI(midiFile, callback, host + "/audio/");
            };
        };
    },

    loadExternalMIDI : function() {
        Piano.loadExternalMIDI = function(midiFile, callback, path) {
            var baseFile    = midiFile.basename(),
                decodeFile = decodeURIComponent(path + midiFile);

            Piano.loadExternalMIDICallback = function(data) {

                MIDI.Player.loadFile(data, function(data) {
                    data =  midiFile;

                    document.getElementById("playback-title").innerHTML = data.replace(".mid", "");
                    localStorage.setItem("midifile", data);

                    loader.stop();
                    callback();
                    Piano.clearNotes();
                });

            };

            var convertMidi = function() {
                loader.update(null, "&lt;Chargement&gt;");

                if(Piano.files[baseFile]){
                    Piano.loadExternalMIDICallback(Piano.files[baseFile]);
                }else{
                    if(Piano.files[baseFile] === null ){
                        if(window.location.protocol){
                            Piano.loadExternalMIDICallback(host + "/audio/" + baseFile);
                        }else{
                            DOMLoader.script.add({
                                src: "http://ravirajendran.fr/midi-to-json.php?query=" + encodeURIComponent(baseFile)
                            });
                        }
                    }else{
                        DOMLoader.script.add({
                            src: "https://midi-to-json.appspot.com/" + decodeFile.split("//")[1]
                        });
                    }
                };
            };

            convertMidi();
        };
    },

    trackNotes : function () {
        Piano.trackNotes = function(event) {
            var noteFinal = event.note - Piano.MIDINoteOffset,
                checkKey = 144 === event.message;

            Piano.trackNote(
                event.channel,
                noteFinal,
                checkKey
            );
            UIPiano.drawKeyLabel(noteFinal, checkKey);
            UIPiano.drawKeyLab(noteFinal, checkKey);
        }

    },

    touchPlay : function(notes, event) {
        var key = notes;

        modelPiano.mouseIsActive = !0;
        Piano.clearNotes();

        if(event.shiftKey){
        }else{
            Piano.noteOn(key);
        }
    },

    touchStop : function(notes, event) {
        var key = notes;

        if(event.shiftKey){
            Piano.clearNotes();
        }else{
            Piano.noteOff(key);
        }
    },

};

var modelB = {

    init : function(modelB) {
        modelB.notesPlaying = 0;

        //Function pour tracker les notes
        modelB.trackNote = function(a, notes, bolean) {
            if(this.notesPlaying += bolean){
                bolean = 1;
            }else{
                bolean = 0;
            };

            this.notes[notes] = {
                isOn: bolean
            };
        };


        modelB.calculNote = function(value) {
            return this.key + 12 * this.octave + (value || 0);
        };

        //Function si la note est On
        modelB.noteOn = function(noteOn) {
            "undefined" == typeof noteOn && (noteOn = this.key + 12 * this.octave);
            UIPiano.drawKeyLab(noteOn, !0);
            this.trackNote(this.channel, noteOn, !0);
            MIDI.noteOn && MIDI.noteOn(this.channel, noteOn + MIDI.pianoKeyOffset, 64);
        };

        //Function si la note est Off
        modelB.noteOff = function(noteOn) {
            UIPiano.drawKeyLab(noteOn, !1);
            this.trackNote(this.channel, noteOn, !1);
            MIDI.noteOff && MIDI.noteOff(this.channel, noteOn + MIDI.pianoKeyOffset);
        };

        //Function pour nettoyer les notes une fois relacher
        modelB.clearNotes = function() {
            if (this.notes) {
                for (var note in this.notes){
                    UIPiano.drawKeyLab(note, !1);
                    UIPiano.drawKeyLabel(note, !1);
                }
                modelB.trackNote(this.channel, note, !1);
            };
        };

        //Function Play
        modelB.play = function(data) {
            data && (MIDI.Player.currentData = data);
            MIDI.Player.loadMidiFile();
        };

        //Function
        modelB.resume = function() {
            delete this.Animation.timeCurrent;
            MIDI.Player.playing = !0;
            this.clearNotes();
            MIDI.Player.resume();
        };
    },

}