import React, {useRef, useEffect, useState} from "react";
import {IoPencil} from 'react-icons/io5'
import {IoTextOutline} from 'react-icons/io5'
import {Navbar, Container, Button, ButtonGroup, Row, Col, ToggleButton, ButtonToolbar} from 'react-bootstrap'
import context from "react-bootstrap/esm/AccordionContext";
const App = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    //Variables to tell whether you wants to draw or write
    var isDraw = false;
    var isWrite = false;
    const drawRef = useRef(isDraw);
    const writeRef = useRef(isWrite);

    //variables to store position of mouse pointers while writing
    var mouseX = 0;
    var mouseY = 20;
    var startX = 0;
    var startY = 20;
    //References
    const myMouseXRef = useRef(mouseX);
    const myMouseYRef = useRef(mouseY);
    const startXRef = useRef(startX);
    const startYRef = useRef(startY);

    //For handling Backspace
    var recentWords = [];//keeps track of letter enters
    var undoList = [];   //stores previous canvas states
    //stores track of pointer positions where we would be writing
    var X = [];          
    var Y = [];
    //References
    const recentWordsRef = useRef(recentWords);
    const undoListRef = useRef(undoList);
    const refX = useRef(X);
    const refY = useRef(Y);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth*2;
        canvas.height = window.innerHeight*2;

        const context = canvas.getContext('2d');
        context.scale(2,2);
        contextRef.current = context;
        canvasRef.current.focus();

        //event Listener for every time key is pressed
        window.addEventListener('keydown', (e) => {
            console.log("key pressed");
            //prevents scrolling down every time spacebar is pressed
            if((e.keyCode === 32) && e.target == document.body) {
                e.preventDefault();
            }
            startWriting(e);
        });
        //saving intial State
        saveState();
    }, []);
    
    //save canvas state
    const saveState = () => {
        refX.current.push(myMouseXRef.current);
        refY.current.push(myMouseYRef.current);
        undoListRef.current.push(canvasRef.current.toDataURL());
    }
    //For handling backspace
    const undo = () => {
        undoListRef.current.pop();
        var ImgData = undoListRef.current[undoListRef.current.length - 1];
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
        var newX = refX.current[refX.current.length - 1];
        var newY = refY.current[refY.current.length - 1];
        setStuff(newX, newY);
        refX.current.pop();
        refY.current.pop();
    }
    // ******* drawing starts *********
    const startDrawing = ({nativeEvent}) => {
        console.log('start Drawing called');
        if(!drawRef.current) {
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
        if(!writeRef.current) {
            return;
        }
        startX = offsetX;
        startY = offsetY;
        startXRef.current = startX;
        startYRef.current = startY;
        console.log("startX: ", startX);
    }
    //stores coordinates where user is typing
    const setStuff = (offsetX, offsetY) => {
        if(!writeRef.current) {
            return;
        }
        console.log( "setStuff called: ",offsetX, ' ', offsetY);
        mouseX = offsetX;
        mouseY = offsetY;
        myMouseXRef.current = mouseX;
        myMouseYRef.current = mouseY;
    }
    const handleDoubleClick = (offsetX, offsetY) => {
        if(!writeRef.current) {
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
            //only initial state left
            if(undoListRef.current.length === 1){
                return;
            }
            undo();
            if(recentWordsRef.current.length === 0) {
                return;
            }
            var recentWord = recentWordsRef.current[recentWordsRef.current.length - 1];
            console.log('recentWord: ', recentWord);
            setStuff(myMouseXRef.current - contextRef.current.measureText(recentWord).width, myMouseYRef.current);
            recentWordsRef.current.pop();
            return;
        }
        if(!writeRef.current) {
            return;
        }
        //Enter
        if(e.keyCode === 13) {
            setStuff(startXRef.current, myMouseYRef.current + 20);
            return;
        }
        //adding text
        contextRef.current.fillText(e.key, myMouseXRef.current, myMouseYRef.current);
        console.log(e.key);
        //updating pointer coordinates
        setStuff(myMouseXRef.current + contextRef.current.measureText(e.key).width, myMouseYRef.current);
        //saving this page
        saveState();
        //adding letters added
        recentWordsRef.current.push(e.key);
        console.log(recentWordsRef.current);
    }
    //********** writing end **********
    //radio button
    const [checked, setChecked] = useState(false);
    const [radioValue, setRadioValue] = useState('0');//1 for type// 2 for draw

    const radios = [
        { name: <IoTextOutline/>, value: '1' },
        { name: <IoPencil/>, value: '2' },
    ];
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
                                        isDraw = false;
                                        isWrite = true;
                                        drawRef.current = isDraw
                                        writeRef.current = isWrite; 
                                    } else if (e.currentTarget.value === '2') {
                                        console.log("Draw")
                                        isWrite = false;
                                        isDraw = true;
                                        drawRef.current = isDraw
                                        writeRef.current = isWrite;
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
                    className = {writeRef.current ? 'cursor' : ''}
                    onDoubleClick={(e) =>handleDoubleClick(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                    onMouseDown={startDrawing}
                    onMouseUp={finishDrawing}
                    onMouseMove={draw}
                    ref={canvasRef}/>
            </main>
        </>
    )
};

export default App;