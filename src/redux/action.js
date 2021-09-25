
export const openDraw = () => {
  return {
    type: 'OPEN_DRAW'
  }
}

export const openWrite = () => {
  return {
    type: 'OPEN_WRITE'
  }
}

export const changeStartX = (X = 0) => {
  return {
    type: 'CHANGE_START_X',
    payload: X
  }
}

export const changeStartY = (Y = 0) => {
  return {
    type: 'CHANGE_START_Y',
    payload: Y
  }
}

export const changeRecentWords = (newRecentWords = []) => {
  return {
    type: 'CHANGE_RECENT_WORDS',
    payload: newRecentWords
  }
}

export const changeUndoList = (newUndoList = []) => {
  return {
    type: 'CHANGE_UNDO_LIST',
    payload: newUndoList
  }
}

export const change_X = (X = []) => {
  return {
    type: 'CHANGE_X',
    payload: X
  }
}

export const change_Y = (Y = []) => {
  return {
    type: 'CHANGE_Y',
    payload: Y
  }
}