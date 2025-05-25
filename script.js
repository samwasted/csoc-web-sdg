function flashKey(note) {
    document.querySelectorAll(`.keys.${note}`).forEach(keyElement => {
        if (keyElement.classList.contains('sharp')) {
            keyElement.classList.remove('bg-gray-900');
            keyElement.classList.add('bg-gray-700');
            setTimeout(() => {
                keyElement.classList.add('bg-gray-900');
                keyElement.classList.remove('bg-gray-700');
            }, 150);
        } else if (keyElement.classList.contains('bg-orange-100')) {
            // Handle orange highlighted keys (from keybindings)
            keyElement.classList.remove('bg-orange-100');
            keyElement.classList.add('bg-orange-300');
            setTimeout(() => {
                keyElement.classList.remove('bg-orange-300');
                keyElement.classList.add('bg-orange-100');
            }, 150);
        } else {
            // Handle default white keys
            keyElement.classList.add('bg-gray-300');
            setTimeout(() => {
                keyElement.classList.remove('bg-gray-300');
            }, 150);
        }
    });
}

//functions for piano keys, also amplify the sound
function playNote(note) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = context.createGain();
    gainNode.gain.value = 7.0; // Boost volume

    const fileNote = note.replace('s', '-'); // cs3 -> c-3 for easier file search

    fetch(`sounds/piano/${fileNote}.mp3`)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(gainNode).connect(context.destination);
            source.start();
        })
        .catch(e => console.error(`Error loading ${note}:`, e));
}

//c3 for normal c3, cs3 for c3 sharp
//create a function that will play the note when the key is pressed, the keys will be buttons with the note name as their class
function playKey(key) {
    //get the key element
    const keyElement = document.querySelector(`.${key}`);
    //add event listener to the key element
    keyElement.addEventListener('click', () => {
        //play the note
        playNote(key);
    });
}
document.querySelectorAll('.keys').forEach(button => {
    const note = button.classList[1]; //second class is the note 
    button.addEventListener('mousedown', () => {
        playNote(note)
        flashKey(note)
    }
    ); //mousedown for instant feedback

});

// Create a shared AudioContext outside playNote (reuse it for all notes)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioContext.createGain();
gainNode.gain.value = 7.0; // Boost volume
gainNode.connect(audioContext.destination);

// Create a MediaStreamDestination for recording
const dest = audioContext.createMediaStreamDestination();
gainNode.connect(dest);

// MediaRecorder setup
let mediaRecorder;
let recordedChunks = [];

function startRecording() {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(dest.stream);

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' }); // or audio/wav
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'piano_recording.webm'; // webm file, can play in browsers
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    mediaRecorder.start();
    console.log('Recording started');
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        console.log('Recording stopped');
    }
}


function playNote(note) {
    const fileNote = note.replace('s', '-'); 

    fetch(`sounds/piano/${fileNote}.mp3`)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(gainNode); 
            source.start();
        })
        .catch(e => console.error(`Error loading ${note}:`, e));
}

document.getElementById('startRec').addEventListener('click', () => {
  startRecording();
  document.getElementById('startRec').disabled = true;
  document.getElementById('stopRec').disabled = false;
});

document.getElementById('stopRec').addEventListener('click', () => {
  stopRecording();
  document.getElementById('startRec').disabled = false;
  document.getElementById('stopRec').disabled = true;
});


//key mappings



function octavemap(octave) {
    const nextOctave = parseInt(octave) + 1;

    return {
        '1': `c${octave}`,
        'q': `cs${octave}`,
        '2': `d${octave}`,
        'w': `ds${octave}`,
        '3': `e${octave}`,
        '4': `f${octave}`,
        'r': `fs${octave}`,
        '5': `g${octave}`,
        't': `gs${octave}`,
        '6': `a${octave}`,
        'y': `as${octave}`,
        '7': `b${octave}`,
        '8': `c${nextOctave}`
    };
}

let currentOctave = 4;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        currentOctave = 3;
        document.querySelector('.tab').classList.add('bg-orange-100');
        document.querySelector('.caps').classList.remove('bg-orange-100');
        document.querySelector('.shift').classList.remove('bg-orange-100');
    } else if (e.key === 'CapsLock') {
        e.preventDefault();
        currentOctave = 4;
        document.querySelector('.tab').classList.remove('bg-orange-100');
        document.querySelector('.caps').classList.add('bg-orange-100');
        document.querySelector('.shift').classList.remove('bg-orange-100');
    } else if (e.shiftKey) {
        currentOctave = 5;
        document.querySelector('.tab').classList.remove('bg-orange-100');
        document.querySelector('.caps').classList.remove('bg-orange-100');
        document.querySelector('.shift').classList.add('bg-orange-100');
    }

    document.querySelectorAll('.keys.bg-orange-100').forEach(el => {
        el.classList.remove('bg-orange-100');
        el.classList.add('bg-gray-50');
    });

    const keyMap = octavemap(currentOctave);

    Object.values(keyMap).forEach(note => {
        document.querySelectorAll(`.${note}:not(.sharp)`).forEach(el => {
            el.classList.remove('bg-gray-50');
            el.classList.add('bg-orange-100');
        });
    });

    const key = e.key.toLowerCase();
    const note = keyMap[key];

    if (note) {
        playNote(note);
        flashKey(note);
    }
});

 function toggleGuide() {
                const panel = document.getElementById('guide-panel');
                panel.classList.toggle('hidden');
 }