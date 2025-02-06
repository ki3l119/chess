import React, { useEffect, useRef } from "react";
import "./piece.scss";

import { PieceType } from "@/pages/game/utils/chess";

export type PieceProps = {
  type: PieceType;
  /**
   * Wether the piece can be dragged.
   */
  movable?: boolean;
  /**
   * Called for movable pieces when the user begins dragging the piece.
   */
  onMoveStart?: (type: PieceType) => void;
  /**
   * Called when the user stops dragging a movable piece.
   */
  onMoveEnd?: () => void;
};

export const Piece: React.FC<PieceProps> = ({
  type,
  movable = false,
  onMoveStart,
  onMoveEnd,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // For handling piece movement
    let startMove: (event: MouseEvent) => void;
    if (movable && imgRef.current) {
      const draggingClass = "chess-piece--moving";
      const pieceElement = imgRef.current;

      // For tracking position of mouse during piece movement
      let mouseClientX = 0;
      let mouseClientY = 0;

      startMove = (event) => {
        if (event.button !== 0) {
          return;
        }

        const onMouseMove = (event: MouseEvent) => {
          const clientXDiff = event.clientX - mouseClientX;
          const clientYDiff = event.clientY - mouseClientY;

          mouseClientX = event.clientX;
          mouseClientY = event.clientY;

          const pieceBoundingRect = pieceElement.getBoundingClientRect();
          pieceElement.style.top =
            (pieceBoundingRect.y + clientYDiff).toString() + "px";
          pieceElement.style.left =
            (pieceBoundingRect.x + clientXDiff).toString() + "px";
        };

        const endMove = () => {
          pieceElement.classList.remove(draggingClass);
          pieceElement.style.removeProperty("top");
          pieceElement.style.removeProperty("left");
          pieceElement.style.removeProperty("height");
          pieceElement.style.removeProperty("width");
          document.removeEventListener("mousemove", onMouseMove);

          if (onMoveEnd) {
            onMoveEnd();
          }
        };

        mouseClientX = event.clientX;
        mouseClientY = event.clientY;

        const boundingRect = pieceElement.getBoundingClientRect();
        pieceElement.style.height = boundingRect.height.toString() + "px";
        pieceElement.style.width = boundingRect.width.toString() + "px";

        pieceElement.classList.add(draggingClass);
        document.addEventListener("mouseup", endMove, { once: true });
        document.addEventListener("mousemove", onMouseMove);

        if (onMoveStart) {
          onMoveStart(type);
        }
      };

      pieceElement.addEventListener("mousedown", startMove);
    }

    return () => {
      if (movable && imgRef.current) {
        imgRef.current.removeEventListener("mousedown", startMove);
      }
    };
  }, [imgRef.current]);

  const pieceClasses = ["chess-piece"];

  if (movable) {
    pieceClasses.push("chess-piece--movable");
  }
  return (
    <img
      className={pieceClasses.join(" ")}
      draggable={false}
      src={`/pieces/${type.color}/${type.name}.svg`}
      ref={imgRef}
    />
  );
};
