const grid = React.createElement;

class Canvas extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            // React references
            canvasRef: React.createRef(),
            divRef: React.createRef(),
            stopBtnRef: React.createRef(),
            generateBtnRef: React.createRef(),
            sliderRef: React.createRef(),
            stepForwardBtnRef: React.createRef(),
            stepBackwardBtnRef: React.createRef(),
            clearBtnRef: React.createRef(),
            deadColorRef: React.createRef(),
            aliveColorRef: React.createRef(),

            // Canvas settings
            canvasWidth: "800",
            canvasHeight: "600",
            bgColor: "#433991",
            gridWidth: 72,
            gridHeight: 54,
            cellSize: 10,

            // Cell state arrays
            cellStates: [],
            bufferStates: [],
            cellStateHistory: [],
            historyIndex: 0,
            
            tickRate: 100,
            simActive: true,
            isDrawing: false,

            // Cell color settings
            colorAlive: "#000000",
            colorDead: "#FFFFFF"
        };

        this.UpdateCellState = this.UpdateCellState.bind(this);

        // Calculate canvas width and height.
        this.state.canvasWidth = this.state.gridWidth+(this.state.gridWidth*this.state.cellSize);
        this.state.canvasHeight = this.state.gridHeight + (this.state.gridHeight*this.state.cellSize);
    };

    componentDidMount()
    {
        this.InitGrid();
        this.InitStateHistoryArray();
        this.DrawGrid();

        this.timerID = setInterval(() => this.tick(), this.state.tickRate);
    };

    componentWillUnmount()
    {
        clearInterval(this.timerID);
    };

    CreateArray2D(x, y)
    {
        var newArr = new Array(y);

        for(var i = 0; i < y; ++i)
        {
            newArr[i] = new Array(x);
        }

        return newArr;
    };

    // Initialize the grid with random states.
    InitGrid()
    {
        this.state.cellStates = this.CreateArray2D(this.state.gridWidth, this.state.gridHeight);
        this.state.bufferStates = this.CreateArray2D(this.state.gridWidth, this.state.gridHeight);

        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            for(var x = 0; x < this.state.gridWidth; ++x)
            {
                this.state.cellStates[y][x] = Math.round(Math.random(1));
            }
        }
    };

    InitStateHistoryArray()
    {
        this.state.cellStateHistory = new Array(10);

        //**Change hard-coded length
        for(let i = 0; i < 10; ++i)
        {
            this.state.cellStateHistory[i] = this.CreateArray2D(this.state.gridWidth, this.state.gridHeight);
        }

        this.CopyStateToHistory();
        this.state.historyIndex = 0;
        this.UpdateStepBackwardBtn();
    }

    CopyArrayInto(arr1, arr2)
    {
        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            arr1[y] = arr2[y].slice();
        }
    }

    CopyStateToHistory()
    {
        // TODO::Remove hard coded length.
        if(this.state.historyIndex == 9)
        {
            this.ShiftHistoryArray();
        }
        
        this.CopyArrayInto(this.state.cellStateHistory[this.state.historyIndex], this.state.cellStates);

        if(this.state.historyIndex < 9)
        {
            this.state.historyIndex++;
        }

        this.UpdateStepBackwardBtn();
    }

    CopyHistoryToState()
    {
        this.state.historyIndex--;

        if(this.state.historyIndex < 0)
        {
            this.state.historyIndex = 0;
        } 

        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            this.state.cellStates[y] = this.state.cellStateHistory[this.state.historyIndex][y].slice();
        }


        this.UpdateStepBackwardBtn();
    }

    // Shifts the history array down
    ShiftHistoryArray()
    {
        for(let i = 0; i < this.state.cellStateHistory.length-1; ++i)
        {
            this.state.cellStateHistory[i] = this.state.cellStateHistory[i+1].slice();
        };
    }

    CheckNeighbourCells(x, y)
    {
        var cellCount = 0;

        for(var i = -1; i < 2; ++i)
        {
            for(var j = -1; j < 2; ++j)
            {
                var currX = (x+i+this.state.gridWidth)%this.state.gridWidth;
                var currY = (y+j+this.state.gridHeight)%this.state.gridHeight;

                cellCount += this.state.cellStates[currY][currX];
            }
        }

        cellCount -= this.state.cellStates[y][x];

        return cellCount;
    };

    UpdateCells()
    {
        this.CopyStateToHistory();

        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            for(var x = 0; x < this.state.gridWidth; ++x)
            {
                var currState = this.state.cellStates[y][x];
                var neighbourCellCount = this.CheckNeighbourCells(x,y);

                if(currState == 0 && neighbourCellCount == 3)
                {
                    this.state.bufferStates[y][x] = 1;
                }
                else if(currState == 1 && (neighbourCellCount < 2 || neighbourCellCount > 3))
                {
                    this.state.bufferStates[y][x] = 0;
                }
                else
                {
                    this.state.bufferStates[y][x] = currState;
                }
            }
        }

        this.CopyArrayInto(this.state.cellStates, this.state.bufferStates);

        this.DrawGrid();
    };

    // Updates the state of a specific cell within mouse bounds.
    UpdateCellState(e)
    {
        var x = Math.trunc(e.offsetX/11);
        var y = Math.trunc(e.offsetY/11);

        // Keep within array bounds
        if(x >= this.state.gridWidth)
        {
            x = this.state.gridWidth-1;
        }
        if(y >= this.state.gridHeight)
        {
            y = this.state.gridHeight-1;
        }

        // Check if we are drawing to allow for clearing alive cells.
        if(!this.state.isDrawing)
        {
            if(this.state.cellStates[y][x] == 1)
            {
                this.state.cellStates[y][x] = 0;
            }
            else
            {
                this.state.cellStates[y][x] = 1;
            }
        }
        else
        {
            this.state.cellStates[y][x] = 1;
        }

        this.DrawGrid();
    }

    DrawGrid()
    {
        var ctx = this.state.canvasRef.current.getContext('2d');

        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            for(var x = 0; x < this.state.gridWidth; ++x)
            {
                if(this.state.cellStates[y][x] == 1)
                {
                    ctx.fillStyle = this.state.colorAlive;
                }
                else
                {
                    ctx.fillStyle = this.state.colorDead;
                };
        
                ctx.fillRect(x*11, y*11, 10, 10)
            }
        }
    };

    UpdateTickRate()
    {
        this.state.tickRate = this.state.sliderRef.current.value;
        clearInterval(this.timerID);
        this.timerID = setInterval(() => this.tick(), this.state.tickRate);
    }

    tick()
    {
        if(this.state.simActive)
        {
            this.UpdateCells();
        };
    };

    StartStop()
    {
        this.state.simActive = !this.state.simActive;
        this.state.stopBtnRef.current.innerText = (this.state.simActive)?"Stop":"Start";
    }

    TickOnce()
    {
        // Stop the simulation
        this.state.simActive = false;
        this.state.stopBtnRef.current.innerText = (this.state.simActive)?"Stop":"Start";

        this.UpdateCells();
    }

    TickBackwards()
    {        
        // Stop the simulation
        this.state.simActive = false;
        this.state.stopBtnRef.current.innerText = (this.state.simActive)?"Stop":"Start";

        // Move back one in state history array, check for out of bounds.
        this.CopyHistoryToState();

        // Draw grid
        this.DrawGrid();
    }

    RegenerateBoard()
    {
        if(this.state.simActive)
        {
            this.StartStop();
        }

        this.ClearBoard();

        this.InitGrid();

        this.DrawGrid();
    }

    ClearBoard()
    {
        if(this.state.simActive)
        {
            this.StartStop();
        }

        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            for(var x = 0; x < this.state.gridWidth; ++x)
            {
                this.state.cellStates[y][x] = 0;
                this.state.cellStates[y][x] = 0;
            }
        }

        this.DrawGrid();
    }

    UpdateAliveStateColor()
    {
        this.state.colorAlive = this.state.aliveColorRef.current.value;
    }

    UpdateDeadStateColor()
    {
        this.state.colorDead = this.state.deadColorRef.current.value;
    }

    UpdateStepBackwardBtn()
    {
        this.state.stepBackwardBtnRef.current.disabled = (this.state.historyIndex > 0)?false:true;
    }

    render()
    {
        var div = React.createElement('div', {ref: this.state.divRef}, 
            // Canvas element  
            React.createElement('canvas',
            {
                onMouseDown: e =>
                {
                    this.UpdateCellState(e.nativeEvent);
                    
                    this.state.isDrawing = true;

                    if(this.state.simActive)
                    {
                        this.StartStop();
                    }
                },

                onMouseUp: e =>
                {
                    this.state.isDrawing = false;
                },

                onMouseMove: e =>
                {
                    if(this.state.isDrawing)
                    {
                        this.UpdateCellState(e.nativeEvent);
                    }
                },

                ref: this.state.canvasRef,
                id: "board",
                width: this.state.canvasWidth,
                height: this.state.canvasHeight,
                style:
                {
                    backgroundColor: this.state.bgColor,
                    paddingLeft: 0,
                    top: '50px',
                    bottom: 0,
                    paddingRight: 0,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'block',
                },
            }, null),

            // Start/Stop button
            React.createElement('button', 
            {
                onClick: () => this.StartStop(),
                
                ref: this.state.stopBtnRef,
                id: 'startStop',
                className: "button",
            }, "Stop"),

            // Generate new board button.
            React.createElement('button', 
            {
                onClick: () => this.RegenerateBoard(),
                
                ref: this.state.generateBtnRef,
                id: 'generate',
                className: "button",
            }, "Generate"),

            // Clear current board button.
            React.createElement('button', 
            {
                onClick: () => this.ClearBoard(),
                
                ref: this.state.clearBtnRef,
                id: 'clear',
                className: "button",
            }, "Clear"),

            // Step backward in simulation button
            React.createElement('button', 
            {
                onClick: () => this.TickBackwards(),

                ref: this.state.stepBackwardBtnRef,
                id: 'stepForward',
                disabled: false,
                className: "button",

            }, "Step Backward"),

            // Step forward in simulation button
            React.createElement('button', 
            {
                onClick: () => this.TickOnce(),
                
                ref: this.state.stepForwardBtnRef,
                id: 'stepForward',
                className: "button",
            }, "Step Forward"),

            // Tickrate slider
            React.createElement('input', 
            {
                ref: this.state.sliderRef,
                onChange: () => this.UpdateTickRate(),
                type:'range', 
                min:'10',
                max:'100',
                defaultValue: '100'
            }, null),

            // Dead state color
            React.createElement('input', 
            {
                onInput: () => this.UpdateDeadStateColor(),
                ref: this.state.deadColorRef,
                type:'color',
                defaultValue:this.state.colorDead
            }, null),

            React.createElement('label', null, "Dead"),

            // Alive state color
            React.createElement('input', 
            {
                onInput: () => this.UpdateAliveStateColor(),
                ref: this.state.aliveColorRef,
                type:'color',
                defaultValue:this.state.colorAlive
            }, null),

            React.createElement('label', null, "Alive"),
        );

        return div;
    }
};

class Grid extends React.Component
{
    constructor(props)
    {
        super(props);
    };

    componentDidMount()
    {
    };

    render()
    {
        var canvas = React.createElement(Canvas, null, null);
        
        return canvas;
    };
};

ReactDOM.render(grid(Grid),
    document.getElementById('gameoflife')
  );
  