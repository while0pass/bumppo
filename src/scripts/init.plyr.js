import Plyr from 'plyr';

const videoPlayer = new Plyr('#bmpp-videoPlayer', {
  //debug: BUMPPO_ENV !== 'production', // eslint-disable-line no-undef
  controls: [],
  clickToPlay: false,
  fullscreen: { enabled: false, fallback: false, iosNative: false },
});

export default videoPlayer;
