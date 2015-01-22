'use strict';

var piano={
    init : function(){
        // create socket
        this.io = require('socket.io').listen(3000);
        this.playlist =[];
        // écoute un event connection lorsqu'un script ouvre un socket
        this.io.on('connection',this.listen);

    },

    listen : function(socket){
        // écoute un event getCollection
        socket.on('mobile', function () {
            console.log('mobile ok');
        });
        socket.on('desktop', function () {
            console.log('desktop ok');
            piano.io.emit('desk');
        });
        socket.on('touch', function (data) {
            piano.io.emit('touched', {key : data.key});
        });
        socket.on('pause', function () {
            console.log('pause emit');
            piano.io.emit('pauseD');
        });
        socket.on('play', function () {
            console.log('play emit');
            piano.io.emit('playD');
        });
        socket.on('addTouche', function (data) {
            piano.io.emit('addTouchesMob', {notes : data.notes});
        });
        socket.on('removeTouche', function (data) {
            piano.io.emit('removeTouchesMob', {notes : data.notes});
        });

    }

};

piano.init();









