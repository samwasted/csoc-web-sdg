function flashKey(note) {
  document.querySelectorAll(`.keys.${note}`).forEach(keyElement => {
    if (keyElement.classList.contains('sharp')) {
      keyElement.classList.remove('bg-gray-900');
      keyElement.classList.add('bg-gray-700');
      setTimeout(() => {
        keyElement.classList.add('bg-gray-900');
        keyElement.classList.remove('bg-gray-700');
      }, 150);
    } else {
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