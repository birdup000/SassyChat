//Audio Calling Portion ONLY
///will make interjection on the both audio and video toggle
/// Adding Audio backend

const socket = io('/') // Create our socket
const audioGrid = document.getElementById('audio-grid') // Find the Audio-Grid element
 
const myPeer = new Peer() // Creating a peer element which represents the current user
const myAudio = document.createElement('audio') // Create a new audio tag to show our audio

///
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
///

// Access the user's just audio
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
}).then(stream => {
    getLocalAudioStream(myAudio, stream) // Display our audio to ourselves

    myPeer.on('call', call => { // When we join someone's room we will receive a call from them
        call.answer(stream) // Stream them our audio
        const audio = document.createElement('audio') // Create an audio tag for them
        call.on('stream', userAudioStream => { // When we recieve their stream
            addAudioStream(audio, userAudioStream) // Display their audio to the screen
        })
    })

    socket.on('user-connected', userId => { // If a new user connect
        connectToNewUser(userId, stream) 
    })
})

myPeer.on('open', id => { // When we first open the app, have us join a room
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) { // This runs when someone joins our room
    const call = myPeer.call(userId, stream) // Call the user who just joined
    // Add their audio
    const audio = document.createElement('audio') 
    call.on('stream', userAudioStream => {
        addAudioStream(audio, userAudioStream)
    })
    // If they leave, remove their audio
    call.on('close', () => {
        audio.remove()
    })
}


function addAudioStream(video, stream) {
    video.srcObject = stream
    video.muted = true
    video.addEventListener('loadedmetadata', () => {
        video.play()
    });
    audioGrid.append(video)
}
