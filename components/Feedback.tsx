import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Text, TextField, Flex } from "./base";

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
export const Feedback = ({
  buttonText = "Feedback",
  placeholder = "Your feedback... Let us know if any song has typos or is wrong, etc",
  popupOffset = -298
}: { buttonText?: string, placeholder?: string, popupOffset?: number }): JSX.Element => {
  const { asPath } = useRouter();
  const [feedbackOn, toggleFeedback] = useState(false);
  const [feedbackLoading, toggleFeedbackLoading] = useState(false);
  const [feedbackText, updateFeedbackText] = useState("");
  const [sentFeedback, toggleSentFeedback] = useState(false);
  const { data: session } = useSession();

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
    await fetch("/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        timestamp: Date.now(),
        feedbackText: feedbackText,
        page: asPath,
        email: session?.user?.email,
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
  const popupRef = useRef(null);
  useOutsideAlerter(popupRef, feedbackOn, toggleFeedback, toggleSentFeedback);

  // ref to the button, so we know the absolute dimensions of it
  const buttonRef = useRef(null);
  const btnPos = buttonRef.current && buttonRef.current.getBoundingClientRect();

  // ref to the textfield to autofocus to input field
  // if feedback is toggled on
  const textFieldRef = useRef(null);
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
        <div className="feedback-popup-box" ref={popupRef}>
          {!sentFeedback && !feedbackLoading ? (
            <>
              <Text as="p" fontSize="14px" color="#444" className="mb-1">
                FEEDBACK
              </Text>
              <TextField
                aria-label="Enter your feedback"
                autoComplete=""
                id="feedback-input"
                lines={4}
                type="textarea"
                placeholder={placeholder}
                value={feedbackText}
                onChange={handleFeedbackTextChange}
                inputRef={textFieldRef}
              />
            </>
          ) : feedbackLoading ? (
            <Text as="p" fontSize="14px" className="text-center pt-8">
              <img src="/loading-dot.svg" width="30px" />
            </Text>
          ) : (
            <Text as="p" fontSize="14px" className="text-center pt-8">
              Thanks for the feedback! 🎉
            </Text>
          )}

          <Flex flexDirection="column" className="items-end mt-1.5">
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
          </Flex>
        </div>
      )}
      <style jsx>{`
        .feedback-box {
          display: flex;
          font-size: 0.875rem;
          cursor: pointer;
          margin-bottom: 12px;
          line-height: 16px;
        }

        .feedback-popup-box {
          transition: all 0.2s ease-in-out, border-radius 0.2s step-start,
            border 0.2s ease-in-out;
          width: 300px;
          border-radius: 6px;
          position: absolute;
          z-index: 100;

          // to place over the button but to the left
          left: ${btnPos && Math.floor(btnPos.right) + popupOffset}px;
          top: ${btnPos && Math.floor(btnPos.top)}px;

        background: #fff;
        padding: 12px;
        box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
        }

        .feedback-btn {
          background: #fff;
        border: 1px solid #eaeaea;
        border-radius: 6px;
        padding: 8px 12px;
        font-family: HKGrotesk;
        font-size: 14px;
        color: #999;
        }

        .feedback-btn:hover {
          border: 1px solid #888;
        }

        .popup-btn {
          font - family: HKGrotesk;
        font-size: 12px;
        color: #fff;
        padding: 6px 8px;
        border: 0;
        border-radius: 6px;
        }

        .close-feedback-btn {
          background: #444;
        }

        .send-feedback-btn {
          background: #155da1;
        }
      `}</style>
    </div>
  );
};

export default Feedback;
