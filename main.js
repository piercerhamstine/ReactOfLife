const grid = React.createElement;
let buffer = [];

class Canvas extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state =
        {
            canvasRef: React.createRef(),
            canvasWidth: "800",
            canvasHeight: "600",
            bgColor: "#433991",

            gridWidth: 72,
            gridHeight: 54,
            cellStates: [],
            bufferStates: []
        };
    };

    componentDidMount()
    {
        this.state.cellStates = this.CreateArray2D(this.state.gridWidth, this.state.gridHeight);
        buffer = this.CreateArray2D(this.state.gridWidth, this.state.gridHeight);
        this.InitGrid();

        this.DrawGrid();

        this.timerID = setInterval(() => this.tick(), 10);
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
                this.state.cellStates[y][x] = buffer[y][x];
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
        //var buffer = this.CreateArray2D(this.state.gridWidth, this.state.gridHeight);
        
        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            for(var x = 0; x < this.state.gridWidth; ++x)
            {
                var currState = this.state.cellStates[y][x];
                var neighbourCellCount = this.CheckNeighbourCells(x,y);

                if(currState == 0 && neighbourCellCount == 3)
                {
                    buffer[y][x] = 1;
                }
                else if(currState == 1 && (neighbourCellCount < 2 || neighbourCellCount > 3))
                {
                    buffer[y][x] = 0;
                }
                else
                {
                    buffer[y][x] = currState;
                }
            }
        }

        this.CopyBuffer();

        this.DrawGrid();
    };

    DrawGrid()
    {
        var ctx = this.state.canvasRef.current.getContext('2d');

        for(var y = 0; y < this.state.gridHeight; ++y)
        {
            for(var x = 0; x < this.state.gridWidth; ++x)
            {
                if(this.state.cellStates[y][x] == 1)
                {
                    ctx.fillStyle = "#000000";
                }
                else
                {
                    ctx.fillStyle = "#FFFFFF";
                };
        
                ctx.fillRect(x*11, y*11, 10, 10)
            }
        }
    };

    tick()
    {
        this.UpdateCells();
    };

    render()
    {
        var canv = React.createElement('canvas',
        {
            ref: this.state.canvasRef,
            id: "board",
            width: this.state.canvasWidth,
            height: this.state.canvasHeight,
            style:{backgroundColor: this.state.bgColor}
        }, null);

        return canv;
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
  