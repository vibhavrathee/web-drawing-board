
const initialState = {
  numOfCakes: 10,
  isDraw: false,
  isWrite: false,
  mouseX: 0,
  mouseY: 20,
  startX: 0, 
  startY: 20,
  recentWords: [],
  undoList: [],
  X: [],
  Y: []
}

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'OPEN_DRAW': return {
        ...state,
        isDraw: true,
        isWrite: false
    };
    case 'OPEN_WRITE': return {
        ...state,
        isDraw: false,
        isWrite: true
    };
    case 'CHANGE_MOUSE_X': return {
        ...state,
        mouseX: action.payload,
    };
    case 'CHANGE_MOUSE_Y': return {
        ...state,
        mouseY: action.payload,
    };
    case 'CHANGE_START_X': return {
        ...state,
        startX: action.payload,
    };
    case 'CHANGE_START_Y': return {
        ...state,
        startY: action.payload,
    };
    case 'CHANGE_RECENT_WORDS': return {
        ...state,
        recentWords: action.payload
    };
    case 'CHANGE_UNDO_LIST': return {
        ...state,
        undoList: action.payload
    }
    case 'CHANGE_X': return {
        ...state,
        X: action.payload
    };
    case 'CHANGE_Y': return {
        ...state,
        Y: action.payload
    }
    
    default: return state;
  }
}

export default rootReducer