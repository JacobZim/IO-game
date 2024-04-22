
import { connect, play } from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { setLeaderboardHidden, setScoreboardHidden } from './leaderboard';

// I'm using a tiny subset of Bootstrap here for convenience - there's some wasted CSS,
// but not much. In general, you should be careful using Bootstrap because it makes it
// easy to unnecessarily bloat your site.
import './css/bootstrap-reboot.css';
import './css/main.css';

const playMenu = document.getElementById('play-menu');
const playButton = document.getElementById('play-button');
const usernameInput = document.getElementById('username-input');

Promise.all([
  connect(onGameOver),
  downloadAssets(),
]).then(() => {
  playMenu.classList.remove('hidden');
  usernameInput.focus();
  playButton.onclick = () => {
    const classSelect = document.querySelector('input[name=class-select]:checked');
    let choice;
    if (classSelect) {choice = classSelect.value;}
    else {choice = 1};
    // Play!
    play(usernameInput.value, choice);
    playMenu.classList.add('hidden');
    initState();
    startCapturingInput();
    startRendering();
    setLeaderboardHidden(false);
    setScoreboardHidden(false);
  };
}).catch(console.error);

function onGameOver() {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
  setScoreboardHidden(true);
}
