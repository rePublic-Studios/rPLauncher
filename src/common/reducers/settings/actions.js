import * as ActionTypes from './actionTypes';

export function updateSoundsSetting(sounds) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDS,
      sounds
    });
  };
}

export function updateReleaseChannel(releaseChannel) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_RELEASE_CHANNEL,
      releaseChannel
    });
  };
}

export function updateHideWindowOnGameLaunch(hideWindow) {
  return dispatch => {
    dispatch({
      type: ActionTypes.HIDE_WINDOW_ON_GAME_LAUNCH,
      hideWindow
    });
  };
}

export function updateShowNews(value) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SHOW_NEWS,
      value
    });
  };
}

export function updatePotatoPcMode(value) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_POTATO_PC_MODE,
      value
    });
  };
}

export function updateInstanceSortType(value) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_INSTANCE_SORT_METHOD,
      value
    });
  };
}

export function updateResolution(resolution) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_MINECRAFT_RESOLUTION,
      resolution
    });
  };
}

export function updateJavaPath(path) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_PATH,
      path
    });
  };
}

export function updateJava16Path(path) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA16_PATH,
      path
    });
  };
}

export function updateJavaMemory(memory) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_MEMORY,
      memory
    });
  };
}

export function updateJavaArguments(args) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_JAVA_ARGUMENTS,
      args
    });
  };
}

export function updateDiscordRPC(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_DISCORD_RPC,
      val
    });
  };
}

export function updateCurseReleaseChannel(curseReleaseChannel) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_CURSE_RELEASE_CHANNEL,
      curseReleaseChannel
    });
  };
}

export function updateFullscreen(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_FULLSCREEN,
      val
    });
  };
}

export function updateFOV(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_FOV,
      val
    });
  };
}

export function updateFPS(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_FPS,
      val
    });
  };
}

export function updateRenderDistance(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_RENDER_DISTANCE,
      val
    });
  };
}

export function updateGUIScale(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_GUI_SCALE,
      val
    });
  };
}

export function updateAutoJump(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_AUTO_JUMP,
      val
    });
  };
}

export function updateSoundCategoryMaster(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_MASTER,
      val
    });
  };
}

export function updateSoundCategoryMusik(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_MUSIC,
      val
    });
  };
}

export function updateSoundCategoryJukebox(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_JUKEBOX,
      val
    });
  };
}

export function updateSoundCategoryWeather(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_WEATHER,
      val
    });
  };
}

export function updateSoundCategoryBlocks(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_BLOCKS,
      val
    });
  };
}

export function updateSoundCategoryHostile(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_HOSTILE,
      val
    });
  };
}

export function updateSoundCategoryNeutral(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_NEUTRAL,
      val
    });
  };
}

export function updateSoundCategoryPlayer(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_PLAYER,
      val
    });
  };
}

export function updateSoundCategoryAmbient(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_AMBIENT,
      val
    });
  };
}

export function updateSoundCategoryVoice(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_SOUNDCATEGORY_VOICE,
      val
    });
  };
}

export function updateVSync(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_VSYNC,
      val
    });
  };
}

export function updateMuteAllSounds(val) {
  return dispatch => {
    dispatch({
      type: ActionTypes.UPDATE_MUTE_ALL_SOUNDS,
      val
    });
  };
}
