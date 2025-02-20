import React, { useState } from "react";

import "./promotion-piece-selector.scss";
import { Piece } from "@/components/piece/piece";
import { PieceName, PromotionPieceName, PieceColor } from "../utils/chess";
import { Button } from "@/components/button/button";

export type PromotionPieceSelector = {
  onSelect?: (piece: PromotionPieceName) => void;
  pieceColor: PieceColor;
};

export const PromotionPieceSelector: React.FC<PromotionPieceSelector> = ({
  pieceColor,
  onSelect,
}) => {
  const [choice, setChoice] = useState(0);
  const promotionPieces: PromotionPieceName[] = [
    PieceName.QUEEN,
    PieceName.ROOK,
    PieceName.BISHOP,
    PieceName.KNIGHT,
  ];

  const selectPiece = () => {
    if (onSelect) {
      onSelect(promotionPieces[choice]);
    }
  };
  return (
    <div className="promotion-piece-selector">
      {promotionPieces.map((name, index) => (
        <div
          className={
            "promotion-piece-selector__option" +
            (choice === index
              ? " promotion-piece-selector__option--selected"
              : "")
          }
          onClick={() => {
            setChoice(index);
          }}
          key={name}
        >
          <Piece
            type={{
              color: pieceColor,
              name,
            }}
          />
        </div>
      ))}
      <div className="promotion-piece-selector__submit">
        <Button onClick={selectPiece}>Choose</Button>
      </div>
    </div>
  );
};
