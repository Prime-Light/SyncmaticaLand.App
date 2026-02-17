"use client"

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { gsap } from "gsap";

interface VariableSpeed {
    min: number;
    max: number;
}

/**
 * Polymorphic props 类型
 */
type TextTypeBaseProps = {
    className?: string;
    showCursor?: boolean;
    hideCursorWhileTyping?: boolean;
    cursorCharacter?: string;
    cursorBlinkDuration?: number;
    cursorClassName?: string;
    text: string | string[];
    typingSpeed?: number;
    initialDelay?: number;
    pauseDuration?: number;
    deletingSpeed?: number;
    loop?: boolean;
    textColors?: string[];
    variableSpeed?: VariableSpeed;
    onSentenceComplete?: (sentence: string, index: number) => void;
    startOnVisible?: boolean;
    reverseMode?: boolean;
};

type TextTypeProps<T extends React.ElementType> = TextTypeBaseProps & {
    as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof TextTypeBaseProps | "as">;

export function TextType<T extends React.ElementType = "div">(props: TextTypeProps<T>) {
    const {
        as,
        typingSpeed = 50,
        initialDelay = 0,
        pauseDuration = 2000,
        deletingSpeed = 30,
        loop = true,
        className = "",
        showCursor = true,
        hideCursorWhileTyping = false,
        cursorCharacter = "|",
        cursorBlinkDuration = 0.5,
        textColors = [],
        startOnVisible = false,
        reverseMode = false,
        text,
        variableSpeed,
        onSentenceComplete,
        ...rest
    } = props;

    const Component = (as || "div") as React.ElementType;

    const [displayedText, setDisplayedText] = useState("");
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(!startOnVisible);

    const cursorRef = useRef<HTMLSpanElement | null>(null);
    const containerRef = useRef<HTMLElement | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

    const getRandomSpeed = useCallback(() => {
        if (!variableSpeed) return typingSpeed;
        const { min, max } = variableSpeed;
        return Math.random() * (max - min) + min;
    }, [variableSpeed, typingSpeed]);

    const getCurrentTextColor = () => {
        if (!textColors.length) return "#ffffff";
        return textColors[currentTextIndex % textColors.length];
    };

    const clearTimeoutIfNeeded = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const executeTypingAnimation = useCallback(() => {
        const currentText = textArray[currentTextIndex];
        const processedText = reverseMode ? currentText.split("").reverse().join("") : currentText;

        if (isDeleting) {
            if (displayedText === "") {
                setIsDeleting(false);

                if (currentTextIndex === textArray.length - 1 && !loop) return;

                onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);

                setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
                setCurrentCharIndex(0);

                timeoutRef.current = setTimeout(() => {}, pauseDuration);
            } else {
                timeoutRef.current = setTimeout(() => {
                    setDisplayedText((prev) => prev.slice(0, -1));
                }, deletingSpeed);
            }
        } else {
            if (currentCharIndex < processedText.length) {
                timeoutRef.current = setTimeout(
                    () => {
                        setDisplayedText((prev) => prev + processedText[currentCharIndex]);
                        setCurrentCharIndex((prev) => prev + 1);
                    },
                    variableSpeed ? getRandomSpeed() : typingSpeed
                );
            } else if (textArray.length > 1) {
                timeoutRef.current = setTimeout(() => {
                    setIsDeleting(true);
                }, pauseDuration);
            }
        }
    }, [
        currentCharIndex,
        currentTextIndex,
        deletingSpeed,
        displayedText,
        getRandomSpeed,
        isDeleting,
        loop,
        onSentenceComplete,
        pauseDuration,
        reverseMode,
        textArray,
        typingSpeed,
        variableSpeed,
    ]);

    useEffect(() => {
        if (!isVisible) return;

        clearTimeoutIfNeeded();

        timeoutRef.current = setTimeout(
            executeTypingAnimation,
            currentCharIndex === 0 && !isDeleting && displayedText === "" ? initialDelay : 0
        );

        return clearTimeoutIfNeeded;
    }, [displayedText, currentCharIndex, isDeleting, isVisible, executeTypingAnimation, initialDelay]);

    useEffect(() => {
        if (showCursor && cursorRef.current) {
            gsap.set(cursorRef.current, { opacity: 1 });
            gsap.to(cursorRef.current, {
                opacity: 0,
                duration: cursorBlinkDuration,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut",
            });
        }
    }, [showCursor, cursorBlinkDuration]);

    useEffect(() => {
        if (!startOnVisible || !containerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [startOnVisible]);

    useEffect(() => {
        return () => clearTimeoutIfNeeded();
    }, []);

    const hideCursor = hideCursorWhileTyping && (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

    return (
        <Component ref={containerRef} className={`inline-block whitespace-pre-wrap tracking-tight ${className}`} {...rest}>
            <span style={{ color: getCurrentTextColor() }}>{displayedText}</span>
            {showCursor && (
                <span ref={cursorRef} className={`ml-1 inline-block ${hideCursor ? "hidden" : ""} ${props.cursorClassName || ""}`}>
                    {cursorCharacter}
                </span>
            )}
        </Component>
    );
}
