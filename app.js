document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('main-audio');
    const playIcon = document.getElementById('play-icon');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnShuffle = document.getElementById('btn-shuffle');
    const btnRepeat = document.getElementById('btn-repeat');
    
    const progressSlider = document.getElementById('player-progress-slider');
    const currTimeLabel = document.getElementById('player-curr-time');
    const totTimeLabel = document.getElementById('player-tot-time');
    
    const playerAlbumArt = document.getElementById('player-album-art');
    const playerSongTitle = document.getElementById('player-song-title');
    const playerSongArtist = document.getElementById('player-song-artist');
    const playerHeartIcon = document.getElementById('player-heart-icon');
    
    const volumeSlider = document.getElementById('player-volume-slider');
    const volumeIcon = document.getElementById('btn-volume-icon');
    
    const navHome = document.getElementById('nav-home');
    const navSearch = document.getElementById('nav-search');
    
    const homeView = document.getElementById('home-view');
    const searchView = document.getElementById('search-view');
    const searchBarContainer = document.getElementById('search-bar-container');
    const searchInput = document.getElementById('search-input');
    
    const btnCreatePlaylist = document.getElementById('btn-create-playlist');
    const libraryPlusIcon = document.getElementById('library-plus-icon');
    const playlistModal = document.getElementById('playlist-modal');
    const playlistNameInput = document.getElementById('playlist-name-input');
    const modalCancel = document.getElementById('modal-cancel');
    const modalCreate = document.getElementById('modal-create');
    const customPlaylistsList = document.getElementById('custom-playlists-list');
    const likedSongsSidebar = document.getElementById('liked-songs-sidebar');
    const likedSongsView = document.getElementById('liked-songs-view');
    const likedSongsContainer = document.getElementById('liked-songs-container');

    let isPlaying = false;
    let currentTrackIndex = 0;
    let isShuffle = false;
    let isRepeat = false;
    let tracks = [];
    const likedTracks = new Set();

    function initTracks() {
        const cards = document.querySelectorAll('.song-card');
        tracks = Array.from(cards).map((card, index) => {
            return {
                index: index,
                src: card.getAttribute('data-src'),
                title: card.getAttribute('data-title'),
                artist: card.getAttribute('data-artist'),
                img: card.getAttribute('data-img'),
                element: card
            };
        });

        tracks.forEach(track => {
            track.element.addEventListener('click', () => {
                playTrack(track.index);
            });
        });

        const savedLikes = JSON.parse(localStorage.getItem('spotify_liked_tracks') || '[]');
        savedLikes.forEach(title => likedTracks.add(title));

        const savedPlaylists = JSON.parse(localStorage.getItem('spotify_playlists') || '[]');
        savedPlaylists.forEach(name => addPlaylistToDOM(name));

        const savedVolume = localStorage.getItem('spotify_volume');
        if (savedVolume !== null) {
            volumeSlider.value = savedVolume;
        }

        if (tracks.length > 0) {
            loadTrack(0);
        }
    }

    function loadTrack(index) {
        currentTrackIndex = index;
        const track = tracks[index];
        if (!track) return;

        audio.src = track.src;
        playerAlbumArt.src = track.img;
        playerSongTitle.textContent = track.title;
        playerSongArtist.textContent = track.artist;

        tracks.forEach(t => {
            t.element.classList.remove('active-card');
            const playHover = t.element.querySelector('.play-hover-btn i');
            if (playHover) {
                playHover.className = 'fa-solid fa-play';
            }
        });
        
        track.element.classList.add('active-card');
        if (isPlaying) {
            const activePlayHover = track.element.querySelector('.play-hover-btn i');
            if (activePlayHover) {
                activePlayHover.className = 'fa-solid fa-pause';
            }
        }

        if (likedTracks.has(track.title)) {
            playerHeartIcon.className = 'fa-solid fa-heart';
            playerHeartIcon.style.color = '#1db954';
        } else {
            playerHeartIcon.className = 'fa-regular fa-heart';
            playerHeartIcon.style.color = '';
        }

        progressSlider.value = 0;
        currTimeLabel.textContent = '0:00';
        totTimeLabel.textContent = '0:00';
    }

    function playTrack(index) {
        if (currentTrackIndex === index && audio.src) {
            togglePlay();
            return;
        }
        
        loadTrack(index);
        playAudio();
    }

    function playAudio() {
        audio.play().then(() => {
            isPlaying = true;
            playIcon.className = 'fa-solid fa-circle-pause';
            
            const activeCard = tracks[currentTrackIndex];
            if (activeCard) {
                const playHover = activeCard.element.querySelector('.play-hover-btn i');
                if (playHover) {
                    playHover.className = 'fa-solid fa-pause';
                }
            }
        }).catch(err => {
        });
    }

    function pauseAudio() {
        audio.pause();
        isPlaying = false;
        playIcon.className = 'fa-solid fa-circle-play';

        const activeCard = tracks[currentTrackIndex];
        if (activeCard) {
            const playHover = activeCard.element.querySelector('.play-hover-btn i');
            if (playHover) {
                playHover.className = 'fa-solid fa-play';
            }
        }
    }

    function togglePlay() {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }

    function updateSliderBackground(slider) {
        const val = slider.value;
        const min = slider.min ? slider.min : 0;
        const max = slider.max ? slider.max : 100;
        const percent = (val - min) / (max - min) * 100;
        slider.style.background = 'linear-gradient(to right, #1db954 0%, #1db954 ' + percent + '%, #4d4d4d ' + percent + '%, #4d4d4d 100%)';
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function updateProgress() {
        if (!audio.duration) return;
        const percent = (audio.currentTime / audio.duration) * 100;
        progressSlider.value = percent;
        currTimeLabel.textContent = formatTime(audio.currentTime);
        totTimeLabel.textContent = formatTime(audio.duration);
        updateSliderBackground(progressSlider);
    }

    function updateDuration() {
        totTimeLabel.textContent = formatTime(audio.duration);
    }

    function seekAudio() {
        if (!audio.duration) return;
        const newTime = (progressSlider.value / 100) * audio.duration;
        audio.currentTime = newTime;
        updateSliderBackground(progressSlider);
    }

    function playNextTrack() {
        if (tracks.length === 0) return;

        if (isRepeat) {
            playTrack(currentTrackIndex);
            return;
        }

        let nextIndex;
        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * tracks.length);
        } else {
            nextIndex = (currentTrackIndex + 1) % tracks.length;
        }

        playTrack(nextIndex);
    }

    function playPrevTrack() {
        if (tracks.length === 0) return;

        let prevIndex;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        if (isShuffle) {
            prevIndex = Math.floor(Math.random() * tracks.length);
        } else {
            prevIndex = currentTrackIndex - 1;
            if (prevIndex < 0) {
                prevIndex = tracks.length - 1;
            }
        }

        playTrack(prevIndex);
    }

    function adjustVolume() {
        const val = volumeSlider.value / 100;
        audio.volume = val;
        
        if (val === 0) {
            volumeIcon.className = 'fa-solid fa-volume-xmark';
        } else if (val < 0.4) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
            volumeIcon.className = 'fa-solid fa-volume-high';
        }
        updateSliderBackground(volumeSlider);
        
        localStorage.setItem('spotify_volume', volumeSlider.value);
    }

    let lastVolumeVal = 80;
    function toggleMute() {
        if (audio.volume > 0) {
            lastVolumeVal = volumeSlider.value;
            volumeSlider.value = 0;
            adjustVolume();
        } else {
            volumeSlider.value = lastVolumeVal;
            adjustVolume();
        }
    }

    function toggleLike() {
        const track = tracks[currentTrackIndex];
        if (!track) return;

        if (likedTracks.has(track.title)) {
            likedTracks.delete(track.title);
            playerHeartIcon.className = 'fa-regular fa-heart';
            playerHeartIcon.style.color = '';
        } else {
            likedTracks.add(track.title);
            playerHeartIcon.className = 'fa-solid fa-heart';
            playerHeartIcon.style.color = '#1db954';
        }

        localStorage.setItem('spotify_liked_tracks', JSON.stringify(Array.from(likedTracks)));

        if (likedSongsView.style.display === 'block') {
            renderLikedSongs();
        }
    }

    function toggleShuffle() {
        isShuffle = !isShuffle;
        btnShuffle.style.filter = isShuffle ? 'invert(38%) sepia(87%) saturate(543%) hue-rotate(94deg) brightness(97%) contrast(87%)' : 'none';
        btnShuffle.style.opacity = isShuffle ? '1' : '0.7';
    }

    function toggleRepeat() {
        isRepeat = !isRepeat;
        btnRepeat.style.filter = isRepeat ? 'invert(38%) sepia(87%) saturate(543%) hue-rotate(94deg) brightness(97%) contrast(87%)' : 'none';
        btnRepeat.style.opacity = isRepeat ? '1' : '0.7';
    }

    function showHomeView() {
        homeView.style.display = 'block';
        searchView.style.display = 'none';
        likedSongsView.style.display = 'none';
        searchBarContainer.style.display = 'none';
        navHome.style.opacity = '1';
        navSearch.style.opacity = '0.6';
        searchInput.value = '';
        
        tracks.forEach(track => {
            track.element.style.display = 'block';
        });
        
        const cardHeaders = document.querySelectorAll('#home-view h2');
        cardHeaders.forEach(h => h.style.display = 'block');
    }

    function showSearchView() {
        homeView.style.display = 'none';
        searchView.style.display = 'block';
        likedSongsView.style.display = 'none';
        searchBarContainer.style.display = 'flex';
        navHome.style.opacity = '0.6';
        navSearch.style.opacity = '1';
        searchInput.focus();
    }

    function showLikedSongsView() {
        homeView.style.display = 'none';
        searchView.style.display = 'none';
        likedSongsView.style.display = 'block';
        searchBarContainer.style.display = 'none';
        navHome.style.opacity = '0.6';
        navSearch.style.opacity = '0.6';
        renderLikedSongs();
    }

    function renderLikedSongs() {
        likedSongsContainer.innerHTML = '';
        const matchedTracks = tracks.filter(t => likedTracks.has(t.title));

        if (matchedTracks.length === 0) {
            likedSongsContainer.innerHTML = '<p style="color: #a7a7a7; padding: 1.5rem 0;">Songs you like will appear here. Click the heart icon on any song card or player to add it!</p>';
            return;
        }

        matchedTracks.forEach(track => {
            const cardClone = track.element.cloneNode(true);
            
            if (track.index === currentTrackIndex) {
                cardClone.classList.add('active-card');
                const overlayIcon = cardClone.querySelector('.play-hover-btn i');
                if (overlayIcon && isPlaying) {
                    overlayIcon.className = 'fa-solid fa-pause';
                }
            }

            cardClone.addEventListener('click', () => {
                playTrack(track.index);
                
                const allClones = likedSongsContainer.querySelectorAll('.song-card');
                allClones.forEach(c => c.classList.remove('active-card'));
                cardClone.classList.add('active-card');
            });

            likedSongsContainer.appendChild(cardClone);
        });
    }

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const categories = document.querySelectorAll('.search-category-card');
        const searchHeader = document.querySelector('#search-view h2');
        
        if (query === '') {
            categories.forEach(c => c.style.display = 'block');
            searchHeader.textContent = 'Browse all';
            
            const results = document.getElementById('search-results-wrapper');
            if (results) results.remove();
            return;
        }

        searchHeader.textContent = 'Search results for "' + searchInput.value + '"';
        categories.forEach(c => c.style.display = 'none');

        let resultsWrapper = document.getElementById('search-results-wrapper');
        if (!resultsWrapper) {
            resultsWrapper = document.createElement('div');
            resultsWrapper.id = 'search-results-wrapper';
            resultsWrapper.className = 'card-container';
            searchView.appendChild(resultsWrapper);
        }
        resultsWrapper.innerHTML = '';

        const matchedTracks = tracks.filter(t => 
            t.title.toLowerCase().includes(query) || 
            t.artist.toLowerCase().includes(query)
        );

        if (matchedTracks.length === 0) {
            resultsWrapper.innerHTML = '<p style="color: #a7a7a7; padding: 1rem;">No songs found matching your search.</p>';
            return;
        }

        matchedTracks.forEach(track => {
            const cardClone = track.element.cloneNode(true);
            
            if (track.index === currentTrackIndex) {
                cardClone.classList.add('active-card');
                const overlayIcon = cardClone.querySelector('.play-hover-btn i');
                if (overlayIcon && isPlaying) {
                    overlayIcon.className = 'fa-solid fa-pause';
                }
            }

            cardClone.addEventListener('click', () => {
                playTrack(track.index);
                
                const allClones = resultsWrapper.querySelectorAll('.song-card');
                allClones.forEach(c => c.classList.remove('active-card'));
                cardClone.classList.add('active-card');
            });
            
            resultsWrapper.appendChild(cardClone);
        });
    }

    function showPlaylistModal() {
        playlistModal.style.display = 'flex';
        playlistNameInput.value = '';
        playlistNameInput.focus();
    }

    function hidePlaylistModal() {
        playlistModal.style.display = 'none';
        playlistNameInput.value = '';
    }

    function addPlaylistToDOM(playlistName) {
        const playlistItem = document.createElement('div');
        playlistItem.className = 'playlist-item';
        playlistItem.innerHTML = '<i class="fa-solid fa-music"></i> <span>' + playlistName + '</span>';
        
        playlistItem.addEventListener('click', () => {
            alert('Welcome to "' + playlistName + '"! This playlist is currently empty. Start playing songs to enjoy your clone!');
        });

        customPlaylistsList.appendChild(playlistItem);
    }

    function createPlaylist() {
        const playlistName = playlistNameInput.value.trim();
        if (!playlistName) {
            alert('Please enter a playlist name.');
            return;
        }

        addPlaylistToDOM(playlistName);
        
        const savedPlaylists = JSON.parse(localStorage.getItem('spotify_playlists') || '[]');
        savedPlaylists.push(playlistName);
        localStorage.setItem('spotify_playlists', JSON.stringify(savedPlaylists));

        hidePlaylistModal();
    }

    playIcon.addEventListener('click', togglePlay);
    btnPrev.addEventListener('click', playPrevTrack);
    btnNext.addEventListener('click', playNextTrack);
    btnShuffle.addEventListener('click', toggleShuffle);
    btnRepeat.addEventListener('click', toggleRepeat);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', playNextTrack);

    progressSlider.addEventListener('input', seekAudio);
    volumeSlider.addEventListener('input', adjustVolume);
    volumeIcon.addEventListener('click', toggleMute);
    playerHeartIcon.addEventListener('click', toggleLike);

    navHome.addEventListener('click', (e) => {
        e.preventDefault();
        showHomeView();
    });
    navSearch.addEventListener('click', (e) => {
        e.preventDefault();
        showSearchView();
    });
    likedSongsSidebar.addEventListener('click', (e) => {
        e.preventDefault();
        showLikedSongsView();
    });

    searchInput.addEventListener('input', performSearch);

    btnCreatePlaylist.addEventListener('click', showPlaylistModal);
    libraryPlusIcon.addEventListener('click', showPlaylistModal);
    modalCancel.addEventListener('click', hidePlaylistModal);
    modalCreate.addEventListener('click', createPlaylist);
    
    playlistNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            createPlaylist();
        }
    });

    playlistModal.addEventListener('click', (e) => {
        if (e.target === playlistModal) {
            hidePlaylistModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        } else if (e.key.toLowerCase() === 'm') {
            toggleMute();
        } else if (e.key.toLowerCase() === 'l') {
            toggleLike();
        }
    });

    initTracks();
    adjustVolume();
});
