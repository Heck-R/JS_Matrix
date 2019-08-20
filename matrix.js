
/**
 * 
 * The Matrix class represents an "n" by "m" dimensional vector
 * 
 * Dependecies:
 * - misc.js
 * - vector.js
 * 
 */
class Matrix {

    /**
     * 
     * Creates a Matrix.
     * The arguments can be:
     * - Nothing: The Matrix will have 0 rows and 0 columns
     * - One Matrix: In this case this is a copy constructor
     * - One Vector, bool: The matrix will represent the Vector. if the bool argument is ommited or false the vector is treated as a row vector, if the bool === true the vector is treated as a column vector
     * - A series of Objectswhiches can define a Vector: Creates Vectors from the Objects, and then creates a Matrix of those Vectors
     * - An Array of the above: Works as the above
     * - A JSON string of the above works the same
     * - arguments[0] == 'init': arguments[1] an array where arguments[1][0] is the number of rows and the arguments[1][1] is the number of columns of this matrix (every dimension's vaule is arguments[2] or 0 if omitted)
     * - arguments[0] an integer: arguments[0] as the number of columns then one number parameter for every element. The given numbers will be the element values from left to right then from top to bottom (the rest will be == 0)
     * 
     */
    constructor(){
        
        this.innerRep;
        this.innerColNum;

        if(arguments.length === 0){
            this.constructorForEmpty();
        } else if( isNumber(arguments[0]) ){
            this.constructorForNumbers.apply(this, arguments);
        } else if(typeof arguments[0] === 'object'){
            if(Matrix.isMatrix(arguments[0]))
                this.constructorForCopy.apply(this, arguments);
            else if( Vector.isVector(arguments[0]) && (arguments.length == 1 || (arguments.length == 2 && typeof arguments[1] == 'boolean') ) ){
                this.constructorForObjects(arguments[0]);
                if(arguments.length == 2 && arguments[1] === true)
                    this.transpose();
            }else if(Array.isArray(arguments[0]) && !isNumber(arguments[0][0])){
                this.constructorForObjects.apply(this, arguments[0]);
            } else
                this.constructorForObjects.apply(this, arguments);
        } else if(typeof arguments[0] === 'string'){
            if(arguments[0] === 'init')
                this.constructorForInit.apply(this, arguments);
            else
                this.constructorForObjects(JSON.parse(arguments[0]));
        } else{
            throw "Wrong argument(s)";
        }

    }

    /**
     * 
     * Helper for the constructor (not for outer useage)
     * Constructor: Empty
     * 
     */
    constructorForEmpty(){
        this.innerRep = [];
        this.innerColNum = 0;
    }

    /**
     * 
     * Helper for the constructor (not for outer useage)
     * Constructor: Copy
     * 
     * @param {Matrix} matrix 
     */
    constructorForCopy(matrix){
        this.innerRep = [];
        this.innerColNum = matrix.colNum;
        for(let row = 0; row < matrix.rowNum; row++){
            this.innerRep.push([]);
            for(let col = 0; col < matrix.colNum; col++){
                this.innerRep[row].push(matrix.getElement(row, col));
            }
        }
    }

    /**
     * 
     * Helper for the constructor (not for outer useage)
     * Constructor: Object
     * 
     * @param {...Object} objectArr 
     */
    constructorForObjects(...objectArr){
        this.innerRep = [];
        for(let row = 0; row < objectArr.length; row++){
            this.innerRep.push([]);
            let copyVector = Vector.vectorify(objectArr[row]);
            if(this.innerColNum == undefined || this.innerColNum < copyVector.dimensions)
                this.innerColNum = copyVector.dimensions;
            for(let col = 0; col < copyVector.dimensions; col++){
                this.innerRep[row].push(copyVector.getDimension(col));
            }
        }
        this.expandCols(this.innerColNum);
    }

    /**
     * 
     * Helper for the constructor (not for outer useage)
     * Constructor: Init
     * 
     * @param {Array} size 
     * @param {float} defaultValue 
     */
    constructorForInit(size, defaultValue = 0){
        this.innerRep = [];
        this.innerColNum = size[1];
        for(let row = 0; row < size[0]; row++){
            this.innerRep.push([]);
            for(let col = 0; col < size[1]; col++){
                this.innerRep[row].push(defaultValue);
            }
        }
    }

    /**
     * 
     * Helper for the constructor (not for outer useage)
     * Constructor: Numbers
     * 
     * @param {int} columns 
     * @param {...float} elementArr 
     */
    constructorForNumbers(columns, ...elementArr){
        this.innerRep = [];
        this.innerColNum = columns;
        let row = -1;
        let col;
        for(let element = 0; element < elementArr.length; element++){
            col = element % columns;
            if(col == 0){
                this.innerRep.push([]);
                row++;
            }
            this.innerRep[row].push(elementArr[element]);
        }
        while(col < columns){
            col++;
            this.innerRep[row].push(0);
        }
    }

    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * 
     * Returns it's size as an object
     * It's y property is the number of rows and the x is the number of columns this matrix has
     * 
     */
    get size(){
        return {
            y: this.rowNum,
            x: this.colNum
        };
    }

    /**
     * 
     * Returns it's size as a Vector
     * It's y property is the number of rows and the x is the number of columns this matrix has
     * 
     */
    get sizeAsVec(){
        return new Vector(this.colNum, this.rowNum);
    }

    /**
     * 
     * Returns it's size as an Array
     * The first number is the number of columns and the second is the number of rows this matrix has
     * 
     */
    get sizeAsArr(){
        return [
            this.colNum,
            this.rowNum
        ];
    }

    /**
     * 
     * Extends or shrinks the matrix to possess the given number of rows and columns
     * 
     * @param {Vectorify-able} size 
     */
    set size(size){
        let sizeVec = Vector.vectorify(size);
        this.rowNum = sizeVec.y;
        this.colNum = sizeVec.x;
    }

    /**
     * 
     * Extends or shrinks the matrix to possess the given number of rows and columns
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Vectorify-able} size 
     */
    setSize(size){
        this.size = size;
        return this;
    }

    /**
     * 
     * Returns whether or not this matrix is a square matrix
     * 
     */
    get isSquareMatrix(){
        return this.rowNum == this.colNum;
    }

    /**
     * 
     * Returns the number of rows this matrix has
     * 
     */
    get rowNum(){
        return this.innerRep.length;
    }

    /**
     * 
     * Extends or shrinks the matrix to possess the given number of rows
     * 
     * @param {int} rowNum 
     */
    set rowNum(rowNum){
        if(this.rowNum < rowNum)
            this.expandRows(rowNum);
        else if(rowNum < this.rowNum)
            this.shrinkRows(rowNum);
    }

    /**
     * 
     * Extends or shrinks the matrix to possess the given number of rows
     * 
     * Returns itself so the function is chainable
     * 
     * @param {int} rowNum 
     */
    setRowNum(rowNum){
        this.rowNum = rowNum;
        return this;
    }

    /**
     * 
     * Returns the number of columns this matrix has
     * 
     */
    get colNum(){
        return this.innerColNum;
    }

    /**
     * 
     * Extends or shrinks the matrix to possess the given number of columns
     * 
     * @param {int} colNum 
     */
    set colNum(colNum){
        if(this.colNum < colNum)
            this.expandCols(colNum);
        else if(colNum < this.colNum)
            this.shrinkCols(colNum);
    }

    /**
     * 
     * Extends or shrinks the matrix to possess the given number of columns
     * 
     * Returns itself so the function is chainable
     * 
     * @param {int} colNum 
     */
    setColNum(colNum){
        this.colNum = colNum;
        return this;
    }

    /**
     * 
     * Returns a copy of the desired row as a Vector
     * 
     * @param {int} row 
     */
    getRowVector(row){
        return new Vector(this.getRowVectorAsArray(row));
    }

    /**
     * 
     * Returns a copy of the desired row as an Array
     * 
     * @param {int} row 
     */
    getRowVectorAsArray(row){
        if(this.hasRow(row))
            return this.innerRep[row].slice();
        else
            return createArray(this.colNum, Number);
    }

    /**
     * 
     * Changes the given row to the copy of the given vector
     * - If the given vector is too short it will be filled with 0s
     * - If the given vector is too long, the matrix will be expanded to that size
     * 
     * @param {int} rowNum 
     * @param {Vectorify-able} rowVec 
     */
    setRowVector(rowNum, rowVec){
        let newRowVec = new Vector(rowVec);

        for(let col = 0; col < newRowVec.dimensions; col++)
            this.setElement(rowNum, col, newRowVec.getDimension(col));
        for(let col = newRowVec.dimensions; col < this.rowNum; col++)
            this.setElement(rowNum, col, 0);
    }

    /**
     * 
     * Returns a copy of the desired column as a Vector
     * 
     * @param {int} column 
     */
    getColVector(column){
        return new Vector(this.getColVectorAsArray(column));
    }

    /**
     * 
     * Returns a copy of the desired column as an Array
     * 
     * @param {int} column 
     */
    getColVectorAsArray(column){
        if(this.hasCol(column)){
            let res = [];
            for(let row = 0; row < this.rowNum; row++){
                res.push(this.innerRep[row][column]);
            }
            return res;
        } else
            return createArray(this.rowNum, Number);
    }

    /**
     * 
     * Changes the given column to the copy of the given vector
     * - If the given vector is too short it will be filled with 0s
     * - If the given vector is too long, the matrix will be expanded to that size
     * 
     * @param {int} colNum 
     * @param {Vectorify-able} colVec 
     */
    setColVector(colNum, colVec){
        let newColVec = new Vector(colVec);

        for(let row = 0; row < newColVec.dimensions; row++)
            this.setElement(row, colNum, newColVec.getDimension(row));
        for(let row = newColVec.dimensions; row < this.rowNum; row++)
            this.setElement(row, colNum, 0);
    }

    /**
     * 
     * Returns a given element (counts from 0,0)
     * If the parameters are greater then this matrix's sizes or less then 0 then this returns 0
     * 
     * @param {int} row
     * @param {int} column 
     */
    getElement(row, column){
        if(this.hasElement(row, column))
            return this.innerRep[row][column];
        else
            return 0;
    }

    /**
     * 
     * Sets the given element to the given value
     * Extends this matrix if it has to.
     * 
     * @param {int} row
     * @param {int} column 
     * @param {float} value 
     */
    setElement(row, column, value){
        if(!this.hasRow(row))
            this.expandRows(row);
        if(!this.hasCol(column))
            this.expandCols(column);
        this.innerRep[row][column] = parseInt(value);
    }

    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Adds the minimum number of rows and coulumns to the matrix so there wouldn't be less then the given amount
     * 
     * @param {*} rows 
     * @param {*} columns 
     */
    expand(rows, columns){
        this.expandRows(rows);
        this.expandCols(columns);
    }

    /**
     * 
     * Removes the minimum number of rows and coulumns from the matrix so there wouldn't be more then the given amount
     * 
     * @param {*} rows 
     * @param {*} columns 
     */
    shrink(rows, columns){
        this.shrinkRows(rows);
        this.shrinkCols(columns);
    }

    /**
     * 
     * Adds the minimum number of rows to the matrix so there wouldn't be less then the given amount
     * 
     * @param {*} rows 
     */
    expandRows(rows){
        while(this.rowNum < rows){
            this.innerRep.push(createArray(this.colNum, Number));
        }
    }

    /**
     * 
     * Removes the minimum number of rows from the matrix so there wouldn't be more then the given amount
     * 
     * @param {*} rows 
     */
    shrinkRows(rows){
        while(rows < this.rowNum){
            this.innerRep.pop();
        }
    }

    /**
     * 
     * Adds the minimum number of coulumns to the matrix so there wouldn't be less then the given amount
     * 
     * @param {*} columns 
     */
    expandCols(columns){
        for(let row = 0; row < this.rowNum; row++){
            while(this.innerRep[row].length < columns){
                this.innerRep[row].push(0);
            }
        }
        this.innerColNum = columns;
    }

    /**
     * 
     * Removes the minimum number of coulumns from the matrix so there wouldn't be more then the given amount
     * 
     * @param {*} columns 
     */
    shrinkCols(columns){
        for(let row = 0; row < this.rowNum; row++){
            while(columns < this.innerRep[row].length){
                this.innerRep[row].pop();
            }
        }
        this.innerColNum = columns;
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Inserts a new row and column filled with the given value
     * 
     * Returns itself so the function is chainable
     * 
     * @param {int} row 
     * @param {int} column 
     * @param {float} value 0 by default
     * @param {int} rowCount 1 by default
     * @param {int} columnCount 1 by default
     */
    insert(row, column, value = 0, rowCount = 1, columnCount = 1){
        for(let i = 0; i < rowCount; i++)
            this.insertRow(row, value);
        for(let i = 0; i < columnCount; i++)
            this.insertCol(column, value);

        return this;
    }

    /**
     * 
     * Removes the given rows and columns
     * 
     * Returns itself so the function is chainable
     * 
     * @param {int} row 
     * @param {int} column 
     * @param {int} rowCount 1 by default
     * @param {int} columnCount 1 by default
     */
    remove(row, column, rowCount = 1, columnCount = 1){
        this.removeRow(row, rowCount);
        this.removeCol(column, columnCount);

        return this;
    }

    /**
     * 
     * Follows the rules of Array.splice, except it returns the removed elements as a marix
     * 
     * Returns the removed elements as a matrix
     * 
     * @param {int} start 
     * @param {int} removeCount 
     * @param {(...Vectory-able|float)} newRows 
     */
    spliceRows(start, removeCount = this.rowNum - start, ...newRows){

        let removed = [];
        for(let i = 0; i < removeCount; i++){
            removed.push(this.innerRep[start]);
            this.removeRow(start);
        }
        
        for(let i = 0; i < newRows.length; i++){
            this.insertRow(start + i, newRows[i]);
        }
        return new Matrix(removed);

    }

    /**
     * 
     * Inserts a new row filled with the given value (0 by default)
     * 
     * Returns itself so the function is chainable
     * 
     * @param {int} row 
     * @param {Vectorify-able|float} value 
     */
    insertRow(row, value){
        let newRow;
        if(isNumber(value))
            newRow = new Vector('init', this.colNum, value).toArray();
        else{
            newRow = Vector.vectorify(value).promote(this.colNum).toArray();
            this.expandCols(newRow.length);
        }

        this.innerRep.splice(row, 0, newRow);
        
        return this;
    }

    /**
     * 
     * Removes the given rows
     * 
     * Returns itself so the function is chainable
     * 
     * @param {int} row 
     * @param {int} rowCount 1 by default
     */
    removeRow(row, rowCount = 1){
        this.innerRep.splice(row, rowCount);
        return this;
    }

    /**
     * 
     * Follows the rules of Array.splice, except it returns the removed elements as a marix
     * 
     * Returns the removed elements as a matrix
     * 
     * @param {int} start 
     * @param {int} removeCount 
     * @param {(...Vectory-able|float)} newCols 
     */
    spliceCols(start, removeCount = this.rowNum - start, ...newCols){

        let removed = [];
        for(let i = 0; i < removeCount; i++){
            removed.push(this.getColVectorAsArray(start));
            this.removeCol(start);
        }
        
        for(let i = 0; i < newCols.length; i++){
            this.insertCol(start + i, newCols[i]);
        }
        return new Matrix(removed);

    }

    /**
     * 
     * Inserts a new column filled with the given value (0 by default)
     * 
     * Returns itself so the function is chainable
     * 
     * @param {int} column 
     * @param {Vectorify-able|float} value 
     */
    insertCol(column, value){
        let newCol;
        if(isNumber(value))
            newCol = new Vector('init', this.rowNum, value).toArray();
        else{
            newCol = Vector.vectorify(value).promote(this.rowNum).toArray();
            this.expandRows(newCol.length);
        }

        for(let row = 0; row < this.rowNum; row++)
            this.innerRep[row].splice(column, 0, newCol[row]);

        return this;
    }

    /**
     * 
     * Removes the given columns
     * 
     * Returns itself so the function is chainable
     * 
     * @param {int} column 
     * @param {int} columnCount 1 by default
     */
    removeCol(column, columnCount = 1){
        let removedArr;
        for(let row = 0; row < this.rowNum; row++)
            removedArr = this.innerRep[row].splice(mathMod(column, this.colNum), columnCount);

        this.innerColNum -= removedArr.length;

        return this;
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * 
     * Changes this to the copy of this matrix's given submatrix (follows the rules of the Array.slice function)
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Vectorify-able} start 
     * @param {Vectorify-able} end 
     */
    subMatrix(start = new Vector(0,0), end = this.sizeAsVec){
        this.innerRep = this.toArray(start, end);
        this.innerColNum = end.x - start.x;
        return this;
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Negates its elements' values.
     * 
     */
    negate(){
        this.map(element => -element);
        return this;
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Adds the given parameter to this.
     * 
     * If the arguments are a(n):
     * - Matrix: Adds the given matrix's elements to this matrix's elements one by one. Extends this matrix if it has to.
     * - Object: Attemps to convert it to a Matrix then proceeds as it was one.
     * - Vectorify-able, int, bool: Adds the given vector's coordinates to this matrix's "num"th row or column one by one (row by default, and column if the 3rd parameter === true). Extends the matrix if it has to.
     * - Number: The number will be added to the matrix's every element.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Matrix|Vector|Object|float} addition 
     * @param {int} num 
     * @param {bool} isColVector 
     */
    add(addition, num, isColVector){
        
        if(isNumber(addition)){
            this.map(element => element + addition);
        } else if(arguments.length > 1){
            this.addVec(Vector.vectorify(addition, num, isColVector));
        } else if(typeof addition == 'object'){
            let realMat = Matrix.matrixify(addition);
            this.expand(realMat.rowNum, realMat.colNum);
            this.map((element, rowInd, colInd) => element + matrix.getElement(rowInd, colInd));
        } else{
            throw "Wrong arguments";
        }

        return this;

    }

    /**
     * 
     * Adds the given vector's coordinates to this matrix one by one.
     * Extends this matrix if it has to.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Vector} vector 
     * @param {int} num Which row / col
     * @param {bool} isColVector 
     */
    addVec(vector, num, isColVector){

        if(isColVector === true)
            this.addColVec(vector, num);
        else
            this.addRowVec(vector, num);

        return this;

    }

    /**
     * 
     * Adds the given vector's coordinates to this matrix's given row one by one.
     * Extends this matrix if it has to.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Vector} vector 
     * @param {int} row 
     */
    addRowVec(vector, row){

        for(let col = 0; col < vector.dimensions; col++)
            this.setElement(row, col, this.getElement(row, col) + vector.getDimension(col) );

        return this;

    }

    /**
     * 
     * Adds the given vector's coordinates to this matrix's given column one by one.
     * Extends this matrix if it has to.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Vector} vector 
     * @param {int} column 
     */
    addColVec(vector, column){

        for(let row = 0; row < vector.dimensions; row++)
            this.setElement(row, column, this.getElement(row, column) + vector.getDimension(row) );

        return this;

    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Subs the given parameter from this.
     * 
     * If the arguments are a(n):
     * - Matrix: Subs the given matrix's elements from this matrix's elements one by one. Extends this matrix if it has to.
     * - Object: Attemps to convert it to a Matrix then proceeds as it was one.
     * - Vectorify-able, int, bool: Subs the given vector's coordinates from this matrix's "num"th row or column one by one (row by default, and column if the 3rd parameter === true). Extends the matrix if it has to.
     * - Number: The number will be subbed from the matrix's every element.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Matrix|Vector|Object|float} substraction 
     * @param {int} num 
     * @param {bool} isColVector 
     */
    sub(substraction, num, isColVector){
        
        if(isNumber(substraction)){
            this.subNum(substraction);
        } else if(arguments.length > 1){
            this.subVec(Vector.vectorify(substraction, num, isColVector));
        } else if(typeof substraction == 'object'){
            this.subMat(Matrix.matrixify(substraction));
        } else{
            throw "Wrong arguments";
        }

        return this;

    }

    /**
     * 
     * The number will be subbed from the matrix's every element.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {float} number 
     */
    subNum(number){
        this.map(element => element - number);
        return this;
    }

    /**
     * 
     * Subs the given matrix's elements from this matrix's elements one by one.
     * Extends this matrix if it has to.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Matrix} matrix 
     */
    subMat(matrix){

        for(let row = 0; row < matrix.rowNum; row++)
            for(let col = 0; col < matrix.colNum; col++)
                this.setElement(row, col, this.getElement(row, col) - matrix.getElement(row, col) );

        return this;

    }

    /**
     * 
     * Subs the given vector's coordinates from this matrix's "num"th row or column one by one (row by default, and column if the 3rd parameter === true).
     * Extends the matrix if it has to.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Vector} vector 
     * @param {int} num 
     * @param {bool} isColVector 
     */
    subVec(vector, num, isColVector){

        if(isColVector === true)
            this.subColVec(vector, num);
        else
            this.subRowVec(vector, num);

        return this;

    }

    /**
     * 
     * Adds the given vector's coordinates to this matrix's given row one by one.
     * Extends this matrix if it has to.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Vector} vector 
     * @param {int} row 
     */
    subRowVec(vector, row){

        for(let col = 0; col < vector.dimensions; col++)
            this.setElement(row, col, this.getElement(row, col) - vector.getDimension(col) );

        return this;

    }

    /**
     * 
     * Adds the given vector's coordinates to this matrix's given column one by one.
     * Extends this matrix if it has to.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Vector} vector 
     * @param {int} column 
     */
    subColVec(vector, column){

        for(let row = 0; row < vector.dimensions; row++)
            this.setElement(row, column, this.getElement(row, column) - vector.getDimension(row) );

        return this;

    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Multiplies this with the given parameter.
     * 
     * If the argument is a(n):
     * - Matrix: Returns the cross product of this and the k vectors in order. In case of k vector, the result will be k+2 dimensional and the calculation uses k+2 dimensions from all of them. The cross product is NOT commutative, thus the order of the vectors count.
     * - k Vector|Object: Attemps to convert the Objects to Vectors then proceeds as they were one.
     * - Number: Every dimension will be multiplied with the given number.
     * 
     * Returns itself so the function is chainable
     * 
     * @param {Matrixify-able|float} multiplier 
     * @param {bool} fromLeft 
     */
    mul(multiplier, fromLeft = false){

        if(isNumber(multiplier))
            this.mulNum(multiplier);
        else if(typeof multiplier == 'object'){
            mulMat(Matrix.matrixify(multiplier), fromLeft);
        } else
            throw 'Wrong arguments';

        return this;
    }

    mulMat(matrix, fromLeft = false){
        if(fromLeft)
            mulLeftMat(matrix);
        else
            mulRightMat(matrix);

        return this;
    }

    mulRightMat(matrix){
        this.constructorForCopy( Matrix.mul(this, matrix) );
        return this;
    }

    mulLeftMat(matrix){
        this.constructorForCopy( Matrix.mul(matrix, this) );
        return this;
    }

    mulNum(number){
        this.map(element => element * number);
        return this;
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Div function for every element one by one
     * 
     * Returns itself so the function is chainable
     * 
     * @param {float} divisional 
     */
    div(divisional){
        this.map(element => element / divisional);
        return this;
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Modulo function for every element one by one
     * 
     * Returns itself so the function is chainable
     * 
     * @param {int} mod 
     */
    mod(modulo){
        this.map(element => mathMod(element, modulo));
        return this;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Returns true if the matrix is seemingly identical in every element
     * 
     * @param {Matrixify-able} matrix
     */
    equals(matrix){
        let mat = Matrix.Matrixify(matrix);
        let size = Matrix.maxSize(this, mat);
        for(let y = 0; y < size.y; y++)
            for(let x = 0; x < size.x; x++)
                if(this.getElement(y,x) != mat.getElement(y,x))
                    return false;
        
        return true;
    }
    
    /**
     * 
     * Returns true if the given matrix has the same size "by nature" and are seemingly identical in every element
     * 
     * @param {Matrixify-able} matrix
     */
    equalsExactly(matrix){
        let mat = Matrix.matrixify(matrix);
        return this.size.x == mat.size.x && this.size.y == mat.size.y && this.equals(vec);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Transposes the matrix
     * 
     * Returns itself so the function is chainable
     * 
     */
    transpose(){/////////////////////////////////////////////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        let prevInnerRep = this.innerRep;
        this.innerRep = createArray(this.colNum, this.rowNum, Number);
        this.map(function(element, row, col) {
            return prevInnerRep[col][row];
        });

        return this;
    }

    /**
     * 
     * Removes the minimum amount of elements to become a square matrix
     * 
     * Returns itself so the function is chainable
     * 
     */
    squarify(){
        let size = Math.min(this.rowNum, this.colNum);
        this.shrink(size, size);

        return this;
    }

    /**
     * 
     * Adds the minimum amount of elements to become a square matrix
     * 
     * Returns itself so the function is chainable
     * 
     */
    squarifyUp(){
        let size = Math.max(this.rowNum, this.colNum);
        this.expand(size, size);

        return this;
    }

    /**
     * 
     * Returns the determinant of this matrix
     * If this matrix is not a square matrix, it's biggest top most square part of it will be used instead.
     * 
     */
    determinant(){
        return Matrix.determinant(this);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    hasRow(row){
        return !isNaN(row) && 0 <= row && row < this.rowNum;
    }

    hasCol(column){
        return !isNaN(column) && 0 <= column && column < this.colNum;
    }

    hasElement(row, column){
        return this.hasRow(row) && this.hasCol(column);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Returns the copy of this matrix's given submatrix (follows the rules of the Array.slice function)
     * If the parameters are ommited, the copy of the whole vector will be returned
     * 
     * @param {Vectorify-able} start 
     * @param {Vectorify-able} end 
     */
    getSubMatrix(start = new Vector(0,0), end = this.sizeAsVec){
        return new Matrix(this.toArray(start, end));
    }

    /**
     * 
     * Returns the array representation of this matrix's given submatrix (follows the rules of the Array.slice function)
     * If the parameters are ommited, the whole vector will be converted
     * 
     * @param {Vectorify-able} start 
     * @param {Vectorify-able} end 
     */
    toArray(start = new Vector(0,0), end = this.sizeAsVec){
        let realStart = Vector.vectorify(start);
        let realEnd = Vector.vectorify(end);

        let res = this.innerRep.slice(realStart.y, realEnd.y);
        for(let row = 0; row < res.length; row++){
            res[row] = res[row].slice(realStart.x, realEnd.x);
        }

        return res;
    }

    /**
     * 
     * Returns the string representation of this matrix
     * 
     */
    toString(){
        return JSON.stringify(this.toArray());
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Applyes the "func" function to every element one by one.
     * The "func" function's arguments are:
     * - current element
     * - the row index of the element
     * - the col index of the element
     * 
     * The "func" function's "this" will be the thisArg argument
     * 
     * If the "func" function has no return value / would return undefined, the element will remain unchanged
     * 
     * @param {Function} func 
     * @param {Array} thisArg null by default
     */
    map(func, thisArg = null){

        for(let row = 0; row < this.rowNum; row++)
            for(let col = 0; col < this.colNum; col++){
                let val = func.apply(thisArg, [this.innerRep[row][col], row, col]);
                if(val !== undefined)
                    this.innerRep[row][col] = val;
            }

        return this;

    }

    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    /**
     * 
     * Returns a copy of the given argument's matrix representation without the removed row and column
     * 
     * @param {Matrixify-able} matrix 
     * @param {int} row 
     * @param {int} column 
     * @param {int} rowCount 1 by default
     * @param {int} columnCount 1 by default
     */
    static remove(matrix, row, column, rowCount = 1, columnCount = 1){
        let newMatrix = new Matrix(matrix);
        newMatrix.removeRow(row, rowCount);
        newMatrix.removeCol(column, columnCount);
        return newMatrix;
    }

    /**
     * 
     * Returns a copy of the given argument's matrix representation without the removed row
     * 
     * @param {Matrixify-able} matrix 
     * @param {int} row 
     * @param {int} rowCount 1 by default
     */
    static removeRow(matrix, row, rowCount = 1){
        let newMatrix = new Matrix(matrix);
        newMatrix.removeRow(row, rowCount);
        return newMatrix;
    }

    /**
     * 
     * Returns a copy of the given argument's matrix representation without the removed column
     * 
     * @param {Matrixify-able} matrix 
     * @param {int} column 
     * @param {int} columnCount 1 by default
     */
    static removeCol(matrix, column, columnCount = 1){
        let newMatrix = new Matrix(matrix);
        newMatrix.removeCol(column, columnCount);
        return newMatrix;
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Returns the copy of the argument's negated Matrix representations if there is such
     * 
     * @param {Matrixify-able} matrix 
     */
    static negate(matrix){
        return new Matrix(matrix).negate();
    }

    /**
     * 
     * Returns the copy of the sum of the two arguments' Matrix representations if there is such
     * 
     * @param {Matrixify-able} matrix1 
     * @param {Matrixify-able|float} matrix2 
     */
    static add(matrix1, matrix2){
        return new Matrix(matrix1).add(Matrix.weakMatrixify(matrix2));
    }

    /**
     * 
     * Returns the copy of the difference of the two arguments' Matrix representations if there is such
     * 
     * @param {Matrixify-able} matrix1 
     * @param {Matrixify-able|float} matrix2 
     */
    static sub(matrix1, matrix2){
        return new Matrix(matrix1).sub(Matrix.weakMatrixify(matrix2));
    }

    /**
     * 
     * Returns the copy of the product of the two arguments' Matrix representations if there is such
     * 
     * @param {Matrixify-able} matrix1 
     * @param {Matrixify-able} matrix2 
     */
    static mul(matrix1, matrix2){
        let realMatrix1 = Matrix.matrixify(matrix1);
        let realMatrix2 = Matrix.matrixify(matrix2);
        let res = new Matrix('init', [realMatrix1.rowNum, realMatrix2.colNum]);

        let rowVecs = [];
        let colVecs = [];

        for(let row = 0; row < realMatrix1.rowNum; row++)
            rowVecs.push(realMatrix1.getRowVector(row));
        for(let col = 0; col < realMatrix1.colNum; col++)
            colVecs.push(realMatrix2.getColVector(col));

        for(let row = 0; row < realMatrix1.rowNum; row++){
            for(let col = 0; col < realMatrix2.colNum; col++){
                res.setElement(row, col, Vector.mulScal(rowVecs[row], colVecs[col]) );
            }
        }

        return res;
    }

    /**
     * 
     * Returns the copy of the divided value of the first argument's Matrix representation if there is such
     * 
     * @param {Matrixify-able} matrix 
     * @param {float} divisional 
     */
    static div(matrix, divisional){
        return new Matrix(matrix).div(divisional);
    }

    /**
     * 
     * Returns copy of the the mod value of the first the argument's Matrix representation if there is such
     * 
     * @param {Matrixify-able} matrix 
     * @param {int} mod 
     */
    static mod(matrix, mod){
        return new Matrix(matrix).mod(mod);
    }

    /**
     * 
     * Returns the copy of the transposed value of the argument's Matrix representation if there is such
     * 
     * @param {Matrixify-able} matrix 
     */
    static transpose(matrix){
        return new Matrix(matrix).transpose();
    }

    /**
     * 
     * Returns a copy of the matrix where the minimum amount of elements have been removed to become a square matrix
     * 
      * @param {Matrixify-able} matrix 
     */
    static squarify(matrix){
        return new Matrix(matrix).squarify();
    }

    /**
     * 
     * If the matrix is not a square matrix, this returns a copy of the matrix where the minimum amount of elements have been removed to become a square matrix.
     * Otherwise this returns the copy of the matrix
     * 
      * @param {Matrixify-able} matrix 
     */
    static weakSquarify(matrix){
        if(Matrix.isMatrix(matrix) && matrix.isSquareMatrix())
            return matrix;
        else
            return new Matrix(matrix).squarify();
    }

    /**
     * 
     * Returns a copy of the matrix where the minimum amount of elements have been added to become a square matrix
     * 
      * @param {Matrixify-able} matrix 
     */
    static squarifyUp(matrix){
        return new Matrix(matrix).squarifyUp();
    }

    /**
     * 
     * If the matrix is not a square matrix, this returns a copy of the matrix where the minimum amount of elements have been added to become a square matrix.
     * Otherwise this returns the copy of the matrix
     * 
      * @param {Matrixify-able} matrix 
     */
    static weakSquarifyUp(matrix){
        if(Matrix.isMatrix(matrix) && matrix.isSquareMatrix())
            return matrix;
        else
            return new Matrix(matrix).squarifyUp();
    }

    /**
     * 
     * Returns the determinant of the given parameter's matrix representation if there is such.
     * If the matrix is not a square matrix, it's biggest top most square part of it will be used instead.
     * 
      * @param {Matrixify-able} matrix 
     */
    static determinant(matrix){
        let workingMatrix = Matrix.squarify(matrix);

        if(workingMatrix.rowNum == 1)
            return workingMatrix.getElement(0, 0);

        let res = 0;
        for(let col = 0; col < workingMatrix.colNum; col++){
            res += Math.pow(-1, col) * workingMatrix.getElement(0,col) * Matrix.determinant( Matrix.remove(workingMatrix, 0, col) );
        }

        return res;
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * If the parameter is a(n)
     * - Matrix: Returns it's reference
     * - Vector, bool: Converts the Vector to a Matrix. Treats the Vector as a row vector by default, and a column vector if isColVector === true
     * - Object: Attemps to convert it to a Matrix
     * - else: Throws an error
     * 
     * @param {Matrix|Vector|Object} matrixCandidate 
     * @param {bool} isColVector 
     */
    static matrixify(matrixCandidate, isColVector = false){
        if(Matrix.isMatrix(matrixCandidate)){
            return matrixCandidate;
        } else if(Vector.isVector(matrixCandidate))
            return new Matrix(matrixCandidate, isColVector);
        else if(typeof matrixCandidate == 'object')
            return new Matrix(matrixCandidate);
        else
            throw 'Wrong argument';
    }

    /**
     * 
     * If the parameter is a(n)
     * - Matrix: Returns it's reference
     * - Vector, bool: Converts the Vector to a Matrix. Treats the Vector as a row vector by default, and a column vector if isColVector === true
     * - Object: Attemps to convert it to a Matrix
     * - else: Returns it's reference
     * 
     * @param {*} matrixCandidate 
     */
    static weakMatrixify(matrixCandidate, isColVector = false){
        try{
            return Matrix.matrixify(matrixCandidate, isColVector);
        } catch(err){
            return matrixCandidate;
        }
    }

    /**
     * 
     * Returns if the parameter is an instance of Vector
     * 
     * @param {*} matrixCandidate 
     */
    static isMatrix(matrixCandidate){
        return matrixCandidate != undefined && matrixCandidate.constructor.name === 'Matrix';
    }

    /**
     * 
     * Returns the copy of matrix.map(func, args)
     * 
     * @param {Vector} matrix 
     * @param {Function} func 
     * @param {Array} thisArg null by default
     */
    static map(matrix, func, thisArg){
        return new Matrix(matrix).map(func, thisArg);
    }
    
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * 
     * Returns the smallest size that every given Matrix can fit in as a Vector
     * 
     * @param  {...Vector|Vector[]} args 
     */
    static maxSize(...args){
        
        if(args.length == 0)
            throw "Wrong arguments";
    
        if(Array.isArray(arguments[0])){
            return Matrix.maxSize.apply(null, arguments[0]);
        } else{
            let res = new Vector(Infinity, Infinity);

            for(let i = 0; i < args.length; i++){
                if(args[i].rowNum > res.y)
                    res.y = args[i].rowNum;
                if(args[i].colNum > res.x)
                    res.x = args[i].colNum;
            }

            return res;
        }

    }

    /**
     * 
     * Returns the smallest size that every given Matrix has as a part as a Vector
     * 
     * @param  {...Vector|Vector[]} args 
     */
    static minSize(...args){
        
        if(args.length == 0)
            throw "Wrong arguments";
    
        if(Array.isArray(arguments[0])){
            return Matrix.maxSize.apply(null, arguments[0]);
        } else{
            let res = new Vector(Infinity, Infinity);

            for(let i = 0; i < args.length; i++){
                if(args[i].rowNum < res.y)
                    res.y = args[i].rowNum;
                if(args[i].colNum < res.x)
                    res.x = args[i].colNum;
            }

            return res;
        }

    }

}