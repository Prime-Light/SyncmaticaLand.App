"use client";

import React from "react";
// @ts-ignore: no bundled types for `typewriter-effect`
import Typewriter from "typewriter-effect";

type Props = {
  as?: React.ElementType;
  text: string | string[];
  typingSpeed?: number; // ms per char when typing
  deletingSpeed?: number; // ms per char when deleting
  pauseDuration?: number; // ms to wait when full text shown
  showCursor?: boolean;
  cursorCharacter?: string;
  className?: string;
};

export function TextType({
  as: Component = "span",
  text,
  typingSpeed = 75,
  deletingSpeed = 50,
  pauseDuration = 1500,
  showCursor = true,
  cursorCharacter = "_",
  className,
}: Props) {
  const strings = Array.isArray(text) ? text : [text];

  return (
    <Component className={className} aria-label={strings.join(" ")}>
      {(() => {
        const opts: any = {
          strings,
          autoStart: true,
          loop: true,
          delay: typingSpeed,
          deleteSpeed: deletingSpeed,
          pauseFor: pauseDuration,
          cursor: showCursor ? cursorCharacter : "",
        };

        return <Typewriter options={opts} />;
      })()}
    </Component>
  );
}
