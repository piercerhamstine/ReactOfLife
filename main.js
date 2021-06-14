const grid = React.createElement;

class Canvas extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            canvasRef: React.createRef(),
            divRef: React.createRef(),
            stopBtnRef: React.createRef(),
            generateBtnRef: React.createRef(),
            sliderRef: React.createRef(),
            stepForwardBtnRef: React.createRef(),
            clearBtnRef: React.createRef(),
            deadColorRef: React.createRef(),
            aliveColorRef: React.createRef(),

            canvasWidth: "800",
            canvasHeight: "600",
            bgColor: "#433991",

            gridWidth: 72,
            gridHeight: 54,
            cellSize: 10,
            cellStates: [],
            bufferStates: [],
            tickRate: 100,
            simActive: true,
            isDrawing: false,

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
        this.state.cellStates = this.CreateArray2D(this.state.gridWidth, this.state.gridHeight);
        this.state.bufferStates = this.CreateArray2D(this.state.gridWidth, this.state.gridHeight);

        this.InitGrid();

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
        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            for(var x = 0; x < this.state.gridWidth; ++x)
            {
                this.state.cellStates[y][x] = Math.round(Math.random(1));
            }
        }
    };

    CopyBuffer()
    {
        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            for(var x = 0; x < this.state.gridWidth; ++x)
            {
                this.state.cellStates[y][x] = this.state.bufferStates[y][x];
            }
        }
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

        this.CopyBuffer();

        this.DrawGrid();
    };

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

    render()
    {
        var div = React.createElement('div', {ref: this.state.divRef}, 
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
                style:{backgroundColor: this.state.bgColor},
            }, null),

            // Start/Stop button
            React.createElement('button', 
            {
                onClick: () => this.StartStop(),
                
                ref: this.state.stopBtnRef,
                style:
                {
                    id: 'startStop',
                    backgroundColor: "#000000",
                    color: "white",
                    cursor: "pointer",
                    padding: "10px 50px",
                    display: "inline-block",
                    textDecoration: "none",
                    border: "none"
                }
            }, "Stop"),

            // Generate new board button.
            React.createElement('button', 
            {
                onClick: () => this.RegenerateBoard(),
                
                ref: this.state.generateBtnRef,
                style:
                {
                    id: 'generate',
                    backgroundColor: "#000000",
                    color: "white",
                    cursor: "pointer",
                    padding: "10px 50px",
                    display: "inline-block",
                    textDecoration: "none",
                    border: "none"
                }
            }, "Generate"),

            // Clear current board button.
            React.createElement('button', 
            {
                onClick: () => this.ClearBoard(),
                
                ref: this.state.clearBtnRef,
                style:
                {
                    id: 'clear',
                    backgroundColor: "#000000",
                    color: "white",
                    cursor: "pointer",
                    padding: "10px 50px",
                    display: "inline-block",
                    textDecoration: "none",
                    border: "none"
                }
            }, "Clear"),

            // Step forward in simulation button
            React.createElement('button', 
            {
                onClick: () => this.TickOnce(),
                
                ref: this.state.stepForwardBtnRef,
                style:
                {
                    id: 'stepForward',
                    backgroundColor: "#000000",
                    color: "white",
                    cursor: "pointer",
                    padding: "10px 50px",
                    display: "inline-block",
                    textDecoration: "none",
                    border: "none"
                }
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
  