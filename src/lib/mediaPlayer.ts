/*
 * https://github.com/morethanwords/tweb
 * Copyright (C) 2019-2021 Eduard Kuzmenko
 * https://github.com/morethanwords/tweb/blob/master/LICENSE
 */

import appMediaPlaybackController from "../components/appMediaPlaybackController";
import { IS_APPLE_MOBILE } from "../environment/userAgent";
import { IS_TOUCH_SUPPORTED } from "../environment/touchSupport";
import RangeSelector from "../components/rangeSelector";
import { onMediaLoad } from "../helpers/files";
import { cancelEvent } from "../helpers/dom/cancelEvent";
import ListenerSetter from "../helpers/listenerSetter";
import ButtonMenu from "../components/buttonMenu";
import { ButtonMenuToggleHandler } from "../components/buttonMenuToggle";
import EventListenerBase from "../helpers/eventListenerBase";
import rootScope from "./rootScope";
import findUpClassName from "../helpers/dom/findUpClassName";
import { GrabEvent } from "../helpers/dom/attachGrabListeners";
import { attachClickEvent } from "../helpers/dom/clickEvent";

export class MediaProgressLine extends RangeSelector {
  protected filledLoad: HTMLDivElement;

  protected progressRAF = 0;

  protected media: HTMLMediaElement;
  protected streamable: boolean;

  constructor(media?: HTMLAudioElement | HTMLVideoElement, streamable?: boolean, withTransition?: boolean, useTransform?: boolean) {
    super({
      step: 1000 / 60 / 1000, 
      min: 0, 
      max: 1, 
      withTransition, 
      useTransform
    }, 0);

    if(media) {
      this.setMedia(media, streamable);
    }
  }

  public setMedia(media: HTMLMediaElement, streamable = false) {
    if(this.media) {
      this.removeListeners();
    }

    if(streamable && !this.filledLoad) {
      this.filledLoad = document.createElement('div');
      this.filledLoad.classList.add('progress-line__filled', 'progress-line__loaded');
      this.container.prepend(this.filledLoad);
      //this.setLoadProgress();
    } else if(this.filledLoad) {
      this.filledLoad.classList.toggle('hide', !streamable);
    }

    this.media = media;
    this.streamable = streamable;
    if(!media.paused || media.currentTime > 0) {
      this.onPlay();
    }

    let wasPlaying = false;
    this.setSeekMax();
    this.setListeners();
    this.setHandlers({
      onMouseDown: () => {
        wasPlaying = !this.media.paused;
        wasPlaying && this.media.pause();
      },

      onMouseUp: (e) => {
        // cancelEvent(e.event);
        wasPlaying && this.media.play();
      }
    });
  }

  protected onLoadedData = () => {
    this.max = this.media.duration;
    this.seek.setAttribute('max', '' + this.max);
  };

  protected onEnded = () => {
    this.setProgress();
  };

  protected onPlay = () => {
    let r = () => {
      this.setProgress();

      this.progressRAF = this.media.paused ? 0 : window.requestAnimationFrame(r);
    };

    if(this.progressRAF) {
      window.cancelAnimationFrame(this.progressRAF);
    }

    if(this.streamable) {
      this.setLoadProgress();
    }

    this.progressRAF = window.requestAnimationFrame(r);
  };

  protected onTimeUpdate = () => {
    if(this.media.paused) {
      this.setProgress();

      if(this.streamable) {
        this.setLoadProgress();
      }
    }
  };

  protected onProgress = (e: Event) => {
    this.setLoadProgress();
  };

  protected scrub(e: GrabEvent) {
    const scrubTime = super.scrub(e);
    this.media.currentTime = scrubTime;
    return scrubTime;
  }

  protected setLoadProgress() {
    if(appMediaPlaybackController.isSafariBuffering(this.media)) return;
    const buf = this.media.buffered;
    const numRanges = buf.length;

    const currentTime = this.media.currentTime;
    let nearestStart = 0, end = 0;
    for(let i = 0; i < numRanges; ++i) {
      const start = buf.start(i);
      if(currentTime >= start && start >= nearestStart) {
        nearestStart = start;
        end = buf.end(i);
      }

      //console.log('onProgress range:', i, buf.start(i), buf.end(i), this.media);
    }

    //console.log('onProgress correct range:', nearestStart, end, this.media);

    const percents = this.media.duration ? end / this.media.duration : 0;
    this.filledLoad.style.width = (percents * 100) + '%';
    //this.filledLoad.style.transform = 'scaleX(' + percents + ')';
  }

  protected setSeekMax() {
    this.max = this.media.duration || 0;
    if(this.max > 0) {
      this.onLoadedData();
    } else {
      this.media.addEventListener('loadeddata', this.onLoadedData);
    }
  }

  public setProgress() {
    if(appMediaPlaybackController.isSafariBuffering(this.media)) return;
    const currentTime = this.media.currentTime;

    super.setProgress(currentTime);
  }

  public setListeners() {
    super.setListeners();
    this.media.addEventListener('ended', this.onEnded);
    this.media.addEventListener('play', this.onPlay);
    this.media.addEventListener('timeupdate', this.onTimeUpdate);
    this.streamable && this.media.addEventListener('progress', this.onProgress);
  }

  public removeListeners() {
    super.removeListeners();

    this.media.removeEventListener('loadeddata', this.onLoadedData);
    this.media.removeEventListener('ended', this.onEnded);
    this.media.removeEventListener('play', this.onPlay);
    this.media.removeEventListener('timeupdate', this.onTimeUpdate);
    this.streamable && this.media.removeEventListener('progress', this.onProgress);

    if(this.progressRAF) {
      window.cancelAnimationFrame(this.progressRAF);
      this.progressRAF = 0;
    }
  }
}

export class VolumeSelector extends RangeSelector {
  public btn: HTMLElement;
  protected volumeSvg: HTMLElement;

  constructor(protected listenerSetter: ListenerSetter, protected vertical = false) {
    super({
      step: 0.01, 
      min: 0, 
      max: 1,
      vertical
    }, 1);

    this.setListeners();
    this.setHandlers({
      onScrub: currentTime => {
        const value = Math.max(Math.min(currentTime, 1), 0);

        //console.log('volume scrub:', currentTime, value);

        appMediaPlaybackController.muted = false;
        appMediaPlaybackController.volume = value;
      },

      /* onMouseUp: (e) => {
        cancelEvent(e.event);
      } */
    });

    this.btn = document.createElement('div');
    this.btn.classList.add('player-volume');

    this.btn.innerHTML = `
    <svg class="player-volume__icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true"></svg>
    `;
    this.btn.classList.add('btn-icon');
    this.volumeSvg = this.btn.firstElementChild as HTMLElement;

    this.btn.append(this.container);

    attachClickEvent(this.volumeSvg, this.onMuteClick, {listenerSetter: this.listenerSetter});
    this.listenerSetter.add(rootScope)('media_playback_params', this.setVolume);

    this.setVolume();
  }

  private onMuteClick = (e?: Event) => {
    e && cancelEvent(e);
    appMediaPlaybackController.muted = !appMediaPlaybackController.muted;
  };

  private setVolume = () => {
    // const volume = video.volume;
    const {volume, muted} = appMediaPlaybackController;
    let d: string;
    if(!volume || muted) {
      d = `M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z`;
    } else if(volume > .5) {
      d = `M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z`;
    } else if(volume > 0 && volume < .25) {
      d = `M7 9v6h4l5 5V4l-5 5H7z`;
    } else {
      d = `M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z`;
    }

    try {
      this.volumeSvg.innerHTML = `<path d="${d}"></path>`;
    } catch(err) {}

    if(!this.mousedown) {
      this.setProgress(muted ? 0 : volume);
    }
  };
}

export default class VideoPlayer extends EventListenerBase<{
  toggleControls: (show: boolean) => void
}> {
  private wrapper: HTMLDivElement;
  private progress: MediaProgressLine;
  private skin: 'default';

  private listenerSetter: ListenerSetter;

  private showControlsTimeout = 0;

  private controlsLocked: boolean;

  /* private videoParent: HTMLElement;
  private videoWhichChild: number; */

  constructor(private video: HTMLVideoElement, play = false, streamable = false, duration?: number) {
    super(false);

    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('ckin__player');

    this.listenerSetter = new ListenerSetter();

    video.parentNode.insertBefore(this.wrapper, video);
    this.wrapper.appendChild(video);

    this.skin = 'default';

    this.stylePlayer(duration);
    // this.setBtnMenuToggle();

    if(this.skin === 'default') {
      const controls = this.wrapper.querySelector('.default__controls.ckin__controls') as HTMLDivElement;
      this.progress = new MediaProgressLine(video, streamable);
      controls.prepend(this.progress.container);
    }

    if(play/*  && video.paused */) {
      const promise = video.play();
      promise.catch((err: Error) => {
        if(err.name === 'NotAllowedError') {
          video.muted = true;
          video.autoplay = true;
          video.play();
        }
      }).finally(() => { // due to autoplay, play will not call
        this.wrapper.classList.toggle('is-playing', !this.video.paused);
      });
      //(this.wrapper.querySelector('.toggle') as HTMLButtonElement).click();
    }
  }

  private stylePlayer(initDuration: number) {
    const {wrapper: player, video, skin} = this;

    player.classList.add(skin);
  
    const html = this.buildControls();
    player.insertAdjacentHTML('beforeend', html);
    let timeDuration: HTMLElement;
  
    if(skin === 'default') {
      const toggle = player.querySelectorAll('.toggle') as NodeListOf<HTMLElement>;
      const fullScreenButton = player.querySelector('.fullscreen') as HTMLElement;
      const timeElapsed = player.querySelector('#time-elapsed');
      timeDuration = player.querySelector('#time-duration') as HTMLElement;
      timeDuration.innerHTML = String(video.duration | 0).toHHMMSS();

      const volumeSelector = new VolumeSelector(this.listenerSetter);

      const leftControls = player.querySelector('.left-controls');
      volumeSelector.btn.classList.remove('btn-icon');
      leftControls.insertBefore(volumeSelector.btn, timeElapsed.parentElement);

      Array.from(toggle).forEach((button) => {
        this.listenerSetter.add(button)('click', () => {
          this.togglePlay();
        });
      });

      this.listenerSetter.add(video)('click', () => {
        if(!IS_TOUCH_SUPPORTED) {
          this.togglePlay();
        }
      });

      if(IS_TOUCH_SUPPORTED) {
        this.listenerSetter.add(player)('click', () => {
          this.toggleControls();
        });

        /* this.listenerSetter.add(player)('touchstart', () => {
          showControls(false);
        });

        this.listenerSetter.add(player)('touchend', () => {
          if(player.classList.contains('is-playing')) {
            showControls();
          }
        }); */
      } else {
        this.listenerSetter.add(this.wrapper)('mousemove', () => {
          this.showControls();
        });

        this.listenerSetter.add(this.wrapper)('mouseenter', () => {
          this.showControls(false);
        });

        this.listenerSetter.add(this.wrapper)('mouseleave', (e) => {
          if(findUpClassName(e.relatedTarget, 'media-viewer-caption')) {
            this.showControls(false);
            return;
          }
          
          this.hideControls();
        });

        this.listenerSetter.add(document)('keydown', (e: KeyboardEvent) => {
          if(rootScope.overlaysActive > 1) { // forward popup is active, etc
            return;
          }

          let good = true;
          if(e.code === 'KeyF') {
            this.toggleFullScreen(fullScreenButton);
          } else if(e.code === 'KeyM') {
            appMediaPlaybackController.muted = !appMediaPlaybackController.muted;
          } else if(e.code === 'Space') {
            this.togglePlay();
          } else if(e.altKey && e.code === 'Equal') {
            appMediaPlaybackController.playbackRate += .25;
          } else if(e.altKey && e.code === 'Minus') {
            appMediaPlaybackController.playbackRate -= .25;
          } else if(this.wrapper.classList.contains('ckin__fullscreen') && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
            if(e.code === 'ArrowLeft') appMediaPlaybackController.seekBackward({action: 'seekbackward'});
            else appMediaPlaybackController.seekForward({action: 'seekforward'});
          } else {
            good = false;
          }

          if(good) {
            cancelEvent(e);
            return false;
          }
        });
      }
  
      /* player.addEventListener('click', (e) => {
        if(e.target !== player) {
          return;
        }

        this.togglePlay();
      }); */
  
      /* video.addEventListener('play', () => {
      }); */

      this.listenerSetter.add(video)('dblclick', () => {
        if(!IS_TOUCH_SUPPORTED) {
          this.toggleFullScreen(fullScreenButton);
        }
      });

      this.listenerSetter.add(fullScreenButton)('click', (e) => {
        this.toggleFullScreen(fullScreenButton);
      });

      'webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange'.split(' ').forEach(eventName => {
        this.listenerSetter.add(player)(eventName, this.onFullScreen, false);
      });

      this.listenerSetter.add(video)('timeupdate', () => {
        timeElapsed.innerHTML = String(video.currentTime | 0).toHHMMSS();
      });

      this.listenerSetter.add(video)('play', () => {
        this.wrapper.classList.add('played');
      }, {once: true});

      this.listenerSetter.add(video)('pause', () => {
        this.showControls(false);
      });
    }

    this.listenerSetter.add(video)('play', () => {
      this.wrapper.classList.add('is-playing');
    });

    this.listenerSetter.add(video)('pause', () => {
      this.wrapper.classList.remove('is-playing');
    });
  
    if(video.duration || initDuration) {
      timeDuration.innerHTML = String(Math.round(video.duration || initDuration)).toHHMMSS();
    } else {
      onMediaLoad(video).then(() => {
        timeDuration.innerHTML = String(Math.round(video.duration)).toHHMMSS();
      });
    }
  }

  public hideControls = () => {
    clearTimeout(this.showControlsTimeout);
    this.showControlsTimeout = 0;

    const isShown = this.wrapper.classList.contains('show-controls');
    if(this.controlsLocked !== false) {
      if(this.video.paused || !isShown || this.controlsLocked) {
        return;
      }
    } else if(!isShown) {
      return;
    }
    
    this.dispatchEvent('toggleControls', false);
    this.wrapper.classList.remove('show-controls');
  };
  
  public showControls = (setHideTimeout = true) => {
    if(this.showControlsTimeout) {
      clearTimeout(this.showControlsTimeout);
      this.showControlsTimeout = 0;
    } else if(!this.wrapper.classList.contains('show-controls') && this.controlsLocked !== false) {
      this.dispatchEvent('toggleControls', true);
      this.wrapper.classList.add('show-controls');
    }

    if(!setHideTimeout || this.controlsLocked) {
      return;
    }

    this.showControlsTimeout = window.setTimeout(this.hideControls, 3e3);
  };

  public toggleControls = (show?: boolean) => {
    const isShown = this.wrapper.classList.contains('show-controls');

    if(show === undefined) {
      if(isShown) this.hideControls();
      else this.showControls();
    } else if(show === isShown) return;
    else if(show === false) this.hideControls();
    else this.showControls();
  };

  public lockControls(visible: boolean) {
    this.controlsLocked = visible;

    this.wrapper.classList.toggle('disable-hover', visible === false);
    this.toggleControls(visible);
  }

  protected togglePlay() {
    this.video[this.video.paused ? 'play' : 'pause']();
  }

  private buildControls() {
    const skin = this.skin;
    if(skin === 'default') {
      return `
      <button class="${skin}__button--big toggle tgico" title="Toggle Play"></button>
      <div class="${skin}__gradient-bottom ckin__controls"></div>
      <div class="${skin}__controls ckin__controls">
        <div class="bottom-controls">
          <div class="left-controls">
            <button class="btn-icon ${skin}__button toggle tgico" title="Toggle Video"></button>
            <div class="time">
              <time id="time-elapsed">0:00</time>
              <span> / </span>
              <time id="time-duration">0:00</time>
            </div>
          </div>
          <div class="right-controls">
            <button class="btn-icon ${skin}__button btn-menu-toggle settings tgico-settings hide" title="Playback Rate"></button>
            <button class="btn-icon ${skin}__button fullscreen tgico-fullscreen" title="Full Screen"></button>
          </div>
        </div>
      </div>`;
    }
  }

  protected setBtnMenuToggle() {
    const buttons: Parameters<typeof ButtonMenu>[0] = [0.25, 0.5, 1, 1.25, 1.5, 2].map((rate) => {
      return { 
        regularText: rate === 1 ? 'Normal' : '' + rate, 
        onClick: () => this.video.playbackRate = rate
      };
    });
    const btnMenu = ButtonMenu(buttons);
    const settingsButton = this.wrapper.querySelector('.settings') as HTMLElement;
    btnMenu.classList.add('top-left');
    ButtonMenuToggleHandler(settingsButton);
    settingsButton.append(btnMenu);
  }

  public static isFullScreen(): boolean {
    // @ts-ignore
    return !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
  }
  
  protected toggleFullScreen(fullScreenButton: HTMLElement) {
    // alternative standard method
    const player = this.wrapper;

    // * https://caniuse.com/#feat=fullscreen
    if(IS_APPLE_MOBILE) {
      const video = this.video as any;
      video.webkitEnterFullscreen();
      video.enterFullscreen();
      return;
    }
    
    if(!VideoPlayer.isFullScreen()) {
      player.classList.add('ckin__fullscreen');

      /* const videoParent = this.video.parentElement;
      const videoWhichChild = whichChild(this.video);
      const needVideoRemount = videoParent !== player;

      if(needVideoRemount) {
        this.videoParent = videoParent;
        this.videoWhichChild = videoWhichChild;
        player.prepend(this.video);
      } */
  
      if(player.requestFullscreen) {
        player.requestFullscreen();
        // @ts-ignore
      } else if(player.mozRequestFullScreen) {
        // @ts-ignore
        player.mozRequestFullScreen(); // Firefox
        // @ts-ignore
      } else if(player.webkitRequestFullscreen) {
        // @ts-ignore
        player.webkitRequestFullscreen(); // Chrome and Safari
        // @ts-ignore
      } else if(player.msRequestFullscreen) {
        // @ts-ignore
        player.msRequestFullscreen();
      }
  
      fullScreenButton.classList.remove('tgico-fullscreen');
      fullScreenButton.classList.add('tgico-smallscreen');
      fullScreenButton.setAttribute('title', 'Exit Full Screen');
    } else {
      player.classList.remove('ckin__fullscreen');

      /* if(this.videoParent) {
        const {videoWhichChild, videoParent} = this;
        if(!videoWhichChild) {
          videoParent.prepend(this.video);
        } else {
          videoParent.insertBefore(this.video, videoParent.children[videoWhichChild]);
        }

        this.videoParent = null;
        this.videoWhichChild = -1;
      } */
  
      // @ts-ignore
      if(document.cancelFullScreen) {
        // @ts-ignore
        document.cancelFullScreen();
        // @ts-ignore
      } else if(document.mozCancelFullScreen) {
        // @ts-ignore
        document.mozCancelFullScreen();
        // @ts-ignore
      } else if(document.webkitCancelFullScreen) {
        // @ts-ignore
        document.webkitCancelFullScreen();
        // @ts-ignore
      } else if(document.msExitFullscreen) {
        // @ts-ignore
        document.msExitFullscreen();
      }
  
      fullScreenButton.classList.remove('tgico-smallscreen');
      fullScreenButton.classList.add('tgico-fullscreen');
      fullScreenButton.setAttribute('title', 'Full Screen');
    }
  }
  
  protected onFullScreen = () => {
    // @ts-ignore
    const isFullscreenNow = document.webkitFullscreenElement !== null;
    if(!isFullscreenNow) {
      this.wrapper.classList.remove('ckin__fullscreen');
    }
  };

  public removeListeners() {
    super.cleanup();
    this.listenerSetter.removeAll();
    this.progress.removeListeners();
  }
}
