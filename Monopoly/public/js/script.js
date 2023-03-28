document.addEventListener("DOMContentLoaded", function(event) {
    const width = 10;
    const height = 10;
    const squares = [
        { type: 'go', color: '#fff', name: 'GO' },
        { type: 'property', color: '#a3f3c3', name: 'Mediterranean Avenue' },
        { type: 'community-chest', color: '#fff', name: 'Community Chest' },
        { type: 'property', color: '#a3f3c3', name: 'Baltic Avenue' },
        { type: 'tax', color: '#fff', name: 'Income Tax' },
        { type: 'railroad', color: '#fff', name: 'Reading Railroad' },
        { type: 'property', color: '#ffc107', name: 'Oriental Avenue' },
        { type: 'chance', color: '#fff', name: 'Chance' },
        { type: 'property', color: '#ffc107', name: 'Vermont Avenue' },
        { type: 'property', color: '#ffc107', name: 'Connecticut Avenue' },
        { type: 'jail', color: '#fff', name: 'Jail' },
        { type: 'property', color: '#ff5722', name: 'St. Charles Place' },
        { type: 'utility', color: '#fff', name: 'Electric Company' },
        { type: 'property', color: '#ff5722', name: 'States Avenue' },
        { type: 'property', color: '#ff5722', name: 'Virginia Avenue' },
        { type: 'railroad', color: '#fff', name: 'Pennsylvania Railroad' },
        { type: 'property', color: '#2196f3', name: 'St. James Place' },
        { type: 'community-chest', color: '#fff', name: 'Community Chest' },
        { type: 'property', color: '#2196f3', name: 'Tennessee Avenue' },
        { type: 'property', color: '#2196f3', name: 'New York Avenue' },
        { type: 'free-parking', color: '#fff', name: 'Free Parking' },
        { type: 'property', color: '#4caf50', name: 'Kentucky Avenue' },
        { type: 'chance', color: '#fff', name: 'Chance' },
        { type: 'property', color: '#4caf50', name: 'Indiana Avenue' },
        { type: 'property', color: '#4caf50', name: 'Illinois Avenue' },
        { type: 'railroad', color: '#fff', name: 'B. & O. Railroad' },
        { type: 'property', color: '#ffeb3b', name: 'Atlantic Avenue' },
        { type: 'property', color: '#ffeb3b', name: 'Ventnor Avenue' },
        { type: 'utility', color: '#fff', name: 'Water Works' },
        { type: 'property', color: '#ffeb3b', name: 'Marvin Gardens' },
        { type: 'go-to-jail', color: '#fff', name: 'Go to Jail' },
        { type: 'property', color: '#f44336', name: 'Pacific Avenue' },
        { type: 'property', color: '#f44336', name: 'North Carolina Avenue' },
        { type: 'community-chest', color: '#fff', name: 'Community Chest' },
        { type: 'property', color: '#f44336', name: 'Pennsylvania Avenue' },
        { type: 'railroad', color: '#fff', name: 'Short Line Railroad' },
        { type: 'chance', color: '#fff', name: 'Chance' },
        { type: 'property', color: '#9c27b0', name: 'Park Place' },
        { type: 'tax', color: '#fff', name: 'Luxury Tax' },
        { type: 'property', color: '#9c27b0', name: 'Boardwalk' }
    ];

    // function to create the squares
    function createSquare(square, x, y) {
        const newSquare = document.createElement('span');
        newSquare.classList.add('board__square');
        newSquare.classList.add(`board__square--${square.type}`);
        newSquare.style.backgroundColor = square.color;
        newSquare.style.gridColumn = `${y + 1}`;
        newSquare.style.gridRow = `${x + 1}`;
        return newSquare;
    }



    // create an array of squares elements
    const squareElements = [];
    let i = 0;
    for (let y = 0; y < width; y++) {
            const square = squares[i++];
            const newSquare = createSquare(square, 0, y);
            squareElements.push(newSquare);
    }
    for (let x = 1; x < height; x++) {
            const square = squares[i++];
            const newSquare = createSquare(square, x, width - 1);
            squareElements.push(newSquare);
    }
    for (let y = width-2; y >= 0; y--) {
            const square = squares[i++];
            const newSquare = createSquare(square, height-1, y);
            squareElements.push(newSquare);
    }
    for (let x = height-2; x >= 0; x--) {
        const square = squares[i++];
        const newSquare = createSquare(square, x, 0);
        squareElements.push(newSquare);
    }


    // add the squares to the board element
    const board = document.getElementById('game-board');
    squareElements.forEach((square) => {
        board.appendChild(square);
    });
});