import React, {useRef, useEffect, useState} from "react";
import {IoPencil} from 'react-icons/io5'
import {IoTextOutline} from 'react-icons/io5'
import {Navbar, Container, Button, ButtonGroup, Row, Col, ToggleButton, ButtonToolbar} from 'react-bootstrap'
import context from "react-bootstrap/esm/AccordionContext";

import { useSelector, useDispatch, createDispatchHook } from "react-redux";
import { openDraw, openWrite, changeMouseX, changeMouseY,changeStartX, changeStartY,
        changeUndoList, changeRecentWords, change_X, change_Y } from "./redux/action";
const App = () => {
    const numOfCakes = useSelector(state => state.numOfCakes)
    // Variables to tell whether you wants to draw or write
    const isDraw = useSelector(state => state.isDraw);
    const isWrite = useSelector(state => state.isWrite);
    //variables to store position of mouse pointers while writing
    const mouseX = useSelector(state => state.mouseX);
    const mouseY = useSelector(state => state.mouseY);
    const startX = useSelector(state => state.startX);
    const startY = useSelector(state => state.startY);
    //For handling Backspace
    const recentWords = useSelector(state => state.recentWords);//keeps track of letter enters
    const undoList = useSelector(state => state.undoList);//stores previous canvas states
    //stores track of pointer positions where we would be writing
    const X = useSelector(state => state.X);
    const Y = useSelector(state => state.Y);
    const dispatch = useDispatch()

    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth*2;
        canvas.height = window.innerHeight*2;

        const context = canvas.getContext('2d');
        context.scale(2,2);
        contextRef.current = context;
        canvasRef.current.focus();
        //saving intial State
        saveState();
    }, []);
    useEffect(() => {
        const handleKeydown = (e) => {
            console.log("key pressed");
            //prevents scrolling down every time spacebar is pressed
            if((e.keyCode === 32) && e.target === document.body) {
                e.preventDefault();
            }
            startWriting(e);
        }
        //event Listener for every time key is pressed
        window.addEventListener('keydown', handleKeydown);
        // cleanup 
        return function cleanupListener() {
            window.removeEventListener('keydown', handleKeydown);
        }
    });
    
    //save canvas state
    const saveState = () => {
        var tempX = X;
        var tempY = Y;
        tempX.push(mouseX);
        tempY.push(mouseY);
        dispatch(change_X(tempX));
        dispatch(change_Y(tempY));

        var newUndoList = undoList;
        newUndoList.push(canvasRef.current.toDataURL());
        dispatch(changeUndoList(newUndoList)); 
    }
    //For handling backspace
    const undo = () => {
        var newUndoList = undoList;
        newUndoList.pop();
        dispatch(changeUndoList(newUndoList)); 
    
        var ImgData = undoList[undoList.length - 1];
        var image = new Image();
        //loads previous canvas-image
        image.src = ImgData;
        image.onload = function () {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            contextRef.current.drawImage(image, 0, 0, canvasRef.current.width*2, canvasRef.current.height*2
                                        , 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        if(!isWrite) {
            return;
        }
        //NOW CHANGE POINTER COORDINATES
        var newX = X[X.length - 1];
        var newY = Y[Y.length - 1];
        setStuff(newX, newY);
        var tempX = X;
        var tempY = Y;
        tempX.pop();
        tempY.pop();
        dispatch(change_X(tempX));
        dispatch(change_Y(tempY));
    }
    // ******* drawing starts *********
    const startDrawing = ({nativeEvent}) => {
        console.log('start Drawing called');
        if(!isDraw) {
            console.log("start draw return");
            return;
        }
        const {offsetX, offsetY} = nativeEvent;//coordinates of mousePointer
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    }
    const finishDrawing = () => {
        if(!isDrawing) {
            return;
        }
        contextRef.current.closePath();
        setIsDrawing(false);
        //saving pic after every picture
        saveState();
        console.log('drawing state saved')
    }
    const draw = ({nativeEvent}) => {
        if(!isDrawing) {
            return;
        }
        const {offsetX, offsetY} = nativeEvent;//coordinates of mousePointer
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    }
    // ******* drawing ends ********

    //******** writing starts *******
    //stores coordinates where user started typing
    const setStart = (offsetX, offsetY) => {
        if(!isWrite) {
            return;
        }
        dispatch(changeStartX(offsetX));
        dispatch(changeStartY(offsetY));
        console.log("startX: ", startX);
    }
    //stores coordinates where user is typing
    const setStuff = (offsetX, offsetY) => {
        if(!isWrite) {
            return;
        }
        console.log( "setStuff called: ",offsetX, ' ', offsetY);
        dispatch(changeMouseX(offsetX));
        dispatch(changeMouseY(offsetY));
    }
    const handleDoubleClick = (offsetX, offsetY) => {
        if(!isWrite) {
            console.log("handleDoubleClick returned")
            return;
        }
        setStart(offsetX, offsetY);
        setStuff(offsetX, offsetY);
    }
    //responds to every time user types
    const startWriting = (e) => {
        console.log("YO", e.keyCode);
        console.log("startWriting");
        contextRef.current.font="16px Arial";
        if(e.keyCode === 20 || e.keyCode === 16) {
            return;
        }
        //Backspace
        if(e.keyCode === 8) {
            if(undoList.length === 1){
                return;
            }
            undo();
            if(recentWords.length === 0) {
                return;
            }
            var recentWord = recentWords[recentWords.length - 1];
            console.log('recentWord: ', recentWord);
            setStuff(mouseX - contextRef.current.measureText(recentWord).width, mouseY);
            const newRecentWords = recentWords;
            newRecentWords.pop();
            dispatch(changeRecentWords(newRecentWords));
            return;
        }
        if(!isWrite) {
            console.log("isWrite", isWrite);
            return;
        }
        //Enter
        if(e.keyCode === 13) {
            setStuff(startX, mouseY + 20);
            return;
        }
        //adding text
        contextRef.current.fillText(e.key, mouseX, mouseY);
        console.log(e.key);
        //updating pointer coordinates
        setStuff(mouseX + contextRef.current.measureText(e.key).width, mouseY);
        //saving this page
        saveState();
        //adding letters added
        const newRecentWords = recentWords;
        newRecentWords.push(e.key);
        console.log(recentWords);
    }
    //********** writing end **********
    //radio button
    const [checked, setChecked] = useState(false);
    const [radioValue, setRadioValue] = useState('0');//1 for type// 2 for draw

    const radios = [
        { name: <IoTextOutline/>, value: '1' },
        { name: <IoPencil/>, value: '2' },
    ];
    //download Function for image
    const download = () => {
        var image = canvasRef.current.toDataURL("image/png").replace("image/png", "image/pdf");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
        window.location.href=image; // it will save locally
    }
    return (
        <>
            <Navbar bg="dark" variant="dark">
                <Container className="justify-content-center">
                        <Navbar.Brand href="#home">
                          <IoTextOutline className="mx-4"/> Online WhiteBoard <IoPencil className="mx-4"/>
                        </Navbar.Brand>
                </Container>
            </Navbar>
            <>
                <ButtonToolbar className="justify-content-center my-3">
                        {radios.map((radio, idx) => (
                        <ToggleButton
                            className="myBtn"
                            size="lg me-4"
                            key={idx}
                            id={`radio-${idx}`}
                            type="radio"
                            variant='outline-primary'
                            name="radio"
                            value={radio.value}
                            checked={radioValue === radio.value}
                            onChange={(e) => {
                                    setRadioValue(e.currentTarget.value)
                                    console.log(e.currentTarget.value)
                                    if(e.currentTarget.value === '1') {
                                        console.log("Write");
                                        dispatch(openWrite());
                                    } else if (e.currentTarget.value === '2') {
                                        console.log("Draw")
                                        dispatch(openDraw());
                                    }
                                }
                            }
                        >
                            {radio.name}
                        </ToggleButton>
                        ))}
                    
                </ButtonToolbar>
            </> 
            <main>
                <canvas 
                    id="myCanvas"
                    className = {isWrite ? 'cursor' : ''}
                    onDoubleClick={(e) =>handleDoubleClick(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    ref={canvasRef}/>
            </main>
            <Button className="mybtn mx-2 my-2" onClick={download}> Download Image</Button>
        </>
    )
};

export default App;