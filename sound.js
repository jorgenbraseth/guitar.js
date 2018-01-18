// Reference note:
const A4 = 440;
const C1 = 55 * 1;
const As1 = 55 * Math.pow(2, 1 / 12);

function note(note, octave) {
    const base = 55;
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    let noteDiff = notes.indexOf(note);
    let returned = base * Math.pow(2, octave - 1 + noteDiff / 12);
    return returned
}

function noteRange(startNote, startOctave, numNotes) {
    const start = note(startNote, startOctave);
    let notes = [];
    for (let i = 0; i < numNotes; i++) {
        notes.push(start * Math.pow(2, i * (1 / 12)));
    }
    return notes;
}

const STRINGS = [
    noteRange("E", 4, 20),
    noteRange("B", 3, 20),
    noteRange("G", 3, 20),
    noteRange("D", 3, 20),
    noteRange("A", 2, 20),
    noteRange("E", 2, 20),
];

function strum(E, A, D, G, B, e) {
    return [
        STRINGS[0][E],
        STRINGS[1][A],
        STRINGS[2][D],
        STRINGS[3][G],
        STRINGS[4][B],
        STRINGS[5][e]
    ];
}

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
analyser.connect(audioCtx.destination);

var out = audioCtx.createBiquadFilter();
out.type = "highpass";
out.frequency.value = 6000;
out.Q.value = 1;
out.connect(analyser);

function play(...freqs) {

    let gain = audioCtx.createGain();
    gain.gain.value = 1 / 6;
    gain.connect(analyser);


    for (let f of freqs) {
        console.log(f);
        let tone = audioCtx.createOscillator();
        tone.type = 'square';
        tone.frequency.value = f;

        tone.connect(out);

        tone.start();
        tone.stop(audioCtx.currentTime + 1.5);
    }

}


function doot() {
    // play(... strum(0, 0, 2, 2, 2, 0));
    play(note("A", 4));
    play(note("A", 5));
}

function micPlay() {

    navigator.mediaDevices.getUserMedia({audio: true, video: false}).then((stream) => {
        var source = audioCtx.createMediaStreamSource(stream);

        var delay = audioCtx.createDelay(1);
        delay.delayTime.value = 0.2;

        source.connect(delay);

        delay.connect(out);
    });


}

function freqToTone(freqRange) {

    tones = [
        {base: 55, off:0, tones: [], name: "A", color: "rgb(0,0,255)"},
        // {base: 55 * Math.pow(2, 1 / 12), tones: [], name: "Bb", color: "rgb(0,150,150)"},
        // {base: 55 * Math.pow(2, 2 / 12), off:2, tones: [], name: "B", color: "rgb(0,150,150)"},
        // {base: 55 * Math.pow(2, 3 / 12), off:3, tones: [], name: "C", color: "rgb(0,150,0)"},
        // {base: 55 * Math.pow(2, 4 / 12), tones: [], name: "C#", color: "rgb(255,255,150)"},
        // {base: 55 * Math.pow(2, 5 / 12), off:5, tones: [], name: "D", color: "rgb(150,150,0)"},
        // {base: 55 * Math.pow(2, 6 / 12), tones: [], name: "D#", color: "rgb(0,150,255)"},
        // {base: 55 * Math.pow(2, 7 / 12), off:7, tones: [], name: "E", color: "rgb(150,0,0)"},
        // {base: 55 * Math.pow(2, 8 / 12), off:8, tones: [], name: "F", color: "rgb(150,0,150)"},
        // {base: 55 * Math.pow(2, 9 / 12), tones: [], name: "F#", color: "rgb(255,255,255)"},
        // {base: 55 * Math.pow(2, 10 / 12), off:10, tones: [], name: "G", color: "rgb(150,150,255)"},
        // {base: 55 * Math.pow(2, 11 / 12), tones: [], name: "G#", color: "rgb(150,150,0)"},
    ];
    // for (let i = 0; i < 20; i++) {
    //     for (let tone of tones) {
    //         tone.tones.push(tone.base * Math.pow(2, i + tone.off/12));
    //     }
    // }
    for (let i = 0; i < 50; i++) {
        for (let tone of tones) {
            tone.tones.push(tone.base * Math.pow(2, i/12));
        }
    }

    for (let tone of tones) {
        for (let freq of tone.tones) {
            if (freqRange[0] <= freq && freqRange[1] >= freq) {
                return tone;
            }
        }
    }


}


var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

// Get a canvas defined with ID "oscilloscope"
var canvas = document.getElementById("oscilloscope");
var canvasCtx = canvas.getContext("2d");


var canvas = document.querySelector('#oscilloscope');
var canvasCtx = canvas.getContext("2d");
WIDTH = canvas.width;
HEIGHT = canvas.height;
function drawBars() {

    analyser.fftSize = 1024 * 16;
    const hzPerSlot = (audioCtx.sampleRate / 2) / analyser.frequencyBinCount;
    var bufferLength = 4000 / hzPerSlot //analyser.frequencyBinCount;
    console.log(hzPerSlot);
    var dataArray = new Float32Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function bars() {
        drawVisual = requestAnimationFrame(bars);

        analyser.getFloatFrequencyData(dataArray);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        var barWidth = (WIDTH / bufferLength) * 2.5;
        var barHeight;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
            barHeight = (dataArray[i] + 140) * 2;

            let freqRange = [hzPerSlot * i, hzPerSlot * (i + 1)];
            let tone = freqToTone(freqRange);

            if (tone != undefined) {
                canvasCtx.fillStyle = tone.color;
            } else {
                // canvasCtx.fillStyle = 'rgb(' + Math.floor(barHeight+100) + ',50,50)';
                canvasCtx.fillStyle = 'rgb(25,25,25)';
            }
            canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

            x += barWidth + 1;
        }
    };
    bars();
}
drawBars();
// micPlay();