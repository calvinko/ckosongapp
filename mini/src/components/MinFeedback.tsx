import React, { useEffect, useRef, useState } from "react";
import LoadingDot from "../assets/loading-dot.svg";
/**
 * Custom hook that listens to clicks outside of the passed ref (the feedback popup). We toggle the feedback state and then resets the
 * sentFeedback state to false
 */
const useOutsideAlerter = (
    ref: React.MutableRefObject<any>,
    feedbackOn: boolean,
    toggleFeedback: Function,
    toggleSentFeedback: Function
) => {
    useEffect(() => {
        /**
         * toggle feedback state if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                toggleFeedback(!feedbackOn);
                toggleSentFeedback(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, feedbackOn]);
};

/**
 * Feedback Component to provide feedback. Opens popup on the left on top of the button (right aligned, in a way)
 */
export const MinFeedback = ({
    buttonText = "Feedback",
    placeholder = "Your feedback... Let us know if any song has typos or is wrong, etc",
    popupOffset = -298
}: { buttonText?: string, placeholder?: string, popupOffset?: number }): JSX.Element => {
    const [feedbackOn, toggleFeedback] = useState(false);
    const [feedbackLoading, toggleFeedbackLoading] = useState(false);
    const [feedbackText, updateFeedbackText] = useState("");
    const [sentFeedback, toggleSentFeedback] = useState(false);

    const handleBtnClick = (e) => {
        toggleFeedback(!feedbackOn);
    };

    /**
     * Send feedback text over to api
     *
     * @param e event
     */
    const handleSendBtnClick = async (e) => {
        toggleFeedbackLoading(true);
        await fetch("https://songapp.vercel.app/api/feedback", {
            method: "POST",
            body: JSON.stringify({
                timestamp: Date.now(),
                feedbackText: feedbackText,
                page: window?.location?.href ?? "unknown",
                email: "",
            }),
        });
        // reset feedback states, but allow popup to still be up, for the "thank you text"
        toggleFeedbackLoading(false);
        toggleSentFeedback(true);
        updateFeedbackText("");
    };

    const handleFeedbackTextChange = (e) => {
        updateFeedbackText(e.target.value);
    };

    /**
     * After feedback text is sent, the popup shows a "thank you" text and a "Done button".
     * This method is called when the "done" button is clicked. Another way to exit is to press
     * outside of the popup, which is handled by useOutsideAlerter
     *
     * @param e
     */
    const handleFeedbackDoneChange = (e) => {
        toggleFeedback(false);
        toggleSentFeedback(false);
    };

    // ref to popup with feedback input
    const popupRef = useRef<HTMLDivElement>(null);
    useOutsideAlerter(popupRef, feedbackOn, toggleFeedback, toggleSentFeedback);

    // ref to the button, so we know the absolute dimensions of it
    const buttonRef = useRef<HTMLButtonElement>(null);
    const btnPos = buttonRef.current && buttonRef.current?.getBoundingClientRect();

    // ref to the textfield to autofocus to input field
    // if feedback is toggled on
    const textFieldRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (feedbackOn) {
            textFieldRef?.current?.focus();
        }
    }, [feedbackOn]);

    return (
        <div className="feedback-box">
            <button ref={buttonRef} className="feedback-btn" onClick={handleBtnClick}>
                {buttonText}
            </button>
            {feedbackOn && (
                <div
                    className="feedback-popup-box"
                    ref={popupRef}
                    style={{
                        left: btnPos ? Math.floor(btnPos?.right) + popupOffset : 0,
                        top: btnPos ? Math.floor(btnPos?.top) : 0,
                    }}
                >
                    {!sentFeedback && !feedbackLoading ? (
                        <>
                            <p className="text-sm text-gray-600 mb-1">
                                FEEDBACK
                            </p>
                            <textarea
                                aria-label="Enter your feedback"
                                autoComplete=""
                                id="feedback-input"
                                rows={4}
                                placeholder={placeholder}
                                value={feedbackText}
                                onChange={handleFeedbackTextChange}
                                ref={textFieldRef}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                        </>
                    ) : feedbackLoading ? (
                        <p className="text-sm text-center pt-8 px-4">
                            <img src={LoadingDot} width="30px" />
                        </p>
                    ) : (
                        <p className="text-sm text-center pt-8">
                            Thanks for the feedback! 🎉
                        </p>
                    )}

                    <div className="flex flex-col items-end mt-1.5">
                        {sentFeedback ? (
                            <button
                                className="popup-btn close-feedback-btn"
                                onClick={handleFeedbackDoneChange}
                            >
                                Done
                            </button>
                        ) : (
                            <button
                                className="popup-btn send-feedback-btn"
                                onClick={handleSendBtnClick}
                            >
                                Send
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinFeedback;
