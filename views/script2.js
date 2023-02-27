// Audio Calling Portion ONLY
// will make interjection on the both audio and video toggle
// Adding Audio backend

const socket = io('/') // Create our socket
const audioGrid = document.getElementById('audio-grid') // Find the Audio-Grid element
 
const myPeer = new Peer() // Creating a peer element which represents the current user
const myAudio = document.createElement('audio') // Create a new audio tag to show our audio
myAudio.id = 'my-audio'; // Set the ID of the audio element

// Access the user's just audio
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
}).then(stream => {
    console.log('Got Audio Stram', stream)
    myAudio.srcObject = stream // Set our audio to use our local audio stream
    myAudio.muted = true // Mute our own audio so we don't hear ourselves
    myAudio.play() // Start playing our audio
    .catch(error => {
        console.error('Error getting audio stream:', error)
      })

    myPeer.on('call', call => { // When we join someone's room we will receive a call from them
        call.answer(stream) // Stream them our audio
        const audio = document.createElement('audio') // Create an audio tag for them
        audio.id = call.peer; // Set the ID of the audio element to the peer ID
        call.on('stream', userAudioStream => { // When we recieve their stream
            addAudioStream(audio, userAudioStream) // Display their audio to the screen
        })
    })

    socket.on('user-connected', userId => { // If a new user connect
        connectToNewUser(userId, stream) 
        console.log('connectToNewUser called with userId:', userId);
    })
})

myPeer.on('open', id => { // When we first open the app, have us join a room
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) { // This runs when someone joins our room
    const call = myPeer.call(userId, stream) // Call the user who just joined
    // Add their audio
    const audio = document.createElement('audio') 
    audio.id = call.peer; // Set the ID of the audio element to the peer ID
    call.on('stream', userAudioStream => {
        addAudioStream(audio, userAudioStream)
    })
    // If they leave, remove their audio
    call.on('close', () => {
        audio.remove()
    })
}

function addAudioStream(audio, stream) {
    audio.srcObject = stream;
    audio.addEventListener('loadedmetadata', () => {
        audio.play();
    });
    audioGrid.appendChild(audio);
}

