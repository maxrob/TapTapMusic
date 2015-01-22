var Piano = {};

"undefined" === typeof MIDI && (MIDI = {Player: {}});
"undefined" === typeof MIDI.Player && (MIDI.Player = {});
"undefined" === typeof MIDI.UI && (MIDI.UI = {});

var scale = 0.55;
Piano.stretchX = 23;
Piano.stretchY = 10;

modelPiano.init();


//Function init
Piano.initGame = function() {

    modelPiano.loadPlugin();

    Event.add("body", "ready", function() {

        canvasBlack   = document.getElementById("black_keys").getContext("2d");
        canvasWhite   = document.getElementById("white_keys").getContext("2d");

        //Charger le fichier midi
        Piano.loadPlugin();
        //Dessiner les notes
        UIPiano.drawKeyboard();

        //Coloriser les touches du clavier piano
        Piano.colorMap = MusicTheory.Synesthesia.map();
    });

    //Fixer les couleurs des touches avec le rythme de la musique
    Piano.MIDINoteOffset = 21;

}();


//Function Piano animation
Piano.Animation = function() {
    var view = {},
        a = 0,
        self = this,
        player = MIDI.Player;

    this.timeCurrent = 0;
    this.animateInterval = 0;

    UIPiano.animationBoot();

    return this;

}();


//Function tracking et play/pause
modelB.init(Piano);

Piano.Glyphs = UIPiano.createKeys();

Piano.domKeys = {};

modelPiano.mouseIsActive = !1;

//Touch clavier

var getNote = function(b, event) {
    var getCoord = Event.proxy.getCoord(event),
        getBoundingBox = Event.proxy.getBoundingBox(b),
        value = (getCoord.x - getBoundingBox.x1) / (Piano.Glyphs.whiteKey.canvas.width + 1) >> 0,
        som   = value % 7,
        count = 0;

    0 < som && (count += 1);
    2 < som && (count += 1);
    3 < som && (count += 1);
    5 < som && (count += 1);

    return value + (count + 5 * (value / 7 >> 0));
};

//Les variables : Afficher la partie Theory, Song
UIB.init(MIDI.UI);