var localStorage = {};
var Piano = {};

"undefined" === typeof MIDI && (MIDI = {Player: {}});
"undefined" === typeof MIDI.Player && (MIDI.Player = {});
"undefined" === typeof MIDI.UI && (MIDI.UI = {});


//Function Global
var loader, canvas = {},
    host = "http://ravirajendran.fr";

var score = 100;
var totalNote = 0;
var total = 0;
var scale = 0.55;
Piano.stretchX = 23;
Piano.stretchY = 10;

//Function Init
modelPiano.init();


//Function
Piano.initGame = function() {

    Event.add("body", "ready", function() {

        widgets.Loader && (MIDI.loader = loader = new widgets.Loader);

        MIDI.Player.timeWarp = 1.5; // Vitesse de lecture

        canvas.black       = document.getElementById("black_keys1").getContext("2d");
        canvas.white       = document.getElementById("white_keys1").getContext("2d");

        var result         = document.getElementById('score');
        var connectSection = document.getElementById('connect-section');
        var btnNext        = document.getElementById('btn-next');
        var btnPlay        = document.getElementById('btn-play');
        var playSection    = document.getElementById('play-section');
        var tracksWrapper  = document.getElementById('tracks-wrapper');
        var mainPiano      = document.getElementById('mainPiano');
        var showResult     = document.getElementById('showResult');
        var trackResult    = document.getElementById('trackResult');
        var sucessRate     = document.getElementById('sucessRate');
        var Replay         = document.getElementById('Replay');
        var trackNotes     = document.querySelector('.track');

        //
        result.innerHTML = score;

        //Coloriser les touches du clavier piano
        Piano.colorMap = MusicTheory.Synesthesia.map();

        //Dessiner les notes
        UIPiano.drawKeyboard1();

        //Tracker les notes avec la musique
        MIDI.Player.addListener(Piano.trackNotes, false);

        btnNext.addEventListener('click',function(e){
            e.preventDefault();
            connectSection.classList.add('hiddenLeft');
            playSection.classList.remove('hiddenRight');
        },false);

        btnPlay.addEventListener('click', function(e) {
            e.preventDefault();
            playSection.classList.add('hiddenLeft');
            tracksWrapper.classList.remove('hiddenRight');
        }, false);

        trackNotes.addEventListener('click', function(e){
            e.preventDefault();

            songMidi = this.getAttribute('href');

            UIPiano.MIDIPlayerPercentage();
            modelPiano.loadPlugin();
            modelPiano.loadFile();
            modelPiano.loadExternalMIDI();
            Piano.loadPlugin();

            Piano.loadPlugin();

            tracksWrapper.classList.add('hiddenLeft');
            mainPiano.classList.remove('hiddenRight');

        });

        showResult.addEventListener('click', function(e){
            e.preventDefault();
            if(MIDI.Player.currentTime == MIDI.Player.endTime){
                mainPiano.classList.add('hiddenLeft');
                trackResult.classList.remove('hiddenRight');

                sucessRate.innerHTML = Math.floor(100*(total)/totalNote);
            }
            return false;
        }, false);

    });



    modelPiano.trackNotes();

    //Fixer les couleurs des touches avec le rythme de la musique
    Piano.MIDINoteOffset = 21;
}();


//Function Piano animation
Piano.Animation = function() {
    var self = this,
        player = MIDI.Player;

    this.timeCurrent = 0;
    this.animateInterval = 0;

    UIPiano.animationBoot();

    this.callback = this.animate;
    return this;
}();

//Function tracking et play/pause
modelB.init(Piano);

Piano.Demo = UIPiano.createKeysDemo();
Piano.domKeys = {};
Piano.mouseIsActive = !1;


//Function vérification de fichier dans le dossier
Piano.files = function() {
    var folder = {};
    for (files = 0; files < folder.length; files++){
      folder[files] = null;
    }
    return folder;
}();

//Les variables UI
UIB.init(MIDI.UI);