'use client';

import React, { useState, useEffect } from 'react';

type Cell = number | null;
type Board = Cell[][];

const createEmptyBoard = (): Board => Array(9).fill(null).map(() => Array(9).fill(null));

const SudokuGame = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [originalBoard, setOriginalBoard] = useState<Board>(createEmptyBoard());
  const [gameWon, setGameWon] = useState(false);

  const generatePuzzle = () => {
    const newBoard: Board = createEmptyBoard();
    fillDiagonalBoxes(newBoard);
    solveSudoku(newBoard);
    const puzzle = newBoard.map(row => [...row]);
    removeNumbers(puzzle);
    setBoard(puzzle);
    setOriginalBoard(puzzle.map(row => [...row]));
    setGameWon(false);
  };

  const fillDiagonalBoxes = (board: Board) => {
    for (let i = 0; i < 9; i += 3) {
      const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let index = 0;
      for (let row = i; row < i + 3; row++) {
        for (let col = i; col < i + 3; col++) {
          board[row][col] = numbers[index++];
        }
      }
    }
  };

  const shuffle = (array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const solveSudoku = (board: Board): boolean => {
    const empty = findEmptyCell(board);
    if (!empty) return true;

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
      if (isValidMove(board, row, col, num)) {
        board[row][col] = num;
        if (solveSudoku(board)) return true;
        board[row][col] = null;
      }
    }
    return false;
  };

  const findEmptyCell = (board: Board): [number, number] | null => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === null) return [row, col];
      }
    }
    return null;
  };

  const removeNumbers = (board: Board) => {
    let count = 0;
    while (count < 40) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (board[row]?.[col] !== null) {
        board[row][col] = null;
        count++;
      }
    }
  };

  const isValidMove = (board: Board, row: number, col: number, num: number): boolean => {
    for (let x = 0; x < 9; x++) {
      if (board[row]?.[x] === num) return false;
    }

    for (let x = 0; x < 9; x++) {
      if (board[x]?.[col] === num) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i]?.[boxCol + j] === num) return false;
      }
    }

    return true;
  };

  const handleCellInput = (row: number, col: number, value: string) => {
    if (originalBoard[row]?.[col] !== null) return;
    
    const num = value === '' ? null : parseInt(value);
    if (num !== null && (num < 1 || num > 9)) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    if (isBoardComplete(newBoard) && isBoardValid(newBoard)) {
      setGameWon(true);
    }
  };

  const isBoardComplete = (board: Board): boolean => {
    return board.every(row => row && row.every(cell => cell !== null));
  };

  const isBoardValid = (board: Board): boolean => {
    for (let i = 0; i < 9; i++) {
      if (!isValidUnit(board[i]) || 
          !isValidUnit(board.map(row => row[i])) || 
          !isValidBox(board, Math.floor(i / 3) * 3, (i % 3) * 3)) {
        return false;
      }
    }
    return true;
  };

  const isValidUnit = (unit: Cell[]): boolean => {
    if (!unit) return false;
    const numbers = unit.filter(cell => cell !== null);
    return new Set(numbers).size === numbers.length;
  };

  const isValidBox = (board: Board, startRow: number, startCol: number): boolean => {
    const numbers: number[] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = board[startRow + i]?.[startCol + j];
        if (cell !== null) numbers.push(cell);
      }
    }
    return new Set(numbers).size === numbers.length;
  };

  useEffect(() => {
    generatePuzzle();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="grid grid-cols-9 gap-0 border-2 border-gray-800">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <input
                        key={`${rowIndex}-${colIndex}`}
                        type="text"
                        maxLength={1}
                        value={cell || ''}
                        onChange={(e) => handleCellInput(rowIndex, colIndex, e.target.value)}
                        className={`
                          w-8 h-8 border text-center outline-none
                          ${(Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                          ${originalBoard[rowIndex]?.[colIndex] !== null ? 'font-bold' : 'text-blue-600'}
                          ${originalBoard[rowIndex]?.[colIndex] !== null ? 'cursor-not-allowed' : ''}
                        `}
                        disabled={originalBoard[rowIndex]?.[colIndex] !== null}
                      />
                    ))
                  )}
                </div>

                <button
                  className="w-full p-2 mt-4 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={generatePuzzle}
                >
                  New Game
                </button>

                {gameWon && (
                  <div className="text-center text-green-600 font-bold mt-4">
                    Congratulations! You have solved the puzzle!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SudokuGame;