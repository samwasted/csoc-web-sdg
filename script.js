// Basic routing functions
function routeToPage(page) {
    // Hide all pages
    document.querySelector('.landing-page').style.display = 'none';
    document.querySelector('.instrument-page.Guitar').style.display = 'none';
    document.querySelector('.instrument-page.Piano').style.display = 'none';
    
    // Show the requested page
    if (page === 'landing') {
        document.querySelector('.landing-page').style.display = 'block';
    } else if (page === 'Guitar') {
        document.querySelector('.instrument-page.Guitar').style.display = 'block';
    } else if (page === 'Piano') {
        document.querySelector('.instrument-page.Piano').style.display = 'block';
    }
}

function getCurrentPage() {
    // Check which page is currently visible
    if (document.querySelector('.landing-page').style.display !== 'none') {
        return 'landing';
    }
    
    // Check specific instrument pages
    if (document.querySelector('.instrument-page.Guitar').style.display !== 'none') {
        return 'Guitar';
    }
    
    if (document.querySelector('.instrument-page.Piano').style.display !== 'none') {
        return 'Piano';
    }
    
    // Default to landing if no page is visible
    return 'landing';
}

// Initialize page routing
document.addEventListener('DOMContentLoaded', function() {
    // Set up initial page (start on landing page)
    routeToPage('Piano');
    
    // Add click event listeners to instrument buttons
    document.querySelector('.instrument-button.Guitar').addEventListener('click', function() {
        routeToPage('Guitar');
    });
    
    document.querySelector('.instrument-button.Piano').addEventListener('click', function() {
        routeToPage('Piano');
    });
    
    // Add click event listeners to back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function() {
            routeToPage('landing');
        });
    });
});

//functions for piano keys, also amplify the sound
function playNote(note) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = context.createGain();
    gainNode.gain.value = 7.0; // Boost volume

    fetch(`sounds/piano/${note}.mp3`)
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

//c3 for normal c3, c-3 for c3 sharp
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
document.querySelectorAll('.piano-key').forEach(button => {
    const note = button.classList[1]; //second class is the note 
    button.addEventListener('click', () => playNote(note));
});